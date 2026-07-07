import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { getDict } from "@/lib/i18n";
import { setLanguageAction } from "@/app/actions";

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl = "/", error } = await searchParams;
  const { t, locale } = await getDict();
  const otherLocale = locale === "ar" ? "en" : "ar";

  return (
    <div className="flex min-h-screen items-center justify-center bg-plum-deep px-4 py-10">
      <div className="w-full max-w-md rounded-panel bg-cream p-8 sm:p-10">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-plum">
            {t.login.kicker}
          </p>
          <form action={setLanguageAction.bind(null, otherLocale)}>
            <button
              type="submit"
              lang={otherLocale}
              className="rounded-full border border-plum/30 px-3 py-1 text-xs font-bold text-plum transition hover:bg-plum hover:text-cream"
            >
              {locale === "ar" ? "English" : "العربية"}
            </button>
          </form>
        </div>
        <h1
          dir="ltr"
          className="mb-8 text-start font-display text-4xl font-black leading-tight text-ink"
        >
          Brand Strategy
          <br />
          <span className="bse-mark">Engine</span>
        </h1>

        {error && (
          <p className="mb-4 rounded-xl bg-peach px-4 py-3 text-sm font-semibold text-ink">
            {t.login.invalid}
          </p>
        )}

        <form action={loginAction} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wide text-plum"
            >
              {t.login.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-xl border-2 border-line bg-ivory px-4 py-3 text-sm text-ink outline-none transition focus:border-plum"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wide text-plum"
            >
              {t.login.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-xl border-2 border-line bg-ivory px-4 py-3 text-sm text-ink outline-none transition focus:border-plum"
            />
          </div>
          <button
            type="submit"
            className="mt-3 rounded-full bg-plum px-5 py-3.5 text-sm font-bold text-cream transition hover:bg-plum-deep active:scale-[0.98]"
          >
            {t.login.signIn}
          </button>
        </form>

        <p className="mt-6 text-xs text-ink-soft">{t.login.tagline}</p>
      </div>
    </div>
  );
}
