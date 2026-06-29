import { AIProvider, TextGenerator } from "./providers/types";
import { anthropicGenerator } from "./providers/anthropic";
import { openaiGenerator } from "./providers/openai";

/** Default drafting model per provider. OpenAI's is overridable via env. */
export const PROVIDER_MODELS: Record<AIProvider, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: process.env.OPENAI_DRAFTING_MODEL || "gpt-4o",
};

const GENERATORS: Record<AIProvider, TextGenerator> = {
  anthropic: anthropicGenerator,
  openai: openaiGenerator,
};

const PROVIDER_ENV_KEY: Record<AIProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
};

export function getGenerator(provider: AIProvider): TextGenerator {
  return GENERATORS[provider];
}

export function getModelFor(provider: AIProvider): string {
  return PROVIDER_MODELS[provider];
}

/** True only if the provider's API key is present in the environment. */
export function isProviderConfigured(provider: AIProvider): boolean {
  return Boolean(process.env[PROVIDER_ENV_KEY[provider]]);
}

/** Providers whose API key is configured — drives which buttons the UI shows. */
export function getAvailableProviders(): AIProvider[] {
  return (Object.keys(GENERATORS) as AIProvider[]).filter(isProviderConfigured);
}

/**
 * The provider to use when none is explicitly chosen. Honors
 * AI_DEFAULT_PROVIDER when valid, else falls back to the first configured
 * provider, else "anthropic".
 */
export function getDefaultProvider(): AIProvider {
  const configured = (process.env.AI_DEFAULT_PROVIDER || "") as AIProvider;
  if (configured in GENERATORS && isProviderConfigured(configured)) {
    return configured;
  }
  return getAvailableProviders()[0] ?? "anthropic";
}
