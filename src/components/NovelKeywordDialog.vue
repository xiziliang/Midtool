<script setup lang="ts">
import { ref, computed, reactive, onBeforeUnmount } from "vue";
import { cloneDeep } from "lodash";

import { useEventListener } from "@vueuse/core";
import Tag from "@/components/Tag.vue";
import type { CustomKeyWord } from "@/models";

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
  item.weight = weight - 1;
}

function onAddWeight(weight: number, item: Partial<CustomKeyWord>) {
  item.weight = weight + 1;
}

function onShowWeightTag(content: string, item: Partial<CustomKeyWord>) {
  allData.value.forEach((x) => (x.showWeight = false));
  item.showWeight = true;
}

defineExpose({
  selectedList,
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
              weight-type="novel"
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
  </el-tabs>
</template>
