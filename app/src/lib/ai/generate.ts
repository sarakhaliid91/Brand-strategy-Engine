import { getGenerator, getModelFor } from "./client";
import { AIProvider } from "./providers/types";
import { SectionType } from "@/lib/sections/types";
import { SECTION_DEFINITIONS } from "@/lib/sections/definitions";
import { formatApprovedContent } from "@/lib/sections/format";
import {
  getApprovedContent,
  isGenerateUnlocked,
} from "@/lib/sections/queries";
import { buildPurposePrompt } from "@/lib/prompts/purpose";
import { buildVisionPrompt } from "@/lib/prompts/vision";
import { PurposeContent, VisionContent } from "@/lib/sections/content-types";

/**
 * Generates a draft for one section, gathering approved context from its
 * `requiredContext` chain. Returns the new content (existing raw-input
 * fields preserved, `statement` overwritten with the AI draft) plus
 * generation metadata for traceability.
 */
export async function generateSectionDraft(
  projectId: string,
  sectionType: SectionType,
  currentContent: unknown,
  language: "ar" | "en",
  provider: AIProvider,
): Promise<{ content: unknown; generationMetadata: unknown }> {
  const unlocked = await isGenerateUnlocked(projectId, sectionType);
  if (!unlocked) {
    throw new Error(
      `Cannot generate ${sectionType}: required context sections are not all approved yet.`,
    );
  }

  const def = SECTION_DEFINITIONS[sectionType];
  const contextBlocks: string[] = [];
  for (const required of def.requiredContext) {
    const approved = await getApprovedContent(projectId, required);
    if (approved) contextBlocks.push(formatApprovedContent(required, approved));
  }

  let prompt: string;
  switch (sectionType) {
    case "purpose":
      prompt = buildPurposePrompt({
        content: currentContent as PurposeContent,
        language,
      });
      break;
    case "vision":
      prompt = buildVisionPrompt({
        content: currentContent as VisionContent,
        language,
        contextBlocks,
      });
      break;
    default:
      throw new Error(`No prompt template implemented yet for ${sectionType}`);
  }

  const model = getModelFor(provider);
  const statement = await getGenerator(provider).generateText({ prompt, model });

  return {
    content: { ...(currentContent as object), statement },
    generationMetadata: {
      provider,
      model,
      contextSections: def.requiredContext,
      generatedAt: new Date().toISOString(),
    },
  };
}
