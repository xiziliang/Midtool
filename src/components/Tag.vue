<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
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
  slice?: boolean;
}>();

const text = computed(() => {
  if (props.slice) {
    return props.content.length > 5 ? props.content.slice(0, 5) + "..." : props.content;
  } else {
    return props.content;
  }
});

const isDisable = computed(() => (!props.slice ? true : props.content.length < 5));
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
      />
      <slot name="icon"></slot>
      {{ text }}
    </span>
  </el-tooltip>
</template>
