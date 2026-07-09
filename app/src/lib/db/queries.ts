import { eq, desc, and, inArray } from "drizzle-orm";
import { db } from "./index";
import { clients, projects, sections, sectionVersions } from "./schema";
import { ORDERED_SECTION_TYPES } from "@/lib/sections/definitions";

export async function getClientsWithProjects(userId: string) {
  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(desc(clients.createdAt));

  const result = [];
  for (const client of rows) {
    const clientProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.clientId, client.id))
      .orderBy(desc(projects.createdAt));

    const projectsWithProgress = [];
    for (const project of clientProjects) {
      const projectSections = await db
        .select()
        .from(sections)
        .where(eq(sections.projectId, project.id));
      const approvedCount = projectSections.filter(
        (s) => s.status === "approved",
      ).length;
      projectsWithProgress.push({
        ...project,
        approvedCount,
        totalCount: ORDERED_SECTION_TYPES.length,
      });
    }

    result.push({ ...client, projects: projectsWithProgress });
  }

  return result;
}

export async function createClient(userId: string, name: string) {
  const [client] = await db
    .insert(clients)
    .values({ userId, name })
    .returning();
  return client;
}

export async function createProject(
  clientId: string,
  name: string,
  language: "ar" | "en",
) {
  const [project] = await db
    .insert(projects)
    .values({ clientId, name, language })
    .returning();

  await db.insert(sections).values(
    ORDERED_SECTION_TYPES.map((sectionType) => ({
      projectId: project.id,
      sectionType,
    })),
  );

  return project;
}

/** Deletes a client and (via FK cascade) every project/section/version under it. */
export async function deleteClientOwnedByUser(clientId: string, userId: string) {
  await db
    .delete(clients)
    .where(and(eq(clients.id, clientId), eq(clients.userId, userId)));
}

export async function renameClientOwnedByUser(
  clientId: string,
  userId: string,
  name: string,
) {
  await db
    .update(clients)
    .set({ name })
    .where(and(eq(clients.id, clientId), eq(clients.userId, userId)));
}

/** Deletes a project and (via FK cascade) every section/version under it. */
export async function deleteProjectOwnedByUser(projectId: string, userId: string) {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(and(eq(projects.id, projectId), eq(clients.userId, userId)))
    .limit(1);
  if (!row) return;
  await db.delete(projects).where(eq(projects.id, projectId));
}

export async function renameProjectOwnedByUser(
  projectId: string,
  userId: string,
  name: string,
) {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(and(eq(projects.id, projectId), eq(clients.userId, userId)))
    .limit(1);
  if (!row) return;
  await db.update(projects).set({ name }).where(eq(projects.id, projectId));
}

/**
 * Duplicates a project within the same client: same name suffixed "(Copy)",
 * same language, and every section's current content copied over as a fresh
 * unapproved draft (so the new copy starts back at review, not pre-approved).
 */
export async function duplicateProjectOwnedByUser(
  projectId: string,
  userId: string,
) {
  const [original] = await db
    .select({ project: projects })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(and(eq(projects.id, projectId), eq(clients.userId, userId)))
    .limit(1);
  if (!original) return null;

  const sourceSections = await db
    .select()
    .from(sections)
    .where(eq(sections.projectId, projectId));
  const versionIds = sourceSections
    .map((s) => s.currentVersionId)
    .filter((id): id is string => Boolean(id));
  const versions = versionIds.length
    ? await db
        .select()
        .from(sectionVersions)
        .where(inArray(sectionVersions.id, versionIds))
    : [];
  const versionById = new Map(versions.map((v) => [v.id, v]));

  const [copy] = await db
    .insert(projects)
    .values({
      clientId: original.project.clientId,
      name: `${original.project.name} (Copy)`,
      language: original.project.language,
    })
    .returning();

  for (const source of sourceSections) {
    const [newSection] = await db
      .insert(sections)
      .values({ projectId: copy.id, sectionType: source.sectionType })
      .returning();

    const sourceVersion = source.currentVersionId
      ? versionById.get(source.currentVersionId)
      : undefined;
    if (sourceVersion) {
      const [newVersion] = await db
        .insert(sectionVersions)
        .values({
          sectionId: newSection.id,
          versionNumber: 1,
          content: sourceVersion.content,
          source: "manual_entry",
        })
        .returning();
      await db
        .update(sections)
        .set({ currentVersionId: newVersion.id, status: "draft" })
        .where(eq(sections.id, newSection.id));
    }
  }

  return copy;
}
