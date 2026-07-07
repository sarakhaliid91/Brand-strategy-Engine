import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import {
  getProjectOwnedByUser,
  getProjectSectionsForReview,
} from "@/lib/sections/queries";
import { SECTION_DEFINITIONS } from "@/lib/sections/definitions";
import { SectionContentView } from "@/lib/sections/render";
import { AppHeader, ProgressBar, ui } from "@/app/ui";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getProjectOwnedByUser(projectId, session.user.id);
  if (!project) notFound();

  const sections = await getProjectSectionsForReview(projectId);
  const approvedCount = sections.filter((s) => s.status === "approved").length;
  const allApproved = approvedCount === sections.length;
  const isRtl = project.language === "ar";

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader backHref={`/projects/${projectId}`} backLabel={project.name}>
        {allApproved ? (
          <a href={`/api/projects/${projectId}/export`} className={ui.btnPrimary}>
            Export PDF
          </a>
        ) : (
          <span
            title="All sections must be approved before exporting"
            className="cursor-not-allowed rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white/40"
          >
            Export PDF
          </span>
        )}
      </AppHeader>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-black text-ink">
            Review &amp; export
          </h1>
          <p className="mt-1 text-sm text-muted">{project.name}</p>
          <div className="mt-4 flex items-center gap-3">
            <ProgressBar
              value={approvedCount}
              total={sections.length}
              className="max-w-xs"
            />
            <span className="text-xs font-bold text-muted">
              {approvedCount}/{sections.length} approved
            </span>
          </div>
        </div>

        {!allApproved && (
          <p className="mb-8 rounded-card bg-coral-soft px-5 py-4 text-sm font-semibold text-ink">
            Export unlocks once every section is approved. Approved sections
            are shown below; the rest are listed as pending.
          </p>
        )}

        <div className="flex flex-col gap-8" dir={isRtl ? "rtl" : "ltr"}>
          {sections.map(({ type, status, content }) => {
            const def = SECTION_DEFINITIONS[type];
            return (
              <section key={type}>
                <div className="mb-2.5 flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-xl font-bold text-ink">
                    <span className="text-brand">{def.order}.</span>{" "}
                    {def.displayName}
                  </h2>
                  <Link
                    href={`/projects/${projectId}/${type}`}
                    className="shrink-0 text-xs font-semibold text-muted transition hover:text-ink"
                    dir="ltr"
                  >
                    {status === "approved" ? "Edit" : "Open"}
                  </Link>
                </div>
                {status === "approved" && content ? (
                  <div className="rounded-card border border-line bg-card p-6 font-serif text-[15px] leading-relaxed text-ink [&_.bse-block]:mb-3.5 [&_.bse-block-heading]:mb-1 [&_.bse-block-heading]:font-sans [&_.bse-block-heading]:text-xs [&_.bse-block-heading]:font-bold [&_.bse-block-heading]:uppercase [&_.bse-block-heading]:tracking-wide [&_.bse-block-heading]:text-brand-deep [&_.bse-para]:mb-2 [&_.bse-para]:whitespace-pre-wrap [&_.bse-values]:flex [&_.bse-values]:flex-col [&_.bse-values]:gap-1.5 [&_.bse-value-name]:font-bold [&_.bse-persona-name]:font-display [&_.bse-persona-name]:text-lg [&_.bse-persona-name]:font-bold">
                    <SectionContentView type={type} content={content} />
                  </div>
                ) : (
                  <div className="rounded-card border border-dashed border-line bg-card/50 p-6 text-sm text-muted">
                    Not yet approved.
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
