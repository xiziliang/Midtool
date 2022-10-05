<script setup lang="ts">
import { computed } from "vue";
import { useVModel, useVModels } from "@vueuse/core";
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

const list = useVModel(props, "data", emit, {
  passive: true,
  deep: true,
});

function onTrigger(item: List) {
  item.isSelected = !item.isSelected;
}
</script>
<template>
  <div
    class="card"
    mt-2
    v-for="item in list"
    @click="onTrigger(item)"
    :class="{ selected: item.isSelected }"
  >
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
