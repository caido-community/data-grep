import { useSDK } from "@/plugins/sdk";
import { useGrepRepository } from "@/repositories/grep";
import { formatTime } from "@/utils/time";
import { defineStore } from "pinia";
import type { GrepOptions, GrepResults, GrepStatus, MatchResult } from "shared";
import { reactive, ref } from "vue";

export const useGrepStore = defineStore("grep", () => {
  const sdk = useSDK();
  const grepRepository = useGrepRepository();

  const pattern = ref("");

  const options = reactive<GrepOptions>({
    includeRequests: true,
    includeResponses: true,
    maxResults: null,
    matchGroups: null,
    onlyInScope: true,
    customHTTPQL: null,
    skipLargeResponses: true,
    cleanupOutput: true,
  });

  const status = reactive<GrepStatus>({
    isSearching: false,
    progress: 0,
  });

  const results = reactive<GrepResults>({
    searchResults: null,
    uniqueMatchesCount: 0,
    searchTime: 0,
    cancelled: false,
  });

  const searchGrepRequests = async () => {
    if (!pattern.value.trim()) {
      sdk.window.showToast("Please enter a search pattern", {
        variant: "error",
      });
      return;
    }

    results.searchResults = null;
    status.isSearching = true;
    status.progress = 0;
    results.uniqueMatchesCount = 0;
    results.cancelled = false;

    try {
      const { matchesCount, cancelled, timeTaken } =
        await grepRepository.searchGrepRequests(pattern.value, options);

      results.searchTime = timeTaken ?? 0;

      if (cancelled) {
        results.cancelled = true;
        return;
      }

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
        sdk.window.showToast(
          `Found ${matchesCount} matching results in ${formatTime(
            results.searchTime
          )}`,
          {
            variant: "success",
          }
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      sdk.window.showToast("Failed to search requests: " + errorMessage, {
        variant: "error",
      });
    } finally {
      status.isSearching = false;
    }
  };

  sdk.backend.onEvent("caidogrep:progress", (value: number) => {
    status.progress = value;
  });

  sdk.backend.onEvent("caidogrep:matches", (matches: number | MatchResult[]) => {
    if (typeof matches === "number") {
      results.uniqueMatchesCount += matches;
    } else {
      const newResults = [
        ...(results.searchResults || []),
        ...matches,
      ];

      if (newResults.length >= 25000) {
        const truncatedResults = newResults.slice(0, 25000);
        truncatedResults.push({
          value: "!!! Results truncated to 25K. Export to view more",
          requestId: "",
          source: "request",
          startIndex: 0,
          endIndex: 0,
        });
        results.searchResults = truncatedResults;
      } else {
        results.searchResults = newResults;
      }

      results.uniqueMatchesCount += matches.length;
    }
  });

  return {
    pattern,
    options,
    status,
    results,
    searchGrepRequests,
  };
});
