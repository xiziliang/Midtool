<script setup lang="ts">
defineProps<{
  Level1Label: string;
  KeyWord: string;
  KeyWord2: string;
  SecondLabel: string;
  promptZH: string;
  promptEN: string;
  image: "yes" | "no";
  title: string;
  detagEN: string;
  parameter: string;
  author: string;
  imgUrl?: string;
  /** 是否主页选中 */
  isSelected?: boolean;
}>();
//test
</script>

<template>
  <div>
    <div
      class="card-img"
      :style="{
        'background-image': `url(${imgUrl})`,
      }"
    >
      <!-- <img height="160" width="156" :src="imgUrl" /> -->
    </div>
    <div class="card-name ellipsis" p="x-3 t-3" text-16px color-dark-400>{{ title }}</div>
    <div class="card-enname ellipsis" p="x-3 b-3">{{ promptZH }}</div>
  </div>
</template>
<style lang="scss" scoped>
.weight-group {
  left: 50%;
  bottom: -40px;
  margin-left: -78px;
  z-index: 10;

  :deep(.el-button) {
    padding: 8px 10px;
  }
}
</style>
