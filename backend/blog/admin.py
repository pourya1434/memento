from django import forms
from django.contrib import admin
from django.db import models
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .models import Attachment, Category, Post

# ---------------------------------------------------------------------------
# Dashboard branding (shown at the top of every admin page).
# ---------------------------------------------------------------------------
admin.site.site_header = "داشبورد مِمِنتو"          # big header on the login + pages
admin.site.site_title = "داشبورد مِمِنتو"           # browser tab title
admin.site.index_title = "مدیریت نوشته‌ها و رسانه‌ها"  # subtitle on the home page


# A roomy editor for the Markdown body. The CSS in static/admin/dashboard.css
# styles it with a monospace font so code fences are easy to write.
class PostAdminForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = "__all__"
        widgets = {
            "body": forms.Textarea(
                attrs={"rows": 24, "class": "markdown-editor", "spellcheck": "false"}
            ),
            "excerpt": forms.Textarea(attrs={"rows": 3}),
        }


def _preview(file, kind):
    """Return a small HTML preview for an uploaded file, by kind."""
    if not file:
        return ""
    url = file.url
    if kind == Attachment.KIND_IMAGE:
        return format_html(
            '<img src="{}" style="max-height:90px;border-radius:8px;" />', url
        )
    if kind == Attachment.KIND_AUDIO:
        return format_html(
            '<audio controls preload="none" style="height:36px;">'
            '<source src="{}"></audio>',
            url,
        )
    return format_html('<a href="{}" target="_blank">⬇️ دانلود فایل</a>', url)


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 1
    fields = ["kind", "title", "file", "order", "preview"]
    readonly_fields = ["preview"]

    @admin.display(description="پیش‌نمایش")
    def preview(self, obj):
        return _preview(obj.file, obj.kind) or "—"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["icon", "name", "name_fa", "post_count", "order"]
    list_display_links = ["name"]
    list_editable = ["order"]
    search_fields = ["name", "name_fa"]
    prepopulated_fields = {"slug": ("name",)}
    fieldsets = [
        (None, {"fields": ["name", "name_fa", "slug", "icon"]}),
        ("جزئیات", {"fields": ["description", "order"]}),
    ]

    @admin.display(description="تعداد نوشته")
    def post_count(self, obj):
        return obj.posts.count()


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    form = PostAdminForm
    list_display = [
        "cover_thumb",
        "title",
        "category",
        "language",
        "is_published",
        "created_at",
    ]
    list_display_links = ["title"]
    list_filter = ["category", "language", "is_published", "created_at"]
    list_editable = ["is_published"]
    search_fields = ["title", "body", "excerpt"]
    date_hierarchy = "created_at"
    inlines = [AttachmentInline]
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ["cover_preview", "updated_at"]
    save_on_top = True
    list_per_page = 25

    fieldsets = [
        (
            "محتوا",
            {
                "fields": [
                    "title",
                    "slug",
                    "category",
                    "language",
                    "excerpt",
                    "body",
                ],
                "description": mark_safe(
                    "متن نوشته با <b>Markdown</b> نوشته می‌شود. "
                    "برای بلوک کد از سه بک‌تیک استفاده کنید، مثلاً "
                    "<code>```python … ```</code>. "
                    "برای زبان فارسی، فیلد «language» را روی Persian بگذارید "
                    "تا سایت آن را راست‌به‌چپ نمایش دهد."
                ),
            },
        ),
        (
            "تصویر کاور و رسانه",
            {"fields": ["cover_image", "cover_preview", "source_url"]},
        ),
        (
            "انتشار",
            {"fields": ["is_published", "created_at", "updated_at"]},
        ),
    ]

    formfield_overrides = {
        models.TextField: {"widget": forms.Textarea(attrs={"rows": 6})},
    }

    class Media:
        css = {"all": ["admin/dashboard.css"]}

    @admin.display(description="کاور")
    def cover_thumb(self, obj):
        if obj.cover_image:
            return format_html(
                '<img src="{}" style="height:42px;width:64px;'
                'object-fit:cover;border-radius:6px;" />',
                obj.cover_image.url,
            )
        return "—"

    @admin.display(description="پیش‌نمایش کاور")
    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html(
                '<img src="{}" style="max-height:220px;border-radius:10px;" />',
                obj.cover_image.url,
            )
        return "هنوز تصویری بارگذاری نشده است."


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ["__str__", "post", "kind", "preview", "order"]
    list_filter = ["kind"]
    search_fields = ["title", "post__title"]

    @admin.display(description="پیش‌نمایش")
    def preview(self, obj):
        return _preview(obj.file, obj.kind) or "—"
