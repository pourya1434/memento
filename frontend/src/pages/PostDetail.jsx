import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPost, mediaUrl } from "../api.js";
import Markdown from "../components/Markdown.jsx";
import Attachments from "../components/Attachments.jsx";

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

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPost(null);
    setError(false);
    getPost(slug).then(setPost).catch(() => setError(true));
  }, [slug]);

  if (error)
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-muted">Post not found.</p>
        <Link to="/" className="text-accent-soft hover:underline">
          ← Back home
        </Link>
      </div>
    );

  if (!post) return <p className="mx-auto max-w-2xl text-muted">Loading…</p>;

  const fa = post.language === "fa";

  return (
    <article
      dir={fa ? "rtl" : "ltr"}
      className={`mx-auto max-w-2xl animate-fade-up ${fa ? "font-fa" : ""}`}
    >
      <Link
        to="/"
        className="mb-8 inline-block text-sm text-muted hover:text-accent-soft"
      >
        {fa ? "بازگشت →" : "← Back"}
      </Link>

      {post.cover_image && (
        <img
          src={mediaUrl(post.cover_image)}
          alt={post.title}
          className="mb-8 w-full rounded-xl border border-ink-700"
        />
      )}

      <h1
        className={`text-3xl font-bold leading-tight text-coral sm:text-4xl ${
          fa ? "font-fa" : "font-serif"
        }`}
      >
        {post.title}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
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
          className="mt-3 inline-block break-all text-sm text-accent-soft hover:underline"
        >
          {post.source_url}
        </a>
      )}

      <div className="mt-8">
        <Markdown>{post.body}</Markdown>
      </div>

      <Attachments items={post.attachments} />
    </article>
  );
}
