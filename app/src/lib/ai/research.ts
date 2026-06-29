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
  maxTokens = 2048,
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

  const prompt = `You are a brand strategist researching a competitor using live web search.

Competitor: ${competitorName}${competitorUrl ? ` (${competitorUrl})` : ""}
Industry/context: ${industry || "(not specified)"}

Search the web for current information about this competitor, then summarize your
findings as a single JSON object with exactly these keys (write the values in ${langName}):
{
  "positioning": "how they position themselves in the market (1-2 sentences)",
  "targetAudience": "who they appear to target",
  "strengths": ["3-5 concrete strengths"],
  "weaknesses": ["2-4 likely weaknesses or gaps"],
  "toneDescriptors": ["3-6 words describing their brand tone/voice"],
  "sources": ["the URLs you actually used"]
}

Output the JSON object as the final thing in your reply.`;

  const text = await runWithSearch(client, prompt);
  const parsed = extractJson(text) as Partial<CompetitorResearchResult>;

  return {
    positioning: parsed.positioning ?? "",
    targetAudience: parsed.targetAudience ?? "",
    strengths: parsed.strengths ?? [],
    weaknesses: parsed.weaknesses ?? [],
    toneDescriptors: parsed.toneDescriptors ?? [],
    sources: parsed.sources ?? [],
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
    .map(
      (e) =>
        `## ${e.name}\nPositioning: ${e.result.positioning}\nAudience: ${e.result.targetAudience}\nStrengths: ${e.result.strengths.join("; ")}\nWeaknesses: ${e.result.weaknesses.join("; ")}\nTone: ${e.result.toneDescriptors.join(", ")}`,
    )
    .join("\n\n");

  const prompt = `You are a brand strategist writing a competitor audit synthesis.

Researched competitors:
${block || "(none)"}

${positioningContext ? `Our brand's positioning so far:\n${positioningContext}\n` : ""}
Write a comparative synthesis in ${langName} that: (1) summarizes the competitive
landscape, (2) highlights the clearest gaps and opportunities, and (3) states how
our brand can differentiate. Use clear prose with short labelled sections
("LANDSCAPE:", "GAPS & OPPORTUNITIES:", "OUR DIFFERENTIATION:"). No markdown symbols.`;

  const response = await client.messages.create({
    model: DRAFTING_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  return collectText(response.content).trim();
}
