"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SECTION_TYPES, SectionType } from "@/lib/sections/types";
import {
  getProjectOwnedByUser,
  getSectionWithCurrentVersion,
  saveDraftContent,
  approveSection,
  createGeneratedVersion,
  hasAIVersion,
  setCurrentVersion,
  getCompetitorEntries,
  addCompetitorEntry,
  getCompetitorEntry,
  saveCompetitorResearch,
  deleteCompetitorEntry,
  getApprovedContent,
  getClientIndustryForProject,
} from "@/lib/sections/queries";
import { generateSectionDraft } from "@/lib/ai/generate";
import { researchCompetitor, synthesizeCompetitors } from "@/lib/ai/research";
import { formatApprovedContent } from "@/lib/sections/format";
import {
  CompetitorResearchResult,
} from "@/lib/sections/content-types";
import { AIProvider } from "@/lib/ai/providers/types";
import { isProviderConfigured } from "@/lib/ai/client";
import {
  parsePurposeForm,
  parseVisionForm,
  parseMissionForm,
  parseValuesForm,
  parseAudiencePersonaForm,
  parsePositioningStrategyForm,
  parseBrandPersonaForm,
  parseCoreMessageForm,
  parseBrandStoryForm,
} from "@/lib/sections/content-types";

async function requireOwnedProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const project = await getProjectOwnedByUser(projectId, session.user.id);
  if (!project) throw new Error("Project not found");
  return project;
}

function isSectionType(value: string): value is SectionType {
  return (SECTION_TYPES as readonly string[]).includes(value);
}

function parseContentForm(sectionType: SectionType, formData: FormData) {
  switch (sectionType) {
    case "purpose":
      return parsePurposeForm(formData);
    case "vision":
      return parseVisionForm(formData);
    case "mission":
      return parseMissionForm(formData);
    case "values":
      return parseValuesForm(formData);
    case "audience_persona":
      return parseAudiencePersonaForm(formData);
    case "positioning_strategy":
      return parsePositioningStrategyForm(formData);
    case "brand_persona":
      return parseBrandPersonaForm(formData);
    case "core_message":
      return parseCoreMessageForm(formData);
    case "brand_story":
      return parseBrandStoryForm(formData);
    default:
      throw new Error(`No form parser for ${sectionType}`);
  }
}

export async function saveSectionAction(
  projectId: string,
  sectionTypeRaw: string,
  formData: FormData,
) {
  await requireOwnedProject(projectId);
  if (!isSectionType(sectionTypeRaw)) throw new Error("Invalid section type");

  const content = parseContentForm(sectionTypeRaw, formData) as unknown as Record<
    string,
    unknown
  >;

  // The notes form doesn't render the AI-written `statement`, so preserve any
  // existing one rather than blanking it when the strategist re-saves notes.
  const existing = await getSectionWithCurrentVersion(projectId, sectionTypeRaw);
  const prev = existing?.currentVersion?.content as
    | Record<string, unknown>
    | undefined;
  if (prev && typeof prev.statement === "string" && !content.statement) {
    content.statement = prev.statement;
  }

  await saveDraftContent(projectId, sectionTypeRaw, content, "manual_entry");
  revalidatePath(`/projects/${projectId}/${sectionTypeRaw}`);
  revalidatePath(`/projects/${projectId}`);
}

export async function approveSectionAction(
  projectId: string,
  sectionTypeRaw: string,
) {
  await requireOwnedProject(projectId);
  if (!isSectionType(sectionTypeRaw)) throw new Error("Invalid section type");

  await approveSection(projectId, sectionTypeRaw);
  revalidatePath(`/projects/${projectId}/${sectionTypeRaw}`);
  revalidatePath(`/projects/${projectId}`);
}

function isProvider(value: string): value is AIProvider {
  return value === "anthropic" || value === "openai";
}

export async function generateSectionAction(
  projectId: string,
  sectionTypeRaw: string,
  providerRaw: string,
) {
  const project = await requireOwnedProject(projectId);
  if (!isSectionType(sectionTypeRaw)) throw new Error("Invalid section type");
  if (!isProvider(providerRaw)) throw new Error("Invalid AI provider");
  if (!isProviderConfigured(providerRaw)) {
    throw new Error(
      `${providerRaw === "anthropic" ? "Claude" : "ChatGPT"} is not configured. Add its API key to .env.local.`,
    );
  }

  const existing = await getSectionWithCurrentVersion(projectId, sectionTypeRaw);
  if (!existing?.currentVersion) {
    throw new Error("Save your raw notes for this section before generating a draft.");
  }
  const currentContent = existing.currentVersion.content;

  const { content, generationMetadata } = await generateSectionDraft(
    projectId,
    sectionTypeRaw,
    currentContent,
    project.language,
    providerRaw,
  );

  const source = (await hasAIVersion(projectId, sectionTypeRaw))
    ? "ai_regenerated"
    : "ai_generated";
  await createGeneratedVersion(
    projectId,
    sectionTypeRaw,
    content,
    source,
    generationMetadata,
  );

  revalidatePath(`/projects/${projectId}/${sectionTypeRaw}`);
  revalidatePath(`/projects/${projectId}`);
}

export async function selectVersionAction(
  projectId: string,
  sectionTypeRaw: string,
  versionId: string,
) {
  await requireOwnedProject(projectId);
  if (!isSectionType(sectionTypeRaw)) throw new Error("Invalid section type");

  await setCurrentVersion(projectId, sectionTypeRaw, versionId);
  revalidatePath(`/projects/${projectId}/${sectionTypeRaw}`);
  revalidatePath(`/projects/${projectId}`);
}

// ---- Competitor research (competitor_audit section) ----

export async function addCompetitorAction(
  projectId: string,
  formData: FormData,
) {
  await requireOwnedProject(projectId);
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!name) return;

  await addCompetitorEntry(projectId, name, url || null);
  revalidatePath(`/projects/${projectId}/competitor_audit`);
}

export async function researchCompetitorAction(
  projectId: string,
  entryId: string,
) {
  const project = await requireOwnedProject(projectId);
  const entry = await getCompetitorEntry(entryId);
  if (!entry) throw new Error("Competitor not found");

  const industry = await getClientIndustryForProject(projectId);
  const result = await researchCompetitor({
    competitorName: entry.competitorName,
    competitorUrl: entry.competitorUrl,
    industry,
    language: project.language,
  });

  await saveCompetitorResearch(entryId, result);
  revalidatePath(`/projects/${projectId}/competitor_audit`);
}

export async function deleteCompetitorAction(
  projectId: string,
  entryId: string,
) {
  await requireOwnedProject(projectId);
  await deleteCompetitorEntry(entryId);
  revalidatePath(`/projects/${projectId}/competitor_audit`);
}

export async function synthesizeCompetitorsAction(projectId: string) {
  const project = await requireOwnedProject(projectId);

  const rows = await getCompetitorEntries(projectId);
  const researched = rows.filter((r) => r.researchResult);
  if (researched.length === 0) {
    throw new Error("Research at least one competitor before synthesizing.");
  }

  const positioningApproved = await getApprovedContent(
    projectId,
    "positioning_strategy",
  );
  const positioningContext = positioningApproved
    ? formatApprovedContent("positioning_strategy", positioningApproved)
    : "";

  const statement = await synthesizeCompetitors({
    entries: researched.map((r) => ({
      name: r.competitorName,
      result: r.researchResult as CompetitorResearchResult,
    })),
    positioningContext,
    language: project.language,
  });

  const source = (await hasAIVersion(projectId, "competitor_audit"))
    ? "ai_regenerated"
    : "ai_generated";
  await createGeneratedVersion(
    projectId,
    "competitor_audit",
    { statement },
    source,
    {
      provider: "anthropic",
      model: "claude-sonnet-4-6",
      competitorsResearched: researched.length,
      generatedAt: new Date().toISOString(),
    },
  );

  revalidatePath(`/projects/${projectId}/competitor_audit`);
  revalidatePath(`/projects/${projectId}`);
}
