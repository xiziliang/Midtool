<script setup lang="ts">
import type { ImgOptions } from "@/models";

defineProps<{
  data: ImgOptions[];
}>();

function formatText(value: string) {
  return value.length > 60 ? value.slice(0, 40) + "..." : value;
}

function onTrigger(item: ImgOptions) {
  item.isSelected = !item.isSelected;
}

function imgError(data: ImgOptions[], index: number) {
  data[index].imgLoadError = true;
}
</script>
<template>
  <div
    class="card no-mark-tag"
    v-for="(item, index) in data"
    :key="item.img"
    :class="{ selected: item.isSelected }"
    @click="onTrigger(item)"
  >
    <div class="card-img">
      <img v-if="!item.imgLoadError" :src="item.img" :onerror="imgError(data, index)" />
      <div v-if="item.imgLoadError" class="loadError" style="width: 100%; height: 135px">
        加载失败
      </div>
    </div>
    <label p="x-4 y-4">{{ formatText(item.img) }}</label>
  </div>
</template>
<style scoped>
.loadError {
  background: #f5f5f5;
  color: #aaa;
  text-align: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  line-height: 135px;
}
</style>
