import { generateText, Output } from "ai";
import { z } from "zod";

import type { FrontendSDK } from "@/types";

export const ModelProvider = {
  OpenRouter: "openrouter",
  OpenAI: "openai",
  Anthropic: "anthropic",
  Google: "google",
} as const;

export type ModelProvider = (typeof ModelProvider)[keyof typeof ModelProvider];

export interface Model {
  id: string;
  name: string;
  provider: ModelProvider;
}

export interface ModelGroup {
  label: string;
  provider: ModelProvider;
  models: Model[];
}

const MODEL_GROUPS: ModelGroup[] = [
  {
    label: "OpenAI",
    provider: ModelProvider.OpenAI,
    models: [
      { id: "gpt-5.4", name: "GPT 5.4", provider: ModelProvider.OpenAI },
      {
        id: "gpt-5.4-nano",
        name: "GPT 5.4 Nano",
        provider: ModelProvider.OpenAI,
      },
      {
        id: "gpt-5.3-codex",
        name: "GPT 5.3 Codex",
        provider: ModelProvider.OpenAI,
      },
    ],
  },
  {
    label: "Anthropic",
    provider: ModelProvider.Anthropic,
    models: [
      {
        id: "claude-sonnet-4-6",
        name: "Sonnet 4.6",
        provider: ModelProvider.Anthropic,
      },
      {
        id: "claude-opus-4-6",
        name: "Opus 4.6",
        provider: ModelProvider.Anthropic,
      },
    ],
  },
  {
    label: "Google",
    provider: ModelProvider.Google,
    models: [
      {
        id: "gemini-3.1-pro-preview-customtools",
        name: "Gemini 3.1 Pro",
        provider: ModelProvider.Google,
      },
      {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash",
        provider: ModelProvider.Google,
      },
    ],
  },
  {
    label: "OpenRouter",
    provider: ModelProvider.OpenRouter,
    models: [
      {
        id: "openai/gpt-5.4",
        name: "GPT 5.4",
        provider: ModelProvider.OpenRouter,
      },
      {
        id: "openai/gpt-5.4-nano",
        name: "GPT 5.4 Nano",
        provider: ModelProvider.OpenRouter,
      },
      {
        id: "anthropic/claude-sonnet-4.6",
        name: "Sonnet 4.6",
        provider: ModelProvider.OpenRouter,
      },
      {
        id: "anthropic/claude-opus-4.6",
        name: "Opus 4.6",
        provider: ModelProvider.OpenRouter,
      },
      {
        id: "google/gemini-3-flash-preview",
        name: "Gemini 3 Flash",
        provider: ModelProvider.OpenRouter,
      },
    ],
  },
];

export function isProviderConfigured(
  sdk: FrontendSDK,
  provider: ModelProvider,
): boolean {
  return sdk.ai
    .getUpstreamProviders()
    .some((p) => p.id === provider && p.status === "Ready");
}

export function getAvailableModelGroups(sdk: FrontendSDK): ModelGroup[] {
  return MODEL_GROUPS.filter((g) => isProviderConfigured(sdk, g.provider));
}

const outputSchema = z.object({
  pattern: z.string(),
  matchGroup: z.number(),
});

const SYSTEM_PROMPT = `
You are Caido Grep Plugin Regex Generator. Your job is to return a regex pattern based on the user's request.

Rules:
- The regex should be as accurate and minimal as possible for what the user asked.
- If the pattern has no capturing group, return 0 as matchGroup.
- If there's a relevant capturing group, return the correct group number that contains the main match.
- Make sure regex is valid.
- Make sure regex is performance optimized.

Examples:

INPUT: regex for all urls
OUTPUT: { "pattern": "https?://[^\\"'> ]+", "matchGroup": 0 }

INPUT: email regex
OUTPUT: { "pattern": "[\\\\w.-]+@[\\\\w.-]+\\\\.\\\\w+", "matchGroup": 0 }
`.trim();

export async function generateRegexPattern(
  sdk: FrontendSDK,
  model: Model,
  userPrompt: string,
): Promise<{ pattern: string; matchGroup: number }> {
  if (!isProviderConfigured(sdk, model.provider)) {
    throw new Error(`Provider "${model.provider}" is not configured`);
  }

  const provider = sdk.ai.createProvider();
  const modelKey = `${model.provider}/${model.id}`;

  const languageModel = provider(modelKey, {
    capabilities: {
      reasoning: false,
      structured_output: true,
    },
  });

  const result = await generateText({
    model: languageModel,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    output: Output.object({
      schema: outputSchema,
    }),
  });

  const output = outputSchema.safeParse(result.output);
  if (!output.success) {
    throw new Error(`Invalid AI response: ${output.error.message}`);
  }

  return {
    pattern: output.data.pattern,
    matchGroup: output.data.matchGroup,
  };
}
