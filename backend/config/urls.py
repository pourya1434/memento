from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

from config.media import serve_with_range

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("blog.urls")),
]

if settings.DEBUG:
    # Serve media through a Range-aware view so audio/video can seek.
    media_prefix = settings.MEDIA_URL.lstrip("/")
    urlpatterns += [
        re_path(
            rf"^{media_prefix}(?P<path>.*)$",
            serve_with_range,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
