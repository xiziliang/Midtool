<script setup lang="ts">
import { ref, watch } from "vue";
import { Check } from "@element-plus/icons-vue";

interface List {
  Level1Label: string;
  KeyWord: string;
  KeyWord2: string;
  SecondLabel: string;
  promptZH: string;
  promptEN: string;
  imgName?: string;
  isSelected?: boolean;
}

const props = defineProps<{
  data: List[];
}>();

// 已选list
const selectedList = ref<List[]>();
// 未选list
const remainList = ref<List[]>();

function onTrigger(item: List) {
  if (item.isSelected) {
    selectedList.value = selectedList.value!.filter((x) => x.promptEN !== item.promptEN);
    remainList.value!.unshift(item);
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
<style scoped lang="scss">
.card {
  width: 10rem;
  background-color: #26292e;
  color: #fff;

  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-shrink: 0;
  word-wrap: break-word;
  background-clip: border-box; // 使background覆盖border
  border-radius: 0.25rem;

  cursor: pointer;

  &:hover {
    background-color: #1a1c1f;
  }

  .card-img,
  img {
    border-top-left-radius: calc(0.25rem - 1px);
    border-top-right-radius: calc(0.25rem - 1px);
  }
  img {
    width: 100%;
  }
}
</style>
