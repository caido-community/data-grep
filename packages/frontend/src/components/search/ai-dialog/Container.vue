<script setup lang="ts">
import Dialog from "primevue/dialog";

import AIDialog from "./AIDialog.vue";
import NoProviders from "./NoProviders.vue";

import { useAIStore } from "@/stores";

const aiStore = useAIStore();
</script>

<template>
  <Dialog
    v-model:visible="aiStore.dialogVisible"
    modal
    header="Generate Regex with AI"
    :style="{ width: '500px' }"
    @hide="aiStore.closeDialog"
  >
    <div class="flex flex-col gap-4">
      <NoProviders v-if="!aiStore.hasAvailableProviders" />
      <AIDialog v-else />
    </div>
  </Dialog>
</template>
