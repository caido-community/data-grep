<script setup lang="ts">
import { useBatchSearchStore, useGrepStore } from "@/stores";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import ProgressBar from "primevue/progressbar";
import Badge from "primevue/badge";
import { computed } from "vue";

const batchSearchStore = useBatchSearchStore();
const grepStore = useGrepStore();

const sortedResults = computed(() => {
  return [...batchSearchStore.resultsWithMatches].sort((a, b) => b.matchesCount - a.matchesCount);
});

function applyPattern(patternName: string) {
  // Find the pattern in TRUFFLEHOG_PATTERNS
  const pattern = batchSearchStore.searchResults.find(r => r.patternName === patternName);
  if (pattern) {
    // Extract the actual regex from the pattern name
    const parts = patternName.split('.');
    const detectorName = parts[0];
    const patternType = parts.slice(1).join('.');
    
    // Import the patterns to get the actual regex
    import("../../../trufflehog_patterns").then(module => {
      const foundPattern = module.TRUFFLEHOG_PATTERNS.find(p => p.name === patternName);
      if (foundPattern) {
        grepStore.pattern = foundPattern.pattern;
        batchSearchStore.closeResultsDialog();
        grepStore.searchGrepRequests();
      }
    });
  }
}

function getColorByCount(count: number): string {
  if (count >= 100) return "danger";
  if (count >= 50) return "warning";
  if (count >= 10) return "info";
  return "secondary";
}
</script>

<template>
  <!-- Warning Dialog -->
  <Dialog
    v-model:visible="batchSearchStore.showWarningDialog"
    modal
    :header="'Search All Secrets'"
    :style="{ width: '500px' }"
    :dismissableMask="false"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mt-1"></i>
        <div>
          <p class="font-semibold mb-2">This operation will search for all secret patterns</p>
          <p class="text-sm text-gray-400">
            We'll scan your requests and responses for {{ batchSearchStore.status.totalPatterns || 166 }}+ 
            different secret patterns from TruffleHog. This may take several minutes depending on 
            the size of your project data.
          </p>
        </div>
      </div>
      
      <div class="bg-zinc-900 border border-gray-700 rounded-md p-3">
        <p class="text-sm">
          <strong>What will happen:</strong>
        </p>
        <ul class="text-sm text-gray-400 mt-2 space-y-1 list-disc list-inside">
          <li>Each secret pattern will be searched individually</li>
          <li>You can cancel the operation at any time</li>
          <li>Results will be aggregated and shown when complete</li>
          <li>High match counts may indicate exposed secrets</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <Button 
        label="Cancel" 
        class="p-button-text" 
        @click="batchSearchStore.closeWarningDialog" 
      />
      <Button 
        label="Start Search" 
        icon="fas fa-search" 
        class="p-button-primary"
        @click="batchSearchStore.confirmAndStartSearch(grepStore.options)" 
      />
    </template>
  </Dialog>

  <!-- Progress Dialog -->
  <Dialog
    v-model:visible="batchSearchStore.status.isSearching"
    modal
    :header="'Searching for Secrets...'"
    :style="{ width: '500px' }"
    :closable="false"
    :dismissableMask="false"
  >
    <div class="flex flex-col gap-4">
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span>Progress: {{ batchSearchStore.status.patternsCompleted }} / {{ batchSearchStore.status.totalPatterns }}</span>
          <span>{{ batchSearchStore.progress }}%</span>
        </div>
        <ProgressBar 
          :value="batchSearchStore.progress" 
          :showValue="false"
          style="height: 8px"
        />
      </div>

      <div class="bg-zinc-900 border border-gray-700 rounded-md p-3">
        <p class="text-sm text-gray-400">
          <strong>Current pattern:</strong> 
          <span class="text-white ml-2">{{ batchSearchStore.status.currentPattern || 'Initializing...' }}</span>
        </p>
        <p class="text-sm text-gray-400 mt-2">
          <strong>Matches found so far:</strong> 
          <span class="text-green-400 ml-2">{{ batchSearchStore.totalMatches }}</span>
        </p>
      </div>
    </div>

    <template #footer>
      <Button 
        label="Cancel Search" 
        icon="fas fa-stop" 
        class="p-button-danger"
        @click="batchSearchStore.cancelSearch" 
      />
    </template>
  </Dialog>

  <!-- Results Dialog -->
  <Dialog
    v-model:visible="batchSearchStore.showResultsDialog"
    modal
    :header="`Secret Search Results`"
    :style="{ width: '700px', maxHeight: '80vh' }"
    :dismissableMask="true"
  >
    <div class="flex flex-col gap-4">
      <!-- Summary -->
      <div class="bg-zinc-900 border border-gray-700 rounded-md p-4">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-lg font-semibold">
              <i class="fas fa-shield-alt text-yellow-500 mr-2"></i>
              Security Scan Complete
            </p>
            <p class="text-sm text-gray-400 mt-1">
              Searched {{ batchSearchStore.status.patternsCompleted }} patterns
            </p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold" :class="batchSearchStore.totalMatches > 0 ? 'text-yellow-500' : 'text-green-500'">
              {{ batchSearchStore.totalMatches }}
            </p>
            <p class="text-sm text-gray-400">Total Matches</p>
          </div>
        </div>
      </div>

      <!-- Results list -->
      <div v-if="sortedResults.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="result in sortedResults"
          :key="result.patternName"
          class="flex justify-between items-center p-3 bg-zinc-900 border border-gray-700 rounded-md hover:bg-zinc-800 transition-colors"
        >
          <div class="flex-1">
            <p class="font-medium">{{ result.patternName }}</p>
            <p class="text-sm text-gray-400">{{ result.category }}</p>
          </div>
          <div class="flex items-center gap-3">
            <Badge 
              :value="result.matchesCount" 
              :severity="getColorByCount(result.matchesCount)"
            />
            <Button
              icon="fas fa-search"
              class="p-button-sm p-button-outlined"
              @click="applyPattern(result.patternName)"
              tooltip="Search with this pattern"
            />
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8 text-gray-400">
        <i class="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
        <p class="text-lg">No secrets detected!</p>
        <p class="text-sm mt-2">Your requests and responses appear to be clean.</p>
      </div>
    </div>

    <template #footer>
      <Button 
        label="Close" 
        class="p-button-secondary" 
        @click="batchSearchStore.closeResultsDialog" 
      />
    </template>
  </Dialog>
</template>