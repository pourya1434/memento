// Circular numbered pagination: ‹ 1 … 3 4 5 … 10 ›
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Build the visible list: first, last, current ±1, ellipsis for gaps.
  const items = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
      items.push(p);
    } else if (items[items.length - 1] !== "…") {
      items.push("…");
    }
  }

  const circle =
    "grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm transition-all duration-200";

  const arrow = (dir, target, disabled, label) => (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(target)}
      className={`${circle} border border-ink-700 text-muted hover:border-accent hover:text-accent-soft disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-ink-700 disabled:hover:text-muted`}
    >
      {dir}
    </button>
  );

  return (
    <nav
      className="mt-14 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {arrow("‹", page - 1, page === 1, "Previous page")}

      {items.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${circle} ${
              p === page
                ? "scale-105 bg-coral font-semibold text-white shadow-lg shadow-coral/25"
                : "border border-ink-700 text-body hover:border-accent hover:text-accent-soft"
            }`}
          >
            {p}
          </button>
        )
      )}

      {arrow("›", page + 1, page === totalPages, "Next page")}
    </nav>
  );
}
