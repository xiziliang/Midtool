<script setup lang="ts">
import { ref, watch } from "vue";
import CardItemComp from "./CardItem.vue";

import type { CardItem } from "@/models";

const props = defineProps<{
  data: CardItem[];

  allDefaultData: any[];
}>();

const allData = ref<CardItem[]>();

function onTrigger(item: CardItem, index: number) {
  if (!item.isDefault && item.isSelected) {
    allData.value?.splice(index, 1);
  } else {
    item.isSelected = !item.isSelected;
  }

  props.allDefaultData.forEach((x: any) => (x.showWeight = false));
  item.showWeight = true;
}

function onReduceWeight(weight: number, item: CardItem) {
  !item.isSelected ? (item.isSelected = true) : null;

  item.weight = weight - 1;
}

function onAddWeight(weight: number, item: CardItem) {
  !item.isSelected ? (item.isSelected = true) : null;

  item.weight = weight + 1;
}

watch(
  () => props.data,
  (value) => {
    if (value) {
      allData.value = value;
    }
  },
  { immediate: true }
);
</script>
<template>
  <div
    class="card"
    v-for="(item, index) in allData"
    :key="item.promptEN"
    :class="{ selected: item.isSelected, 'no-mark-tag': !item.isSelected }"
    :data-weight="Math.trunc(item.weight)"
    :data-weight-none="Math.trunc(item.weight) == 1 ? 'none' : ''"
    @click.stop.self="onTrigger(item, index)"
    :title="item.details ? item.details : ''"
  >
    <CardItemComp
      v-bind="item"
      weight-type="novel"
      @add-weight="(value) => onAddWeight(value, item)"
      @reduce-weight="(value) => onReduceWeight(value, item)"
    />
  </div>
</template>
