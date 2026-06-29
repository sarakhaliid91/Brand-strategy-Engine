import { BrandStoryContent } from "@/lib/sections/content-types";

export function buildBrandStoryPrompt(args: {
  content: BrandStoryContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist writing a brand's Brand Story — a hero's-journey
narrative where the customer is the hero and the brand is the guide.

Approved context from the whole brand strategy so far (audience persona, positioning, brand
persona, core message, values, purpose, vision, mission):
${contextBlocks.join("\n\n") || "(none)"}

The hero is the brand's customer.${content.characterName ? ` Use the name "${content.characterName}" for the hero.` : " Give the hero a fitting name."}
${content.guidance ? `Extra guidance from the strategist: ${content.guidance}\n` : ""}
Write the Brand Story in ${langName} as seven chapters, each a few vivid paragraphs, using
these chapter headings exactly:

THE EXISTING WORLD: the hero's normal everyday life (drawn from the audience persona).
THE OBSTACLE: what they struggle with that the brand solves (their pains, fears, internal and external struggles).
THE CALL TO ACTION: the moment they realise they must act, and the consequences of not acting.
MEETING THE GUIDE: where the brand enters as the guide — its point of difference, key benefit, mission and values reassure the hero.
THE CHALLENGE: they commit to act; their fears and vulnerability surface.
THE TRANSFORMATION: they overcome the problem; external and internal achievements; the from→to contrast.
THE NEW WORLD: the life they desired, now realised, and the lasting outlook it gives them.

Use the chapter labels above as headings followed by the prose. No markdown symbols, just the
labels and narrative.`;
}
