import { CoreMessageContent } from "@/lib/sections/content-types";

export function buildCoreMessagePrompt(args: {
  content: CoreMessageContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist writing a brand's Core Message — a StoryBrand-style
message map used to talk about the brand consistently.

Approved context from earlier in this brand strategy (purpose, vision, mission, values,
audience, positioning, brand persona):
${contextBlocks.join("\n\n") || "(none)"}

${content.guidance ? `Extra guidance from the strategist: ${content.guidance}\n` : ""}
Write the Core Message in ${langName}, structured into these labelled blocks. For each of the
first five, write a rich paragraph that answers who/where/how/why as relevant:

AUDIENCE: who they are, where they are, and why they are our audience.
PAIN POINTS: their core pain point, where/when it shows up, and why it matters to them.
KEY BENEFIT: the main benefit they get from us, and why it matters.
COMPETITIVE ALTERNATIVE: what we offer instead of the ordinary alternative.
DIFFERENTIATOR: what makes us genuinely different.

Then a short SECONDARY CORE MESSAGE that restates, in one line each, the brand's Purpose,
Vision, Mission, and Values (drawn from the approved context).

Use the block labels above as headings (e.g. "AUDIENCE:") followed by the text. No markdown
symbols, just the labels and prose.`;
}
