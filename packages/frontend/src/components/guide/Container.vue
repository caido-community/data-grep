<script setup lang="ts">
import Card from "primevue/card";
import Dialog from "primevue/dialog";

import { useGuideStore } from "@/stores";

const guideStore = useGuideStore();
</script>

<template>
  <Dialog
    v-model:visible="guideStore.dialogVisible"
    modal
    header="Search Guide"
    :style="{ width: '700px' }"
    @hide="guideStore.closeDialog"
  >
    <div class="flex flex-col gap-6">
      <Card>
        <template #title>
          <div class="flex items-center">
            <i class="fas fa-tachometer-alt mr-2 text-blue-500"></i>
            Performance Tips
          </div>
        </template>
        <template #content>
          <ul class="list-disc pl-6 space-y-3">
            <li>
              <span class="font-medium">Use "Only in Scope"</span> - Make sure
              your scope is strict to limit the search area and improve
              performance
            </li>
            <li>
              <span class="font-medium">Use Custom HTTPQL</span> - Target only
              specific requests with HTTPQL to reduce the search space
            </li>
            <li>
              <span class="font-medium">Limit Results</span> - Use Max Results
              setting to cap the number of matches returned
            </li>
            <li>
              <span class="font-medium">Use Simple Regexes</span> - Complex
              regex patterns can significantly slow down search operations
            </li>
            <li class="text-yellow-500">
              <span class="font-medium">Warning for Large Projects</span> - When
              searching in very large projects, you should use Custom HTTPQL or
              Max Results to prevent performance issues
            </li>
          </ul>
        </template>
      </Card>

      <Card>
        <template #title>
          <div class="flex items-center">
            <i class="fas fa-book mr-2 text-green-500"></i>
            General Usage
          </div>
        </template>
        <template #content>
          <ol class="list-decimal pl-6 space-y-3">
            <li>
              <span class="font-medium">Write your regex pattern</span> in the
              search field
            </li>
            <li>
              <span class="font-medium">Configure search options</span> to
              narrow down your results
            </li>
            <li>
              <span class="font-medium">Click Search</span> to execute the
              pattern against your data
            </li>
            <li>
              Use <span class="font-medium">Ask AI</span> to automatically
              generate regex patterns based on your requirements
            </li>
            <li>
              Try <span class="font-medium">Predefined Patterns</span> for
              common search scenarios
            </li>
          </ol>
        </template>
      </Card>
    </div>
  </Dialog>
</template>
