import { VisionContent } from "@/lib/sections/content-types";

export function buildVisionPrompt(args: {
  content: VisionContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist drafting a Brand Vision statement for a paying
client's brand strategy deck.

Approved context from earlier in this brand strategy (use it to keep the vision aligned):
${contextBlocks.join("\n\n") || "(none)"}

Raw 5-10 year impact aspirations gathered from the strategist:
- Customers: ${content.customers.join("; ") || "(not provided)"}
- Achievements: ${content.achievements.join("; ") || "(not provided)"}
- Industry: ${content.industry.join("; ") || "(not provided)"}
- Environment: ${content.environment.join("; ") || "(not provided)"}
- World: ${content.world.join("; ") || "(not provided)"}

Write the Brand Vision in ${langName} as TWO parts:
1. VISION STATEMENT: one vivid, specific sentence in a "We aspire to (verb) (statement)"
   structure. A vision statement is deliberately a single powerful line — do not pad it into a
   paragraph — but it must be concrete and ambitious, naming the specific market position or
   scale the brand is aiming for (not a vague "be the best" cliché).
2. WHAT THIS LOOKS LIKE: a detailed paragraph (4-6 sentences) unpacking that vision across the
   concrete aspirations above — customers, achievements, industry impact, environment, and
   wider world — grounded in the specific details given, painting a picture of what success
   actually looks like in 5-10 years.

Format your answer exactly as:
VISION STATEMENT: <one sentence>

WHAT THIS LOOKS LIKE: <the paragraph>

Keep the labels "VISION STATEMENT:" and "WHAT THIS LOOKS LIKE:" in English exactly as shown even
though the text after them is in ${langName} — this keeps the document structure consistent
across languages. No other commentary, no markdown.`;
}
