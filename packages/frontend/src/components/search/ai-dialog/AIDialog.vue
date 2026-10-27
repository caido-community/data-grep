<script setup lang="ts">
import Button from "primevue/button";
import Select from "primevue/select";
import Textarea from "primevue/textarea";

import { useAIStore } from "@/stores";

const aiStore = useAIStore();
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-surface-400">Model</label>
      <Select
        v-model="aiStore.selectedModelKey"
        :options="aiStore.modelGroups"
        option-label="name"
        option-value="key"
        option-group-label="label"
        option-group-children="models"
        placeholder="Select a model"
        class="w-full"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-surface-400">Ask AI</label>
      <Textarea
        v-model="aiStore.prompt"
        :rows="8"
        placeholder="Describe the regex pattern you need..."
        class="w-full"
        :style="{
          fontSize: '14px',
          background: 'var(--c-gray-800)',
          resize: 'vertical',
        }"
      />
    </div>

    <div class="flex justify-end">
      <Button
        label="Generate"
        icon="fas fa-robot"
        class="p-button-primary"
        :loading="aiStore.isProcessing"
        :disabled="!aiStore.selectedModelKey || !aiStore.prompt.trim()"
        @click="aiStore.processAIPrompt"
      />
    </div>
  </div>
</template>
