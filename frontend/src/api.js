// Static data layer — no server required.
//
// The site is built from JSON exported by the Django `export_static` command
// (backend/blog/management/commands/export_static.py). Filtering, search, and
// pagination that the REST API used to do are replicated here in the browser,
// so the public site can be hosted as static files (e.g. GitHub Pages).

// BASE_URL is "/" locally and "/<repo>/" on GitHub Pages project sites.
const BASE = import.meta.env.BASE_URL;

const loadJson = (path) =>
  fetch(`${BASE}${path}`).then((r) => {
    if (!r.ok) throw new Error(`Failed to load ${path}: ${r.status}`);
    return r.json();
  });

// Fetch each dataset at most once.
let categoriesPromise;
let postsPromise;
const loadCategories = () => (categoriesPromise ??= loadJson("data/categories.json"));
const loadPosts = () => (postsPromise ??= loadJson("data/posts.json"));

// Must match Django's old REST_FRAMEWORK PAGE_SIZE (and Home.jsx).
const PAGE_SIZE = 10;

export const getCategories = () => loadCategories();

export const getPosts = async (params = {}) => {
  let items = await loadPosts();

  const page = params.page || 1;
  const categorySlug = params["category__slug"];
  const search = (params.search || "").trim().toLowerCase();

  if (categorySlug) {
    items = items.filter((p) => p.category && p.category.slug === categorySlug);
  }
  if (search) {
    items = items.filter((p) =>
      [p.title, p.excerpt, p.body]
        .filter(Boolean)
        .some((text) => text.toLowerCase().includes(search))
    );
  }

  const count = items.length;
  const start = (page - 1) * PAGE_SIZE;
  const results = items.slice(start, start + PAGE_SIZE);

  // Same shape Home.jsx expects from the old paginated API.
  return {
    count,
    results,
    next: start + PAGE_SIZE < count ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
  };
};

export const getPost = (slug) =>
  loadJson(`data/posts/${encodeURIComponent(slug)}.json`);

// Build a usable URL for a media path. Exported paths are repo-relative
// (e.g. "media/covers/x.jpg"); absolute URLs are passed through untouched.
export const mediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE}${String(path).replace(/^\//, "")}`;
};
