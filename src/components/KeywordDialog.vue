<script setup lang="ts">
import { ref, computed, watchEffect, watch, onBeforeUnmount } from "vue";
import { cloneDeep } from "lodash";

import { useStorage, useEventListener } from "@vueuse/core";
import { KEYWORD_CUSTOM_LIST, KEYWORD_HISTORY_LIST } from "@/constants";
import Tag from "@/components/Tag.vue";
import type { CustomKeyWord } from "@/models";

const props = defineProps<{
  list: Partial<CustomKeyWord>[];
  dialogVisible?: boolean;
}>();

const clearUp = useEventListener("click", () => {
  [...allData.value, ...keyWordHistoryList.value].forEach((x) => (x.showWeight = false));
});

onBeforeUnmount(() => {
  clearUp();
});

const keyWordCustomList = useStorage<CustomKeyWord[]>(
  KEYWORD_CUSTOM_LIST,
  [],
  localStorage
);

const keyWordHistoryList = useStorage<CustomKeyWord[]>(
  KEYWORD_HISTORY_LIST,
  [],
  localStorage
);

const allData = ref<Partial<CustomKeyWord>[]>([]);

const currentTab = computed({
  get: () => tabList.value[0] || "history",
  set() {},
});
const tabList = computed(() => Array.from(new Set(allData.value.map((x) => x.KeyWord))));

function keyword2label(label: string) {
  return Array.from(
    new Set(allData.value.filter((x) => x.KeyWord === label).map((x) => x.KeyWord2))
  );
}

function onClickKeyWordTag(item: Partial<CustomKeyWord>) {
  item.isSelected = !item.isSelected;
  item.showWeight = true;
}

function onReduceWeight(weight: number, item: Partial<CustomKeyWord>) {
  item.weight = weight - 0.25;
}

function onAddWeight(weight: number, item: Partial<CustomKeyWord>) {
  item.weight = weight + 0.25;
}

function onShowWeightTag(content: string, item: Partial<CustomKeyWord>) {
  [...allData.value, ...keyWordHistoryList.value].forEach((x) => (x.showWeight = false));
  item.showWeight = true;
}

defineExpose({
  keyWordCustomList,
  keyWordHistoryList,
});

watch(
  () => props.list,
  (value) => {
    if (!value) return;
    allData.value = cloneDeep(value);

    // NOTE:对应历史数据合并到JSON数据上
    if (keyWordCustomList.value) {
      keyWordCustomList.value.forEach((x) => {
        const item = allData.value.find((y) => y.promptEN === x.promptEN);
        if (item) Object.assign(item, x);
      });
    }
  },
  {
    immediate: true,
  }
);

watchEffect(() => {
  if (!props.dialogVisible) {
    keyWordCustomList.value = allData.value.filter(
      (x) => x.isSelected
    ) as CustomKeyWord[];
  }
});
</script>
<template>
  <el-tabs v-model="currentTab">
    <el-tab-pane v-for="keyword1 in tabList" :label="keyword1" :name="keyword1">
      <div h-lg overflow-auto will-change-scroll p="x-20px t-15px">
        <div v-for="keyword2 in keyword2label(keyword1!)" class="keyword2">
          <div flex="~" m="y-4">
            <div flex>
              <p>{{ keyword2 }}</p>
            </div>
          </div>
          <div flex="~ gap-3 wrap" justify-start items-start>
            <Tag
              slice
              v-for="item in allData.filter((x) => x.KeyWord2 === keyword2)"
              weight-type="mid"
              :content="item.promptZH!"
              :weight="item.weight"
              :show-weight="item.showWeight"
              :is-selected="item.isSelected"
              @click.stop.self="onClickKeyWordTag(item)"
              @reduce-weight="(value) => onReduceWeight(value, item)"
              @add-weight="(value) => onAddWeight(value, item)"
              @click-tag="(value) => onShowWeightTag(value, item)"
            ></Tag>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="历史记录" name="history">
      <div h-lg overflow-auto p-x-20px>
        <div flex="~ gap-3 wrap" p="y-4" justify-start items-start>
          <Tag
            slice
            v-for="item in keyWordHistoryList"
            weight-type="mid"
            :content="item.promptZH!"
            :weight="item.weight"
            :show-weight="item.showWeight"
            :is-selected="item.isSelected"
            @click.stop.self="onClickKeyWordTag(item)"
            @reduce-weight="(value) => onReduceWeight(value, item)"
            @add-weight="(value) => onAddWeight(value, item)"
            @click-tag="(value) => onShowWeightTag(value, item)"
          ></Tag>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
