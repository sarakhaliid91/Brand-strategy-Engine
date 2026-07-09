import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sections } from "@/lib/db/schema";
import {
  SECTION_DEFINITIONS,
  ORDERED_SECTION_TYPES,
} from "@/lib/sections/definitions";
import { SectionType, localizedSection } from "@/lib/sections/types";
import { getProjectOwnedByUser } from "@/lib/sections/queries";
import { AppHeader, ProgressBar, StatusChip, ui } from "@/app/ui";
import { ConfirmSubmitButton } from "@/app/client-ui";
import {
  renameProjectAction,
  deleteProjectAction,
  duplicateProjectAction,
} from "@/app/actions";
import { getDict } from "@/lib/i18n";
import { isValidUuid } from "@/lib/db/uuid";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidUuid(id)) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getProjectOwnedByUser(id, session.user.id);
  if (!project) notFound();

  const { t, locale } = await getDict();

  const projectSections = await db
    .select()
    .from(sections)
    .where(eq(sections.projectId, id));

  const statusByType = new Map(
    projectSections.map((s) => [s.sectionType as SectionType, s.status]),
  );
  const approvedCount = ORDERED_SECTION_TYPES.filter(
    (t) => statusByType.get(t) === "approved",
  ).length;

  return (
    <div className="min-h-screen bg-ivory">
      <AppHeader backHref="/" backLabel={t.project.dashboard}>
        <Link href={`/projects/${id}/review`} className={ui.btnPrimary}>
          {t.project.reviewExport}
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-4xl font-black text-ink">
              {project.name}
            </h1>
            <div className="flex items-center gap-1">
              <details className="group relative">
                <summary className="cursor-pointer list-none rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ivory-dark hover:text-ink">
                  {t.dashboard.rename}
                </summary>
                <form
                  action={renameProjectAction.bind(null, id)}
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
              <form action={duplicateProjectAction.bind(null, id)}>
                <button
                  type="submit"
                  title={t.project.duplicateHint}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ivory-dark hover:text-ink"
                >
                  {t.dashboard.duplicate}
                </button>
              </form>
              <ConfirmSubmitButton
                action={deleteProjectAction.bind(null, id)}
                confirmMessage={t.dashboard.confirmDeleteProject(project.name)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-peach-soft hover:text-ink"
              >
                {t.dashboard.delete}
              </ConfirmSubmitButton>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ProgressBar
              value={approvedCount}
              total={ORDERED_SECTION_TYPES.length}
              className="max-w-xs"
            />
            <span className="text-xs font-bold text-ink-soft">
              {t.dashboard.approvedOf(
                approvedCount,
                ORDERED_SECTION_TYPES.length,
              )}
            </span>
          </div>
        </div>

        <ol className="flex flex-col gap-2.5">
          {ORDERED_SECTION_TYPES.map((type) => {
            const def = SECTION_DEFINITIONS[type];
            const loc = localizedSection(def, locale);
            const status = statusByType.get(type) ?? "not_started";
            return (
              <li key={type}>
                <Link
                  href={`/projects/${id}/${type}`}
                  className="flex items-center gap-4 rounded-card border border-line bg-cream px-5 py-4 transition hover:border-plum hover:bg-ivory-dark/40"
                >
                  <span className="w-8 shrink-0 font-display text-2xl font-black text-plum">
                    {def.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{loc.name}</p>
                    <p className="truncate text-xs text-ink-soft">{loc.summary}</p>
                  </div>
                  <StatusChip status={status} />
                </Link>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
