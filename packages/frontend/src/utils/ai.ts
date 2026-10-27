import type {
  AIModelId,
  AIUpstreamProvider,
  AIUpstreamProviderKind,
} from "@caido/sdk-frontend";
import { generateText, Output } from "ai";
import { z } from "zod";

import type { FrontendSDK } from "@/types";

export type Model = {
  key: AIModelId;
  name: string;
};

export type ModelGroup = {
  label: string;
  models: Model[];
};

const PROVIDER_LABELS: Partial<Record<AIUpstreamProviderKind, string>> = {
  ANTHROPIC: "Anthropic",
  BEDROCK: "Bedrock",
  CHATGPT: "ChatGPT",
  GEMINI: "Gemini",
  OPENAI: "OpenAI",
  OPENROUTER: "OpenRouter",
  XAI: "xAI",
};

const getProviderLabel = (provider: AIUpstreamProvider) =>
  provider.kind === "XAI" && provider.auth === "OAUTH"
    ? "Grok"
    : (PROVIDER_LABELS[provider.kind] ?? provider.id);

export function listModelGroups(sdk: FrontendSDK): ModelGroup[] {
  const models = sdk.ai.getUpstreamModels();
  const groups = sdk.ai
    .getUpstreamProviders()
    .map((provider) => ({
      id: provider.id,
      label: getProviderLabel(provider),
      models: models
        .filter(
          (model) =>
            model.providerId === provider.id &&
            model.support.structuredOutput !== "UNSUPPORTED",
        )
        .map((model) => ({
          key: model.modelId,
          name: model.displayName,
        })),
    }))
    .filter((group) => group.models.length > 0);

  return groups.map(({ id, label, models }) => ({
    label:
      groups.filter((group) => group.label === label).length > 1
        ? `${label} (${id})`
        : label,
    models,
  }));
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
  modelKey: AIModelId,
  userPrompt: string,
): Promise<{ pattern: string; matchGroup: number }> {
  const isAvailable = listModelGroups(sdk).some((group) =>
    group.models.some((model) => model.key === modelKey),
  );
  if (!isAvailable) {
    throw new Error(`Model "${modelKey}" is no longer available`);
  }

  const languageModel = sdk.ai.createProvider()(modelKey);

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
