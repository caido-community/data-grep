<script setup lang="ts">
import Card from "primevue/card";

import { useGrepStore } from "@/stores";

const store = useGrepStore();
</script>

<template>
  <Card
    class="h-full"
    :pt="{
      body: { class: 'flex flex-col items-center justify-center h-full' },
    }"
  >
    <template #content>
      <div class="flex flex-col items-center justify-center h-full gap-4">
        <i
          v-if="
            store.pattern.trim() && store.results.searchResults?.length === 0
          "
          class="fas fa-search-minus text-gray-400 text-3xl"
        ></i>
        <i v-else class="fas fa-search text-gray-400 text-3xl"></i>

        <div
          v-if="
            store.pattern.trim() && store.results.searchResults?.length === 0
          "
          class="text-gray-400 text-md"
        >
          No results found
        </div>
        <div v-else class="text-gray-400 text-md">
          Enter a pattern and search to see results
        </div>
      </div>
    </template>
  </Card>
</template>
