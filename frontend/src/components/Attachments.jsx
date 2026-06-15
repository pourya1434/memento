import AudioPlayer from "./AudioPlayer.jsx";
import { mediaUrl } from "../api.js";

// Renders the shared assets attached to a post: music players, books,
// downloadable files, and extra images.
export default function Attachments({ items = [] }) {
  if (!items.length) return null;

  const audio = items.filter((a) => a.kind === "audio");
  const images = items.filter((a) => a.kind === "image");
  const downloads = items.filter((a) => a.kind === "file" || a.kind === "book");

  return (
    <div className="mt-10 space-y-4 border-t border-ink-700 pt-8">
      {audio.map((a) => (
        <AudioPlayer key={a.id} src={mediaUrl(a.file)} title={a.title} />
      ))}

      {images.map((a) => (
        <img
          key={a.id}
          src={mediaUrl(a.file)}
          alt={a.title}
          className="my-4 rounded-lg border border-ink-700"
        />
      ))}

      {downloads.length > 0 && (
        <div className="space-y-2">
          {downloads.map((a) => (
            <a
              key={a.id}
              href={mediaUrl(a.file)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-800/60 px-4 py-3 text-sm transition hover:border-accent hover:text-accent-soft"
            >
              <span className="text-lg">{a.kind === "book" ? "📖" : "📎"}</span>
              <span className="flex-1 truncate">
                {a.title || "Download"}
              </span>
              <span className="text-xs text-muted">
                {a.kind === "book" ? "Book" : "Download"}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
