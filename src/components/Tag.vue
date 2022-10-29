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
    return typeof props.slice === "number" ? props.slice : 6;
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

const addDisable = computed(() =>
  props.weightType === "mid" ? props.weight! >= 5 : props.weight! >= 10
);

const reduceDisable = computed(() =>
  props.weightType === "mid" ? props.weight! <= -1 : props.weight! <= 1
);

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
      class="keyword-tag py-6px"
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
      </el-button>
      <span><slot name="icon"></slot> {{ text }}</span>
      <slot></slot>
      <div
        v-show="showWeight"
        class="weight-group"
        :style="{ bottom: $slots.default ? '-72%' : '-110%' }"
        flex
        absolute
        items-center
      >
        <i
          class="icon-reduce"
          :class="{
            'is-disabled': reduceDisable,
          }"
          @click="!reduceDisable && $emit('reduce-weight', weight)"
        />
        <div min-w-80px text-center font-400>
          权重 {{ weight === undefined ? 1 : weight }}
        </div>
        <i
          class="icon-add"
          :class="{
            'is-disabled': addDisable,
          }"
          @click="!addDisable && $emit('add-weight', weight)"
        />
      </div>
    </span>
  </el-tooltip>
</template>
<style lang="scss" scoped>
.dpiStyle {
  min-width: 156px;
}
</style>
