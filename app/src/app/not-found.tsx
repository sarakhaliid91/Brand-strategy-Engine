import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md rounded-panel bg-brand p-10 text-center">
        <p className="font-display text-6xl font-black text-ink">404</p>
        <p className="mt-2 text-sm font-semibold text-brand-deep">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
