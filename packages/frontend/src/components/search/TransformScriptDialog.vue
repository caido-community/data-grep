<script setup lang="ts">
import { useGrepStore } from "@/stores";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { ref } from "vue";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { autocompletion } from "@codemirror/autocomplete";

const grepStore = useGrepStore();
const visible = ref(false);
const localScript = ref("");

// Disable autocomplete to avoid positioning issues in modal
const extensions = [javascript(), oneDark, autocompletion({ override: [] })];

const open = () => {
  localScript.value = grepStore.options.transformScript || "";
  visible.value = true;
};

const save = () => {
  grepStore.options.transformScript = localScript.value.trim() || null;
  visible.value = false;
};

const cancel = () => {
  visible.value = false;
};

defineExpose({ open });
</script>

<template>
  <Dialog v-model:visible="visible" header="Transform Script" :modal="true" :closable="true" :draggable="false"
    :style="{ width: '700px' }">
    <div class="flex flex-col gap-3">
      <p class="text-xs text-gray-400">
        Write JavaScript to transform each match. Receives <code class="text-blue-400">match</code> (string), return
        transformed value or <code class="text-blue-400">null</code> to skip.
      </p>

      <div class="border border-zinc-700 rounded">
        <Codemirror v-model="localScript" placeholder="return match.split('@')[1];"
          :style="{ height: '400px', fontSize: '14px' }" :autofocus="true" :indent-with-tab="true" :tab-size="2"
          :extensions="extensions" />
      </div>

      <div class="text-xs text-gray-500 bg-zinc-900 p-2 rounded font-mono">
        <span class="text-gray-400 font-semibold">Examples:</span><br>
        <code class="text-blue-400">return match.toUpperCase();</code> — Uppercase<br>
        <code class="text-blue-400">return match.split('@')[1];</code> — Extract domain<br>
        <code class="text-blue-400">return match.endsWith('.com') ? match : null;</code> — Filter
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" class="p-button-text" @click="cancel" />
      <Button label="Save" icon="fas fa-save" @click="save" />
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.cm-editor) {
  font-size: 14px !important;
}

:deep(.cm-content) {
  font-family: ui-monospace, monospace !important;
}

/* Fix autocomplete tooltip positioning */
:deep(.cm-tooltip-autocomplete) {
  position: fixed !important;
  z-index: 9999 !important;
}
</style>
