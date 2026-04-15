<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";

import { SECRET_PATTERNS } from "@/data/secret-patterns";
import { useBatchSearchStore } from "@/stores";

const batchSearchStore = useBatchSearchStore();
</script>

<template>
  <Dialog
    v-model:visible="batchSearchStore.showWarningDialog"
    modal
    header="Search All Secrets"
    :style="{ width: '500px' }"
    :dismissable-mask="false"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <i
          class="fas fa-exclamation-triangle text-yellow-500 text-2xl mt-1"
        ></i>
        <div>
          <p class="font-semibold mb-2">
            This will search for all secret patterns
          </p>
          <p class="text-sm text-gray-400">
            We'll scan your traffic against
            {{ SECRET_PATTERNS.length }} secret detection patterns from
            TruffleHog. This may take several minutes depending on the size of
            your project data.
          </p>
        </div>
      </div>

      <div class="bg-zinc-900 border border-gray-700 rounded-md p-3">
        <p class="text-sm font-semibold">What will happen:</p>
        <ul class="text-sm text-gray-400 mt-2 space-y-1 list-disc list-inside">
          <li>Each pattern will be searched individually on the main page</li>
          <li>You can stop the current search using the Stop button</li>
          <li>Results accumulate and can be filtered by category</li>
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
        @click="batchSearchStore.confirmAndStart"
      />
    </template>
  </Dialog>
</template>
