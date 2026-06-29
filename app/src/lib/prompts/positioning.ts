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
and Positioning Statement.

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

Write two things in ${langName}, each as polished prose:
1. A one-sentence USP statement.
2. A positioning statement (1-2 sentences) following the logic "We help [who] who [need] to
   [achieve/experience], unlike [the ordinary alternative], through [our unique solution]."

Format your answer exactly as:
USP: <usp statement>

Positioning: <positioning statement>

No other commentary, no markdown.`;
}
