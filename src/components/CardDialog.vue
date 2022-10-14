<script setup lang="ts">
import { ref, watch, watchEffect, computed } from "vue";
import { ElMessage } from "element-plus";
import { cloneDeep } from "lodash";

import type { CardItem } from "@/models";
import { CARD_CUSTOM_LIST } from "@/constants";

import { useStorage } from "@vueuse/core";
import { Check } from "@element-plus/icons-vue";

const cardCustomList = useStorage<CardItem[]>(CARD_CUSTOM_LIST, [], localStorage);

const props = defineProps<{
  list: CardItem[];
  dialogVisible: boolean;
}>();

const allData = ref<CardItem[]>([]);
const currentTab = ref<string>();
const tabList = computed(() => Array.from(new Set(allData.value.map((x) => x.KeyWord))));

watch(
  tabList,
  () => {
    currentTab.value = tabList?.value[0];
  },
  { immediate: true }
);

function keyword2label(label: string) {
  return Array.from(
    new Set(allData.value.filter((x) => x.KeyWord === label).map((x) => x.KeyWord2))
  );
}

function onTrigger(item: CardItem) {
  item.isSelected = !item.isSelected;
  if (allData.value.filter((x) => x.isSelected).length > 10) {
    ElMessage.warning("最多选10条");
    item.isSelected = false;
  }
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
        // NOTE: 加上 y.isSelected
        cardCustomList.value.some((y) => y.promptEN === x.promptEN && y.isSelected)
          ? (x.isSelected = true)
          : (x.isSelected = false);
      });
    }
  },
  {
    immediate: true,
  }
);

watchEffect(() => {
  if (!props.dialogVisible) {
    cardCustomList.value = allData.value.filter((x) => x.isSelected);
  }
});
</script>
<template>
  <el-tabs v-model="currentTab">
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
      <div max-h-2xl min-h-lg overflow-auto>
        <div v-for="keyword2 in keyword2label(keyword1!)" class="keyword2">
          <div flex="~" mt-4>
            <div flex>
              <p>{{ keyword2 }}</p>
            </div>
          </div>
          <div flex="~ gap-3 wrap" justify-start items-start pt-4>
            <div
              class="card"
              v-for="item in allData.filter((x) => x.KeyWord2 === keyword2)"
              :key="item.promptEN"
              :class="{ selected: item.isSelected }"
              @click="onTrigger(item)"
            >
              <div class="card-img">
                <img height="160" width="156" :src="item.imgName" />
              </div>
              <div class="card-name" p-2>{{ item.promptZH }}</div>
              <div class="card-enname" p-2>{{ item.promptEN }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<style lang="scss" scoped>
.isSelected.tab-pane-title::after {
  background-color: var(--el-color-primary-light-8);
}
.tab-pane-title::after {
  content: attr(data-count);
  width: 16px;
  height: 16px;
  position: absolute;
  background-color: var(--el-color-white);
  top: 0px;
  color: inherit;
  border-radius: 50%;
  display: inline;
  font-size: 12px;
  text-align: center;
  vertical-align: middle;
  line-height: 16px;
}
</style>
