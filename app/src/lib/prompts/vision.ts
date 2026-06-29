import { VisionContent } from "@/lib/sections/content-types";

export function buildVisionPrompt(args: {
  content: VisionContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist drafting a Brand Vision statement.

Approved context from earlier in this brand strategy (use it to keep the vision aligned):
${contextBlocks.join("\n\n") || "(none)"}

Raw 5-10 year impact aspirations gathered from the strategist:
- Customers: ${content.customers.join("; ") || "(not provided)"}
- Achievements: ${content.achievements.join("; ") || "(not provided)"}
- Industry: ${content.industry.join("; ") || "(not provided)"}
- Environment: ${content.environment.join("; ") || "(not provided)"}
- World: ${content.world.join("; ") || "(not provided)"}

Write a single, polished Brand Vision statement in ${langName} (1-2 sentences) using a
"We aspire to (verb) (statement)" structure, synthesizing the above aspirations into an
ambitious but credible long-term vision aligned with the brand purpose above. Write only
the statement itself, no preamble, no quotes, no markdown.`;
}
