"""Range-aware media serving for development.

Django's built-in ``django.views.static.serve`` / ``FileResponse`` do not
honor HTTP ``Range`` requests, so the browser cannot seek inside an audio or
video file — every seek re-fetches from byte 0 and playback restarts. This
view adds minimal ``Range`` support so the SoundCloud-style seekbar works.

DEBUG-only: in production, serve media through nginx/whitenoise, which already
support range requests.
"""

import os
import re
from pathlib import Path

from django.http import (
    FileResponse,
    Http404,
    HttpResponse,
    HttpResponseNotModified,
)
from django.utils.http import http_date
from django.views.static import was_modified_since

RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)", re.IGNORECASE)


def serve_with_range(request, path, document_root=None):
    full_path = Path(document_root) / path
    if not full_path.exists() or not full_path.is_file():
        raise Http404(f"'{path}' does not exist")

    stat = full_path.stat()
    size = stat.st_size
    content_type = _guess_type(full_path)

    # Honor If-Modified-Since (Django's static serve does this too).
    if not was_modified_since(
        request.META.get("HTTP_IF_MODIFIED_SINCE"), stat.st_mtime
    ):
        return HttpResponseNotModified()

    range_header = request.META.get("HTTP_RANGE", "").strip()
    match = RANGE_RE.match(range_header) if range_header else None

    if match:
        start_s, end_s = match.groups()
        start = int(start_s) if start_s else 0
        end = int(end_s) if end_s else size - 1
        end = min(end, size - 1)

        if start > end or start >= size:
            resp = HttpResponse(status=416)  # Range Not Satisfiable
            resp["Content-Range"] = f"bytes */{size}"
            return resp

        length = end - start + 1
        f = full_path.open("rb")
        f.seek(start)
        resp = FileResponse(
            _file_chunks(f, length),
            status=206,
            content_type=content_type,
        )
        resp["Content-Length"] = str(length)
        resp["Content-Range"] = f"bytes {start}-{end}/{size}"
    else:
        resp = FileResponse(full_path.open("rb"), content_type=content_type)
        resp["Content-Length"] = str(size)

    resp["Accept-Ranges"] = "bytes"
    resp["Last-Modified"] = http_date(stat.st_mtime)
    return resp


def _file_chunks(f, length, chunk_size=8192):
    """Yield exactly ``length`` bytes from ``f`` then close it."""
    remaining = length
    try:
        while remaining > 0:
            chunk = f.read(min(chunk_size, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk
    finally:
        f.close()


def _guess_type(full_path):
    import mimetypes

    content_type, _ = mimetypes.guess_type(str(full_path))
    return content_type or "application/octet-stream"
