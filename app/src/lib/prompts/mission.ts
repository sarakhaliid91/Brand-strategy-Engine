import { MissionContent } from "@/lib/sections/content-types";

export function buildMissionPrompt(args: {
  content: MissionContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist drafting a Brand Mission statement for a paying
client's brand strategy deck.

Approved context from earlier in this brand strategy (keep the mission aligned with it):
${contextBlocks.join("\n\n") || "(none)"}

Ongoing commitments the strategist listed (the things the brand does, day in, day out):
${content.ongoingCommitments.map((c) => `- ${c}`).join("\n") || "(not provided)"}

Write the Brand Mission in ${langName} as TWO parts:
1. MISSION STATEMENT: one or two punchy, present-tense sentences ("We are committed to...")
   synthesizing the ongoing commitments into a single coherent statement of what the brand does
   now, every day. Concrete and specific — not aspirational (that's the vision above), not vague.
2. HOW WE DELIVER ON IT: a detailed paragraph (4-6 sentences) that walks through the concrete,
   day-to-day commitments listed above and explains specifically how each one shows up in the
   customer's experience of the brand.

Format your answer exactly as:
MISSION STATEMENT: <the statement>

HOW WE DELIVER ON IT: <the paragraph>

Keep the labels "MISSION STATEMENT:" and "HOW WE DELIVER ON IT:" in English exactly as shown even
though the text after them is in ${langName}. No other commentary, no markdown.`;
}
