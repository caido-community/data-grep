import { useSDK } from "@/plugins/sdk";
import {
  generateRegexPattern,
  getAvailableModelGroups,
  type Model,
  type ModelGroup,
} from "@/utils/ai";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useGrepStore } from "./grepStore";

export const useAIStore = defineStore("ai", () => {
  const sdk = useSDK();
  const grepStore = useGrepStore();

  const dialogVisible = ref(false);
  const prompt = ref("");
  const isProcessing = ref(false);
  const selectedModel = ref<Model | undefined>();

  const availableModelGroups = computed<ModelGroup[]>(() =>
    getAvailableModelGroups(sdk),
  );

  const hasAvailableProviders = computed(
    () => availableModelGroups.value.length > 0,
  );

  function openDialog() {
    dialogVisible.value = true;

    const groups = availableModelGroups.value;
    const allModels = groups.flatMap((g) => g.models);

    const currentStillAvailable =
      selectedModel.value &&
      allModels.some(
        (m) =>
          m.id === selectedModel.value!.id &&
          m.provider === selectedModel.value!.provider,
      );

    if (!currentStillAvailable && allModels.length > 0) {
      selectedModel.value = allModels[0];
    }
  }

  function closeDialog() {
    dialogVisible.value = false;
    prompt.value = "";
  }

  async function processAIPrompt() {
    if (!selectedModel.value) {
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
        selectedModel.value,
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
    selectedModel,
    availableModelGroups,
    hasAvailableProviders,
    openDialog,
    closeDialog,
    processAIPrompt,
  };
});
