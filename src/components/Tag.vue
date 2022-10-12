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
    <span class="el-check-tag is-checked !px-20px !py-10px" relative v-bind="$attrs">
      <el-button
        v-if="isSelected"
        class="check-icon"
        type="success"
        :icon="Check"
        circle
      />
      <el-button
        v-if="isCustom && !isSelected"
        class="delete-icon"
        type="danger"
        :icon="Delete"
        circle
        @click.stop="$emit('delete', content)"
      />
      <slot name="icon"></slot>
      {{ text }}
    </span>
  </el-tooltip>
</template>
