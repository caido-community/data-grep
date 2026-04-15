<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { computed, ref, watch } from "vue";

import { usePatternsStore } from "@/stores";

const patternsStore = usePatternsStore();

const formData = ref({
  id: "",
  name: "",
  description: "",
  regex: "",
  matchGroups: [] as number[],
});

const matchGroupsInput = ref("");

const errors = ref({
  name: "",
  regex: "",
});

const isEditing = computed(() => !!patternsStore.editingPattern);
const isSaving = ref(false);

watch(
  () => patternsStore.showCustomRegexDialog,
  (visible) => {
    if (visible) {
      if (patternsStore.editingPattern) {
        formData.value = {
          id: patternsStore.editingPattern.id,
          name: patternsStore.editingPattern.name,
          description: patternsStore.editingPattern.description,
          regex: patternsStore.editingPattern.regex,
          matchGroups: patternsStore.editingPattern.matchGroups || [],
        };
        matchGroupsInput.value = (
          patternsStore.editingPattern.matchGroups || []
        ).join(", ");
      } else {
        formData.value = {
          id: window.crypto.randomUUID(),
          name: "",
          description: "",
          regex: "",
          matchGroups: [],
        };
        matchGroupsInput.value = "";
      }
      clearErrors();
    }
  },
);

function clearErrors() {
  errors.value = {
    name: "",
    regex: "",
  };
}

function validateForm() {
  clearErrors();
  let isValid = true;

  if (!formData.value.name.trim()) {
    errors.value.name = "Name is required";
    isValid = false;
  }

  if (!formData.value.regex.trim()) {
    errors.value.regex = "Regex pattern is required";
    isValid = false;
  } else {
    try {
      new RegExp(formData.value.regex);
    } catch {
      errors.value.regex = "Invalid regex pattern";
      isValid = false;
    }
  }

  return isValid;
}

function parseMatchGroups(input: string): number[] {
  if (!input.trim()) return [];

  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n >= 0);
}

async function handleSave() {
  if (!validateForm()) {
    return;
  }

  const parsedMatchGroups = parseMatchGroups(matchGroupsInput.value);
  isSaving.value = true;
  try {
    await patternsStore.saveCustomPattern(formData.value.id, {
      name: formData.value.name,
      description: formData.value.description,
      regex: formData.value.regex,
      matchGroups: parsedMatchGroups.length > 0 ? parsedMatchGroups : undefined,
    });
  } finally {
    isSaving.value = false;
  }
}

function handleCancel() {
  patternsStore.closeCustomRegexDialog();
}
</script>

<template>
  <Dialog
    v-model:visible="patternsStore.showCustomRegexDialog"
    modal
    :header="isEditing ? 'Edit Custom Regex' : 'Create Custom Regex'"
    :style="{ width: '500px' }"
    class="p-fluid"
  >
    <div class="space-y-6">
      <div>
        <label for="regex-name" class="block text-sm font-medium mb-2"
          >Name</label
        >
        <InputText
          id="regex-name"
          v-model="formData.name"
          placeholder="Pattern Name"
          :class="{ 'p-invalid': errors.name }"
          class="w-full"
        />
        <small v-if="errors.name" class="p-error block mt-1">{{
          errors.name
        }}</small>
      </div>

      <div>
        <label for="regex-description" class="block text-sm font-medium mb-2"
          >Description</label
        >
        <Textarea
          id="regex-description"
          v-model="formData.description"
          placeholder="Describe what this pattern matches..."
          rows="3"
          class="w-full"
        />
      </div>

      <div>
        <label for="regex-pattern" class="block text-sm font-medium mb-2"
          >Regex Pattern</label
        >
        <InputText
          id="regex-pattern"
          v-model="formData.regex"
          placeholder="[a-zA-Z0-9]+"
          :class="{ 'p-invalid': errors.regex }"
          class="w-full"
        />
        <small v-if="errors.regex" class="p-error block mt-1">{{
          errors.regex
        }}</small>
      </div>

      <div>
        <label for="match-groups" class="block text-sm font-medium mb-2"
          >Match Groups (Optional)</label
        >
        <InputText
          id="match-groups"
          v-model="matchGroupsInput"
          placeholder="Enter group numbers separated by commas (e.g., 1, 2, 3)"
          class="w-full"
        />
        <small class="text-gray-400 block mt-1">
          Specify which capture groups to extract (leave empty for full match)
        </small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          icon="fas fa-times"
          severity="secondary"
          outlined
          @click="handleCancel"
        />
        <Button
          :label="isEditing ? 'Update' : 'Create'"
          icon="fas fa-save"
          :loading="isSaving"
          @click="handleSave"
        />
      </div>
    </template>
  </Dialog>
</template>
