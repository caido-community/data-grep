<script setup lang="ts">
import None from "./None.vue";
import Results from "./Results.vue";
import Searching from "./Searching.vue";
import Welcome from "./Welcome.vue";

import { useGrepStore } from "@/stores";

const store = useGrepStore();
</script>

<template>
  <Results
    v-if="store.results.searchResults && store.results.searchResults.length > 0"
  />
  <Welcome v-else-if="!store.pattern.trim()" />
  <Searching v-else-if="store.status.isSearching" />
  <None v-else />
</template>

<style>
.shimmer {
  display: inline-block;
  color: white;
  background: #acacac linear-gradient(to left, #acacac, #ffffff 50%, #acacac);
  background-position: -4rem top;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-animation: shimmer 3.2s infinite;
  animation: shimmer 3.2s infinite;
  background-size: 4rem 100%;
}

@-webkit-keyframes shimmer {
  0% {
    background-position: -4rem top;
  }
  70% {
    background-position: 7.5rem top;
  }
  100% {
    background-position: 7.5rem top;
  }
}

@keyframes shimmer {
  0% {
    background-position: -4rem top;
  }
  70% {
    background-position: 7.5rem top;
  }
  100% {
    background-position: 7.5rem top;
  }
}
</style>
