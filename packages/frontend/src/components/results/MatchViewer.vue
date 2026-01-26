<script setup lang="ts">
import { useSDK } from "@/plugins/sdk";
import type { MatchResult } from "shared";
import { ref, onMounted, nextTick, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import DOMPurify from "dompurify";

const props = defineProps<{
  match: MatchResult;
}>();

const emit = defineEmits<{
  close: [];
}>();

const sdk = useSDK();
const visible = ref(true);
const isLoading = ref(true);
const error = ref<string | null>(null);
const requestRaw = ref("");
const responseRaw = ref<string | null>(null);

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const highlightedRequest = computed(() => {
  if (!requestRaw.value) return "";
  if (props.match.source !== "request") return DOMPurify.sanitize(escapeHtml(requestRaw.value));
  const text = requestRaw.value;
  const { startIndex, endIndex } = props.match;
  if (startIndex >= 0 && endIndex <= text.length && startIndex < endIndex) {
    const before = escapeHtml(text.slice(0, startIndex));
    const matched = escapeHtml(text.slice(startIndex, endIndex));
    const after = escapeHtml(text.slice(endIndex));
    return DOMPurify.sanitize(
      `${before}<mark class="bg-red-600 text-white px-[3px] py-[1px] rounded-[2px] font-semibold" id="grep-match-highlight">${matched}</mark>${after}`,
      { ADD_ATTR: ["class", "id"] }
    );
  }
  return DOMPurify.sanitize(escapeHtml(text));
});

const highlightedResponse = computed(() => {
  if (!responseRaw.value) return "";
  if (props.match.source !== "response") return DOMPurify.sanitize(escapeHtml(responseRaw.value));
  const text = responseRaw.value;
  const { startIndex, endIndex } = props.match;
  if (startIndex >= 0 && endIndex <= text.length && startIndex < endIndex) {
    const before = escapeHtml(text.slice(0, startIndex));
    const matched = escapeHtml(text.slice(startIndex, endIndex));
    const after = escapeHtml(text.slice(endIndex));
    return DOMPurify.sanitize(
      `${before}<mark class="bg-red-600 text-white px-[3px] py-[1px] rounded-[2px] font-semibold" id="grep-match-highlight">${matched}</mark>${after}`,
      { ADD_ATTR: ["class", "id"] }
    );
  }
  return DOMPurify.sanitize(escapeHtml(text));
});

const scrollToHighlight = () => {
  setTimeout(() => {
    const el = document.getElementById("grep-match-highlight");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 150);
};

const loadData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const result = await sdk.backend.getRequestData(props.match.requestId);
    if (result.error || !result.data) {
      error.value = result.error || "Request not found";
      return;
    }
    requestRaw.value = result.data.requestRaw;
    responseRaw.value = result.data.responseRaw;
    await nextTick();
    scrollToHighlight();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load";
  } finally {
    isLoading.value = false;
  }
};

const handleClose = () => {
  visible.value = false;
  emit("close");
};

onMounted(() => loadData());
</script>

<template>
  <Dialog v-model:visible="visible" :header="`Request #${match.requestId}`" :modal="true" :closable="true"
    :draggable="false" :style="{ width: '85vw', maxWidth: '1200px' }" @hide="handleClose">
    <div class="flex flex-col gap-3">
      <div class="px-3 py-2 bg-zinc-800 rounded-md text-[13px] flex items-center justify-between">
        <div class="text-gray-400">
          Match found in
          <span class="text-red-500 font-semibold mx-1">{{ match.source }}</span>
          at position {{ match.startIndex }}-{{ match.endIndex }}
        </div>
        <div
          class="font-mono text-[11px] bg-zinc-900 px-2 py-1 rounded-md text-red-500 max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap">
          {{ match.value }}
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-12 text-gray-400">
        <i class="fas fa-spinner fa-spin mr-2"></i>Loading...
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-500">
        <i class="fas fa-exclamation-triangle mr-2"></i>{{ error }}
      </div>

      <table v-else class="w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th class="text-left py-1.5 text-[11px] font-semibold text-gray-400 w-1/2">
              <i class="fas fa-arrow-up mr-1"></i>Request
              <span v-if="match.source === 'request'" class="text-red-500 ml-1">(match)</span>
            </th>
            <th v-if="responseRaw" class="text-left py-1.5 text-[11px] font-semibold text-gray-400 w-1/2">
              <i class="fas fa-arrow-down mr-1"></i>Response
              <span v-if="match.source === 'response'" class="text-red-500 ml-1">(match)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="align-top pr-2">
              <pre
                class="h-[400px] overflow-auto bg-[#18181b] border border-[#27272a] rounded p-2.5 m-0 text-[11px] font-mono text-[#d4d4d4] whitespace-pre-wrap break-all"
                v-html="highlightedRequest"></pre>
            </td>
            <td v-if="responseRaw" class="align-top pl-2">
              <pre
                class="h-[400px] overflow-auto bg-[#18181b] border border-[#27272a] rounded p-2.5 m-0 text-[11px] font-mono text-[#d4d4d4] whitespace-pre-wrap break-all"
                v-html="highlightedResponse"></pre>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <Button label="Close" icon="fas fa-times" @click="handleClose" class="p-button-outlined" />
    </template>
  </Dialog>
</template>
