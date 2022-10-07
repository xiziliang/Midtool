<script setup lang="ts">
import { Check, Delete } from "@element-plus/icons-vue";

defineProps<{
  content: string;
  isDelete?: boolean;
  isSelected?: boolean;
}>();
</script>

<template>
  <el-tooltip
    :disabled="content.length <= 4"
    :content="content"
    effect="customized"
    placement="top"
  >
    <span class="el-check-tag is-checked !px-20px !py-10px" relative>
      <el-button
        v-if="isSelected"
        class="check-icon"
        type="success"
        :icon="Check"
        circle
      />
      <el-button
        v-if="isDelete"
        class="delete-icon"
        type="danger"
        :icon="Delete"
        circle
      />
      <slot name="icon"></slot>
      {{ content.length > 4 ? content.slice(0, 4) + "..." : content }}
    </span>
  </el-tooltip>
</template>
<style scoped lang="scss"></style>
