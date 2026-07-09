"use client";

/**
 * Next.js redacts thrown-error messages in production builds (they only
 * reach the client as this generic string, plus a `digest` you'd have to
 * cross-reference in server logs) — so this boundary can't just print
 * `error.message` and expect it to be useful. Give a generic, actionable
 * hint instead of a dead end.
 */
const REDACTED_MARKER = "Server Components render";

export default function SectionError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const isRedacted = error.message?.includes(REDACTED_MARKER);
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <div className="rounded-card bg-peach-soft p-6 text-sm text-ink">
        <p className="font-display text-lg font-bold">Something went wrong</p>
        <p className="mt-1.5 text-ink/80">
          {isRedacted
            ? "This usually means something the page needs isn't set up yet — most often a missing AI API key in Vercel's Environment Variables. Double-check those, then try again."
            : error.message}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-ink px-4 py-2 text-xs font-bold text-cream transition hover:bg-plum-deep"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
