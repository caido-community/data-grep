<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import { ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useGrepRepository } from "@/repositories/grep";
import { useGrepStore } from "@/stores";

const store = useGrepStore();
const sdk = useSDK();
const isStoppingSearch = ref(false);
const { stopGrep } = useGrepRepository();

const stopSearch = async () => {
  isStoppingSearch.value = true;
  try {
    await stopGrep();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sdk.window.showToast(`Failed to stop grep: ${message}`, {
      variant: "error",
    });
  } finally {
    isStoppingSearch.value = false;
  }
};
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
        <i class="fas fa-spinner fa-spin text-gray-400 text-3xl"></i>
        <div class="text-gray-400 text-md shimmer">
          Searching {{ store.status.progress }}%
        </div>
        <Button
          severity="danger"
          size="small"
          label="Stop"
          icon="fas fa-stop"
          :loading="isStoppingSearch"
          @click="stopSearch"
        />
      </div>
    </template>
  </Card>
</template>
