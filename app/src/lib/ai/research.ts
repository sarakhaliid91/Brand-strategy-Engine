import Anthropic from "@anthropic-ai/sdk";
import { getModelFor } from "./client";

const DRAFTING_MODEL = getModelFor("anthropic");
import { CompetitorResearchResult } from "@/lib/sections/content-types";

/**
 * Competitor web research uses Claude's server-side web_search tool. This is
 * Anthropic-specific (provider-divergent from prose drafting), so it talks to
 * the Anthropic SDK directly rather than through the TextGenerator abstraction.
 * OpenAI web research would be wired separately if/when needed.
 */
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Competitor research uses Claude's web search; add the key to .env.local.",
    );
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Dynamic-filtering web search variant (Sonnet 4.6 / Opus 4.6+).
const WEB_SEARCH_TOOL = { type: "web_search_20260209", name: "web_search" } as const;

function collectText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

/** Pulls the last JSON object out of a text blob (models often wrap it in prose). */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.lastIndexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Could not parse research result as JSON");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

/** Runs the web-search loop, following pause_turn continuations a bounded number of times. */
async function runWithSearch(
  client: Anthropic,
  prompt: string,
  maxTokens = 4096,
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  let response = await client.messages.create({
    model: DRAFTING_MODEL,
    max_tokens: maxTokens,
    tools: [WEB_SEARCH_TOOL],
    messages,
  });

  let guard = 0;
  while (response.stop_reason === "pause_turn" && guard < 5) {
    messages.push({ role: "assistant", content: response.content });
    response = await client.messages.create({
      model: DRAFTING_MODEL,
      max_tokens: maxTokens,
      tools: [WEB_SEARCH_TOOL],
      messages,
    });
    guard += 1;
  }

  return collectText(response.content);
}

export async function researchCompetitor(args: {
  competitorName: string;
  competitorUrl: string | null;
  industry: string;
  language: "ar" | "en";
}): Promise<CompetitorResearchResult> {
  const { competitorName, competitorUrl, industry, language } = args;
  const langName = language === "ar" ? "Arabic" : "English";
  const client = getClient();

  const prompt = `You are a senior brand strategist conducting a rigorous competitor audit using
live web search, for a paying client's brand strategy deck. Be specific and evidence-based —
every score and claim should be backed by something you actually found, not a generic guess.

Competitor: ${competitorName}${competitorUrl ? ` (${competitorUrl})` : ""}
Industry/context: ${industry || "(not specified)"}

Search the web for this competitor's website, social media, reviews and any press. Then produce
a single JSON object with exactly this shape (write all text values in ${langName}):

{
  "positioning": "how they position themselves in the market, in detail (2-3 sentences)",
  "targetAudience": "who they appear to target and why, specifically",
  "strengths": ["4-6 concrete, specific strengths with evidence, not generic praise"],
  "weaknesses": ["3-5 concrete, specific gaps or weaknesses with evidence"],
  "toneDescriptors": ["4-6 words describing their brand tone/voice"],
  "sources": ["the URLs you actually used"],
  "dimensions": {
    "positioningStrategy": { "score": 0-10, "summary": "1-2 sentences", "notes": ["3-5 specific observations: do they have a clear point of difference, is their position unique, does it add value, could it be replicated easily"] },
    "brandMessage": { "score": 0-10, "summary": "1-2 sentences", "notes": ["3-5 observations: is their tagline/hook memorable, do they clearly communicate their solution, do they speak to fears/desires/emotions, is messaging consistent"] },
    "personality": { "score": 0-10, "summary": "1-2 sentences", "notes": ["3-5 observations: do they have a defined archetype/personality, what characteristics show up in messaging vs identity, where do they fail to resonate, is their brand voice well defined"] },
    "brandIdentity": { "score": 0-10, "summary": "1-2 sentences", "notes": ["3-5 observations: is their logo memorable, does their color palette/imagery/typography support their message"] },
    "brandPresence": { "score": 0-10, "summary": "1-2 sentences", "notes": ["3-5 observations: website/UX/UI quality, content quality, physical presence if applicable"] },
    "coreOffer": { "score": 0-10, "summary": "1-2 sentences", "notes": ["3-5 observations: is their core offer clearly promoted, do they have an effective sales funnel and call to action, is pricing competitive, how could they improve"] }
  }
}

Score each dimension 0-10 based on genuine effectiveness (0 = absent/non-existent, 10 =
best-in-class). Output the JSON object as the final thing in your reply.`;

  const text = await runWithSearch(client, prompt);
  const parsed = extractJson(text) as Partial<CompetitorResearchResult>;

  return {
    positioning: parsed.positioning ?? "",
    targetAudience: parsed.targetAudience ?? "",
    strengths: parsed.strengths ?? [],
    weaknesses: parsed.weaknesses ?? [],
    toneDescriptors: parsed.toneDescriptors ?? [],
    sources: parsed.sources ?? [],
    dimensions: parsed.dimensions,
  };
}

export async function synthesizeCompetitors(args: {
  entries: { name: string; result: CompetitorResearchResult }[];
  positioningContext: string;
  language: "ar" | "en";
}): Promise<string> {
  const { entries, positioningContext, language } = args;
  const langName = language === "ar" ? "Arabic" : "English";
  const client = getClient();

  const block = entries
    .map((e) => {
      const d = e.result.dimensions;
      const dimLines = d
        ? Object.entries(d)
            .map(([key, v]) => `  - ${key}: ${v.score}/10 — ${v.summary}`)
            .join("\n")
        : "";
      return `## ${e.name}\nPositioning: ${e.result.positioning}\nAudience: ${e.result.targetAudience}\nStrengths: ${e.result.strengths.join("; ")}\nWeaknesses: ${e.result.weaknesses.join("; ")}\nTone: ${e.result.toneDescriptors.join(", ")}\nScored dimensions:\n${dimLines}`;
    })
    .join("\n\n");

  const prompt = `You are a senior brand strategist writing the Competitor Audit synthesis for a
paying client's brand strategy deck — the section that turns raw competitor research into a
clear strategic point of view.

Researched competitors:
${block || "(none)"}

${positioningContext ? `Our brand's positioning so far:\n${positioningContext}\n` : ""}
Write a detailed comparative synthesis in ${langName} (this should be substantial — several
paragraphs, not a quick summary) with these labelled sections, each a fully developed paragraph
grounded in the specific competitors and scores above, not generic industry commentary:

LANDSCAPE: what the competitive set looks like as a whole — where competitors cluster, where
they're uniformly weak or strong across the scored dimensions, and what pattern that reveals.

GAPS & OPPORTUNITIES: the clearest, most specific gaps this research surfaced — unmet needs and
concrete opportunities our brand can credibly claim, referencing specific competitor weaknesses.

OUR DIFFERENTIATION: exactly how our brand should differentiate given this landscape — concrete
and actionable, tying back to our own positioning where provided above, not a vague call to
"stand out."

Use the labels above in English exactly as shown ("LANDSCAPE:", "GAPS & OPPORTUNITIES:",
"OUR DIFFERENTIATION:") even though the prose itself is in ${langName}. Put a blank line between
sections. No markdown symbols.`;

  const response = await client.messages.create({
    model: DRAFTING_MODEL,
    max_tokens: 3072,
    messages: [{ role: "user", content: prompt }],
  });
  return collectText(response.content).trim();
}
