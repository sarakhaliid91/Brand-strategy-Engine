import { PositioningStrategyContent } from "@/lib/sections/content-types";

export function buildPositioningPrompt(args: {
  content: PositioningStrategyContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  const diffs = content.differentiators
    .map(
      (d) =>
        `- ${d.idea}: adds "${d.addedValue}", enhances experience by "${d.enhancesExperience}"${d.rating ? ` (rating ${d.rating})` : ""}`,
    )
    .join("\n");

  return `You are a senior brand strategist writing a brand's Unique Selling Proposition (USP)
and Positioning Statement for a paying client's brand strategy deck.

Approved context from earlier in this brand strategy (audience, competitor gaps, values, etc.):
${contextBlocks.join("\n\n") || "(none)"}

Unmet needs: ${content.unmetNeeds.join("; ") || "(none)"}
Opportunities: ${content.opportunities.join("; ") || "(none)"}
Differentiator shortlist:
${diffs || "(none)"}

USP raw inputs — end result delivered: "${content.uspEndResult}"; benefit of the difference: "${content.uspBenefit}".
Positioning template inputs — we help: "${content.posWeHelp}"; who: "${content.posWho}";
to achieve/experience: "${content.posToAchieve}"; unlike (the ordinary alternative): "${content.posUnlike}";
our solution: "${content.posOurSolution}".

Write four things in ${langName}, each grounded in the concrete inputs above (never generic):

1. USP STATEMENT: one rich, specific sentence combining the end result and the benefit of
   difference into a compelling promise.
2. POSITIONING STATEMENT: one or two full sentences following the logic "We help [who] who
   [need] to [achieve/experience], unlike [the ordinary alternative], through [our unique
   solution]" — written as finished, confident prose, not a fill-in-the-blank template.
3. WHY THIS WINS: a detailed paragraph (4-6 sentences) explaining, using the unmet needs,
   opportunities and differentiator shortlist above, exactly why this positioning is defensible
   and hard to copy — reference the specific differentiators and their ratings.
4. HOW WE'LL PROVE IT: a paragraph (3-5 sentences) translating the positioning into 2-3 concrete,
   observable things the brand should consistently do or say so customers actually experience
   this positioning, not just read about it.

Format your answer exactly as:
USP STATEMENT: <text>

POSITIONING STATEMENT: <text>

WHY THIS WINS: <text>

HOW WE'LL PROVE IT: <text>

Keep the four labels above in English exactly as shown even though the text after each is in
${langName}. No other commentary, no markdown.`;
}
