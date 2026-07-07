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
import { getDict } from "@/lib/i18n";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    <div className="min-h-screen bg-paper">
      <AppHeader backHref="/" backLabel={t.project.dashboard}>
        <Link href={`/projects/${id}/review`} className={ui.btnPrimary}>
          {t.project.reviewExport}
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-black text-ink">
            {project.name}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <ProgressBar
              value={approvedCount}
              total={ORDERED_SECTION_TYPES.length}
              className="max-w-xs"
            />
            <span className="text-xs font-bold text-muted">
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
                  className="flex items-center gap-4 rounded-card border border-line bg-card px-5 py-4 transition hover:border-brand hover:bg-mint-soft/40"
                >
                  <span className="w-8 shrink-0 font-display text-2xl font-black text-brand">
                    {def.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{loc.name}</p>
                    <p className="truncate text-xs text-muted">{loc.summary}</p>
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
