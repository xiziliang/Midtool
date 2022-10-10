<script setup lang="ts">
import { ref, watch } from "vue";
import { Check } from "@element-plus/icons-vue";
import type { CardItem } from "@/models";

const props = defineProps<{
  data: CardItem[];
}>();

// 已选list
const selectedList = ref<CardItem[]>();
// 未选list
const remainList = ref<CardItem[]>();

function onTrigger(item: CardItem) {
  if (item.isSelected) {
    selectedList.value = selectedList.value!.filter((x) => x.promptEN !== item.promptEN);
    setTimeout(() => {
      remainList.value!.unshift(item);
    }, 500);
  } else {
    selectedList.value!.push(item);
    remainList.value = remainList.value!.filter((x) => x.promptEN !== item.promptEN);
  }
  item.isSelected = !item.isSelected;
}

watch(
  () => props.data,
  (value) => {
    if (value) {
      selectedList.value = value.filter((x) => x.isSelected);
      remainList.value = value.filter((x) => !x.isSelected);
    }
  },
  { immediate: true }
);
</script>
<template>
  <TransitionGroup name="animate__fadeInRight">
    <div
      class="card"
      v-for="item in selectedList"
      :key="item.promptEN"
      :class="{ selected: item.isSelected }"
      @click="onTrigger(item)"
    >
      <el-button
        v-if="item.isSelected"
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
  </TransitionGroup>
  <div
    class="card"
    v-for="item in remainList"
    :key="item.promptEN"
    :class="{ selected: item.isSelected }"
    @click="onTrigger(item)"
  >
    <el-button
      v-if="item.isSelected"
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
</template>
