"use client";

import { useState, useTransition } from "react";

/**
 * Wraps a destructive form submit with a native confirm() prompt. Kept as
 * the one small client island in an otherwise all-server-actions app —
 * just enough JS to stop an accidental delete click.
 */
export function ConfirmSubmitButton({
  action,
  confirmMessage,
  className,
  children,
}: {
  action: () => void | Promise<void>;
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(() => {
            action();
          });
        }
      }}
    >
      {children}
    </button>
  );
}

/** Copies text to the clipboard with a brief "Copied!" confirmation. */
export function CopyButton({
  text,
  label,
  copiedLabel,
  className,
}: {
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // Clipboard API unavailable (e.g. insecure context) — no-op.
        }
      }}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

/** Client-side filter over a list of client cards by name, no server round-trip. */
export function ClientSearchFilter({
  placeholder,
  noMatches,
}: {
  placeholder: string;
  noMatches: string;
}) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  return (
    <div className="mb-5">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          const q = e.target.value;
          setQuery(q);
          const needle = q.trim().toLowerCase();
          let visible = 0;
          document
            .querySelectorAll<HTMLElement>("[data-client-card]")
            .forEach((el) => {
              const name = (el.dataset.clientName ?? "").toLowerCase();
              const match = !needle || name.includes(needle);
              el.style.display = match ? "" : "none";
              if (match) visible += 1;
            });
          setVisibleCount(needle ? visible : null);
        }}
        placeholder={placeholder}
        className="w-full max-w-xs rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-plum focus:ring-2 focus:ring-peach-soft"
      />
      {visibleCount === 0 && (
        <p className="mt-1 text-xs text-ink-soft/60">{noMatches}</p>
      )}
    </div>
  );
}
