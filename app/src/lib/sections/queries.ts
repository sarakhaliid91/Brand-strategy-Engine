import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sections, sectionVersions, projects, clients } from "@/lib/db/schema";
import { SectionType } from "./types";
import { SECTION_DEFINITIONS } from "./definitions";

export async function getProject(projectId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return project;
}

export async function getProjectOwnedByUser(projectId: string, userId: string) {
  const [row] = await db
    .select({ project: projects })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(and(eq(projects.id, projectId), eq(clients.userId, userId)))
    .limit(1);
  return row?.project ?? null;
}

export async function getSection(projectId: string, sectionType: SectionType) {
  const [section] = await db
    .select()
    .from(sections)
    .where(
      and(eq(sections.projectId, projectId), eq(sections.sectionType, sectionType)),
    )
    .limit(1);
  return section;
}

export async function getSectionWithCurrentVersion(
  projectId: string,
  sectionType: SectionType,
) {
  const section = await getSection(projectId, sectionType);
  if (!section) return null;

  let currentVersion = null;
  if (section.currentVersionId) {
    const [version] = await db
      .select()
      .from(sectionVersions)
      .where(eq(sectionVersions.id, section.currentVersionId))
      .limit(1);
    currentVersion = version ?? null;
  }

  return { section, currentVersion };
}

export async function getApprovedContent(
  projectId: string,
  sectionType: SectionType,
) {
  const result = await getSectionWithCurrentVersion(projectId, sectionType);
  if (!result || result.section.status !== "approved") return null;
  return result.currentVersion?.content ?? null;
}

/** True only if every section in `requiredContext` is approved. */
export async function isGenerateUnlocked(
  projectId: string,
  sectionType: SectionType,
) {
  const def = SECTION_DEFINITIONS[sectionType];
  for (const required of def.requiredContext) {
    const section = await getSection(projectId, required);
    if (!section || section.status !== "approved") return false;
  }
  return true;
}

/**
 * Saves a draft: if the current version is unapproved, mutates it in place;
 * otherwise (no version yet, or current is approved) creates a new version.
 * Keeps version history limited to meaningful Generate/Regenerate/Approve
 * events rather than every keystroke-level save.
 */
export async function saveDraftContent(
  projectId: string,
  sectionType: SectionType,
  content: unknown,
  source: "manual_entry" | "manual_edit_after_ai" = "manual_entry",
) {
  const section = await getSection(projectId, sectionType);
  if (!section) throw new Error(`Section ${sectionType} not found`);

  let currentVersion = null;
  if (section.currentVersionId) {
    const [version] = await db
      .select()
      .from(sectionVersions)
      .where(eq(sectionVersions.id, section.currentVersionId))
      .limit(1);
    currentVersion = version ?? null;
  }

  if (currentVersion && section.status !== "approved") {
    await db
      .update(sectionVersions)
      .set({ content })
      .where(eq(sectionVersions.id, currentVersion.id));
  } else {
    const [newVersion] = await db
      .insert(sectionVersions)
      .values({
        sectionId: section.id,
        versionNumber: (currentVersion?.versionNumber ?? 0) + 1,
        content,
        source,
      })
      .returning();

    await db
      .update(sections)
      .set({ currentVersionId: newVersion.id, status: "draft" })
      .where(eq(sections.id, section.id));
    return;
  }

  await db
    .update(sections)
    .set({ status: "draft" })
    .where(eq(sections.id, section.id));
}

export async function approveSection(projectId: string, sectionType: SectionType) {
  const section = await getSection(projectId, sectionType);
  if (!section) throw new Error(`Section ${sectionType} not found`);
  if (!section.currentVersionId) {
    throw new Error("Cannot approve a section with no content yet");
  }

  await db
    .update(sections)
    .set({ status: "approved" })
    .where(eq(sections.id, section.id));
}

export async function createGeneratedVersion(
  projectId: string,
  sectionType: SectionType,
  content: unknown,
  source: "ai_generated" | "ai_regenerated",
  generationMetadata: unknown,
) {
  const section = await getSection(projectId, sectionType);
  if (!section) throw new Error(`Section ${sectionType} not found`);

  let lastVersionNumber = 0;
  if (section.currentVersionId) {
    const [version] = await db
      .select()
      .from(sectionVersions)
      .where(eq(sectionVersions.id, section.currentVersionId))
      .limit(1);
    lastVersionNumber = version?.versionNumber ?? 0;
  }

  const [newVersion] = await db
    .insert(sectionVersions)
    .values({
      sectionId: section.id,
      versionNumber: lastVersionNumber + 1,
      content,
      source,
      generationMetadata,
    })
    .returning();

  await db
    .update(sections)
    .set({ currentVersionId: newVersion.id, status: "in_review" })
    .where(eq(sections.id, section.id));
}
