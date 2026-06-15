import math
import struct
import wave
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from blog.models import Attachment, Category, Post


SAMPLE_GO = '''Deepseek spun this one from my old bash script. It is quite a lot faster.

```go
package main

import "fmt"

func main() {
    grid := newGrid(40, 20)
    for tick := 0; tick < 100; tick++ {
        grid.step()
        fmt.Print(grid)
    }
}
```

A small note on performance: pre-allocating the buffer once instead of
reallocating every tick made the whole thing noticeably snappier.
'''

SAMPLE_FA = '''این یک نوشتهٔ نمونه به زبان فارسی است. فونت و جهت متن باید
به‌صورت خودکار راست‌به‌چپ شود و با طراحی کلی سایت هماهنگ بماند.

> یک نقل‌قول کوتاه برای آزمایش سبک.

و یک قطعه کد هم:

```python
print("سلام دنیا")
```
'''

SAMPLE_ART = '''Some loose notes on color and light I keep coming back to.

- Warm light usually means cool shadows, and the other way around.
- Edges carry as much information as values — soften the ones you want the eye
  to skip.
- A limited palette almost always reads as more harmonious than a wide one.

> "Color is my day-long obsession, joy and torment." — Monet
'''

SAMPLE_MUSIC = '''A short tune I put together while testing the audio player.
Nothing fancy — press play below and the SoundCloud-style waveform should fill
in as it plays.
'''


def make_sample_audio():
    """Generate a tiny WAV melody so the audio player has something to play."""
    folder = Path(settings.MEDIA_ROOT) / "attachments"
    folder.mkdir(parents=True, exist_ok=True)
    rel = "attachments/sample-track.wav"
    path = Path(settings.MEDIA_ROOT) / rel
    if path.exists():
        return rel

    rate = 22050
    # A gentle C-major arpeggio.
    notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63]
    frames = bytearray()
    for freq in notes:
        dur = 0.45
        n = int(rate * dur)
        for i in range(n):
            t = i / rate
            # simple attack/release envelope
            env = min(t * 6, (dur - t) * 6, 1.0)
            val = int(0.35 * env * 32767 * math.sin(2 * math.pi * freq * t))
            frames += struct.pack("<h", val)

    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(bytes(frames))
    return rel


class Command(BaseCommand):
    help = "Seed the database with sample categories and posts."

    def handle(self, *args, **options):
        cats = {}
        for i, (name, name_fa, icon) in enumerate([
            ("Programming", "برنامه‌نویسی", "›_"),
            ("Art", "هنر", "✦"),
            ("Literature", "ادبیات", "❝"),
        ]):
            cat, _ = Category.objects.get_or_create(
                name=name, defaults={"name_fa": name_fa, "icon": icon, "order": i}
            )
            cats[name] = cat

        posts = [
            dict(
                title="Game of life in golang",
                category=cats["Programming"],
                language="en",
                source_url="https://github.com/example/gameOfLifeGolang",
                excerpt="A faster Conway's Game of Life, rewritten from an old bash script.",
                body=SAMPLE_GO,
            ),
            dict(
                title="Fzf preview mine",
                category=cats["Programming"],
                language="en",
                excerpt="A custom fzf preview script that handles images, pdf, audio and more.",
                body="Something like that in .zshrc\n\n```bash\nexport FZF_CTRL_T_OPTS=\"--preview 'fzf_preview {}'\"\n```\n\nNeeds sixels and some apps like ffmpeg, mediainfo, mpv, chafa.",
            ),
            dict(
                title="On color and light",
                category=cats["Art"],
                language="en",
                excerpt="A few notes I keep coming back to about color, edges and a limited palette.",
                body=SAMPLE_ART,
            ),
            dict(
                title="یادداشتی دربارهٔ ادبیات",
                category=cats["Literature"],
                language="fa",
                excerpt="نمونه‌ای از یک نوشتهٔ فارسی برای آزمایش فونت و چیدمان راست‌به‌چپ.",
                body=SAMPLE_FA,
            ),
        ]

        created = 0
        for p in posts:
            _, was_created = Post.objects.get_or_create(
                title=p["title"], defaults={**p, "created_at": timezone.now()}
            )
            created += int(was_created)

        # A post that carries a music attachment (rendered as an audio player).
        music, _ = Post.objects.get_or_create(
            title="A little melody",
            defaults=dict(
                category=cats["Art"],
                language="en",
                excerpt="A short tune — press play to try the SoundCloud-style player.",
                body=SAMPLE_MUSIC,
                created_at=timezone.now(),
            ),
        )
        if not music.attachments.filter(kind=Attachment.KIND_AUDIO).exists():
            Attachment.objects.create(
                post=music,
                kind=Attachment.KIND_AUDIO,
                title="A little melody",
                file=make_sample_audio(),
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seed complete: {Category.objects.count()} categories, "
            f"{Post.objects.count()} posts."
        ))
