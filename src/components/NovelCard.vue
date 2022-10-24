<script setup lang="ts">
import { ref, watch } from "vue";
import CardItemComp from "./CardItem.vue";

import type { CardItem } from "@/models";

const props = defineProps<{
  data: CardItem[];
}>();

// 当前展示weight的card
const currentShowWeightCard = ref("");
const allData = ref<CardItem[]>();

function onTrigger(item: CardItem) {
  item.isSelected = !item.isSelected;

  onClickCard(item.promptEN, item);
}

function onReduceWeight(weight: number, item: CardItem) {
  item.weight = weight - 1;
}

function onAddWeight(weight: number, item: CardItem) {
  item.weight = weight + 1;
}

function onClickCard(promptEN: string, item: CardItem) {
  if (currentShowWeightCard.value === promptEN) return;

  currentShowWeightCard.value = promptEN;
  props.data.forEach((x) => (x.showWeight = false));
  item.showWeight = true;
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
    v-for="item in allData"
    :key="item.promptEN"
    :class="{ selected: item.isSelected }"
    :data-weight="Math.trunc(item.weight)"
    @click.stop.self="onTrigger(item)"
  >
    <CardItemComp
      v-bind="item"
      weight-type="novel"
      @add-weight="(value) => onAddWeight(value, item)"
      @reduce-weight="(value) => onReduceWeight(value, item)"
    />
  </div>
</template>
