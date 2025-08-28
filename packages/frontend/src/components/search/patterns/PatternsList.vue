<script setup lang="ts">
import { usePatternsStore } from "@/stores";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import CustomRegexDialog from "./CustomRegexDialog.vue";

const patternsStore = usePatternsStore();
const confirm = useConfirm();

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

function isCustomPattern(name: string) {
  return patternsStore.customPatterns.some((p) => p.name === name);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <p class="text-gray-300">Select a pattern to use in your search:</p>
      <Button
        label="Create Custom"
        icon="fas fa-plus"
        class="p-button-sm p-button-outlined"
        @click="patternsStore.openCustomRegexDialog()"
      />
    </div>

    <!-- Search and filters -->
    <div class="flex flex-col gap-3">
      <div class="flex gap-2">
        <input
          v-model="patternsStore.searchQuery"
          type="text"
          placeholder="Search patterns..."
          class="flex-1 px-3 py-2 bg-zinc-900 border border-gray-700 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div class="flex gap-2 flex-wrap">
        <button
          @click="patternsStore.selectedCategory = 'all'"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            patternsStore.selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
          ]"
        >
          All ({{ patternsStore.allPatterns.length }})
        </button>
        <button
          @click="patternsStore.selectedCategory = 'predefined'"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            patternsStore.selectedCategory === 'predefined'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
          ]"
        >
          Common ({{ patternsStore.predefinedPatterns.length }})
        </button>
        <button
          @click="patternsStore.selectedCategory = 'secrets'"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            patternsStore.selectedCategory === 'secrets'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
          ]"
        >
          <i class="fas fa-key mr-1"></i>
          Secrets ({{ patternsStore.secretPatterns.length }})
        </button>
        <button
          @click="patternsStore.selectedCategory = 'custom'"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            patternsStore.selectedCategory === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
          ]"
        >
          Custom ({{ patternsStore.customPatterns.length }})
        </button>
      </div>
    </div>

    <div v-if="patternsStore.isLoading" class="flex justify-center py-8">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <div v-else-if="patternsStore.filteredPatterns.length === 0" class="text-center py-8 text-gray-400">
      <i class="fas fa-search text-4xl mb-3"></i>
      <p>No patterns found matching your criteria</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
      <div
        v-for="pattern in patternsStore.filteredPatterns"
        :key="pattern.name"
        class="p-4 border rounded-lg hover:bg-zinc-900/50 transition-colors"
        :class="
          isCustomPattern(pattern.name)
            ? 'border-blue-700/50 bg-blue-900/10'
            : 'border-gray-700'
        "
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-medium">{{ pattern.name }}</h3>
              <span
                v-if="pattern.category === 'secrets'"
                class="text-xs bg-red-600 text-white px-2 py-1 rounded"
              >
                <i class="fas fa-key mr-1"></i>Secret
              </span>
              <span
                v-else-if="isCustomPattern(pattern.name)"
                class="text-xs bg-blue-600 text-white px-2 py-1 rounded"
              >
                Custom
              </span>
            </div>
            <p class="text-sm text-gray-400">{{ pattern.description }}</p>
            <code
              class="mt-2 block text-xs text-gray-300 bg-gray-600 p-2 rounded w-fit"
            >
              {{ pattern.pattern }}
            </code>
            <div
              v-if="pattern.matchGroups && pattern.matchGroups.length > 0"
              class="mt-2"
            >
              <span class="text-xs text-gray-400">Match Groups: </span>
              <span class="text-xs text-blue-400">{{
                pattern.matchGroups.join(", ")
              }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <Button
              v-if="isCustomPattern(pattern.name)"
              icon="fas fa-edit"
              class="p-button-sm p-button-outlined p-button-secondary"
              @click="
                patternsStore.openCustomRegexDialog(
                  getCustomPatternById(pattern.name)
                )
              "
              tooltip="Edit this pattern"
            />
            <Button
              v-if="isCustomPattern(pattern.name)"
              icon="fas fa-trash"
              class="p-button-sm p-button-outlined p-button-danger"
              @click="
                handleDeleteCustomPattern(
                  getCustomPatternById(pattern.name)?.id || '',
                  pattern.name
                )
              "
              tooltip="Delete this pattern"
            />
            <Button
              icon="fas fa-check"
              class="p-button-sm p-button-outlined"
              @click="patternsStore.applyPattern(pattern)"
              tooltip="Apply this pattern"
            />
          </div>
        </div>
      </div>
    </div>

    <CustomRegexDialog />
    <ConfirmDialog />
  </div>
</template>
