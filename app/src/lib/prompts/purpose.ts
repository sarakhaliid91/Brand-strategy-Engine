import { PurposeContent } from "@/lib/sections/content-types";

export function buildPurposePrompt(args: {
  content: PurposeContent;
  language: "ar" | "en";
}): string {
  const { content, language } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist drafting an internal Brand Purpose statement.

Raw inputs gathered from the strategist:
- Who we are helping: ${content.whoWeHelp.join("; ") || "(not provided)"}
- What we help them with: ${content.whatWeHelpThemWith.join("; ") || "(not provided)"}
- Desired emotion for the audience: ${content.desiredEmotion.join("; ") || "(not provided)"}
- How that emotion impacts their lives: ${content.emotionImpact.join("; ") || "(not provided)"}
- Knock-on effects elsewhere in their lives: ${content.knockOnEffect.join("; ") || "(not provided)"}
- Practical impact of that knock-on effect: ${content.practicalImpact.join("; ") || "(not provided)"}
- Biggest impact the brand can have in customers' lives: ${content.biggestImpact || "(not provided)"}

Write a single, polished Brand Purpose statement in ${langName} (2-3 sentences) that synthesizes
the above into a clear statement of who the brand serves, what it does for them, and the
deeper impact it has on their lives. Write only the statement itself, no preamble, no quotes,
no markdown.`;
}
