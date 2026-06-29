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

  return `You are a senior brand strategist articulating a brand's persona — the brand as if
it were a person.

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

Write a cohesive Brand Persona description in ${langName} (2-4 short paragraphs) that brings
this person to life: who they are, how they carry themselves, how they speak, and how they
make the audience feel. Ground it in the archetype mix and interview answers above. Write only
the description, no headings, no markdown.`;
}
