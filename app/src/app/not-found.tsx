import Link from "next/link";
import { getDict } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md rounded-panel bg-brand p-10 text-center">
        <p className="font-display text-6xl font-black text-ink">404</p>
        <p className="mt-2 text-sm font-semibold text-brand-deep">
          {t.notFound.message}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black"
        >
          {t.notFound.backHome}
        </Link>
      </div>
    </div>
  );
}
