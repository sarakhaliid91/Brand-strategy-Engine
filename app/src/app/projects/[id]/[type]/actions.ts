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
} from "@/lib/sections/queries";
import { generateSectionDraft } from "@/lib/ai/generate";
import { AIProvider } from "@/lib/ai/providers/types";
import { isProviderConfigured } from "@/lib/ai/client";
import {
  parsePurposeForm,
  parseVisionForm,
  parseMissionForm,
  parseValuesForm,
  parseAudiencePersonaForm,
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

  const content = parseContentForm(sectionTypeRaw, formData);
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
