<script setup lang="ts">
import { GuideContainer } from "@/components/guide";
import { useAIStore, useGrepStore, useGuideStore, usePatternsStore } from "@/stores";
import Button from "primevue/button";
import Divider from "primevue/divider";
import { ref } from "vue";
import Options from "./Options.vue";
import Search from "./Search.vue";
import TransformScriptDialog from "./TransformScriptDialog.vue";
import { AIDialogContainer } from "./ai-dialog";
import { PatternsDialogContainer } from "./patterns";

const grepStore = useGrepStore();
const aiStore = useAIStore();
const patternsStore = usePatternsStore();
const guideStore = useGuideStore();
const transformDialogRef = ref<InstanceType<typeof TransformScriptDialog> | null>(null);

const openTransformDialog = () => {
  transformDialogRef.value?.open();
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <Search />

    <Divider :pt="{
      root: {
        class:
          'my-1 text-gray-400 flex relative mx-0 py-0 px-5 w-full before:block before:absolute before:left-0 before:top-1/2 before:w-full before:border-solid before:border-t before:border-surface-200 before:dark:border-surface-600',
      },
    }">Options</Divider>
    <Options />

    <div class="flex justify-between mt-2 gap-2">
      <div class="flex gap-2">
        <Button
          label="Search"
          icon="fas fa-search"
          class="p-button-primary"
          @click="grepStore.searchGrepRequests"
          :loading="grepStore.status.isSearching"
          :disabled="!grepStore.pattern.trim()"
        />
        <Button
          :loading="aiStore.isProcessing"
          label="Ask AI"
          icon="fas fa-robot"
          class="p-button-secondary"
          @click="aiStore.openDialog"
        />
        <Button
          label="Predefined Patterns"
          icon="fas fa-list"
          class="p-button-secondary"
          @click="patternsStore.openDialog"
        />
        <Button
          label="Transform"
          icon="fas fa-cog"
          severity="secondary"
          :disabled="grepStore.options.transformScript === null"
          @click="openTransformDialog"
        />
      </div>
      <Button
        label="Guide"
        outlined
        severity="info"
        icon="fas fa-book"
        class="p-button-secondary"
        @click="guideStore.openDialog"
      />
    </div>

    <AIDialogContainer />
    <PatternsDialogContainer />
    <GuideContainer />
    <TransformScriptDialog ref="transformDialogRef" />
  </div>
</template>
