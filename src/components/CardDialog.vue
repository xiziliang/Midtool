<script setup lang="ts">
import { ref, watch, watchEffect } from "vue";

import type { CardItem } from "@/models";
import { CARD_CUSTOM_LIST } from "@/constants";

import { useStorage } from "@vueuse/core";
import { Check } from "@element-plus/icons-vue";
import { cloneDeep } from "lodash";

const cardCustomList = useStorage<CardItem[]>(CARD_CUSTOM_LIST, [], localStorage);

const props = defineProps<{
  list: CardItem[];
  dialogVisible: boolean;
}>();

const allData = ref<CardItem[]>([]);

function onTrigger(item: CardItem) {
  item.isShow = !item.isShow;
}

defineExpose({
  cardCustomList,
});

watch(
  () => props.list,
  (value) => {
    if (!value) return;
    allData.value = cloneDeep(value);

    if (cardCustomList.value) {
      allData.value.forEach((x) => {
        cardCustomList.value.some((y) => y.promptEN === x.promptEN)
          ? (x.isShow = true)
          : (x.isShow = false);
      });
    }
  },
  {
    immediate: true,
  }
);

watchEffect(() => {
  if (!props.dialogVisible) {
    cardCustomList.value = allData.value.filter((x) => x.isShow);
  }
});
</script>
<template>
  <div max-h-xl overflow-auto flex="~ gap-4 wrap" justify-start items-stretch pt-4>
    <div
      class="card"
      v-for="item in allData"
      :key="item.promptEN"
      :class="{ selected: item.isShow }"
      @click="onTrigger(item)"
    >
      <el-button
        v-if="item.isShow"
        class="check-icon"
        type="success"
        :icon="Check"
        circle
      />
      <div class="card-img">
        <img height="160" width="156" :src="item.imgName" />
      </div>
      <div class="card-name" p-2>{{ item.promptZH }}</div>
      <div class="card-enname" p-2>{{ item.promptEN }}</div>
    </div>
  </div>
</template>
