import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the drawer whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className="page-bg relative min-h-full"
      style={{ "--logo-url": `url(${import.meta.env.BASE_URL}logo-transparent.png)` }}
    >
      {/* Top bar — brand on the left, menu button on the right */}
      <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-900/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}logo-transparent.png`}
              alt="logo"
              className="h-9 w-9 opacity-90"
            />
            <span className="font-serif text-lg font-semibold text-accent">
              Memento
            </span>
          </Link>

          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-body transition-colors hover:bg-ink-800 hover:text-accent-soft"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 lg:py-14">
        <Outlet />
      </main>

      {/* Right-side slide-over menu */}
      <div
        className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 right-0 w-72 max-w-[85vw] overflow-y-auto border-l border-ink-700 bg-ink-900 p-6 shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="font-serif text-base font-semibold text-accent">
              Memento
            </span>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-ink-800 hover:text-body"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
          <Sidebar onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </div>
  );
}
