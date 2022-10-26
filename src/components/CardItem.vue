<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  Level1Label: string;
  KeyWord: string;
  KeyWord2: string;
  SecondLabel: string;
  promptZH: string;
  promptEN: string;
  image: "yes" | "no";
  fileUrl?: string;
  weight?: number;
  weightType?: "mid" | "novel";
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

const addDisable = computed(() =>
  props.weightType === "mid" ? props.weight! >= 5 : props.weight! >= 10
);

const reduceDisable = computed(() =>
  props.weightType === "mid" ? props.weight! <= -1 : props.weight! <= 1
);
</script>

<template>
  <div>
    <div class="card-img" v-lazy="fileUrl">
      <!-- <img height="160" width="156" :src="fileUrl" /> -->
    </div>
    <div class="card-name" text-16px pb-0 p-2>{{ promptZH }}</div>

    <div v-show="showWeight" class="weight-group bottom--26%" flex absolute items-center>
      <i
        class="icon-reduce"
        :class="{
          'is-disabled': reduceDisable,
        }"
        @click="!reduceDisable && $emit('reduce-weight', weight)"
      />
      <div min-w-80px text-center>权重 {{ weight === undefined ? 1 : weight }}</div>
      <i
        class="icon-add"
        :class="{
          'is-disabled': addDisable,
        }"
        @click="!addDisable && $emit('add-weight', weight)"
      />
    </div>
  </div>
</template>
