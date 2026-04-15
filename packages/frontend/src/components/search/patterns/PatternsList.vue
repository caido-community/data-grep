<script setup lang="ts">
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import { useConfirm } from "primevue/useconfirm";

import CustomRegexDialog from "./CustomRegexDialog.vue";

import { usePatternsStore } from "@/stores";
import type { PatternCategory } from "@/stores/patternsStore";

const patternsStore = usePatternsStore();
const confirm = useConfirm();

const categoryOptions: { label: string; value: PatternCategory }[] = [
  { label: "All", value: "all" },
  { label: "Predefined", value: "predefined" },
  { label: "Secrets", value: "secrets" },
  { label: "Custom", value: "custom" },
];

function handleDeleteCustomPattern(id: string, name: string) {
  confirm.require({
    message: `Are you sure you want to delete the custom pattern "${name}"?`,
    header: "Delete Custom Pattern",
    icon: "fas fa-exclamation-triangle",
    rejectClass: "p-button-text p-button-text",
    acceptClass: "p-button-danger",
    accept: () => {
      patternsStore.deleteCustomPattern(id);
    },
  });
}

function getCustomPatternById(name: string) {
  return patternsStore.customPatterns.find((p) => p.name === name);
}

function editCustomPattern(name: string) {
  const pattern = getCustomPatternById(name);
  if (pattern !== undefined) {
    patternsStore.openCustomRegexDialog(pattern);
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <SelectButton
        v-model="patternsStore.selectedCategory"
        :options="categoryOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        class="p-button-sm"
      />
      <Button
        label="Create Custom"
        icon="fas fa-plus"
        class="p-button-sm p-button-outlined"
        @click="patternsStore.openCustomRegexDialog()"
      />
    </div>

    <div class="flex gap-2">
      <div class="relative flex-1">
        <i
          class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
        ></i>
        <InputText
          v-model="patternsStore.searchQuery"
          placeholder="Search patterns..."
          class="w-full pl-9"
        />
      </div>
      <Select
        v-if="patternsStore.selectedCategory === 'secrets'"
        v-model="patternsStore.selectedSecretCategory"
        :options="[
          { label: 'All Categories', value: 'all' },
          ...patternsStore.secretPatternCategories.map((c) => ({
            label: c,
            value: c,
          })),
        ]"
        option-label="label"
        option-value="value"
        class="w-52"
      />
    </div>

    <div v-if="!patternsStore.isLoading" class="text-xs text-gray-500">
      {{ patternsStore.filteredPatterns.length }} patterns
    </div>

    <div v-if="patternsStore.isLoading" class="flex justify-center py-8">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <div v-else class="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto">
      <div
        v-for="pattern in patternsStore.filteredPatterns"
        :key="pattern.name + pattern.pattern"
        class="p-3 border rounded-lg hover:bg-zinc-900/50 transition-colors"
        :class="{
          'border-blue-700/50 bg-blue-900/10': pattern.category === 'custom',
          'border-yellow-700/30 bg-yellow-900/5':
            pattern.category === 'secrets',
          'border-gray-700': pattern.category === 'predefined',
        }"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-sm font-medium truncate">{{ pattern.name }}</h3>
              <span
                v-if="pattern.category === 'custom'"
                class="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded shrink-0"
              >
                Custom
              </span>
              <span
                v-if="pattern.category === 'secrets' && pattern.secretCategory"
                class="text-xs bg-yellow-700/50 text-yellow-200 px-1.5 py-0.5 rounded shrink-0"
              >
                {{ pattern.secretCategory }}
              </span>
            </div>
            <p class="text-xs text-gray-400">{{ pattern.description }}</p>
            <code
              class="mt-1.5 block text-xs text-gray-300 bg-gray-600 p-1.5 rounded w-fit max-w-full truncate"
            >
              {{ pattern.pattern }}
            </code>
            <div
              v-if="pattern.matchGroups && pattern.matchGroups.length > 0"
              class="mt-1.5"
            >
              <span class="text-xs text-gray-400">Match Groups: </span>
              <span class="text-xs text-blue-400">{{
                pattern.matchGroups.join(", ")
              }}</span>
            </div>
          </div>
          <div class="flex gap-2 ml-2 shrink-0">
            <Button
              v-if="pattern.category === 'custom'"
              icon="fas fa-edit"
              class="p-button-sm p-button-outlined p-button-secondary"
              tooltip="Edit this pattern"
              @click="editCustomPattern(pattern.name)"
            />
            <Button
              v-if="pattern.category === 'custom'"
              icon="fas fa-trash"
              class="p-button-sm p-button-outlined p-button-danger"
              tooltip="Delete this pattern"
              @click="
                handleDeleteCustomPattern(
                  getCustomPatternById(pattern.name)?.id || '',
                  pattern.name,
                )
              "
            />
            <Button
              icon="fas fa-check"
              class="p-button-sm p-button-outlined"
              tooltip="Apply this pattern"
              @click="patternsStore.applyPattern(pattern)"
            />
          </div>
        </div>
      </div>

      <div
        v-if="patternsStore.filteredPatterns.length === 0"
        class="text-center py-8 text-gray-400"
      >
        <i class="fas fa-search text-2xl mb-2"></i>
        <p>No patterns match your search.</p>
      </div>
    </div>

    <CustomRegexDialog />
    <ConfirmDialog />
  </div>
</template>
