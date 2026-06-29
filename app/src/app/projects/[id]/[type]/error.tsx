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
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p className="font-medium">Something went wrong</p>
        <p className="mt-1">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-800 ring-1 ring-red-300 hover:bg-red-100"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
