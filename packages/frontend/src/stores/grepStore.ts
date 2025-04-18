import { useSDK } from "@/plugins/sdk";
import { useGrepRepository } from "@/repositories/grep";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useGrepStore = defineStore("grep", () => {
  const sdk = useSDK();

  const pattern = ref("");
  const includeRequests = ref(true);
  const includeResponses = ref(true);
  const maxResults = ref<number | null>(null);
  const isSearching = ref(false);
  const matchGroup = ref<number | null>(null);
  const onlyInScope = ref(true);
  const progress = ref(0);
  const searchResults = ref<string[] | null>(null);
  const customHTTPQL = ref<string | null>(null);
  const skipLargeResponses = ref(true);
  const cleanupOutput = ref(false);
  const uniqueMatchesCount = ref(0);
  const grepRepository = useGrepRepository();

  const searchGrepRequests = async () => {
    if (!pattern.value.trim()) {
      sdk.window.showToast("Please enter a search pattern", {
        variant: "error",
      });
      return;
    }

    searchResults.value = null;
    isSearching.value = true;
    progress.value = 0;
    uniqueMatchesCount.value = 0;

    try {
      const matchesCount = await grepRepository.searchGrepRequests(
        pattern.value,
        {
          includeRequests: includeRequests.value,
          includeResponses: includeResponses.value,
          maxResults: maxResults.value ?? null,
          matchGroup: matchGroup.value ?? null,
          onlyInScope: onlyInScope.value,
          customHTTPQL: customHTTPQL.value ?? null,
          skipLargeResponses: skipLargeResponses.value,
          cleanupOutput: cleanupOutput.value,
        }
      );

      if (!matchesCount) {
        sdk.window.showToast("No results found", {
          variant: "info",
        });
        return;
      }

      if (matchesCount === 0) {
        sdk.window.showToast("No matches found for the pattern", {
          variant: "info",
        });
      } else {
        sdk.window.showToast(`Found ${matchesCount} matching results`, {
          variant: "success",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      sdk.window.showToast("Failed to search requests: " + errorMessage, {
        variant: "error",
      });
    } finally {
      isSearching.value = false;
    }
  };

  const stopGrepSearch = async () => {
    try {
      const { error } = await sdk.backend.stopGrep();
      if (error) {
        console.error("Failed to stop grep:", error);
        sdk.window.showToast("Failed to stop search: " + error, {
          variant: "error",
        });
        return;
      }

      sdk.window.showToast("Search stopped successfully", {
        variant: "info",
      });
    } catch (error) {
      sdk.window.showToast("Failed to stop search: " + error, {
        variant: "error",
      });
    } finally {
      isSearching.value = false;
    }
  };

  sdk.backend.onEvent("caidogrep:progress", (value: number) => {
    progress.value = value;
  });

  sdk.backend.onEvent("caidogrep:matches", (matches: number | string[]) => {
    if (typeof matches === "number") {
      uniqueMatchesCount.value += matches;
    } else {
      searchResults.value = [
        ...(searchResults.value || []),
        ...Array.from(matches),
      ];

      uniqueMatchesCount.value += matches.length;
    }
  });

  return {
    pattern,
    includeRequests,
    includeResponses,
    maxResults,
    isSearching,
    matchGroup,
    onlyInScope,
    searchResults,
    uniqueMatchesCount,
    progress,
    customHTTPQL,
    skipLargeResponses,
    cleanupOutput,

    searchGrepRequests,
    stopGrepSearch,
  };
});
