<script setup lang="ts">
import { useSDK } from "@/plugins/sdk";
import type { MatchResult } from "shared";
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

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
  if (props.match.source !== "request") return escapeHtml(requestRaw.value);
  const text = requestRaw.value;
  const { startIndex, endIndex } = props.match;
  if (startIndex >= 0 && endIndex <= text.length && startIndex < endIndex) {
    const before = escapeHtml(text.slice(0, startIndex));
    const matched = escapeHtml(text.slice(startIndex, endIndex));
    const after = escapeHtml(text.slice(endIndex));
    return `${before}<mark style="background:#dc2626;color:#fff;padding:1px 3px;border-radius:2px;font-weight:600" id="grep-match-highlight">${matched}</mark>${after}`;
  }
  return escapeHtml(text);
});

const highlightedResponse = computed(() => {
  if (!responseRaw.value) return "";
  if (props.match.source !== "response") return escapeHtml(responseRaw.value);
  const text = responseRaw.value;
  const { startIndex, endIndex } = props.match;
  if (startIndex >= 0 && endIndex <= text.length && startIndex < endIndex) {
    const before = escapeHtml(text.slice(0, startIndex));
    const matched = escapeHtml(text.slice(startIndex, endIndex));
    const after = escapeHtml(text.slice(endIndex));
    return `${before}<mark style="background:#dc2626;color:#fff;padding:1px 3px;border-radius:2px;font-weight:600" id="grep-match-highlight">${matched}</mark>${after}`;
  }
  return escapeHtml(text);
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
onUnmounted(() => {});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="`Request #${match.requestId}`"
    :modal="true"
    :closable="true"
    :draggable="false"
    :style="{ width: '85vw', maxWidth: '1200px' }"
    @hide="handleClose"
  >
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="padding:8px 12px;background:#27272a;border-radius:6px;font-size:13px;display:flex;align-items:center;justify-content:space-between">
        <div style="color:#9ca3af">
          Match found in
          <span style="color:#ef4444;font-weight:600;margin:0 4px">{{ match.source }}</span>
          at position {{ match.startIndex }}-{{ match.endIndex }}
        </div>
        <div style="font-family:ui-monospace,monospace;font-size:11px;background:#18181b;padding:4px 8px;border-radius:4px;color:#ef4444;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          {{ match.value }}
        </div>
      </div>

      <div v-if="isLoading" style="text-align:center;padding:48px 0;color:#9ca3af">
        <i class="fas fa-spinner fa-spin" style="margin-right:8px"></i>Loading...
      </div>

      <div v-else-if="error" style="text-align:center;padding:48px 0;color:#ef4444">
        <i class="fas fa-exclamation-triangle" style="margin-right:8px"></i>{{ error }}
      </div>

      <table v-else style="width:100%;border-collapse:collapse;table-layout:fixed">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 0;font-size:11px;font-weight:600;color:#9ca3af;width:50%">
              <i class="fas fa-arrow-up" style="margin-right:4px"></i>Request
              <span v-if="match.source === 'request'" style="color:#ef4444;margin-left:4px">(match)</span>
            </th>
            <th v-if="responseRaw" style="text-align:left;padding:6px 0;font-size:11px;font-weight:600;color:#9ca3af;width:50%">
              <i class="fas fa-arrow-down" style="margin-right:4px"></i>Response
              <span v-if="match.source === 'response'" style="color:#ef4444;margin-left:4px">(match)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="vertical-align:top;padding-right:8px">
              <pre
                style="height:400px;overflow:auto;background:#18181b;border:1px solid #27272a;border-radius:4px;padding:10px;margin:0;font-size:11px;font-family:ui-monospace,monospace;color:#d4d4d4;white-space:pre-wrap;word-break:break-all"
                v-html="highlightedRequest"
              ></pre>
            </td>
            <td v-if="responseRaw" style="vertical-align:top;padding-left:8px">
              <pre
                style="height:400px;overflow:auto;background:#18181b;border:1px solid #27272a;border-radius:4px;padding:10px;margin:0;font-size:11px;font-family:ui-monospace,monospace;color:#d4d4d4;white-space:pre-wrap;word-break:break-all"
                v-html="highlightedResponse"
              ></pre>
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
