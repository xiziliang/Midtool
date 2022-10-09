<script setup lang="ts">
import { ref, computed, watchEffect, watch } from "vue";
import { cloneDeep } from "lodash";

import { useStorage } from "@vueuse/core";
import { KEYWORD_CUSTOM_LIST } from "@/constants";
import Tag from "@/components/Tag.vue";
import type { CustomKeyWord } from "@/models";

const props = defineProps<{
  list: Partial<CustomKeyWord>[];
  dialogVisible?: boolean;
}>();

const keyWordCustomList = useStorage<CustomKeyWord[]>(
  KEYWORD_CUSTOM_LIST,
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

defineExpose({
  keyWordCustomList,
});

watch(
  () => props.list,
  (value) => {
    if (!value) return;
    allData.value = cloneDeep(value);

    if (keyWordCustomList.value) {
      allData.value.forEach((x) => {
        keyWordCustomList.value.some((y) => y.promptEN === x.promptEN)
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
    keyWordCustomList.value = allData.value.filter((x) => x.isShow) as CustomKeyWord[];
  }
});
</script>
<template>
  <el-tabs v-model="currentTab" tab-click="handleClick">
    <el-tab-pane v-for="keyword1 in tabList" :label="keyword1" :name="keyword1">
      <div h-lg overflow-auto will-change-scroll>
        <div v-for="keyword2 in keyword2label(keyword1!)" class="keyword2">
          <div flex="~" mt-4 mb-4>
            <div flex>
              <p>{{ keyword2 }}</p>
            </div>
          </div>
          <div flex="~ gap-3 wrap" justify-start items-start>
            <Tag
              slice
              v-for="item in allData.filter((x) => x.KeyWord2 === keyword2)"
              :content="item.promptZH!"
              :is-selected="item.isShow"
              @click="item.isShow = !item.isShow"
            ></Tag>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="历史记录" name="history">
      <div h-lg overflow-auto>history</div>
    </el-tab-pane>
  </el-tabs>
</template>
