<script setup lang="ts">
import { usePatternsStore } from "@/stores";
import Dialog from "primevue/dialog";
import PatternsList from "./PatternsList.vue";

const patternsStore = usePatternsStore();
</script>

<template>
  <Dialog
    v-model:visible="patternsStore.dialogVisible"
    modal
    header="Patterns"
    :style="{ width: '700px' }"
    @hide="patternsStore.closeDialog"
  >
    <PatternsList />
  </Dialog>
</template>
