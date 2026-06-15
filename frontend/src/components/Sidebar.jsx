import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getCategories } from "../api.js";

export default function Sidebar({ onNavigate }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const linkClass = ({ isActive }) =>
    [
      "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-ink-700 text-accent-soft"
        : "text-body hover:bg-ink-800 hover:text-accent-soft",
    ].join(" ");

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
        Categories
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        <NavLink to="/" end onClick={onNavigate} className={linkClass}>
          <span className="w-5 shrink-0 text-center text-muted">✷</span>
          <span className="flex-1">All posts</span>
        </NavLink>

        {categories.map((c) => (
          <NavLink
            key={c.slug}
            to={`/category/${c.slug}`}
            onClick={onNavigate}
            className={linkClass}
          >
            <span className="w-5 shrink-0 text-center font-mono text-xs text-muted group-hover:text-accent-soft">
              {c.icon || "•"}
            </span>
            <span className="min-w-0 flex-1 truncate">{c.name}</span>
            {c.name_fa && (
              <span
                className="shrink-0 font-fa text-xs text-muted"
                dir="rtl"
              >
                {c.name_fa}
              </span>
            )}
            <span className="shrink-0 rounded-full bg-ink-800 px-2 py-0.5 text-[10px] text-muted">
              {c.post_count}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-ink-700 px-1 pt-4 text-xs text-muted">
        Built with Django &amp; React.
      </div>
    </div>
  );
}
