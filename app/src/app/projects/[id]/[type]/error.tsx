"use client";

export default function SectionError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <div className="rounded-card bg-coral-soft p-6 text-sm text-ink">
        <p className="font-display text-lg font-bold">Something went wrong</p>
        <p className="mt-1.5 text-ink/80">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-black"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
