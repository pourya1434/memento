import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPosts, getCategories } from "../api.js";
import PostCard from "../components/PostCard.jsx";
import Pagination from "../components/Pagination.jsx";

// Must match Django REST_FRAMEWORK PAGE_SIZE.
const PAGE_SIZE = 10;

export default function Home() {
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Reset to the first page whenever the category or search changes.
  useEffect(() => {
    setPage(1);
  }, [slug, query]);

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (slug) params["category__slug"] = slug;
    if (query) params.search = query;

    getPosts(params)
      .then((data) => {
        setPosts(data.results ?? data);
        setCount(data.count ?? (data.results ? data.results.length : data.length));
      })
      .finally(() => setLoading(false));
  }, [slug, query, page]);

  useEffect(() => {
    if (!slug) {
      setCategory(null);
      return;
    }
    getCategories().then((cats) =>
      setCategory(cats.find((c) => c.slug === slug) || null)
    );
  }, [slug]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const goToPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10">
        <h1 className="font-serif text-3xl font-bold text-body sm:text-4xl">
          {category ? category.name : "Latest"}
        </h1>
        <p className="mt-2 text-muted">
          {category
            ? category.description || "Posts in this category."
            : "A cozy corner for notes on programming, art, and literature."}
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts…"
          className="mt-5 w-full rounded-lg border border-ink-700 bg-ink-800/60 px-4 py-2.5 text-sm text-body placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </header>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-muted">No posts found.</p>
      ) : (
        <>
          <div className="space-y-8">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} />
            ))}
          </div>

          {!query && (
            <div className="mt-4 text-center text-xs text-muted">
              Page {page} of {totalPages} · {count} posts
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  );
}
