<script setup lang="ts">
import { Check } from "@element-plus/icons-vue";
import type { ImgOptions } from "@/models";

const props = defineProps<{
  data: ImgOptions[];
}>();

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
      <img height="160" width="156" :src="item.img" />
    </div>
    <label>{{ item.img }}</label>
  </div>
</template>
