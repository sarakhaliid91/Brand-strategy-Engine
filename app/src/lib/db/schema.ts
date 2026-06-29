import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  integer,
  unique,
} from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "in_progress",
  "complete",
  "archived",
]);

export const projectLanguageEnum = pgEnum("project_language", ["ar", "en"]);

export const sectionStatusEnum = pgEnum("section_status", [
  "not_started",
  "draft",
  "in_review",
  "approved",
]);

export const versionSourceEnum = pgEnum("version_source", [
  "manual_entry",
  "ai_generated",
  "ai_regenerated",
  "manual_edit_after_ai",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  industry: text("industry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: projectStatusEnum("status").default("in_progress").notNull(),
  language: projectLanguageEnum("language").default("ar").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// sectionType values are defined in code (see lib/sections/definitions.ts),
// not as a DB enum, so adding a new section type is a code change only.
export const sections = pgTable(
  "sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sectionType: text("section_type").notNull(),
    status: sectionStatusEnum("status").default("not_started").notNull(),
    currentVersionId: uuid("current_version_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.projectId, table.sectionType)],
);

export const sectionVersions = pgTable("section_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  content: jsonb("content").notNull(),
  source: versionSourceEnum("source").notNull(),
  generationMetadata: jsonb("generation_metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const competitorEntries = pgTable("competitor_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  competitorName: text("competitor_name").notNull(),
  competitorUrl: text("competitor_url"),
  researchResult: jsonb("research_result"),
  researchedAt: timestamp("researched_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exports = pgTable("exports", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  exportedAt: timestamp("exported_at").defaultNow().notNull(),
  snapshotOfVersions: jsonb("snapshot_of_versions").notNull(),
});
