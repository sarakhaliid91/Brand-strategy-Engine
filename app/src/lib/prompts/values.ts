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

  return `You are a senior brand strategist refining a brand's core values for a paying client's
brand strategy deck.

Approved context from earlier in this brand strategy:
${contextBlocks.join("\n\n") || "(none)"}

How different stakeholder groups should perceive the brand:
${perceptions || "(not provided)"}

Values shortlist gathered: ${content.shortlist.join(", ") || "(none)"}
Any core values already seeded:
${seeded || "(none)"}

Produce a clean set of 5-7 brand core values in ${langName}, synthesized from the stakeholder
perceptions and shortlist above (do not just invent generic values like "quality" or
"innovation" unless the inputs genuinely point there). For each value, give the value word
followed by a colon and one vivid, specific, action-based sentence describing how the brand
lives it day to day — written in second person, as if speaking directly to the customer (the
strategist's house style: an evocative one-liner, e.g. a value of "luxury" →
"You'll feel like the precious piece in everything we do"). Each sentence should be concrete
enough that it could only belong to this brand, not a stock phrase that fits any company.

Output one value per line as "Value: sentence". No preamble, no numbering, no markdown.`;
}
