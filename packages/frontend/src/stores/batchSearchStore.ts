import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import { useSDK } from "@/plugins/sdk";
import { useGrepRepository } from "@/repositories/grep";
import { useGrepStore } from "./grepStore";
import { TRUFFLEHOG_PATTERNS } from "../trufflehog_patterns";
import type { GrepOptions } from "shared";

interface BatchSearchResult {
  patternName: string;
  category: string;
  matchesCount: number;
  matches?: string[];
}

interface BatchSearchStatus {
  isSearching: boolean;
  currentPattern: string;
  patternsCompleted: number;
  totalPatterns: number;
  cancelled: boolean;
}

export const useBatchSearchStore = defineStore("batchSearch", () => {
  const sdk = useSDK();
  const grepRepository = useGrepRepository();

  const showWarningDialog = ref(false);
  const showResultsDialog = ref(false);
  const searchResults = ref<BatchSearchResult[]>([]);
  
  const status = reactive<BatchSearchStatus>({
    isSearching: false,
    currentPattern: "",
    patternsCompleted: 0,
    totalPatterns: 0,
    cancelled: false,
  });

  const progress = computed(() => {
    if (status.totalPatterns === 0) return 0;
    return Math.round((status.patternsCompleted / status.totalPatterns) * 100);
  });

  const totalMatches = computed(() => {
    return searchResults.value.reduce((sum, result) => sum + result.matchesCount, 0);
  });

  const resultsWithMatches = computed(() => {
    return searchResults.value.filter(result => result.matchesCount > 0);
  });

  let abortController: AbortController | null = null;

  async function searchAllSecrets(options: GrepOptions) {
    // Show warning dialog first
    showWarningDialog.value = true;
  }

  async function confirmAndStartSearch(options: GrepOptions) {
    showWarningDialog.value = false;
    status.isSearching = true;
    status.cancelled = false;
    status.patternsCompleted = 0;
    status.totalPatterns = TRUFFLEHOG_PATTERNS.length;
    searchResults.value = [];
    abortController = new AbortController();

    try {
      for (const pattern of TRUFFLEHOG_PATTERNS) {
        if (abortController.signal.aborted) {
          status.cancelled = true;
          break;
        }

        status.currentPattern = pattern.name;
        
        try {
          // First validate the regex pattern
          try {
            new RegExp(pattern.pattern, 'i');
          } catch (regexError) {
            console.error(`Invalid regex pattern "${pattern.name}": ${pattern.pattern}`);
            sdk.window.showToast(`Invalid regex in "${pattern.name}": ${regexError}`, {
              variant: "error",
            });
            continue;
          }
          
          // Set the current pattern name for display in results
          const grepStore = useGrepStore();
          grepStore.currentPatternName = pattern.name;
          
          // Search with this pattern
          const result = await grepRepository.searchGrepRequests(
            pattern.pattern,
            {
              ...options,
              maxResults: 100, // Limit results per pattern to avoid overwhelming
            }
          );

          if (result.matchesCount && result.matchesCount > 0) {
            searchResults.value.push({
              patternName: pattern.name,
              category: pattern.category,
              matchesCount: result.matchesCount,
            });
          }
        } catch (error) {
          console.error(`Error searching with pattern "${pattern.name}":`, error);
          sdk.window.showToast(`Error in pattern "${pattern.name}": ${error}`, {
            variant: "error",
          });
        }

        status.patternsCompleted++;
      }

      // Show results dialog when done
      showResultsDialog.value = true;
      
      if (status.cancelled) {
        sdk.window.showToast("Batch search cancelled", {
          variant: "info",
        });
      } else if (totalMatches.value === 0) {
        sdk.window.showToast("No secrets found in the requests/responses", {
          variant: "success",
        });
      } else {
        sdk.window.showToast(
          `Found ${totalMatches.value} potential secrets across ${resultsWithMatches.value.length} patterns!`,
          {
            variant: "warning",
          }
        );
      }
    } catch (error) {
      sdk.window.showToast(`Batch search error: ${error}`, {
        variant: "error",
      });
    } finally {
      status.isSearching = false;
      status.currentPattern = "";
      abortController = null;
    }
  }

  function cancelSearch() {
    if (abortController) {
      abortController.abort();
    }
  }

  function closeWarningDialog() {
    showWarningDialog.value = false;
  }

  function closeResultsDialog() {
    showResultsDialog.value = false;
  }

  return {
    showWarningDialog,
    showResultsDialog,
    searchResults,
    status,
    progress,
    totalMatches,
    resultsWithMatches,
    searchAllSecrets,
    confirmAndStartSearch,
    cancelSearch,
    closeWarningDialog,
    closeResultsDialog,
  };
});