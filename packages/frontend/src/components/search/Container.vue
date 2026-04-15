<script setup lang="ts">
import Card from "primevue/card";

import GrepSearchForm from "./Form.vue";
</script>

<template>
  <Card class="h-full">
    <template #content>
      <div class="flex flex-col h-full">
        <div class="flex items-center text-xl font-semibold mb-6">
          <i class="fas fa-search mr-3"></i>
          Search Configuration
        </div>
        <GrepSearchForm />
      </div>
    </template>
  </Card>
</template>
