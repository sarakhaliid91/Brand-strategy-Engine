import Anthropic from "@anthropic-ai/sdk";
import { GenerateTextArgs, TextGenerator } from "./types";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Add it to .env.local to draft with Claude.",
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const anthropicGenerator: TextGenerator = {
  async generateText({ prompt, model, maxTokens = 1024 }: GenerateTextArgs) {
    const response = await getClient().messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content[0];
    if (!block || block.type !== "text") {
      throw new Error("Unexpected response from Claude");
    }
    return block.text.trim();
  },
};
