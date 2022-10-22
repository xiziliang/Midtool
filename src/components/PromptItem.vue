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
    <div class="card-name" p-2>{{ title }}</div>
    <div class="card-enname" p-2>{{ promptZH }}</div>
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
