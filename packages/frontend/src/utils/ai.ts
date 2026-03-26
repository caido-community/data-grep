import { type LanguageModelV3 } from "@ai-sdk/provider";
import { generateText } from "ai";

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

export const SYSTEM_PROMPT = `
You are Caido Grep Plugin Regex Generator. Your job is to return a regex pattern based on the user's request.

Rules:
- Only output two lines:
  - Line 1: The regex pattern
  - Line 2: The match group number
- Do not explain or add anything else.
- The regex should be as accurate and minimal as possible for what the user asked.
- If the pattern has no capturing group, return 0 as match group.
- If there's a relevant capturing group, return the correct group number that contains the main match.
- Make sure regex is valid.
- Make sure regex is performance optimized.

Examples:
<Input>regex for all urls</Input>
<Output>
https?://[^\"\\'> ]+
0
</Output>

<Input>email regex</Input>
<Output>
[\\w.-]+@[\\w.-]+\\.\\w+
0
</Output>

In both examples notice two lines are returned. The first line is the regex pattern and the second line is the match group number.

Just return the pattern and the group number. Nothing more.`;

export async function generateRegexPattern(
  sdk: FrontendSDK,
  model: Model,
  userPrompt: string,
): Promise<{ pattern: string; matchGroup: number }> {
  const provider = sdk.ai.createProvider();
  const modelKey = `${model.provider}/${model.id}`;

  const languageModel = provider(modelKey, {
    capabilities: {
      reasoning: false,
      structured_output: false,
    },
  }) as unknown as LanguageModelV3;

  const result = await generateText({
    model: languageModel,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
  });

  const lines = result.text
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0);

  const pattern = lines[0]?.trim() ?? "";
  const matchGroup = parseInt(lines[1]?.trim() ?? "0", 10) || 0;

  return { pattern, matchGroup };
}
