export type AIProvider = "anthropic" | "openai";

export interface GenerateTextArgs {
  prompt: string;
  model: string;
  maxTokens?: number;
}

export interface TextGenerator {
  /** Single-shot prompt -> plain text completion. */
  generateText(args: GenerateTextArgs): Promise<string>;
}

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  anthropic: "Claude",
  openai: "ChatGPT",
};
