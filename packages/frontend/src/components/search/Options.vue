<script setup lang="ts">
import { useGrepStore } from "@/stores";
import { useMediaQuery } from "@vueuse/core";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import { computed } from "vue";

const grepStore = useGrepStore();
const isSmallScreen = useMediaQuery("(max-width: 900px)");

const matchGroupsString = computed({
  get: () => {
    if (!grepStore.options.matchGroups) return "";
    return grepStore.options.matchGroups.join(",");
  },
  set: (value: string) => {
    if (!value) {
      grepStore.options.matchGroups = null;
      return;
    }

    const groups = value.split(",")
      .map(g => g.trim())
      .filter(g => g !== "")
      .map(g => parseInt(g))
      .filter(g => !isNaN(g));

    grepStore.options.matchGroups = groups.length ? groups : null;
  }
});
</script>

<template>
  <div
    class="flex flex-row justify-between"
    :class="{ 'flex-col gap-4': isSmallScreen }"
  >
    <div class="flex flex-row gap-6">
      <div class="flex flex-col gap-3">
        <div class="flex items-center">
          <Checkbox
            v-model="grepStore.options.includeRequests"
            :binary="true"
            inputId="includeRequests"
          />
          <label for="includeRequests" class="ml-3">Include Requests</label>
        </div>

        <div class="flex items-center">
          <Checkbox
            v-model="grepStore.options.includeResponses"
            :binary="true"
            inputId="includeResponses"
          />
          <label for="includeResponses" class="ml-3">Include Responses</label>
        </div>

        <div class="flex items-center">
          <Checkbox
            v-model="grepStore.options.onlyInScope"
            :binary="true"
            inputId="onlyInScope"
          />
          <label for="onlyInScope" class="ml-3">Only In Scope</label>
          <i
            class="fas fa-info-circle ml-2 text-gray-500"
            v-tooltip.right="'Only include requests that are in scope'"
          ></i>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex items-center">
          <Checkbox
            v-model="grepStore.options.skipLargeResponses"
            :binary="true"
            inputId="skipLargeResponses"
          />
          <label for="skipLargeResponses" class="ml-3"
            >Skip Large Responses</label
          >
          <i
            class="fas fa-info-circle ml-2 text-gray-500"
            v-tooltip.right="
              'Skip responses larger than 10MB. This should be always used to avoid performance issues'
            "
          ></i>
        </div>

        <div class="flex items-center">
          <Checkbox
            v-model="grepStore.options.cleanupOutput"
            :binary="true"
            inputId="cleanupOutput"
          />
          <label for="cleanupOutput" class="ml-3">Cleanup output</label>
          <i
            class="fas fa-info-circle ml-2 text-gray-500"
            v-tooltip.right="
              'Remove all non-printable characters from the output'
            "
          ></i>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap gap-6">
      <div>
        <label class="block mb-2.5 font-medium">
          Match Groups
          <i
            class="fas fa-info-circle ml-1 text-gray-500"
            v-tooltip.right="
              'Extract specific groups from regex match. Separate groups with commas. Leave empty to extract entire match'
            "
          ></i>
        </label>
        <InputText
          v-model="matchGroupsString"
          placeholder="0,1,2 (optional)"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-2.5 font-medium">
          Max Results
          <i
            class="fas fa-info-circle ml-1 text-gray-500"
            v-tooltip.right="
              'Maximum number of results to return. Leave empty for no limit'
            "
          ></i>
        </label>
        <InputNumber
          v-model="grepStore.options.maxResults"
          :min="1"
          placeholder="1000"
          class="w-full"
        />
      </div>

      <div class="min-w-[150px] sm:min-w-[250px] lg:min-w-[400px] flex-1">
        <label class="block mb-2.5 font-medium">
          Custom HTTPQL
          <i
            class="fas fa-info-circle ml-1 text-gray-500"
            v-tooltip.right="'Custom HTTPQL query to filter results'"
          ></i>
        </label>
        <InputText
          v-model="grepStore.options.customHTTPQL"
          placeholder='req.ext.eq:".html"'
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>
