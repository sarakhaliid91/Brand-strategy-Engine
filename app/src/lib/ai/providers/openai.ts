import OpenAI from "openai";
import { GenerateTextArgs, TextGenerator } from "./types";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to .env.local to draft with ChatGPT.",
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export const openaiGenerator: TextGenerator = {
  async generateText({ prompt, model, maxTokens = 1024 }: GenerateTextArgs) {
    const response = await getClient().chat.completions.create({
      model,
      max_completion_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Unexpected response from ChatGPT");
    }
    return text.trim();
  },
};
