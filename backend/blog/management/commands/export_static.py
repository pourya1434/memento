"""Export the blog to static JSON + media for a GitHub Pages build.

The public site is fully static: it has no Django server. You author content
locally in the Django admin, then run:

    python manage.py export_static

which writes JSON the React app reads at build time, and copies media into the
frontend so it gets committed and served by GitHub Pages. Then commit & push —
the GitHub Action rebuilds and deploys.
"""

import json
import re
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from blog.models import Category, Post
from blog.serializers import (
    CategorySerializer,
    PostDetailSerializer,
    PostListSerializer,
)


def _rel_media(value):
    """Normalize any media URL to a repo-relative path like 'media/covers/x.jpg'."""
    if not value:
        return value
    value = re.sub(r"^https?://[^/]+", "", str(value))  # drop scheme://host
    return value.lstrip("/")


def _fix_media(obj):
    """Recursively rewrite cover_image / file fields to relative media paths."""
    if isinstance(obj, dict):
        for key, val in obj.items():
            if key in ("cover_image", "file") and isinstance(val, str):
                obj[key] = _rel_media(val)
            else:
                _fix_media(val)
    elif isinstance(obj, list):
        for item in obj:
            _fix_media(item)
    return obj


def _write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


class Command(BaseCommand):
    help = "Export categories/posts to static JSON + media for the GitHub Pages build."

    def handle(self, *args, **options):
        frontend = (Path(settings.BASE_DIR).parent / "frontend").resolve()
        data_dir = frontend / "public" / "data"
        posts_dir = data_dir / "posts"
        media_out = frontend / "public" / "media"

        # Clean previous export so deleted posts/media don't linger.
        if data_dir.exists():
            shutil.rmtree(data_dir)
        posts_dir.mkdir(parents=True, exist_ok=True)

        # Categories.
        categories = _fix_media(list(CategorySerializer(Category.objects.all(), many=True).data))
        _write_json(data_dir / "categories.json", categories)

        # Posts: one detail file each, plus a combined list (with body, so the
        # frontend can search title/excerpt/body client-side like the API did).
        published = (
            Post.objects.filter(is_published=True)
            .select_related("category")
            .prefetch_related("attachments")
        )
        listed = []
        for post in published:
            detail = _fix_media(dict(PostDetailSerializer(post).data))
            _write_json(posts_dir / f"{post.slug}.json", detail)

            item = _fix_media(dict(PostListSerializer(post).data))
            item["body"] = post.body  # used only for search
            listed.append(item)
        _write_json(data_dir / "posts.json", listed)

        # Media: mirror MEDIA_ROOT into the frontend so it's committed & served.
        if Path(settings.MEDIA_ROOT).exists():
            if media_out.exists():
                shutil.rmtree(media_out)
            shutil.copytree(settings.MEDIA_ROOT, media_out)

        self.stdout.write(
            self.style.SUCCESS(
                f"Exported {len(listed)} posts and {len(categories)} categories "
                f"to {data_dir.relative_to(frontend.parent)}"
            )
        )
