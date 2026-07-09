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
import { buildMissionPrompt } from "@/lib/prompts/mission";
import { buildValuesPrompt } from "@/lib/prompts/values";
import { buildPositioningPrompt } from "@/lib/prompts/positioning";
import { buildBrandPersonaPrompt } from "@/lib/prompts/brand-persona";
import { buildCoreMessagePrompt } from "@/lib/prompts/core-message";
import { buildBrandStoryPrompt } from "@/lib/prompts/brand-story";
import {
  PurposeContent,
  VisionContent,
  MissionContent,
  ValuesContent,
  PositioningStrategyContent,
  BrandPersonaContent,
  CoreMessageContent,
  BrandStoryContent,
} from "@/lib/sections/content-types";

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
    case "mission":
      prompt = buildMissionPrompt({
        content: currentContent as MissionContent,
        language,
        contextBlocks,
      });
      break;
    case "values":
      prompt = buildValuesPrompt({
        content: currentContent as ValuesContent,
        language,
        contextBlocks,
      });
      break;
    case "positioning_strategy":
      prompt = buildPositioningPrompt({
        content: currentContent as PositioningStrategyContent,
        language,
        contextBlocks,
      });
      break;
    case "brand_persona":
      prompt = buildBrandPersonaPrompt({
        content: currentContent as BrandPersonaContent,
        language,
        contextBlocks,
      });
      break;
    case "core_message":
      prompt = buildCoreMessagePrompt({
        content: currentContent as CoreMessageContent,
        language,
        contextBlocks,
      });
      break;
    case "brand_story":
      prompt = buildBrandStoryPrompt({
        content: currentContent as BrandStoryContent,
        language,
        contextBlocks,
      });
      break;
    default:
      throw new Error(`No prompt template implemented yet for ${sectionType}`);
  }

  // Every section now drafts multi-part, richly detailed prose rather than a
  // one-line statement, so all budgets are generous; the multi-chapter /
  // multi-block sections need the most room.
  const TOKEN_BUDGET: Record<SectionType, number> = {
    purpose: 2048,
    vision: 2048,
    mission: 2048,
    values: 2048,
    audience_persona: 2048,
    competitor_audit: 2048,
    positioning_strategy: 3072,
    brand_persona: 4096,
    core_message: 8192,
    brand_story: 8192,
  };
  const maxTokens = TOKEN_BUDGET[sectionType] ?? 2048;

  const model = getModelFor(provider);
  const statement = await getGenerator(provider).generateText({
    prompt,
    model,
    maxTokens,
  });

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
