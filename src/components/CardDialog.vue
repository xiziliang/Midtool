<script setup lang="ts">
import { ref, computed, watchEffect, watch, onBeforeUnmount } from "vue";
import { cloneDeep } from "lodash";
import type { TabsPaneContext } from "element-plus";

import { useTabScroll } from "@/hooks";
import { useStorage, useEventListener } from "@vueuse/core";
import { CARD_CUSTOM_LIST, CARD_HISTORY_LIST } from "@/constants";
import Tag from "@/components/Tag.vue";
import type { CardItem } from "@/models";

const props = defineProps<{
  list: Partial<CardItem>[];
  dialogVisible?: boolean;
}>();

const clearUp = useEventListener("click", () => {
  [...allData.value, ...cardHistoryList.value].forEach((x) => (x.showWeight = false));
});

onBeforeUnmount(() => {
  clearUp();
});

const cardCustomList = useStorage<CardItem[]>(CARD_CUSTOM_LIST, [], localStorage);

const cardHistoryList = useStorage<CardItem[]>(CARD_HISTORY_LIST, [], localStorage);

const allData = ref<Partial<CardItem>[]>([]);

const {
  tab2Ref,
  scrollBoxRef,

  isClickScroll,

  currentTab,
  currentTab2,

  tabList,
  tab2List,

  // fn
  scrollTo,
} = useTabScroll(allData);

function onClickKeyword2Tab(context: TabsPaneContext) {
  isClickScroll.value = true;
  scrollTo(context.paneName + "");

  setTimeout(() => {
    isClickScroll.value = false;
  }, 1000);
}

function keyword2label(label: string) {
  return Array.from(
    new Set(allData.value.filter((x) => x.KeyWord === label).map((x) => x.KeyWord2))
  );
}

function onReduceWeight(weight: number, item: Partial<CardItem>) {
  item.weight = weight - 0.25;
}

function onAddWeight(weight: number, item: Partial<CardItem>) {
  item.weight = weight + 0.25;
}

function onTrigger(item: Partial<CardItem>) {
  item.isSelected = !item.isSelected;

  [...allData.value, ...cardHistoryList.value].forEach((x) => (x.showWeight = false));
  item.showWeight = true;
}

defineExpose({
  cardCustomList,
  cardHistoryList,
});

watch(
  () => props.list,
  (value) => {
    if (!value) return;
    allData.value = cloneDeep(value);

    // NOTE:对应历史数据合并到JSON数据上
    if (cardCustomList.value) {
      cardCustomList.value.forEach((x) => {
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
    cardCustomList.value = allData.value.filter((x) => x.isSelected) as CardItem[];
  }
});
</script>
<template>
  <el-tabs class="tabs-style" v-model="currentTab">
    <el-tab-pane v-for="keyword1 in tabList" :label="keyword1" :name="keyword1">
      <template #label
        ><div
          class="tab-pane-title"
          :data-count="
            allData.filter((x) => x.KeyWord === keyword1 && x.isSelected).length
          "
          :class="{ isSelected: currentTab === keyword1 }"
        >
          {{ keyword1 }}
        </div></template
      >
      <el-tabs
        py-1
        mt-1px
        class="keyword2Tab"
        v-model="currentTab2"
        @tab-click="onClickKeyword2Tab"
      >
        <el-tab-pane
          v-for="keyword2 in tab2List"
          :key="keyword2"
          :label="keyword2"
          :name="keyword2"
        ></el-tab-pane>
      </el-tabs>
      <div
        ref="scrollBoxRef"
        class="scrollBox"
        :class="keyword1 + 'scrollBox'"
        pt-5px
        h-lg
        overflow-auto
      >
        <div
          ref="tab2Ref"
          v-for="keyword2 in keyword2label(keyword1!)"
          :class="['keyword2', keyword2]"
        >
          <div flex="~" mt-4 text-16px color-dark-400>
            <div flex>
              <p font-600>{{ keyword2 }}</p>
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
              @click.stop.self
              @reduce-weight="(value) => onReduceWeight(value, item)"
              @add-weight="(value) => onAddWeight(value, item)"
              @click-tag="onTrigger(item)"
            ></Tag>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="历史记录" name="history">
      <div h-full overflow-auto p-x-20px>
        <div flex="~ gap-3 wrap" p="y-4" justify-start items-start>
          <Tag
            slice
            v-for="item in cardHistoryList"
            weight-type="mid"
            :content="item.promptZH!"
            :weight="item.weight"
            :show-weight="item.showWeight"
            :is-selected="item.isSelected"
            @click.stop.self
            @reduce-weight="(value) => onReduceWeight(value, item)"
            @add-weight="(value) => onAddWeight(value, item)"
            @click-tag="onTrigger(item)"
          ></Tag>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<style lang="scss" scoped>
:deep(.el-tabs__header) {
  margin: 0;
}
</style>
