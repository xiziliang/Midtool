<script setup lang="ts">
import { computed, ref } from "vue";
import { useVModel } from "@vueuse/core";
import { Check } from "@element-plus/icons-vue";

interface List {
  // Level1Label: string;
  // KeyWord: string;
  // KeyWord2: string;
  // SecondLabel: string;
  promptZH: string;
  promptEN: string;
  imgName?: string;
  isSelected?: boolean;
}

const props = defineProps<{
  data: List[];
}>();

const emit = defineEmits(["update:data"]);

const propsList = useVModel(props, "data", emit, {
  passive: true,
  deep: true,
});

// 已选list
const selectedList = ref(propsList.value.filter((x) => x.isSelected));
// 未选list
const remainList = ref(propsList.value.filter((x) => !x.isSelected));

function onTrigger(item: List) {
  if (item.isSelected) {
    selectedList.value = selectedList.value.filter((x) => x.promptEN !== item.promptEN);
    remainList.value.unshift(item);
  } else {
    selectedList.value.push(item);
    remainList.value = remainList.value.filter((x) => x.promptEN !== item.promptEN);
  }
  item.isSelected = !item.isSelected;
}
</script>
<template>
  <TransitionGroup name="animate__fadeInRight">
    <div
      class="card"
      mt-4
      v-for="item in selectedList"
      :key="item.promptEN"
      @click="onTrigger(item)"
      :class="{ selected: item.isSelected }"
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
    mt-4
    v-for="item in remainList"
    :key="item.promptEN"
    @click="onTrigger(item)"
    :class="{ selected: item.isSelected }"
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

.check-icon {
  position: absolute;
  top: -16px;
  right: -16px;
}
</style>
