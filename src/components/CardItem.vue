<script setup lang="ts">
import { Plus, Remove } from "@element-plus/icons-vue";

defineProps<{
  Level1Label: string;
  KeyWord: string;
  KeyWord2: string;
  SecondLabel: string;
  promptZH: string;
  promptEN: string;
  image: "yes" | "no";
  imgUrl?: string;
  weight: number;
  showWeight?: boolean;
  /** 是否主页选中 */
  isSelected?: boolean;
  /** 是否是用户自定义 */
  isCustom?: boolean;
}>();

defineEmits([
  /** 权重-- */
  "reduce-weight",
  /** 权重++ */
  "add-weight",
]);
</script>

<template>
  <div>
    <div class="card-img">
      <img height="160" width="156" :src="imgUrl" />
    </div>
    <div class="card-name" p-2>{{ promptZH }}</div>
    <div class="card-enname" p-2>{{ promptEN }}</div>

    <el-button-group v-show="showWeight" class="weight-group" flex absolute>
      <el-button
        type="danger"
        :icon="Remove"
        :disabled="weight! <= 1"
        @click="$emit('reduce-weight', weight)"
      />
      <el-button bg-white hover:bg-white text>词权重 {{ weight || 1 }}</el-button>
      <el-button
        type="primary"
        :icon="Plus"
        :disabled="weight! >= 9"
        @click="$emit('add-weight', weight)"
      />
    </el-button-group>
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
