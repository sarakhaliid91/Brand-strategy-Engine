import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getClientsWithProjects } from "@/lib/db/queries";
import { createClientAction, createProjectAction } from "@/app/actions";
import { AppHeader, ProgressBar, ui } from "@/app/ui";
import { getDict } from "@/lib/i18n";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { t } = await getDict();
  const clients = await getClientsWithProjects(session.user.id);

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black text-ink">
              {t.dashboard.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{t.dashboard.subtitle}</p>
          </div>
          <form action={createClientAction} className="flex gap-2">
            <input
              name="name"
              placeholder={t.dashboard.newClientPlaceholder}
              required
              className={ui.input}
            />
            <button type="submit" className={ui.btnPrimary}>
              {t.dashboard.addClient}
            </button>
          </form>
        </div>

        {clients.length === 0 && (
          <div className="rounded-panel bg-mint-soft px-8 py-16 text-center">
            <p className="font-display text-2xl font-bold text-brand-deep">
              {t.dashboard.emptyTitle}
            </p>
            <p className="mt-2 text-sm text-brand-deep/70">
              {t.dashboard.emptyHint}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {clients.map((client) => (
            <section key={client.id} className={`${ui.card} p-6 sm:p-7`}>
              <h2 className="mb-4 font-display text-2xl font-bold text-ink">
                {client.name}
              </h2>

              <ul className="mb-5 flex flex-col gap-2.5">
                {client.projects.map((project) => {
                  const done =
                    project.totalCount > 0 &&
                    project.approvedCount === project.totalCount;
                  return (
                    <li key={project.id}>
                      <Link
                        href={`/projects/${project.id}`}
                        className="group flex items-center gap-4 rounded-card border border-line px-5 py-4 transition hover:border-brand hover:bg-mint-soft/40"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center gap-2">
                            <span className="truncate text-sm font-bold text-ink">
                              {project.name}
                            </span>
                            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase text-muted">
                              {project.language === "ar" ? "العربية" : "EN"}
                            </span>
                          </div>
                          <ProgressBar
                            value={project.approvedCount}
                            total={project.totalCount}
                          />
                        </div>
                        <span
                          className={`shrink-0 text-xs font-bold ${done ? "text-brand-deep" : "text-muted"}`}
                        >
                          {done
                            ? t.dashboard.complete
                            : t.dashboard.approvedOf(
                                project.approvedCount,
                                project.totalCount,
                              )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {client.projects.length === 0 && (
                  <li className="rounded-card border border-dashed border-line px-5 py-4 text-sm text-muted">
                    {t.dashboard.noProjects}
                  </li>
                )}
              </ul>

              <form action={createProjectAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="clientId" value={client.id} />
                <input
                  name="name"
                  placeholder={t.dashboard.projectNamePlaceholder}
                  required
                  className={`${ui.input} min-w-40 flex-1`}
                />
                <select name="language" defaultValue="ar" className={ui.input}>
                  <option value="ar">{t.dashboard.arabic}</option>
                  <option value="en">{t.dashboard.english}</option>
                </select>
                <button type="submit" className={ui.btnSoft}>
                  {t.dashboard.newProject}
                </button>
              </form>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
