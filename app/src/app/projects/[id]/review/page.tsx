import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import {
  getProjectOwnedByUser,
  getProjectSectionsForReview,
} from "@/lib/sections/queries";
import { SECTION_DEFINITIONS } from "@/lib/sections/definitions";
import { SectionContentView } from "@/lib/sections/render";

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
    <div className="min-h-screen bg-zinc-50">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-8 py-4">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            &larr; {project.name}
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-zinc-900">
            Review &amp; export
          </h1>
          <p className="text-xs text-zinc-500">
            {approvedCount}/{sections.length} sections approved
          </p>
        </div>
        <div className="flex items-center gap-2">
          {allApproved ? (
            <a
              href={`/api/projects/${projectId}/export`}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Export PDF
            </a>
          ) : (
            <span
              title="All sections must be approved before exporting"
              className="cursor-not-allowed rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400"
            >
              Export PDF
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-8 py-10">
        {!allApproved && (
          <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Export unlocks once every section is approved. Approved sections are
            shown below; the rest are listed as pending.
          </p>
        )}

        <div
          className="flex flex-col gap-8"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {sections.map(({ type, status, content }) => {
            const def = SECTION_DEFINITIONS[type];
            return (
              <section key={type} className="bse-review-section">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-zinc-900">
                    {def.order}. {def.displayName}
                  </h2>
                  <Link
                    href={`/projects/${projectId}/${type}`}
                    className="text-xs text-zinc-400 hover:text-zinc-700"
                  >
                    {status === "approved" ? "Edit" : status.replace("_", " ")}
                  </Link>
                </div>
                {status === "approved" && content ? (
                  <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed text-zinc-800 [&_.bse-block]:mb-3 [&_.bse-block-heading]:mb-1 [&_.bse-block-heading]:text-xs [&_.bse-block-heading]:font-semibold [&_.bse-block-heading]:uppercase [&_.bse-block-heading]:tracking-wide [&_.bse-block-heading]:text-zinc-500 [&_.bse-para]:mb-2 [&_.bse-para]:whitespace-pre-wrap [&_.bse-values]:flex [&_.bse-values]:flex-col [&_.bse-values]:gap-1 [&_.bse-value-name]:font-semibold [&_.bse-persona-name]:font-semibold">
                    <SectionContentView type={type} content={content} />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-200 bg-white/50 p-6 text-sm text-zinc-400">
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
