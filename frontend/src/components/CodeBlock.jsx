import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// A code block with language label + copy button, styled to match the
// cozy dark theme.
export default function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  return (
    <div className="group my-5 overflow-hidden rounded-lg border border-ink-700 bg-[#1d242c]">
      <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-wide text-muted">
          {language || "code"}
        </span>
        <button
          onClick={copy}
          className="rounded px-2 py-1 text-xs text-muted opacity-0 transition hover:text-accent-soft group-hover:opacity-100"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: "transparent",
          padding: "1rem 1.1rem",
          fontSize: "0.85rem",
        }}
        codeTagProps={{ style: { fontFamily: '"JetBrains Mono", monospace' } }}
        wrapLongLines
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
