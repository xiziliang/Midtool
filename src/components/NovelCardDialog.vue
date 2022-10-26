<script setup lang="ts">
import { ref, watch, reactive, computed, nextTick, onBeforeUnmount } from "vue";
import type { TabsPaneContext } from "element-plus";
import { cloneDeep } from "lodash";

import type { CardItem } from "@/models";
import { useIntersectionObserver, useEventListener } from "@vueuse/core";

import CardItemComp from "./CardItem.vue";

const props = defineProps<{
  list: CardItem[];
  defaultData: any[];
  dialogVisible: boolean;
}>();

const clearUp = useEventListener("click", () => {
  allData.value.forEach((x) => (x.showWeight = false));
});

onBeforeUnmount(() => {
  clearUp();
});

// instance
const keyword2Ref = ref<HTMLElement[] | null>();
const scrollBoxRef = ref<HTMLElement[] | null>();

const isClickScroll = ref(false);
// tab-pane是否在页面中显示的映射
const map = ref<Record<string, any>>({});
const currentTab = ref<string>();
const currentTab2 = ref<string>();

// computed data
const allData = computed(() => {
  const list = reactive(cloneDeep(props.list));
  if (props.defaultData) {
    const defaultData = props.defaultData.filter((x) => !x.isDefault);

    // NOTE:对应历史数据合并
    defaultData.forEach((x) => {
      const item = list.find((y) => x.promptEN === y.promptEN);
      if (item) Object.assign(item, x);
    });
  }
  return list;
});
const tabList = computed(() => Array.from(new Set(allData.value.map((x) => x.KeyWord))));
const tab2List = computed(() => {
  return Array.from(
    new Set(
      allData.value.filter((x) => x.KeyWord === currentTab?.value).map((x) => x.KeyWord2)
    )
  );
});
const selectedList = computed(() => allData.value.filter((x) => x.isSelected));

/** 添加监听: 元素显示0r隐藏 */
function addElementVisibility() {
  const scrollTarget = scrollBoxRef.value?.find((x) =>
    x.className.includes(currentTab.value!)
  );

  const targets = keyword2Ref.value?.filter((x) => {
    return tab2List.value.includes(x.classList[1]);
  });

  targets?.forEach((x) => {
    const isVisible = ref(false);
    const { stop } = useIntersectionObserver(
      x,
      ([{ isIntersecting }]) => {
        isVisible.value = isIntersecting;
      },
      {
        root: scrollTarget,
      }
    );

    map.value[x.classList[1]] = {
      stop,
      isVisible,
    };
  });
}

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

function scrollTo(className: string) {
  document.getElementsByClassName(className)[0].scrollIntoView({
    behavior: "smooth",
  });
}

function clearScroll() {
  for (const key in map.value) {
    map.value[key].stop();
  }
  map.value = {};
}

function onTrigger(item: CardItem) {
  item.isSelected = !item.isSelected;

  onClickCard(item);
}

function onClickCard(item: CardItem) {
  allData.value.forEach((x) => (x.showWeight = false));
  item.showWeight = true;
}

function onReduceWeight(weight: number, item: CardItem) {
  item.weight = weight - 1;
}

function onAddWeight(weight: number, item: CardItem) {
  item.weight = weight + 1;
}

defineExpose({
  selectedList,
});

watch(
  tabList,
  () => {
    currentTab.value = tabList?.value[0];
  },
  { immediate: true }
);

watch(
  tab2List,
  async () => {
    if (!tab2List.value.length) return;

    currentTab2.value = tab2List.value[0];

    await nextTick();
    currentTab2.value ? scrollTo(currentTab2.value) : undefined;

    clearScroll();
    addElementVisibility();
  },
  { immediate: true }
);

watch(
  map,
  () => {
    if (Object.entries(map.value).length < 0) return;

    if (isClickScroll.value) return;

    const firstShowEl = Object.entries(map.value).find((x) => x[1].isVisible);
    currentTab2.value = firstShowEl?.[0];
  },
  { deep: true }
);
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
      <el-tabs
        py-1
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
        :class="keyword1 + 'scrollBox'"
        pt-15px
        max-h-2xl
        min-h-lg
        overflow-auto
      >
        <div
          ref="keyword2Ref"
          v-for="keyword2 in keyword2label(keyword1!)"
          :class="['keyword2', keyword2]"
        >
          <div flex="~" mt-4 text-16px color-dark-400>
            <div flex>
              <p font-600>{{ keyword2 }}</p>
            </div>
          </div>
          <div flex="~ gap-3 wrap" justify-start items-start pt-4>
            <div
              class="card"
              v-for="item in allData.filter((x) => x.KeyWord2 === keyword2)"
              :key="item.promptEN"
              :class="{ selected: item.isSelected, 'no-mark-tag': !item.isSelected }"
              :data-weight="Math.trunc(item.weight)"
              @click.stop.self="onTrigger(item)"
            >
              <CardItemComp
                v-bind="item"
                weight-type="mid"
                @add-weight="(value) => onAddWeight(value, item)"
                @reduce-weight="(value) => onReduceWeight(value, item)"
              ></CardItemComp>
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

:deep(.el-tabs__header) {
  margin: 0;
}
.keyword2Tab {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;

  :deep(.el-tabs__nav-wrap::after) {
    content: none;
  }
}
</style>
