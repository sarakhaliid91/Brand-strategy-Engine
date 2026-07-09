import { BrandPersonaContent } from "@/lib/sections/content-types";

export function buildBrandPersonaPrompt(args: {
  content: BrandPersonaContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  const roles = content.archetypeRoleMix
    .filter((a) => a.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((a) => `${a.archetype} (${a.weight})`)
    .join(", ");

  const interview = content.interview
    .filter((q) => q.answer.trim())
    .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
    .join("\n");

  return `You are a senior brand strategist articulating a brand's persona for a paying client's
brand strategy deck — the brand written up as if it were a specific, vivid person, the way an
actor would prepare a character brief.

Approved context from earlier in this brand strategy (audience, values, positioning):
${contextBlocks.join("\n\n") || "(none)"}

Brand archetype mix: ${roles || "(not provided)"}
Personality characteristics: ${content.personalityCharacteristics || "(not provided)"}
Desires: ${content.personalityDesires || "(not provided)"} | Fears: ${content.personalityFears || "(not provided)"}
Appearance: ${content.appearanceCharacteristics || "(not provided)"}; dress/style: ${content.dressStyle}; accessories: ${content.accessories}
Tone of voice: ${content.toneOfVoice || "(not provided)"}
Language keywords/phrases: ${content.languageKeywords || "(not provided)"}
Brand interview answers:
${interview || "(none)"}

Write a rich Brand Persona description in ${langName}, structured into these labelled sections,
each a fully developed paragraph (not a one-liner) grounded specifically in the inputs above —
avoid generic personality-brief language that could describe any brand:

WHO THEY ARE: introduce this person — their character, values and what drives them, weaving in
the archetype mix and personality/desires/fears above.

HOW THEY PRESENT THEMSELVES: their appearance, style of dress, accessories, and the overall
impression they give at first glance, grounded in the appearance inputs above.

HOW THEY SPEAK: their tone of voice, the language and phrases they favor and avoid, and how that
voice actually sounds across a few different situations (greeting a customer, handling a
complaint, celebrating a win) — draw directly on the brand interview answers above.

HOW THEY MAKE PEOPLE FEEL: the specific emotional effect this person has on the audience when
they interact with them, tied back to the audience's own desires and fears from the approved
context.

Use the section labels above exactly as headings, in English, kept as-is even though the
paragraphs themselves are in ${langName} — this keeps the document structure consistent across
languages. Put a blank line between sections. No markdown symbols.`;
}
