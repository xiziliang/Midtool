<script setup lang="ts">
import type { ImgOptions } from "@/models";

defineProps<{
  data: ImgOptions[];
}>();

function formatText(value: string) {
  return value.length > 60 ? value.slice(0, 60) + "..." : value;
}

function onTrigger(item: ImgOptions) {
  item.isSelected = !item.isSelected;
}
</script>
<template>
  <div
    class="card"
    v-for="item in data"
    :key="item.img"
    :class="{ selected: item.isSelected }"
    @click="onTrigger(item)"
  >
    <div class="card-img">
      <img :src="item.img" />
    </div>
    <label p="x-4 y-4">{{ formatText(item.img) }}</label>
  </div>
</template>
