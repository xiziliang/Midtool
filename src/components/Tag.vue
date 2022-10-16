<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  content: string;
  /** 卡片类型 */
  type?: "dpi" | string;
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
      flex="~ col"
      class="keyword-tag px-20px py-6px"
      :class="{ selected: isSelected, dpiStyle: type === 'dpi' }"
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
      <span><slot name="icon"></slot> {{ text }}</span>
      <slot></slot>
    </span>
  </el-tooltip>
</template>
<style lang="scss" scoped>
.dpiStyle {
  min-width: 156px;
}
</style>
