<script setup lang="ts">
import { computed } from "vue";
import { Check, Delete } from "@element-plus/icons-vue";

const props = defineProps<{
  content: string;
  /** 是否选中 */
  isSelected?: boolean;
  /** 是否是自定义 */
  isCustom?: boolean;
  /** 是否裁剪 */
  slice?: boolean | number;
  /** 是否使用tooltip */
  tooltip?: boolean;
}>();

defineOptions({
  inheritAttrs: false,
});

defineEmits(["delete"]);

const limit = computed(() => {
  if (props.slice) {
    return typeof props.slice === "number" ? props.slice : 5;
  }
  return false;
});

const text = computed(() => {
  if (limit.value) {
    return props.content.length > limit.value
      ? props.content.slice(0, limit.value) + "..."
      : props.content;
  } else {
    return props.content;
  }
});

const isDisable = computed(() =>
  !props.tooltip ? true : !limit.value ? true : props.content.length < limit.value
);
</script>

<template>
  <el-tooltip
    :disabled="isDisable"
    :content="content"
    effect="customized"
    placement="top"
  >
    <span
      relative
      class="keyword-tag !px-20px !py-6px"
      :class="{ selected: isSelected }"
      v-bind="$attrs"
    >
      <el-button
        v-if="isCustom && !isSelected"
        class="delete-icon"
        type="danger"
        @click.stop="$emit('delete', content)"
      >
        x
      </el-button>
      <slot name="icon"></slot>
      {{ text }}
    </span>
  </el-tooltip>
</template>
<style scoped>
.keyword-tag {
  min-width: 106px;
  text-align: center;
  border: 2px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  cursor: pointer;
}
</style>
