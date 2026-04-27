import { defineStore } from "pinia";
import type { CustomRegex } from "shared";
import { computed, ref } from "vue";

import { useGrepStore } from "./grepStore";

import {
  SECRET_PATTERN_CATEGORIES,
  SECRET_PATTERNS,
  type SecretPatternCategory,
} from "@/data/secret-patterns";
import { useCustomRegexRepository } from "@/repositories/customRegex";

export type PatternCategory = "all" | "predefined" | "secrets" | "custom";

export interface DisplayPattern {
  name: string;
  pattern: string;
  description: string;
  category: PatternCategory;
  secretCategory?: SecretPatternCategory;
  matchGroups?: number[];
}

export const usePatternsStore = defineStore("patterns", () => {
  const grepStore = useGrepStore();
  const customRegexRepo = useCustomRegexRepository();

  const dialogVisible = ref(false);
  const customPatterns = ref<(CustomRegex & { id: string })[]>([]);
  const isLoading = ref(false);
  const editingPattern = ref<(CustomRegex & { id: string }) | undefined>();
  const showCustomRegexDialog = ref(false);
  const selectedCategory = ref<PatternCategory>("all");
  const searchQuery = ref("");
  const selectedSecretCategory = ref<SecretPatternCategory | "all">("all");

  const predefinedPatterns: DisplayPattern[] = [
    {
      name: "Email",
      pattern: "[\\w.-]+@[\\w.-]+\\.\\w+",
      description: "Matches email addresses",
      category: "predefined",
    },
    {
      name: "URL",
      pattern: "https?://[\\w.-]+(?:\\.[a-zA-Z]{2,})+[\\w/.-]*",
      description: "Matches HTTP/HTTPS URLs",
      category: "predefined",
    },
    {
      name: "IP Address",
      pattern: "(?:[0-9]{1,3}\\.){3}[0-9]{1,3}",
      description: "Matches IPv4 addresses",
      category: "predefined",
    },
    {
      name: "JSON Object",
      pattern: "\\{[^}]*\\}",
      description: "Matches simple JSON objects",
      category: "predefined",
    },
    {
      name: "AWS Keys",
      pattern: "AKIA[0-9A-Z]{16}",
      description: "Matches AWS access key IDs",
      category: "predefined",
    },
    {
      name: "JWT Tokens",
      pattern: "eyJ[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*",
      description: "Matches JWT tokens",
      category: "predefined",
    },
    {
      name: "Strings",
      pattern: "'(.*?)'|\"(.*?)\"|`(.*?)`",
      description: "Matches strings",
      matchGroups: [1, 2, 3],
      category: "predefined",
    },
  ];

  const secretPatterns: DisplayPattern[] = SECRET_PATTERNS.map((sp) => ({
    name: sp.name,
    pattern: sp.pattern,
    description: `Secret detection: ${sp.category}`,
    category: "secrets" as const,
    secretCategory: sp.category,
  }));

  const allPatterns = computed<DisplayPattern[]>(() => [
    ...predefinedPatterns,
    ...secretPatterns,
    ...customPatterns.value.map((cp) => ({
      name: cp.name,
      pattern: cp.regex,
      description: cp.description,
      matchGroups: cp.matchGroups,
      category: "custom" as const,
    })),
  ]);

  const filteredPatterns = computed<DisplayPattern[]>(() => {
    let patterns = allPatterns.value;

    if (selectedCategory.value !== "all") {
      patterns = patterns.filter((p) => p.category === selectedCategory.value);
    }

    if (
      selectedCategory.value === "secrets" &&
      selectedSecretCategory.value !== "all"
    ) {
      patterns = patterns.filter(
        (p) => p.secretCategory === selectedSecretCategory.value,
      );
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      patterns = patterns.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    }

    return patterns;
  });

  const secretPatternCategories = SECRET_PATTERN_CATEGORIES;

  async function loadCustomPatterns() {
    isLoading.value = true;
    try {
      const patterns = await customRegexRepo.listCustomRegexes();
      customPatterns.value = patterns.map((p) => ({
        id: p.id,
        ...p.regex,
      }));
    } catch {
      // Silently fail — patterns will show as empty
    } finally {
      isLoading.value = false;
    }
  }

  async function saveCustomPattern(id: string, pattern: CustomRegex) {
    const success = await customRegexRepo.upsertCustomRegex(id, pattern);
    if (success) {
      await loadCustomPatterns();
      closeCustomRegexDialog();
    }
    return success;
  }

  async function deleteCustomPattern(id: string) {
    const success = await customRegexRepo.deleteCustomRegex(id);
    if (success) {
      await loadCustomPatterns();
    }
    return success;
  }

  function openDialog() {
    dialogVisible.value = true;
    loadCustomPatterns();
  }

  function closeDialog() {
    dialogVisible.value = false;
  }

  function openCustomRegexDialog(pattern?: CustomRegex & { id: string }) {
    editingPattern.value = pattern;
    showCustomRegexDialog.value = true;
  }

  function closeCustomRegexDialog() {
    showCustomRegexDialog.value = false;
    editingPattern.value = undefined;
  }

  function applyPattern(pattern: DisplayPattern) {
    grepStore.pattern = pattern.pattern;
    grepStore.currentPatternName = pattern.name;
    grepStore.options.matchGroups = pattern.matchGroups;
    closeDialog();
  }

  return {
    dialogVisible,
    customPatterns,
    filteredPatterns,
    isLoading,
    editingPattern,
    showCustomRegexDialog,
    selectedCategory,
    searchQuery,
    selectedSecretCategory,
    secretPatternCategories,
    openDialog,
    closeDialog,
    openCustomRegexDialog,
    closeCustomRegexDialog,
    applyPattern,
    loadCustomPatterns,
    saveCustomPattern,
    deleteCustomPattern,
  };
});
