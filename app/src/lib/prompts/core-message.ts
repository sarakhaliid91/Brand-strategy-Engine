import { CoreMessageContent } from "@/lib/sections/content-types";

export function buildCoreMessagePrompt(args: {
  content: CoreMessageContent;
  language: "ar" | "en";
  contextBlocks: string[];
}): string {
  const { content, language, contextBlocks } = args;
  const langName = language === "ar" ? "Arabic" : "English";

  return `You are a senior brand strategist writing a brand's Core Message for a paying client's
brand strategy deck — a StoryBrand-style message map the client will use to talk about the brand
consistently across every channel (website, ads, sales conversations).

Approved context from earlier in this brand strategy (purpose, vision, mission, values,
audience, positioning, brand persona):
${contextBlocks.join("\n\n") || "(none)"}

${content.guidance ? `Extra guidance from the strategist: ${content.guidance}\n` : ""}
Write the PRIMARY CORE MESSAGE in ${langName} as five labelled blocks. This is the most
important, most detailed section of the whole strategy — each block must be a substantial,
richly developed passage (aim for 100-180 words each, several sentences), not a short summary.
For EACH of the five blocks, explicitly work through four angles — who/where they are, where it
shows up, how it manifests concretely, and why it matters — weaving all four into flowing prose
(you do not need to label the four angles individually, just make sure the paragraph answers
all of them):

AUDIENCE: Who exactly is this audience (grounded in the approved audience persona)? Where do
they physically and psychologically encounter the brand? How do they behave that marks them as
this audience? Why are they the brand's audience specifically, not just "everyone"?

PAIN POINTS: What is their core, specific pain point? Where and when does it show up in their
daily life? How does it actually manifest — what does it feel like, what goes wrong? Why does it
matter enough that they'd change behavior to solve it?

KEY BENEFIT: What is the single main benefit this brand delivers? Where/when do they experience
it? How does the brand concretely deliver it (specific products, moments, touches)? Why does
this benefit matter so much to this specific audience?

COMPETITIVE ALTERNATIVE: What would they do instead of choosing this brand (the ordinary
alternative)? Where is that alternative available? How does the brand's offer concretely differ
from it, detail by detail? Why does the brand's alternative genuinely serve them better?

DIFFERENTIATOR: What makes this brand genuinely, defensibly different? Where does that
difference show up in the real experience? How was that difference built and maintained? Why
does it matter to the audience, not just as a claim but as something they can feel?

Then write a SECONDARY CORE MESSAGE: restate the brand's Purpose, Vision, Mission, and Values in
one clear line each (drawn from the approved context, not re-invented).

Use the block labels above (AUDIENCE:, PAIN POINTS:, KEY BENEFIT:, COMPETITIVE ALTERNATIVE:,
DIFFERENTIATOR:, then PURPOSE:, VISION:, MISSION:, VALUES: for the secondary message) in English
exactly as shown, even though all the prose after each label is written in ${langName}. Put a
blank line between blocks. No markdown symbols, just the labels and prose.`;
}
