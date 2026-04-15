<script setup lang="ts">
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";

import { ResultsContainer } from "@/components/results";
import { SearchContainer } from "@/components/search";
</script>

<template>
  <Splitter class="h-full" layout="vertical">
    <SplitterPanel :size="30" :min-size="20">
      <SearchContainer />
    </SplitterPanel>

    <SplitterPanel :size="70" :min-size="50">
      <ResultsContainer />
    </SplitterPanel>
  </Splitter>
</template>
