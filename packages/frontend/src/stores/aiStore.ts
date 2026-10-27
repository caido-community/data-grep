import type { AIModelId } from "@caido/sdk-frontend";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { useGrepStore } from "./grepStore";

import { useSDK } from "@/plugins/sdk";
import {
  generateRegexPattern,
  listModelGroups,
  type ModelGroup,
} from "@/utils/ai";

export const useAIStore = defineStore("ai", () => {
  const sdk = useSDK();
  const grepStore = useGrepStore();

  const dialogVisible = ref(false);
  const prompt = ref("");
  const isProcessing = ref(false);
  const selectedModelKey = ref<AIModelId | undefined>();
  const modelGroups = ref<ModelGroup[]>([]);

  const hasModels = computed(() => modelGroups.value.length > 0);

  function refreshModels() {
    modelGroups.value = listModelGroups(sdk);
    const models = modelGroups.value.flatMap((group) => group.models);
    if (!models.some((model) => model.key === selectedModelKey.value)) {
      selectedModelKey.value = models[0]?.key;
    }
  }

  refreshModels();
  sdk.ai.onUpstreamModelsChange(refreshModels);

  function openDialog() {
    dialogVisible.value = true;
    refreshModels();
  }

  function closeDialog() {
    dialogVisible.value = false;
    prompt.value = "";
  }

  async function processAIPrompt() {
    if (selectedModelKey.value === undefined) {
      sdk.window.showToast("No AI model selected", { variant: "error" });
      return;
    }

    if (!prompt.value.trim()) {
      sdk.window.showToast("Please enter a prompt", { variant: "error" });
      return;
    }

    isProcessing.value = true;
    dialogVisible.value = false;

    try {
      const { pattern, matchGroup } = await generateRegexPattern(
        sdk,
        selectedModelKey.value,
        prompt.value,
      );

      grepStore.pattern = pattern;
      grepStore.options.matchGroups = [matchGroup];

      sdk.window.showToast("AI pattern generated successfully", {
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      sdk.window.showToast(`Failed to generate pattern: ${message}`, {
        variant: "error",
      });
    } finally {
      isProcessing.value = false;
    }
  }

  return {
    dialogVisible,
    prompt,
    isProcessing,
    selectedModelKey,
    modelGroups,
    hasModels,
    openDialog,
    closeDialog,
    processAIPrompt,
  };
});
