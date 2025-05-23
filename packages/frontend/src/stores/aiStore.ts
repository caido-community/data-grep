import { useSDK } from "@/plugins/sdk";
import { askOpenAI, SYSTEM_PROMPT } from "@/utils/ai";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useGrepStore } from "./grepStore";

export const useAIStore = defineStore("ai", () => {
  const sdk = useSDK();
  const grepStore = useGrepStore();

  const dialogVisible = ref(false);
  const prompt = ref("");
  const isProcessing = ref(false);
  const apiKey = ref("");

  function openDialog() {
    dialogVisible.value = true;
    refreshApiKey();
  }

  function closeDialog() {
    dialogVisible.value = false;
    prompt.value = "";
  }

  function refreshApiKey() {
    apiKey.value = sdk.env.getVar("OPENAI_API_KEY") || "";
  }

  function getApiKey() {
    return apiKey.value;
  }

  async function processAIPrompt() {
    if (!apiKey.value) {
      sdk.window.showToast("No API key found", { variant: "error" });
      return;
    }

    if (!prompt.value.trim()) {
      sdk.window.showToast("Please enter a prompt", { variant: "error" });
      return;
    }

    isProcessing.value = true;
    dialogVisible.value = false;

    let count = 0;

    try {
      await askOpenAI(
        apiKey.value,
        prompt.value,
        SYSTEM_PROMPT,
        (content: string) => {
          if (count === 0) {
            grepStore.pattern = content;
          } else {
            grepStore.options.matchGroups = [parseInt(content) || 0];
          }

          count++;
        }
      );

      sdk.window.showToast("AI pattern generated successfully", {
        variant: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      sdk.window.showToast("Failed to generate pattern: " + errorMessage, {
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
    apiKey,
    openDialog,
    closeDialog,
    processAIPrompt,
    getApiKey,
    refreshApiKey,
  };
});
