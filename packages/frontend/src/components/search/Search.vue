<script setup lang="ts">
import InputText from "primevue/inputtext";

import { useGrepStore } from "@/stores";

const grepStore = useGrepStore();

function handlePatternInput(event: Event) {
  const input = event.target as HTMLInputElement;
  grepStore.pattern = input.value;
  grepStore.currentPatternName = "";
}
</script>

<template>
  <div class="mt-2.5">
    <label class="block mb-2.5 font-medium">Search Pattern (regex)</label>
    <InputText
      v-tooltip.bottom="'Enter a regular expression to search for'"
      :value="grepStore.pattern"
      class="w-full h-12"
      placeholder="Enter a regex pattern to search for"
      @input="handlePatternInput"
    />
  </div>
</template>
