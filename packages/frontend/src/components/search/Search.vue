<script setup lang="ts">
import { useGrepStore } from "@/stores";
import InputText from "primevue/inputtext";

const grepStore = useGrepStore();

// Clear pattern name when user types a custom pattern
function handlePatternInput(event: Event) {
  const input = event.target as HTMLInputElement;
  grepStore.pattern = input.value;
  // Clear the pattern name since user is entering a custom pattern
  grepStore.currentPatternName = "";
}
</script>

<template>
  <div class="mt-2.5">
    <label class="block mb-2.5 font-medium">Search Pattern (regex)</label>
    <InputText
      :value="grepStore.pattern"
      @input="handlePatternInput"
      class="w-full h-12"
      placeholder="Enter a regex pattern to search for"
      v-tooltip.bottom="'Enter a regular expression to search for'"
    />
  </div>
</template>
