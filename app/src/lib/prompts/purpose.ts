import { PurposeContent } from "@/lib/sections/content-types";

export function buildPurposePrompt(args: {
  content: PurposeContent;
  language: "ar" | "en";
}): string {
  const { content, language } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist drafting an internal Brand Purpose statement for a
paying client's brand strategy deck. This document will be read by the business owner and used
to align every future decision, so it must feel specific to THIS business, never generic or
interchangeable with any other brand.

Raw inputs gathered from the strategist:
- Who we are helping: ${content.whoWeHelp.join("; ") || "(not provided)"}
- What we help them with: ${content.whatWeHelpThemWith.join("; ") || "(not provided)"}
- Desired emotion for the audience: ${content.desiredEmotion.join("; ") || "(not provided)"}
- How that emotion impacts their lives: ${content.emotionImpact.join("; ") || "(not provided)"}
- Knock-on effects elsewhere in their lives: ${content.knockOnEffect.join("; ") || "(not provided)"}
- Practical impact of that knock-on effect: ${content.practicalImpact.join("; ") || "(not provided)"}
- Biggest impact the brand can have in customers' lives: ${content.biggestImpact || "(not provided)"}

Write a single, polished Brand Purpose statement in ${langName}: one substantial, well-crafted
paragraph (aim for 5-8 sentences, roughly 90-160 words). It must:
- Name specifically who the brand serves and what it does for them, using the concrete details
  above rather than vague categories.
- Trace the emotional chain from "what we do" through to "the deeper impact on their lives" —
  do not skip straight to a platitude.
- End on the single biggest, most specific impact the brand has in customers' lives.
- Read as finished, client-ready copy — vivid and concrete, not a generic mission-statement
  template that could apply to any business in any category.

Write only the statement itself, no preamble, no quotes, no markdown, no headings.`;
}
