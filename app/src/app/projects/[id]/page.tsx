import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, sections } from "@/lib/db/schema";
import { SECTION_DEFINITIONS, ORDERED_SECTION_TYPES } from "@/lib/sections/definitions";
import { SectionType } from "@/lib/sections/types";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) notFound();

  const projectSections = await db
    .select()
    .from(sections)
    .where(eq(sections.projectId, id));

  const statusByType = new Map(
    projectSections.map((s) => [s.sectionType as SectionType, s.status]),
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-8 py-4">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          &larr; Dashboard
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-zinc-900">
          {project.name}
        </h1>
      </header>

      <main className="mx-auto max-w-2xl px-8 py-10">
        <ol className="flex flex-col gap-2">
          {ORDERED_SECTION_TYPES.map((type) => {
            const def = SECTION_DEFINITIONS[type];
            const status = statusByType.get(type) ?? "not_started";
            return (
              <li key={type}>
                <a
                  href={`/projects/${id}/${type}`}
                  className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {def.order}. {def.displayName}
                    </p>
                    <p className="text-xs text-zinc-500">{def.summary}</p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                    {status.replace("_", " ")}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
