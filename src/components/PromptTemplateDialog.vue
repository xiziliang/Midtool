<script setup lang="ts">
import { ref, computed, watch, watchEffect, nextTick, onBeforeUnmount, reactive } from "vue";
import DetailDialog from "./DetailDialog.vue"
import type { PromptTemplate } from "@/models";
import type { TabsPaneContext } from "element-plus";
import { cloneDeep } from "lodash";
import { useStorage, useIntersectionObserver, useEventListener } from "@vueuse/core";
import { PROMPT_CUSTOM_LIST } from "@/constants";
import PromptItem from "./PromptItem.vue";
const props = defineProps<{
  list: PromptTemplate[];
  dialogVisible: boolean;
}>();
const emit = defineEmits(['childClose'])
const clearUp = useEventListener("click", () => {
  allData.value.forEach((x) => (x.showWeight = false));
  currentShowWeightCard.value = "";
});
onBeforeUnmount(() => {
  clearUp();
});

// 数据声明
const isClickScroll = ref(false);
const currentTab = ref<string>();//一级tab
const currentTab2 = ref<string>();//二级tab
const allData = ref<PromptTemplate[]>([]);//所有数据
const map = ref<Record<string, any>>({});
const cardCustomList = useStorage<PromptTemplate[]>(PROMPT_CUSTOM_LIST, [], localStorage);
const keyword2Ref = ref<HTMLElement[] | null>();
const scrollBoxRef = ref<HTMLElement[] | null>();
const tabList = computed(() => Array.from(new Set(allData.value.map((x) => x.KeyWord))));
const tab2List = computed(() => {
  return Array.from(
    new Set(
      allData.value.filter((x) => x.KeyWord === currentTab?.value).map((x) => x.KeyWord2)
    )
  );
});
const currentShowWeightCard = ref("");
//一级tab
watch(
  tabList,
  () => {
    currentTab.value = tabList?.value[0];
  },
  { immediate: true }
);
// 二级tab
watch(tab2List, async () => {
  if (!tab2List.value.length) return;

  currentTab2.value = tab2List.value[0];

  await nextTick();
  currentTab2.value ? scrollTo(currentTab2.value) : undefined;

  clearScroll();
  addElementVisibility();
});
watch(
  () => props.list,
  (value) => {
    if (!value) return;
    allData.value = cloneDeep(value);

    if (cardCustomList.value) {
      // NOTE:对应历史数据合并到JSON数据上
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
watchEffect(() => {
  if (!props.dialogVisible) {
    cardCustomList.value = allData.value.filter((x) => x.isSelected);
  }
});
function clearScroll() {
  for (const key in map.value) {
    map.value[key].stop();
  }
  map.value = {};
}
function scrollTo(className: string) {
  document.getElementsByClassName(className)[0].scrollIntoView({
    behavior: "smooth",
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
function onTrigger(item: PromptTemplate) {
  item.isSelected = true;
  // onClickCard(item.promptEN, item);
  showDetailDialog(item)
}
//权重
// function onClickCard(promptEN: string, item: PromptTemplate) {
//   if (currentShowWeightCard.value === promptEN) return;

//   currentShowWeightCard.value = promptEN;
//   allData.value.forEach((x) => (x.showWeight = false));
//   item.showWeight = true;
// }
// 点击展开详情dialog
let detailItemData = ref<PromptTemplate>()
function showDetailDialog(item: PromptTemplate){
  dialogVisible.detail = true;
  detailItemData.value = item;
}

// 详情dialog
const dialogVisible = reactive({
  detail: false
})

// 关闭详情
function closeDetailDialog(){
  dialogVisible.detail = false;
}
// 使用详情
async function useDetailData(){
  dialogVisible.detail = false;
  window.scrollTo(0, document.documentElement.clientHeight * 2);
  await nextTick();
  let list = detailTagList(detailItemData);
  emit('childClose',list, detailItemData);
}
// 生成tag数据
function detailTagList(data:PromptTemplate){
  let list = data.value.promptZH.replace(/\s*/g, "").replace(/,/g, "，").replace(/（/g, "(").replace(/）/g, ")").split("，");
  let listEN = data.value.promptEN.replace(/[(]|[)]|[{]|[}]|[（]|[）]/g, "").replace(/,/g, "，").split("，");
  let newList:object[] = [];
  list.forEach((item:string,index:number)=>{
    if(item){
      let matchArr1 = item.match(/[(|)]/gi);
      let matchArr2 = item.match(/[{|}]/gi);
      let itemPromptEN = listEN[index];
      if(matchArr1 || matchArr2){
        let weightNum:number = 1;
        if(matchArr1){
          weightNum += matchArr1.length * 2;
        }else if(matchArr2){
          weightNum += matchArr2.length * 1;
        }
        let itemPromptZH = item.replace(/[(]|[)]|[{]|[}]|[（]|[）]|\s*/g, "");
        newList.push({
          promptZH: itemPromptZH,
          promptEN: itemPromptEN,
          isCustom: true,
          isSelected: true,
          weight: weightNum,
          showWeight: false
        })
      }else {
        newList.push({
          promptZH: item,
          promptEN: itemPromptEN,
          isCustom: true,
          isSelected: true,
          weight: 1,
          showWeight: false
        })
      }
    }
  })
  return newList
}
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
        class="max-height-box"
        pt-15px
        min-h-lg
        overflow-auto
        style="max-height: calc(100vh - 182px);"
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
              :data-weight="item.weight"
              :data-weight-none="item.weight == 1 ? 'none' : ''"
              :title="item.details ? item.details : ''"
              @click.stop.self="onTrigger(item)"
            >
              <PromptItem
                v-bind="item"
              ></PromptItem>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
  <el-dialog
    title=""
    v-model="dialogVisible.detail"
    center
    destroy-on-close
    draggable
    class="detail-dialog"
    :close-on-click-modal="false"
  >
    <DetailDialog
      ref="detailDialogRef"
      :detailData="detailItemData"
      :dialog-visible="dialogVisible.detail"
    ></DetailDialog>
    <template #footer>
      <span>
        <el-button class="detail-back" @click="closeDetailDialog">返回</el-button>
      </span>
      <span>
        <el-button class="detail-use" @click="useDetailData">使用</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.card::before) {
  display: none;
}
:deep(.el-overlay) {
  background: none;
}

</style>