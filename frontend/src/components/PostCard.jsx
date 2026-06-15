import { Link } from "react-router-dom";

function formatDate(iso, lang) {
  try {
    return new Date(iso).toLocaleDateString(lang === "fa" ? "fa-IR" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function PostCard({ post, index = 0 }) {
  const fa = post.language === "fa";
  return (
    <article
      dir={fa ? "rtl" : "ltr"}
      className="animate-fade-up border-b border-ink-700/70 pb-8"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      <Link to={`/post/${post.slug}`} className="group block">
        <h2
          className={`text-2xl font-bold leading-tight text-coral transition-colors group-hover:text-[#f08a7e] sm:text-[1.7rem] ${
            fa ? "font-fa" : "font-serif"
          }`}
        >
          {post.title}
        </h2>
      </Link>

      <div className="mt-1 flex items-center gap-3 text-xs text-muted">
        <span>{formatDate(post.created_at, post.language)}</span>
        {post.category && (
          <Link
            to={`/category/${post.category.slug}`}
            className="rounded-full bg-ink-800 px-2 py-0.5 hover:text-accent-soft"
          >
            {post.category.name}
          </Link>
        )}
      </div>

      {post.source_url && (
        <a
          href={post.source_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block break-all text-sm text-accent-soft hover:underline"
        >
          {post.source_url}
        </a>
      )}

      {post.excerpt && (
        <p className={`mt-3 text-body/90 ${fa ? "font-fa leading-loose" : ""}`}>
          {post.excerpt}
        </p>
      )}

      <Link
        to={`/post/${post.slug}`}
        className="mt-3 inline-block text-sm text-muted hover:text-accent-soft"
      >
        {fa ? "ادامه ←" : "Read more →"}
      </Link>
    </article>
  );
}
