from django.db import models
from django.utils.text import slugify
from django.utils import timezone


class Category(models.Model):
    """A topic group: programming, art, literature, ..."""

    name = models.CharField(max_length=80)
    name_fa = models.CharField(
        "Persian name", max_length=80, blank=True,
        help_text="Optional Persian label shown in the sidebar.",
    )
    slug = models.SlugField(max_length=90, unique=True, blank=True)
    description = models.TextField(blank=True)
    # A short emoji / glyph shown next to the category in the sidebar.
    icon = models.CharField(max_length=8, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Post(models.Model):
    LANG_EN = "en"
    LANG_FA = "fa"
    LANGUAGE_CHOICES = [
        (LANG_EN, "English"),
        (LANG_FA, "Persian (Farsi)"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="posts",
    )
    language = models.CharField(
        max_length=2, choices=LANGUAGE_CHOICES, default=LANG_EN,
        help_text="Drives font + text direction (RTL for Persian) on the site.",
    )
    excerpt = models.TextField(
        blank=True, help_text="Short summary shown in the post list."
    )
    # Body is written in Markdown; the frontend renders it (code fences,
    # images, links, headings all supported).
    body = models.TextField(help_text="Markdown. Use ``` fences for code blocks.")
    cover_image = models.ImageField(upload_to="covers/", blank=True, null=True)
    source_url = models.URLField(
        blank=True, help_text="Optional link shown under the title (e.g. GitHub repo)."
    )

    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title, allow_unicode=True) or "post"
            slug = base
            i = 2
            while Post.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Attachment(models.Model):
    """A shared asset: music (SoundCloud-style player), a file, a book, an image."""

    KIND_AUDIO = "audio"
    KIND_FILE = "file"
    KIND_BOOK = "book"
    KIND_IMAGE = "image"
    KIND_CHOICES = [
        (KIND_AUDIO, "Music / audio"),
        (KIND_FILE, "File / download"),
        (KIND_BOOK, "Book"),
        (KIND_IMAGE, "Image"),
    ]

    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="attachments"
    )
    kind = models.CharField(max_length=8, choices=KIND_CHOICES, default=KIND_FILE)
    title = models.CharField(max_length=200, blank=True)
    file = models.FileField(upload_to="attachments/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title or f"{self.get_kind_display()} #{self.pk}"
