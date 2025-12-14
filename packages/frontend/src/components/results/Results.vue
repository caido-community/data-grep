<script setup lang="ts">
import { useSDK } from "@/plugins/sdk";
import { useGrepRepository } from "@/repositories/grep";
import { useGrepStore } from "@/stores";
import { copyToClipboard } from "@/utils/clipboard";
import { formatTime } from "@/utils/time";
import Button from "primevue/button";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import VirtualScroller from "primevue/virtualscroller";
import { computed, ref } from "vue";

const store = useGrepStore();
const isStoppingSearch = ref(false);
const isExporting = ref(false);
const isCopying = ref(false);
const sdk = useSDK();

type SortType =
  | "none"
  | "alphabetical-asc"
  | "alphabetical-desc"
  | "length-asc"
  | "length-desc";
const currentSort = ref<SortType>("none");
const resultsFilter = ref("");

const sortOptions = [
  { label: "No sorting", value: "none", icon: "fas fa-list" },
  {
    label: "Alphabetical A-Z",
    value: "alphabetical-asc",
    icon: "fas fa-sort-alpha-down",
  },
  {
    label: "Alphabetical Z-A",
    value: "alphabetical-desc",
    icon: "fas fa-sort-alpha-up",
  },
  {
    label: "Length (Short to Long)",
    value: "length-asc",
    icon: "fas fa-sort-numeric-down",
  },
  {
    label: "Length (Long to Short)",
    value: "length-desc",
    icon: "fas fa-sort-numeric-up",
  },
];

const { downloadResults, stopGrep } = useGrepRepository();

const hasResults = computed(
  () => store.results.searchResults && store.results.searchResults?.length > 0
);

const filteredAndSortedResults = computed(() => {
  if (!store.results.searchResults) return [];

  // First filter by search term
  let results = [...store.results.searchResults];
  if (resultsFilter.value.trim()) {
    const searchTerm = resultsFilter.value.toLowerCase();
    results = results.filter(item => item.toLowerCase().includes(searchTerm));
  }

  switch (currentSort.value) {
    case "alphabetical-asc":
      return results.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
    case "alphabetical-desc":
      return results.sort((a, b) =>
        b.toLowerCase().localeCompare(a.toLowerCase())
      );
    case "length-asc":
      return results.sort((a, b) => {
        const lengthDiff = a.length - b.length;
        return lengthDiff !== 0
          ? lengthDiff
          : a.toLowerCase().localeCompare(b.toLowerCase());
      });
    case "length-desc":
      return results.sort((a, b) => {
        const lengthDiff = b.length - a.length;
        return lengthDiff !== 0
          ? lengthDiff
          : a.toLowerCase().localeCompare(b.toLowerCase());
      });
    default:
      return results;
  }
});

const copyAllMatches = async () => {
  if (!hasResults.value) return;

  isCopying.value = true;
  try {
    const data = await downloadResults();
    if (!data || data.length === 0) return;

    copyToClipboard(sdk, data.join("\n"));
  } catch (error) {
    console.error("Error copying matches:", error);
    sdk.window.showToast("Error copying matches", { variant: "error" });
  } finally {
    isCopying.value = false;
  }
};

const exportToFile = async () => {
  if (!hasResults.value) return;

  isExporting.value = true;
  try {
    const data = await downloadResults();
    if (!data || data.length === 0) return;

    const blob = new Blob([data.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grep-matches-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting results:", error);
    sdk.window.showToast("Error exporting results", { variant: "error" });
  } finally {
    isExporting.value = false;
  }
};

const stopSearch = async () => {
  isStoppingSearch.value = true;
  try {
    await stopGrep();
  } catch (error) {
    console.error("Failed to stop grep:", error);
    sdk.window.showToast("Failed to stop search", { variant: "error" });
  } finally {
    isStoppingSearch.value = false;
  }
};
</script>

<template>
  <Card
    class="h-full"
    :pt="{
      body: { class: 'p-4 h-full' },
      content: { class: 'p-0 h-full' },
    }"
  >
    <template #content>
      <div class="flex flex-col h-full">
        <div class="flex justify-between items-center mb-4">
          <span class="text-xl font-semibold">
            <i class="fas fa-list mr-2"></i>
            <template v-if="store.results.searchResults">
              Matches ({{ store.results.uniqueMatchesCount }} matches)
            </template>
            <template v-else-if="store.status.isSearching">
              Searching...
            </template>
          </span>
          <div class="text-sm text-gray-500 flex items-center gap-2">
            <template v-if="store.status.isSearching">
              <div class="shimmer">Searching {{ store.status.progress }}%</div>
            </template>
            <template
              v-else-if="
                store.results.searchResults && !store.results.cancelled
              "
            >
              Scan finished in {{ formatTime(store.results.searchTime) }}
            </template>
            <template v-else-if="store.results.cancelled">
              Scan cancelled
            </template>
          </div>
        </div>
        <div class="flex flex-col gap-4 h-full">
          <div class="flex justify-between items-center gap-4">
            <div class="relative flex-1">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              <InputText
                v-model="resultsFilter"
                placeholder="Filter results..."
                class="w-full pl-9"
                :disabled="!hasResults"
              />
            </div>
            <div class="text-xs text-gray-500">
              {{ filteredAndSortedResults.length }} items
              <template v-if="resultsFilter.trim() && filteredAndSortedResults.length !== store.results.uniqueMatchesCount">
                (filtered from {{ store.results.uniqueMatchesCount }})
              </template>
            </div>
          </div>
          <VirtualScroller
            v-if="store.results.searchResults?.length"
            :items="filteredAndSortedResults"
            :itemSize="24"
            class="w-full h-full border border-gray-700 transition-all duration-200"
            scrollHeight="100%"
            :key="currentSort + resultsFilter"
          >
            <template #item="{ item }">
              <div
                class="p-1 bg-zinc-900/30 transition-colors select-text hover:bg-zinc-800/50"
              >
                {{ item }}
              </div>
            </template>
            <template #content="{ items, loading }">
              <div v-if="!items.length && !loading" class="p-4 text-gray-400">
                No matches found...
              </div>
            </template>
          </VirtualScroller>
          <div v-else class="p-4 text-gray-400">No matches found...</div>

          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <Button
                label="Copy All Matches"
                icon="fas fa-copy"
                class="p-button-outlined"
                @click="copyAllMatches"
                :loading="isCopying"
                :disabled="!hasResults"
              />
              <Button
                label="Export"
                icon="fas fa-download"
                class="p-button-outlined"
                @click="exportToFile"
                :loading="isExporting"
                :disabled="!hasResults"
              />
              <Button
                v-if="store.status.isSearching"
                severity="danger"
                size="small"
                label="Stop"
                icon="fas fa-stop"
                :loading="isStoppingSearch"
                @click="stopSearch"
              />
            </div>
            <div class="flex items-center gap-1">
              <span class="text-sm text-gray-400 mr-2">Sort:</span>
              <Dropdown
                :options="sortOptions"
                v-model="currentSort"
                optionLabel="label"
                optionValue="value"
                class="w-64"
                placeholder="Select sorting..."
              >
                <template #value="{ value }">
                  <div v-if="value" class="flex items-center gap-2">
                    <i
                      :class="
                        sortOptions.find((opt) => opt.value === value)?.icon
                      "
                      class="text-sm"
                    ></i>
                    <span>{{
                      sortOptions.find((opt) => opt.value === value)?.label
                    }}</span>
                  </div>
                  <span v-else>Select sorting...</span>
                </template>
                <template #option="{ option }">
                  <div class="flex items-center gap-2">
                    <i :class="option.icon" class="text-sm"></i>
                    <span>{{ option.label }}</span>
                  </div>
                </template>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
