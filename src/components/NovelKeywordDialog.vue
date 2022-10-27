<script setup lang="ts">
import { computed, reactive, onBeforeUnmount } from "vue";
import { cloneDeep } from "lodash";

import type { TabsPaneContext } from "element-plus";
import { useTabScroll } from "@/hooks";
import { useEventListener } from "@vueuse/core";
import type { CustomKeyWord } from "@/models";

import Tag from "@/components/Tag.vue";

const props = defineProps<{
  list: Partial<CustomKeyWord>[];
  defaultData: Partial<CustomKeyWord>[];
  dialogVisible?: boolean;
}>();

const clearUp = useEventListener("click", () => {
  allData.value.forEach((x) => (x.showWeight = false));
});

onBeforeUnmount(() => {
  clearUp();
});

const allData = computed<Partial<CustomKeyWord>[]>(() => {
  const list = reactive(cloneDeep(props.list));
  if (props.defaultData) {
    const defaultData = props.defaultData.filter((x) => !(x.isCustom || x.isDefault));

    // NOTE:对应历史数据合并
    defaultData.forEach((x) => {
      const item = list.find((y) => x.promptEN === y.promptEN);
      if (item) Object.assign(item, x);
    });
  }
  return list;
});
const selectedList = computed(() => allData.value.filter((x) => x.isSelected));

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

function keyword2label(label: string) {
  return Array.from(
    new Set(allData.value.filter((x) => x.KeyWord === label).map((x) => x.KeyWord2))
  );
}

function onClickKeyword2Tab(context: TabsPaneContext) {
  isClickScroll.value = true;
  scrollTo(context.paneName + "");

  setTimeout(() => {
    isClickScroll.value = false;
  }, 1000);
}

function onTrigger(item: Partial<CustomKeyWord>) {
  item.isSelected = !item.isSelected;

  allData.value.forEach((x) => (x.showWeight = false));
  item.showWeight = true;
}

function onReduceWeight(weight: number, item: Partial<CustomKeyWord>) {
  item.weight = weight - 1;
}

function onAddWeight(weight: number, item: Partial<CustomKeyWord>) {
  item.weight = weight + 1;
}

defineExpose({
  selectedList,
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
              weight-type="novel"
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
  </el-tabs>
</template>
<style lang="scss" scoped>
:deep(.el-tabs__header) {
  margin: 0;
}
</style>
