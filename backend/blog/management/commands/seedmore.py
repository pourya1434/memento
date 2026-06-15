import shutil
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from blog.models import Attachment, Category, Post


# (title, category-name, language, body) — enough to span several pages.
PROGRAMMING = [
    ("Taming async in Rust", "Notes after a weekend fighting the borrow checker.\n\n```rust\nasync fn fetch() -> u32 { 42 }\n```"),
    ("A tiny ray tracer in C", "Under 300 lines, renders a few spheres to a PPM file."),
    ("Why I switched to Neovim", "Lua config, lazy loading, and finally understanding folds."),
    ("Debugging with strace", "When the logs lie, syscalls tell the truth.\n\n```bash\nstrace -f -e trace=open ./app\n```"),
    ("SQLite is underrated", "One file, zero servers, perfectly fine for a personal site."),
    ("Writing a shell in 200 lines", "fork, exec, wait — the whole loop is smaller than you think."),
    ("Vim macros that saved my week", "Record once, replay everywhere. `qa ... q` then `@a`."),
    ("Understanding Unix pipes", "Small programs, composed. The original microservices."),
    ("A note on hash maps", "Open addressing vs chaining, and when each one wins."),
    ("Regex I keep forgetting", "Lookaheads, non-greedy, and word boundaries."),
]

ART = [
    ("Sketchbook, page 12", "Loose gesture studies from the cafe this morning."),
    ("Studying Caravaggio's light", "Hard edges into deep shadow — chiaroscuro practice."),
    ("A week of gesture drawing", "Thirty-second poses, every day. The line gets braver."),
    ("Mixing greens that don't go muddy", "Lean on yellow ochre and a touch of the complement."),
    ("Watercolor on cheap paper", "It buckles, but the accidents are half the fun."),
    ("Inktober leftovers", "The prompts I never finished, finished late."),
    ("Color and memory", "Why some palettes feel like a specific afternoon."),
]

LITERATURE = [
    ("On rereading Borges", "en", "The Library of Babel hits differently the second time."),
    ("Why short stories matter", "en", "A whole world in a few thousand words."),
    ("Notes on a single poem", "en", "Spending a week with sixteen lines."),
    ("دربارهٔ شعر کلاسیک", "fa", "یادداشتی کوتاه دربارهٔ وزن و موسیقی شعر کهن.\n\n> هر که دارد هوس کشتن ما"),
    ("خواندن دوبارهٔ بوف کور", "fa", "هر بار چیز تازه‌ای از این کتاب بیرون می‌کشم."),
    ("یادداشت‌های پراکنده", "fa", "چند خط دربارهٔ کتاب‌هایی که این ماه خواندم."),
]


class Command(BaseCommand):
    help = "Add a batch of varied posts (for pagination) and attach the real mp3."

    def handle(self, *args, **options):
        cats = {c.name: c for c in Category.objects.all()}
        if not cats:
            self.stderr.write("Run `manage.py seed` first to create categories.")
            return

        now = timezone.now()
        n = 0  # used to stagger created_at so ordering looks natural
        created = 0

        def add(title, category, language, body, excerpt=""):
            nonlocal n, created
            obj, was = Post.objects.get_or_create(
                title=title,
                defaults=dict(
                    category=category,
                    language=language,
                    body=body,
                    excerpt=excerpt or body.split("\n")[0][:120],
                    created_at=now - timedelta(days=n, hours=n),
                ),
            )
            n += 1
            created += int(was)
            return obj

        for title, body in PROGRAMMING:
            add(title, cats.get("Programming"), "en", body)
        for title, body in ART:
            add(title, cats.get("Art"), "en", body)
        for title, lang, body in LITERATURE:
            add(title, cats.get("Literature"), lang, body)

        # The real mp3 example, attached to a dedicated post.
        eruption = add(
            "Eruption — One Way Ticket",
            cats.get("Art"),
            "en",
            "A track I've had on repeat. Hit play below — the waveform fills "
            "in as it streams.",
            excerpt="A track I've had on repeat — try the player.",
        )
        self._attach_mp3(eruption)

        self.stdout.write(self.style.SUCCESS(
            f"Added posts ({created} new). Total posts: {Post.objects.count()}."
        ))

    def _attach_mp3(self, post):
        src = Path(settings.BASE_DIR).parent / "Eruption - One Way Ticket.mp3"
        if not src.exists():
            self.stderr.write(f"mp3 not found at {src}; skipping audio attach.")
            return
        rel = "attachments/eruption-one-way-ticket.mp3"
        dest = Path(settings.MEDIA_ROOT) / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            shutil.copy(src, dest)
        if not post.attachments.filter(kind=Attachment.KIND_AUDIO).exists():
            Attachment.objects.create(
                post=post,
                kind=Attachment.KIND_AUDIO,
                title="Eruption — One Way Ticket",
                file=rel,
            )
