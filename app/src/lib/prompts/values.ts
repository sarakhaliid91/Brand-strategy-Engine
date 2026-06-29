import { ValuesContent } from "@/lib/sections/content-types";

export function buildValuesPrompt(args: {
  content: ValuesContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  const perceptions = content.groupPerceptions
    .map(
      (g) =>
        `- ${g.group}: wants to be seen as ${g.comments.join("; ")} (values: ${g.relatedValues.join(", ")})`,
    )
    .join("\n");

  const seeded = content.coreValues
    .map((v) => `- ${v.value}${v.actionSentence ? `: ${v.actionSentence}` : ""}`)
    .join("\n");

  return `You are a senior brand strategist refining a brand's core values.

Approved context from earlier in this brand strategy:
${contextBlocks.join("\n\n") || "(none)"}

How different stakeholder groups should perceive the brand:
${perceptions || "(not provided)"}

Values shortlist gathered: ${content.shortlist.join(", ") || "(none)"}
Any core values already seeded:
${seeded || "(none)"}

Produce a clean set of 4-6 brand core values in ${langName}. For each value, give the value
word followed by a colon and one short, vivid "action-based" sentence describing how the brand
lives it (the strategist's house style is evocative one-liners, e.g. a value of "luxury" →
"you'll feel like the precious piece in everything"). Output one value per line as
"Value: sentence". No preamble, no numbering, no markdown.`;
}
