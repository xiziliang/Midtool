<script setup lang="ts">
import { ref } from "vue";
import type { PromptTemplate } from "@/models";
const props = defineProps<{
  detailData: PromptTemplate[];
}>();
console.log(props.detailData.promptEN)
</script>
<template>
  <div class="header-img">
    <img src="" alt="">
  </div>
</template>