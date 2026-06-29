import { anthropic, DRAFTING_MODEL } from "./client";
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

async function callClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Add it to .env.local to enable AI drafting.",
    );
  }
  const response = await anthropic.messages.create({
    model: DRAFTING_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected AI response type");
  return block.text.trim();
}

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

  const statement = await callClaude(prompt);

  return {
    content: { ...(currentContent as object), statement },
    generationMetadata: {
      model: DRAFTING_MODEL,
      contextSections: def.requiredContext,
      generatedAt: new Date().toISOString(),
    },
  };
}
