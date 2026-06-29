import { MissionContent } from "@/lib/sections/content-types";

export function buildMissionPrompt(args: {
  content: MissionContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist drafting a Brand Mission statement.

Approved context from earlier in this brand strategy (keep the mission aligned with it):
${contextBlocks.join("\n\n") || "(none)"}

Ongoing commitments the strategist listed (the things the brand does, day in, day out):
${content.ongoingCommitments.map((c) => `- ${c}`).join("\n") || "(not provided)"}

Write a single, polished Brand Mission statement in ${langName} (1-3 sentences). A mission
describes what the brand does now and is committed to doing — concrete and present-tense,
distinct from the aspirational vision above. Synthesize the commitments into one coherent
statement. Write only the statement itself, no preamble, no quotes, no markdown.`;
}
