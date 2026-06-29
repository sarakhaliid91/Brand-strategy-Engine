import { eq, desc } from "drizzle-orm";
import { db } from "./index";
import { clients, projects, sections } from "./schema";
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
