import Link from "next/link";
import { signOutAction, setLanguageAction } from "@/app/actions";
import { getDict } from "@/lib/i18n";

/* Shared class recipes — one place to keep the Thmanyah look consistent. */
export const ui = {
  btnPrimary:
    "inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
  btnDark:
    "inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
  btnSoft:
    "inline-flex items-center justify-center rounded-full bg-mint-soft px-4 py-2 text-sm font-semibold text-brand-deep transition hover:bg-mint active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
  btnGhost:
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-ink/5 hover:text-ink",
  input:
    "rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-mint",
  card: "rounded-card border border-line bg-card",
  label: "text-xs font-semibold text-muted",
} as const;

const STATUS_CLS: Record<string, string> = {
  approved: "bg-brand text-ink",
  in_review: "bg-mint text-brand-deep",
  draft: "bg-ink/10 text-ink",
  not_started: "border border-dashed border-line bg-transparent text-muted",
};

export async function StatusChip({ status }: { status: string }) {
  const { t } = await getDict();
  const cls = STATUS_CLS[status] ?? STATUS_CLS.not_started;
  const label = t.status[status] ?? t.status.not_started;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}
    >
      {label}
    </span>
  );
}

export function ProgressBar({
  value,
  total,
  className = "",
}: {
  value: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-ink/10 ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div
        className="h-full rounded-full bg-brand transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Wordmark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      dir="ltr"
      className={`font-display text-lg font-bold tracking-tight ${inverted ? "text-white" : "text-ink"}`}
    >
      Brand Strategy{" "}
      <span className="bse-mark font-black text-ink">Engine</span>
    </span>
  );
}

async function LanguageToggle() {
  const { locale } = await getDict();
  const other = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "English" : "العربية";
  return (
    <form action={setLanguageAction.bind(null, other)}>
      <button
        type="submit"
        lang={other}
        className="rounded-full border border-white/20 px-3 py-1.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        {label}
      </button>
    </form>
  );
}

/** Black app-chrome header used on every screen. */
export async function AppHeader({
  backHref,
  backLabel,
  children,
}: {
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}) {
  const { t } = await getDict();
  return (
    <header className="bg-ink">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" className="shrink-0">
            <Wordmark inverted />
          </Link>
          {backHref && (
            <Link
              href={backHref}
              className="hidden truncate text-sm text-white/60 transition hover:text-white sm:block"
            >
              {t.back} {backLabel ?? ""}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {children}
          <LanguageToggle />
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              {t.signOut}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
