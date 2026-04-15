import { defineStore } from "pinia";
import type { GrepOptions } from "shared";
import { computed, reactive, ref } from "vue";

import { useGrepStore } from "./grepStore";

import { SECRET_PATTERNS } from "@/data/secret-patterns";
import type { SecretPatternCategory } from "@/data/secret-patterns";
import { useSDK } from "@/plugins/sdk";
import { useGrepRepository } from "@/repositories/grep";

interface BatchSearchStatus {
  isSearching: boolean;
  patternsCompleted: number;
  totalPatterns: number;
  cancelled: boolean;
}

export const useBatchSearchStore = defineStore("batchSearch", () => {
  const sdk = useSDK();
  const grepRepository = useGrepRepository();
  const grepStore = useGrepStore();

  const showWarningDialog = ref(false);
  const pendingOptions = ref<GrepOptions | undefined>();

  // Maps match value -> category for filtering results
  const matchCategoryMap = ref(new Map<string, SecretPatternCategory>());
  const selectedResultCategory = ref<SecretPatternCategory | "all">("all");

  // Track which categories had matches for the filter dropdown
  const activeCategorySet = ref(new Set<SecretPatternCategory>());

  const status = reactive<BatchSearchStatus>({
    isSearching: false,
    patternsCompleted: 0,
    totalPatterns: 0,
    cancelled: false,
  });

  const activeCategories = computed(() => [...activeCategorySet.value].sort());

  function startBatchSearch(options: GrepOptions) {
    pendingOptions.value = options;
    showWarningDialog.value = true;
  }

  async function confirmAndStart() {
    if (pendingOptions.value === undefined) return;

    const options = pendingOptions.value;
    showWarningDialog.value = false;
    pendingOptions.value = undefined;

    const validPatterns = SECRET_PATTERNS.filter((p) => {
      try {
        new RegExp(p.pattern, "i");
        return true;
      } catch {
        return false;
      }
    });

    status.isSearching = true;
    status.cancelled = false;
    status.patternsCompleted = 0;
    status.totalPatterns = validPatterns.length;
    matchCategoryMap.value.clear();
    activeCategorySet.value.clear();
    selectedResultCategory.value = "all";

    // Initialize the main page once — results accumulate across all patterns
    grepStore.results.searchResults = [];
    grepStore.results.uniqueMatchesCount = 0;
    grepStore.results.searchTime = 0;
    grepStore.results.cancelled = false;
    grepStore.status.isSearching = true;
    grepStore.status.progress = 0;

    let totalFoundPatterns = 0;
    let totalFoundMatches = 0;
    const startTime = Date.now();

    try {
      for (const pattern of validPatterns) {
        if (status.cancelled) break;

        grepStore.pattern = pattern.pattern;
        grepStore.currentPatternName = `[${status.patternsCompleted + 1}/${status.totalPatterns}] ${pattern.name}`;

        const countBefore = grepStore.results.searchResults?.length ?? 0;

        try {
          const result = await grepRepository.searchGrepRequests(
            pattern.pattern,
            { ...options, maxResults: 100 },
          );

          if (result.cancelled) {
            status.cancelled = true;
            break;
          }

          // Tag new matches with this pattern's category
          const currentResults = grepStore.results.searchResults ?? [];
          for (let i = countBefore; i < currentResults.length; i++) {
            const match = currentResults[i];
            if (match !== undefined) {
              matchCategoryMap.value.set(match.value, pattern.category);
            }
          }

          if (result.matchesCount !== undefined && result.matchesCount > 0) {
            activeCategorySet.value.add(pattern.category);
            totalFoundPatterns++;
            totalFoundMatches += result.matchesCount;
          }
        } catch {
          // Skip patterns that fail — errors are non-critical during batch search
        }

        status.patternsCompleted++;
      }

      if (status.cancelled) {
        sdk.window.showToast("Batch search cancelled", { variant: "info" });
      } else if (totalFoundMatches === 0) {
        sdk.window.showToast("No secrets found", { variant: "success" });
      } else {
        sdk.window.showToast(
          `Found ${totalFoundMatches} potential secrets across ${totalFoundPatterns} patterns`,
          { variant: "warning" },
        );
      }
    } catch (error) {
      sdk.window.showToast(
        `Batch search error: ${error instanceof Error ? error.message : error}`,
        { variant: "error" },
      );
    } finally {
      grepStore.results.searchTime = Date.now() - startTime;
      status.isSearching = false;
      grepStore.status.isSearching = false;
      grepStore.currentPatternName = "";
    }
  }

  function cancelSearch() {
    status.cancelled = true;
    grepStore.status.isSearching = false;
    grepStore.results.cancelled = true;
    grepRepository.stopGrep();
  }

  function closeWarningDialog() {
    showWarningDialog.value = false;
    pendingOptions.value = undefined;
  }

  function resetBatchState() {
    matchCategoryMap.value.clear();
    activeCategorySet.value.clear();
    selectedResultCategory.value = "all";
  }

  function getMatchCategory(value: string): SecretPatternCategory | undefined {
    return matchCategoryMap.value.get(value);
  }

  return {
    showWarningDialog,
    status,
    activeCategories,
    selectedResultCategory,
    startBatchSearch,
    confirmAndStart,
    cancelSearch,
    closeWarningDialog,
    resetBatchState,
    getMatchCategory,
  };
});
