<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  content: string;
  /** 是否裁剪 */
  slice?: boolean | number;
}>();

const limit = computed(() => {
  if (props.slice) {
    return typeof props.slice === "number" ? props.slice : 8;
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
</script>

<template>
  <span relative flex="~ col" px-10px py-4px class="tooltip-tag">
    <span truncate><slot name="icon"></slot> {{ text }}</span>
    <slot></slot>
  </span>
</template>
