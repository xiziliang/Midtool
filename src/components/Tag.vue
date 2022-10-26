<script setup lang="ts">
import { computed } from "vue";
import { Plus, Remove } from "@element-plus/icons-vue";

const props = defineProps<{
  content: string;
  /** 卡片类型 */
  type?: "dpi" | string;
  /** 是否选中 */
  isSelected?: boolean;
  /** 是否是自定义 */
  isCustom?: boolean;
  /** 权重类型 */
  weightType?: "mid" | "novel";
  /** 是否展示权重 */
  showWeight?: boolean;
  /** 权重 */
  weight?: number;
  /** 是否裁剪 */
  slice?: boolean | number;
  /** 是否使用tooltip */
  tooltip?: boolean;
}>();

defineOptions({
  inheritAttrs: false,
});

const emits = defineEmits([
  /** 删除 */
  "delete",
  /** 权重-- */
  "reduce-weight",
  /** 权重++ */
  "add-weight",
  /** 当前点击的tag */
  "click-tag",
]);

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

function onClick() {
  emits("click-tag", props.content);
}
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
      :class="{
        selected: isSelected,
        dpiStyle: type === 'dpi',
        'no-mark-tag': !isSelected,
      }"
      :data-weight="Math.trunc(weight!)"
      v-bind="$attrs"
      @click.stop.self="onClick"
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
      <el-button-group
        v-show="showWeight"
        class="weight-group"
        :style="{ bottom: $slots.default ? '-72%' : '-122%' }"
        flex
        absolute
      >
        <el-button
          type="danger"
          :icon="Remove"
          :disabled="weightType === 'mid' ? weight! <= -1 : weight! <= 1"
          @click="$emit('reduce-weight', weight)"
        />
        <el-button bg-white hover:bg-white min-w-90px text
          >权重 {{ weight === undefined ? 1 : weight }}</el-button
        >
        <el-button
          type="primary"
          :icon="Plus"
          :disabled="weightType === 'mid' ? weight! >= 5 : weight! >= 10"
          @click="$emit('add-weight', weight)"
        />
      </el-button-group>
    </span>
  </el-tooltip>
</template>
<style lang="scss" scoped>
.dpiStyle {
  min-width: 156px;
}

.weight-group {
  left: 50%;
  margin-left: -78px;
  z-index: 10;

  :deep(.el-button) {
    padding: 8px 10px;
  }
}
</style>
