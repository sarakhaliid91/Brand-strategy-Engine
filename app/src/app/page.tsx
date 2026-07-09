import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getClientsWithProjects } from "@/lib/db/queries";
import {
  createClientAction,
  createProjectAction,
  deleteClientAction,
  renameClientAction,
  deleteProjectAction,
  renameProjectAction,
  duplicateProjectAction,
} from "@/app/actions";
import { AppHeader, ProgressBar, ui } from "@/app/ui";
import { ConfirmSubmitButton, ClientSearchFilter } from "@/app/client-ui";
import { getDict } from "@/lib/i18n";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { t } = await getDict();
  const clients = await getClientsWithProjects(session.user.id);

  return (
    <div className="min-h-screen bg-ivory">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black text-ink">
              {t.dashboard.title}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{t.dashboard.subtitle}</p>
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
          <div className="rounded-panel bg-ivory-dark px-8 py-16 text-center">
            <p className="font-display text-2xl font-bold text-plum">
              {t.dashboard.emptyTitle}
            </p>
            <p className="mt-2 text-sm text-plum/70">
              {t.dashboard.emptyHint}
            </p>
          </div>
        )}

        {clients.length > 3 && (
          <ClientSearchFilter
            placeholder={t.dashboard.searchPlaceholder}
            noMatches={t.dashboard.noSearchMatches}
          />
        )}

        <div className="flex flex-col gap-6">
          {clients.map((client) => (
            <section
              key={client.id}
              data-client-card
              data-client-name={client.name}
              className={`${ui.card} p-6 sm:p-7`}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-2xl font-bold text-ink">
                  {client.name}
                </h2>
                <div className="flex items-center gap-1">
                  <details className="group relative">
                    <summary className="cursor-pointer list-none rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ivory hover:text-ink">
                      {t.dashboard.rename}
                    </summary>
                    <form
                      action={renameClientAction.bind(null, client.id)}
                      className="absolute end-0 top-full z-10 mt-1 flex gap-1.5 rounded-card border border-line bg-cream p-2 shadow-lg"
                    >
                      <input
                        name="name"
                        defaultValue={client.name}
                        required
                        autoFocus
                        className={`${ui.input} w-48`}
                      />
                      <button type="submit" className={ui.btnSoft}>
                        {t.dashboard.save}
                      </button>
                    </form>
                  </details>
                  <ConfirmSubmitButton
                    action={deleteClientAction.bind(null, client.id)}
                    confirmMessage={t.dashboard.confirmDeleteClient(client.name)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-peach-soft hover:text-ink"
                  >
                    {t.dashboard.delete}
                  </ConfirmSubmitButton>
                </div>
              </div>

              <ul className="mb-5 flex flex-col gap-2.5">
                {client.projects.map((project) => {
                  const done =
                    project.totalCount > 0 &&
                    project.approvedCount === project.totalCount;
                  return (
                    <li
                      key={project.id}
                      className="rounded-card border border-line transition hover:border-plum hover:bg-ivory-dark/40"
                    >
                      <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">
                        <Link
                          href={`/projects/${project.id}`}
                          className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex items-center gap-2">
                              <span className="truncate text-sm font-bold text-ink">
                                {project.name}
                              </span>
                              <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase text-ink-soft">
                                {project.language === "ar" ? "العربية" : "EN"}
                              </span>
                            </div>
                            <ProgressBar
                              value={project.approvedCount}
                              total={project.totalCount}
                            />
                          </div>
                          <span
                            className={`shrink-0 text-xs font-bold ${done ? "text-plum" : "text-ink-soft"}`}
                          >
                            {done
                              ? t.dashboard.complete
                              : t.dashboard.approvedOf(
                                  project.approvedCount,
                                  project.totalCount,
                                )}
                          </span>
                        </Link>
                        <div className="flex shrink-0 flex-wrap items-center gap-0.5">
                          <details className="group relative">
                            <summary className="cursor-pointer list-none rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:bg-ivory hover:text-ink">
                              {t.dashboard.rename}
                            </summary>
                            <form
                              action={renameProjectAction.bind(null, project.id)}
                              className="absolute end-0 top-full z-10 mt-1 flex gap-1.5 rounded-card border border-line bg-cream p-2 shadow-lg"
                            >
                              <input
                                name="name"
                                defaultValue={project.name}
                                required
                                autoFocus
                                className={`${ui.input} w-48`}
                              />
                              <button type="submit" className={ui.btnSoft}>
                                {t.dashboard.save}
                              </button>
                            </form>
                          </details>
                          <form action={duplicateProjectAction.bind(null, project.id)}>
                            <button
                              type="submit"
                              title={t.project.duplicateHint}
                              className="rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:bg-ivory hover:text-ink"
                            >
                              {t.dashboard.duplicate}
                            </button>
                          </form>
                          <ConfirmSubmitButton
                            action={deleteProjectAction.bind(null, project.id)}
                            confirmMessage={t.dashboard.confirmDeleteProject(
                              project.name,
                            )}
                            className="rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:bg-peach-soft hover:text-ink"
                          >
                            {t.dashboard.delete}
                          </ConfirmSubmitButton>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {client.projects.length === 0 && (
                  <li className="rounded-card border border-dashed border-line px-5 py-4 text-sm text-ink-soft">
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
