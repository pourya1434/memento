import { useMemo, useRef, useState } from "react";

// A lightweight SoundCloud-style player: play/pause, a clickable bar
// "waveform", and elapsed / total time. No external audio library.
export default function AudioPlayer({ src, title }) {
  const audioRef = useRef(null);
  const barRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);

  // Deterministic pseudo-waveform so bars stay stable across renders.
  const bars = useMemo(() => {
    const n = 64;
    return Array.from({ length: n }, (_, i) => {
      const v = Math.sin(i * 0.7) * Math.cos(i * 0.27) + Math.sin(i * 1.9);
      return 0.25 + Math.abs(v) * 0.4; // 0.25 .. ~1.0
    });
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const onTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration || scrubbing) return;
    setProgress(a.currentTime / a.duration);
    setCurrent(a.currentTime);
  };

  // Map a clientX position onto a 0..1 ratio along the bar. The bar is
  // forced LTR (see dir="ltr" below), so left edge is always 0.
  const ratioFromX = (clientX) => {
    const el = barRef.current;
    if (!el || clientX == null) return 0;
    const rect = el.getBoundingClientRect();
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  };

  // Jump to a point and actually move playback there.
  const seekTo = (clientX) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const ratio = ratioFromX(clientX);
    a.currentTime = ratio * a.duration;
    setProgress(ratio);
    setCurrent(a.currentTime);
  };

  // Press (or tap) seeks immediately to that spot, then we attach window
  // listeners so a drag keeps scrubbing even off the bar, SoundCloud-style.
  // Listeners are attached here (not in an effect) to avoid a render-timing
  // race where a quick click's mouseup fires before the listener exists.
  const startScrub = (clientX) => {
    setScrubbing(true);
    seekTo(clientX);

    const move = (e) => seekTo(e.clientX ?? e.touches?.[0]?.clientX);
    const end = () => {
      setScrubbing(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", end);
  };

  const fmt = (s) => {
    if (!s || Number.isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div
      dir="ltr"
      className="my-6 flex items-center gap-4 rounded-xl border border-ink-700 bg-ink-800/70 p-4"
    >
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform hover:scale-105"
      >
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        {title && (
          <div className="mb-1 truncate text-sm text-body">{title}</div>
        )}
        <div
          ref={barRef}
          onMouseDown={(e) => startScrub(e.clientX)}
          onTouchStart={(e) => startScrub(e.touches[0].clientX)}
          className="flex h-12 cursor-pointer touch-none select-none items-center gap-[2px]"
        >
          {bars.map((h, i) => {
            const played = i / bars.length <= progress;
            return (
              <div
                key={i}
                className={`w-full rounded-sm transition-colors ${
                  played ? "bg-accent" : "bg-ink-600"
                }`}
                style={{ height: `${h * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="shrink-0 font-mono text-xs text-muted">
        {fmt(current)} / {fmt(duration)}
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTime}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />
    </div>
  );
}
