import { BrandStoryContent } from "@/lib/sections/content-types";

export function buildBrandStoryPrompt(args: {
  content: BrandStoryContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist writing a brand's Brand Story for a paying client's
brand strategy deck — a hero's-journey narrative where the customer is the hero and the brand is
the guide. This is the capstone, most vivid document in the whole strategy: it should read like
a short piece of narrative non-fiction grounded entirely in the approved strategy so far, not
generic inspirational copy.

Approved context from the whole brand strategy so far (audience persona, positioning, brand
persona, core message, values, purpose, vision, mission):
${contextBlocks.join("\n\n") || "(none)"}

The hero is the brand's customer.${content.characterName ? ` Use the name "${content.characterName}" for the hero.` : " Give the hero a fitting, specific name (not a placeholder)."}
${content.guidance ? `Extra guidance from the strategist: ${content.guidance}\n` : ""}
Write the Brand Story in ${langName} as seven chapters. This must be long-form and detailed —
each chapter should be 3-5 fully developed paragraphs (not two or three thin sentences), rich
with concrete, sensory, specific detail drawn directly from the audience persona and other
approved context above (their actual demographics, routines, fears, desires — not invented
generic details). Use these chapter headings exactly:

THE EXISTING WORLD: the hero's normal everyday life in vivid, specific detail — their age,
occupation, routines morning to night, what they value, how they spend their time — drawn from
the audience persona.

THE OBSTACLE: what they struggle with that the brand solves — their core pain points, internal
and external struggles, and the emotions attached, in concrete situations rather than abstract
statements.

THE CALL TO ACTION: the specific moment or accumulation of moments that made them realize they
had to act, and what the consequences would have been if they hadn't.

MEETING THE GUIDE: the moment the brand enters the story as the guide — its point of difference,
key benefit, and the specific way its mission and values reassure the hero that this is the
right path.

THE CHALLENGE: the hero commits to act; their fears and vulnerability surface in specific,
human detail — what they hope for and what they're afraid of.

THE TRANSFORMATION: they overcome the problem — the concrete external achievement and the
quieter internal one, painted as a clear before-and-after contrast.

THE NEW WORLD: the life they now have, realized in specific detail, and the lasting outlook it
gives them — full circle back to the existing world, transformed.

Use the chapter labels above in English exactly as shown, even though the narrative itself is
written in ${langName}, followed by the prose. Put a blank line between chapters. No markdown
symbols, just the labels and narrative.`;
}
