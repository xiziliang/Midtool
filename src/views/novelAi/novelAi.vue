<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, unref, computed } from "vue";
import type { Ref } from "vue";
import { ElMessage } from "element-plus";
import { cloneDeep } from "lodash";
import type { PromptTemplate } from "@/models";

import type { NovelAiParams, DpiOptions, CustomKeyWord, CardItem } from "@/models";

import NovelCard from "@/components/NovelCard.vue";
import Tag from "@/components/Tag.vue";
import PromptItem from "@/components/PromptItem.vue";
import NovelKeywordDialog from "@/components/NovelKeywordDialog.vue";
import NovelCardDialog from "@/components/NovelCardDialog.vue";
import PromptTemplateDialog from "@/components/PromptTemplateDialog.vue";
import DetailDialog from "@/components/DetailDialog.vue"

import { ReplaceKey } from "@/constants";
import { addParentheses } from "@/utils";
import { useEventListener } from "@vueuse/core";
import { useNovelAiData } from "@/hooks";

const clearUp = useEventListener("click", clearWeight);

onBeforeUnmount(() => {
  clearUp();
});
const detailItemData = ref<PromptTemplate>();
const {
  // JSON数据
  promptTemplateList,
  drawPeopleList,
  drawBodyList,
  drawStyleList,
  composeKeyWord,
  positiveKeyWord,

  // 默认展示数据
  defaultPromptTemplate,
  defaultDrawPeople,
  defaultDrawBody,
  defaultDrawStyle,
  defaultComposeKeyWord,
  defaultPositiveKeyWord,
  defaultCustomKeyWord,

  // 所有数据
  allDefaultData,

  // input提示词
  tooltiplist,

  fetch,
} = useNovelAiData();

fetch();

// instance
const cardRef = ref<InstanceType<typeof NovelCardDialog>>();
const keywordRef = ref<InstanceType<typeof NovelKeywordDialog>>();

const newCustomKeyWord = ref("");
const newComposeKeyWord = ref("");
const newPositiveKeyWord = ref("");

const others = computed(() => {
  const keyword1 = defaultComposeKeyWord.value.filter((x) => x.isSelected && x.isCustom);
  const keyword2 = defaultPositiveKeyWord.value.filter((x) => x.isSelected && x.isCustom);
  const keyword3 = defaultCustomKeyWord.value.filter((x) => x.isSelected && x.isCustom);
  return [...keyword1, ...keyword2, ...keyword3];
});

const stringField = computed(() => {
  const prompt = [
    ...defaultDrawPeople.value,
    ...defaultDrawBody.value,
    ...defaultDrawStyle.value,
  ]
    .filter((x) => x.isSelected && !x.isCustom)
    .map((x) => addParentheses(x.promptEN, x.weight))
    .join(",");

  // NOTE:keyword不包含defaultCustomKeyWord， 因为defaultCustomKeyWord要进翻译
  const keyWord = [...defaultComposeKeyWord.value, ...defaultPositiveKeyWord.value]
    .filter((x) => x.isSelected && !x.isCustom)
    .map((x) => addParentheses(x.promptEN, x.weight))
    .join(",");

  return ReplaceKey + (prompt ? prompt + "," : "") + keyWord;
});

const dialogVisible = reactive({
  prompt: false,
  people: false,
  body: false,
  style: false,
  composeKeyWord: false,
  positiveKeyWord: false,
  detail: false,

  writeComposeKeyWord: false,
  writePositiveKeyWord: false,
  writeCustomKeyWord: false,
});

function onSelectParams(
  type:
    | NovelAiParams
    | "writeComposeKeyWord"
    | "writePositiveKeyWord"
    | "writeCustomKeyWord"
) {
  switch (type) {
    case "prompt":
      dialogVisible.prompt = true;

      break;
    case "people":
      dialogVisible.people = true;

      break;
    case "body":
      dialogVisible.body = true;

      break;
    case "style":
      dialogVisible.style = true;

      break;
    case "composeKeyWord":
      dialogVisible.composeKeyWord = true;

      break;
    case "writeComposeKeyWord":
      dialogVisible.writeComposeKeyWord = true;

      break;
    case "positiveKeyWord":
      dialogVisible.positiveKeyWord = true;

      break;
    case "writePositiveKeyWord":
      dialogVisible.writePositiveKeyWord = true;

      break;
    case "writeCustomKeyWord":
      dialogVisible.writeCustomKeyWord = true;

      break;
  }

  clearWeight();
}

function clearWeight() {
  allDefaultData.value.forEach((x: any) => (x.showWeight = false));
}

function onShowWeightTag(item: CustomKeyWord, type?: NovelAiParams, index?: number) {
  if (!(item.isCustom || item.isDefault) && item.isSelected) {
    switch (type) {
      case "composeKeyWord":
        defaultComposeKeyWord.value.splice(index!, 1);
        break;
      case "positiveKeyWord":
        defaultPositiveKeyWord.value.splice(index!, 1);
        break;
    }
  } else {
    item.isSelected = !item.isSelected;
  }

  allDefaultData.value.forEach((x: any) => (x.showWeight = false));
  item.showWeight = true;
}

function onReduceWeight(weight: number, item: any) {
  !item.isSelected ? (item.isSelected = true) : null;

  item.weight = weight - 1;
}

function onAddWeight(weight: number, item: any) {
  !item.isSelected ? (item.isSelected = true) : null;

  item.weight = weight + 1;
}

function initKeyword<T>(name: Ref<T> | T) {
  return {
    promptZH: unref(name),
    isCustom: true,
    isSelected: true,
    weight: 1,
    showWeight: false,
  } as any;
}

/** 关闭弹窗后，选中数据和现有历史数据合并 */
function assignHistoyData(elRef: Ref<any>, data: Ref<any[]>) {
  // 从dialog中选择后
  const HistoryData = (elRef.value?.selectedList as any[]) || [];

  const currentSelected = data.value.filter((x) => x.isSelected);
  const historySelected = HistoryData.filter((x) => x.isSelected);

  // NOTE: 当前选中的个数大于弹窗选中的个数，表示在弹窗是是进行了取消选中的操作
  //       需要把从弹窗返回的数据取出isDefault为true的数据，和默认的5条数据进行合并
  if (currentSelected.length > historySelected.length) {
    const default5 = data.value.filter((x) => x.isDefault);
    const remainDefault5 = HistoryData.filter((x) => x.isDefault && x.isSelected);
    const remainOther = HistoryData.filter((x) => !x.isDefault && x.isSelected);

    default5.forEach((x) => {
      const has = remainDefault5.find((y) => y.promptEN === x.promptEN);
      has ? Object.assign(has, x) : (x.isSelected = false);
    });

    data.value = [...remainOther, ...default5];
  } else {
    // NOTE:对应历史数据合并
    HistoryData.forEach((x) => {
      const has = data.value.find((y) => y.promptEN === x.promptEN);
      has ? Object.assign(has, x) : data.value.unshift(x);
    });
  }
}

function onClosePeople() {
  onCloseDialog();

  assignHistoyData(cardRef, defaultDrawPeople);
}

function onCloseBody() {
  onCloseDialog();

  assignHistoyData(cardRef, defaultDrawBody);
}

function onCloseStyle() {
  onCloseDialog();

  assignHistoyData(cardRef, defaultDrawStyle);
}

function onCloseComposeKeyword() {
  onCloseDialog();

  if (newComposeKeyWord.value) {
    defaultComposeKeyWord.value.unshift(initKeyword(newComposeKeyWord));
    newComposeKeyWord.value = "";
  } else {
    assignHistoyData(keywordRef, defaultComposeKeyWord);
  }
}

function onClosePositiveKeyword() {
  onCloseDialog();

  if (newPositiveKeyWord.value) {
    defaultPositiveKeyWord.value.unshift(initKeyword(newPositiveKeyWord));
    newPositiveKeyWord.value = "";
  } else {
    assignHistoyData(keywordRef, defaultPositiveKeyWord);
  }
}
// 自己添加
function onCloseCustomKeyword() {
  onCloseDialog();
  defaultCustomKeyWord.value.unshift(initKeyword(newCustomKeyWord));
}

function onCloseDialog() {
  dialogVisible.prompt = false;
  dialogVisible.people = false;
  dialogVisible.body = false;
  dialogVisible.style = false;
  dialogVisible.composeKeyWord = false;
  dialogVisible.positiveKeyWord = false;

  dialogVisible.writeComposeKeyWord = false;
  dialogVisible.writePositiveKeyWord = false;
  dialogVisible.writeCustomKeyWord = false;
}

function onDeleteKeyword(type: NovelAiParams, index: number) {
  switch (type) {
    case "composeKeyWord":
      defaultComposeKeyWord.value.splice(index, 1);
      break;
    case "positiveKeyWord":
      defaultPositiveKeyWord.value.splice(index, 1);
      break;
    case "customKeyword":
      defaultCustomKeyWord.value.splice(index, 1);
      break;
  }
  ElMessage.success("删除成功");
}
function closePromptTemplateDialog(detailList: object[]) {
  dialogVisible.prompt = false;
  defaultPromptTemplate.value.forEach((item) => {
    item.isSelected = false;
  });
  defaultDrawPeople.value.forEach((item) => {
    item.isSelected = false;
  });
  defaultDrawStyle.value.forEach((item) => {
    item.isSelected = false;
  });
  defaultDrawBody.value.forEach((item) => {
    item.isSelected = false;
  });
  defaultComposeKeyWord.value.forEach((item) => {
    item.isSelected = false;
  });
  defaultPositiveKeyWord.value.forEach((item) => {
    item.isSelected = false;
  });
  defaultCustomKeyWord.value = detailList;
}
function adddefaultPromptTemplate(list:object[],detailItemData:PromptTemplate){
  defaultPromptTemplate.value.unshift(detailItemData.value);
  closePromptTemplateDialog(list);
}
// 详情dialog
function clickCard(item:PromptTemplate){
  dialogVisible.detail = true;
  detailItemData.value = item;
}
// 关闭详情
function closeDetailDialog(){
  dialogVisible.detail = false;
}
// 使用详情
async function useDetailData(){
  dialogVisible.detail = false;
  let list = detailTagList(detailItemData);
  closePromptTemplateDialog(list)
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
        let itemPromptZH = item.replace(/[(]|[)]|[{]|[}]|[（]|[）]|\s*/g, "")
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
defineExpose({
  // 杂项
  others,
  // input的提示
  tipsList: tooltiplist,
  // 拼接字符串数据
  stringField,
  // 所有默认数据
  allDefaultData,
});
</script>

<template>
  <main
    class="container-params ma lt-lg:max-w-660px lg:max-w-828px xl:max-w-1176px 2xl:max-w-1336px"
  >
    <div flex="~" mt-4 mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('prompt')">
        <p text-20px color-dark-400>
          <i class="icon-fengge icon-big mr-2 -mb-1"></i>选择参考图
        </p>
        <div i-carbon:add></div>
        <p ml-8px self-center text-14px class="text-[#AAAAAA]">
          我们会自动选中对应的参考词，让画面与原图更接近，这些词会自动加在翻译的句尾
        </p>
      </div>
    </div>
    <div
      flex="~ gap-12px wrap"
      justify-start
      items-stretch
      will-change-scroll
      p="x-2px"
      class="more"
    >
      <div
        class="card prompt-item no-mark-tag"
        v-for="item in defaultPromptTemplate"
        :key="item.promptEN"
        :class="{ selected: item.isSelected }"
        @click="clickCard(item)"
      >
        <PromptItem v-bind="item" />
      </div>
    </div>
    <div flex="~" mt-8 mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('people')">
        <p text-20px color-dark-400>
          <i class="icon-fengge icon-big mr-2 -mb-1"></i>画个人
        </p>
        <div i-carbon:add></div>
        <p ml-8px self-center text-14px class="text-[#AAAAAA]">
          角色/身份/头发/面部/姿势/情绪/衣着...
        </p>
      </div>
    </div>
    <div
      flex="~ gap-12px wrap"
      justify-start
      items-stretch
      will-change-scroll
      p="x-2px"
      class="more"
    >
      <NovelCard :data="defaultDrawPeople" :all-default-data="allDefaultData"></NovelCard>
    </div>
    <div flex="~" mt-28px mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('body')">
        <p text-20px color-dark-400>
          <i class="icon-fengge icon-big mr-2 -mb-1"></i>画个物体
        </p>
        <div i-carbon:add></div>
        <p ml-8px self-center text-14px class="text-[#AAAAAA]">添加物体/只画物体</p>
      </div>
    </div>
    <div
      flex="~ gap-12px wrap"
      justify-start
      items-stretch
      will-change-scroll
      p="x-2px"
      class="more"
    >
      <NovelCard :data="defaultDrawBody" :all-default-data="allDefaultData"></NovelCard>
    </div>
    <div flex="~" mt-28px mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('style')">
        <p text-20px color-dark-400>
          <i class="icon-fengge icon-big mr-2 -mb-1"></i>画风
        </p>
        <div i-carbon:add></div>
        <p ml-8px self-center text-14px class="text-[#AAAAAA]">动漫绘画为主</p>
      </div>
    </div>
    <div
      flex="~ gap-12px wrap"
      justify-start
      items-stretch
      will-change-scroll
      p="x-2px"
      class="more"
    >
      <NovelCard :data="defaultDrawStyle" :all-default-data="allDefaultData"></NovelCard>
    </div>
    <div flex="~" mt-28px mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('composeKeyWord')">
        <p text-20px color-dark-400>
          <i class="icon-tishici icon-big mr-2 -mb-1"></i>构图
        </p>
        <div i-carbon:add></div>
        <p ml-8px self-center text-14px class="text-[#AAAAAA]">焦距/距离/灯光...</p>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch p="x-2px" class="more">
      <Tag
        class="no-mark-tag"
        content="自定义"
        @click="onSelectParams('writeComposeKeyWord')"
      >
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="(item, index) in defaultComposeKeyWord"
        weight-type="novel"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        :weight="item.weight"
        :show-weight="item.showWeight"
        @click.stop.self
        @delete="onDeleteKeyword('composeKeyWord', index)"
        @reduce-weight="(value) => onReduceWeight(value, item)"
        @add-weight="(value) => onAddWeight(value, item)"
        @click-tag="onShowWeightTag(item, 'composeKeyWord', index)"
      ></Tag>
    </div>
    <div flex="~" mt-28px mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('positiveKeyWord')">
        <p text-20px color-dark-400>
          <i class="icon-tishici icon-big mr-2 -mb-1"></i>正面tag
        </p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch p="x-2px" class="more">
      <Tag
        class="no-mark-tag"
        content="自定义"
        @click="onSelectParams('writePositiveKeyWord')"
      >
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="(item, index) in defaultPositiveKeyWord"
        weight-type="novel"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        :weight="item.weight"
        :show-weight="item.showWeight"
        @click.stop.self
        @delete="onDeleteKeyword('positiveKeyWord', index)"
        @reduce-weight="(value) => onReduceWeight(value, item)"
        @add-weight="(value) => onAddWeight(value, item)"
        @click-tag="onShowWeightTag(item, 'positiveKeyWord', index)"
      ></Tag>
    </div>
    <div flex="~" mt-28px mb-8px class="readmore-title">
      <div cursor-pointer flex>
        <p text-20px color-dark-400>
          <i class="icon-tishici icon-big mr-2 -mb-1"></i>自己添加
        </p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch p="x-2px" class="more">
      <Tag
        class="no-mark-tag"
        content="自定义"
        @click="onSelectParams('writeCustomKeyWord')"
      >
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="(item, index) in defaultCustomKeyWord"
        weight-type="novel"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        :weight="item.weight"
        :show-weight="item.showWeight"
        @click.stop.self
        @delete="onDeleteKeyword('customKeyword', index)"
        @reduce-weight="(value) => onReduceWeight(value, item)"
        @add-weight="(value) => onAddWeight(value, item)"
        @click-tag="onShowWeightTag(item)"
      ></Tag>
    </div>
  </main>
  <!-- dialog start ----------------->
  <el-dialog
    v-model="dialogVisible.prompt"
    top="0"
    class="prompt-dialog"
    width="100%"
    title="选择参考图"
    center
    draggable
    destroy-on-close
    :close-on-click-modal="false"
  >
    <PromptTemplateDialog
      ref="promptTemplateRef"
      :list="promptTemplateList"
      :dialog-visible="dialogVisible.prompt"
      @childClose="adddefaultPromptTemplate"
    ></PromptTemplateDialog>
  </el-dialog>
  <el-dialog
    title="画个人"
    class="dialog-media"
    v-model="dialogVisible.people"
    center
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <NovelCardDialog
      :ref="(el) => (cardRef = el)"
      :list="drawPeopleList"
      :dialog-visible="dialogVisible.people"
      :default-data="defaultDrawPeople"
    />
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onClosePeople"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="画个物体"
    class="dialog-media"
    v-model="dialogVisible.body"
    center
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <NovelCardDialog
      :ref="(el) => (cardRef = el)"
      :list="drawBodyList"
      :dialog-visible="dialogVisible.body"
      :default-data="defaultDrawBody"
    />
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onCloseBody">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="画风"
    class="dialog-media"
    v-model="dialogVisible.style"
    center
    width="70%"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <NovelCardDialog
      :ref="(el) => (cardRef = el)"
      :list="drawStyleList"
      :dialog-visible="dialogVisible.style"
      :default-data="defaultDrawStyle"
    />
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onCloseStyle">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="构图"
    class="dialog-media"
    v-model="dialogVisible.composeKeyWord"
    center
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <NovelKeywordDialog
      :ref="(el) => (keywordRef = el)"
      :list="composeKeyWord"
      :default-data="defaultComposeKeyWord"
      :dialog-visible="dialogVisible.composeKeyWord"
    ></NovelKeywordDialog>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onCloseComposeKeyword"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="正面tag"
    class="dialog-media"
    v-model="dialogVisible.positiveKeyWord"
    center
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <NovelKeywordDialog
      :ref="(el) => (keywordRef = el)"
      :list="positiveKeyWord"
      :default-data="defaultPositiveKeyWord"
      :dialog-visible="dialogVisible.positiveKeyWord"
    ></NovelKeywordDialog>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onClosePositiveKeyword"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="添加构图"
    v-model="dialogVisible.writeComposeKeyWord"
    center
    width="456px"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <el-input
      type="textarea"
      v-model="newComposeKeyWord"
      maxlength="30"
      show-word-limit
      placeholder="请输入"
      :rows="4"
    ></el-input>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onCloseComposeKeyword"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="添加正面tag"
    v-model="dialogVisible.writePositiveKeyWord"
    center
    width="456px"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <el-input
      type="textarea"
      v-model="newPositiveKeyWord"
      maxlength="30"
      show-word-limit
      placeholder="请输入"
      :rows="4"
    ></el-input>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onClosePositiveKeyword"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="自己添加"
    v-model="dialogVisible.writeCustomKeyWord"
    center
    width="456px"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <el-input
      type="textarea"
      v-model="newCustomKeyWord"
      maxlength="30"
      show-word-limit
      placeholder="请输入"
      :rows="4"
    ></el-input>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onCloseCustomKeyword"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title=""
    v-model="dialogVisible.detail"
    center
    width="50%"
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
