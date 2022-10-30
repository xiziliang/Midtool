<script setup lang="ts">
import { ref, reactive, nextTick, computed, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { cloneDeep } from "lodash";
import type { PromptTemplate } from "@/models";

import type { MidJourneyParams, DpiOptions, CustomKeyWord, CardItem } from "@/models";
import { ReplaceKey } from "@/constants";

import ImgCard from "@/components/ImgCard.vue";
import Tag from "@/components/Tag.vue";
import MidjourneyParams from "@/components/MidjourneyParams.vue";
import DpiDialog from "@/components/DpiDialog.vue";
import KeywordDialog from "@/components/KeywordDialog.vue";
import CardDialog from "@/components/CardDialog.vue";
import PromptItem from "@/components/PromptItem.vue";
import PromptTemplateDialog from "@/components/PromptTemplateDialog.vue";
import DetailDialog from "@/components/DetailDialog.vue"

import { useEventListener } from "@vueuse/core";
import { useMidJourneyData } from "@/hooks";

const {
  // JSON data
  promptList,
  cardList,
  keyWordList,
  paramsList,
  dpiList,

  // Storage data
  cardCustomList,
  keyWordCustomList,
  dpiCustomsList,
  paramCustomsList,
  imgCustomsList,
  keyWordHistoryList,
  cardHistoryList,

  // computed data
  defaultPromptList,
  defaultCardList,
  defaultKeyWordList,
  defaultDpiList,
  defaultParamList,
  defaultImgList,
  defaultCustomKeyWord,
  allDefaultData,
  // 默认有权重的数据
  defaultWeightData,
  tooltiplist,

  // 画面比例自定义
  dpiParams,

  fetch,
} = useMidJourneyData();
const clearUp = useEventListener("click", () => {
  defaultWeightData.value.forEach((x) => (x.showWeight = false));
});

onBeforeUnmount(() => {
  clearUp();
});

fetch();

const parameterRef = ref<InstanceType<typeof MidjourneyParams> | null>(null);
const dpiDialogRef = ref<InstanceType<typeof DpiDialog> | null>(null);
const keywordDialogRef = ref<InstanceType<typeof KeywordDialog> | null>(null);
const cardDialogRef = ref<InstanceType<typeof CardDialog> | null>(null);

const newCardValue = ref("");
const newKeyWordValue = ref("");
const newImgAddressValue = ref("");
const newCustomKeyWord = ref("");

const stringField = computed(() => {
  const cardListString = defaultCardList.value
    .filter((x) => x.isSelected && !x.isCustom)
    .map((x) => (x.weight === 0 ? x.promptEN : x.promptEN + ":" + x.weight))
    .join(",");

  // midJourney 关键词和权重直接拼接用:
  const keyWordString = defaultKeyWordList.value
    .filter((x) => x.isSelected && !x.isCustom)
    .map((x) => (x.weight === 0 ? x.promptEN : x.promptEN + ":" + x.weight))
    .join(",");

  // NOTE: paramsList or defaultParamList
  const paramsListString = paramsList.value
    .filter((x) => x.checked)
    .map((x) => {
      if (x.type === "selector") {
        return x.parameter + " " + x.value;
      } else {
        return x.parameter + " " + x.option;
      }
    })
    .join(" ");

  const imglist = defaultImgList.value
    .filter((x) => x.isSelected)
    .map((x) => x.img)
    .join(" ");

  return (
    (imglist ? imglist + "," : "") +
    ReplaceKey +
    (cardListString ? cardListString + "," : "") +
    (keyWordString ? keyWordString + "," : "") +
    (dpiParams.isSelected
      ? `--ar ${dpiParams.height}:${dpiParams.width}` + ","
      : defaultDpiList.value.filter((x) => x.isSelected).length
      ? `--ar ${defaultDpiList.value[0].height}:${defaultDpiList.value[0].width}` + ","
      : "") +
    (paramsListString ? paramsListString : "")
  );
});
const others = computed(() => {
  const KeyWord1 = defaultKeyWordList.value.filter((x) => x.isCustom && x.isSelected);
  // TODO: 参考图数据也要加入过滤，因为给接口只传中文
  const KeyWord2 = defaultCustomKeyWord.value.filter((x) => x.isCustom && x.isSelected);
  const KeyWord3 = defaultCardList.value.filter((x) => x.isCustom && x.isSelected);
  return [...KeyWord1, ...KeyWord2, ...KeyWord3];
});

const dialogVisible = reactive({
  params: false,
  keyWord: false,
  dpi: false,
  card: false,
  img: false,
  writeCard: false,
  writeKeyWord: false,
  writeCustomKeyWord: false,
  detail: false,
  prompt: false
});

defineExpose({
  /** 杂项 */
  others,
  /** 用于翻译后拼接 */
  stringField,
  /** input下方的tooltip提示 */
  tipsList: tooltiplist,
  /** 所有默认数据 */
  allDefaultData,
});

function onClickKeyWordTag(item: CustomKeyWord | CardItem) {
  item.isSelected = !item.isSelected;
  item.showWeight = true;
}

function onClickDpiTag(item: DpiOptions) {
  defaultDpiList.value.forEach((x) => (x.isSelected = false));
  dpiParams.isSelected = false;

  item.isSelected = true;
}

function onDeleteCard(index: number) {
  defaultCardList.value.splice(index, 1);
  ElMessage.success("删除成功");
}

function onDeleteKeyword(index: number) {
  defaultKeyWordList.value.splice(index, 1);
  ElMessage.success("删除成功");
}

function onDeleteCudtomKeyword(index: number) {
  defaultCustomKeyWord.value.splice(index, 1);
  ElMessage.success("删除成功");
}

function onDeleteDpi() {
  dpiParams.isSelected = false;
  dpiParams.width = "";
  dpiParams.height = "";

  ElMessage.success("删除成功");
}

function onReduceWeight(weight: number, item: CustomKeyWord | CardItem) {
  !item.isSelected ? (item.isSelected = true) : null;
  item.weight = weight - 0.25;
}

function onAddWeight(weight: number, item: CustomKeyWord | CardItem) {
  !item.isSelected ? (item.isSelected = true) : null;
  item.weight = weight + 0.25;
}

function onShowWeightTag(content: string, item: CustomKeyWord | CardItem) {
  defaultWeightData.value.forEach((x) => (x.showWeight = false));

  item.showWeight = true;
}

async function onCloseCardDialog() {
  dialogVisible.card = false;
  await nextTick();

  cardCustomList.value = cardDialogRef.value?.cardCustomList;
  cardHistoryList.value = cardDialogRef.value?.cardHistoryList;

  defaultCardList.value.unshift(...cardHistoryList.value.filter((x) => x.isSelected));
}

async function onCloseDpiDialog() {
  dialogVisible.dpi = false;
  await nextTick();
  const { width, height } = dpiDialogRef.value?.dpiCustom!;
  if (width && height) {
    dpiParams.width = width;
    dpiParams.height = height;
    dpiParams.isSelected = true;
  } else {
    dpiParams.width = "";
    dpiParams.height = "";
    dpiParams.isSelected = false;
  }

  if (dpiParams.isSelected) {
    dpiCustomsList.value = dpiDialogRef.value?.dpiCustomsList;
    dpiCustomsList.value.forEach((x) => (x.isSelected = false));
  } else {
    dpiCustomsList.value = dpiDialogRef.value?.dpiCustomsList;
  }
}

async function onCloseKeyWordDialog() {
  dialogVisible.keyWord = false;
  await nextTick();
  keyWordCustomList.value = keywordDialogRef.value?.keyWordCustomList;
  keyWordHistoryList.value = keywordDialogRef.value?.keyWordHistoryList;

  defaultKeyWordList.value.unshift(
    ...keyWordHistoryList.value.filter((x) => x.isSelected)
  );
}

function onCloseWriteCardDialog() {
  dialogVisible.writeCard = false;

  const item = cardHistoryList.value.find((x) => x.promptZH === newCardValue.value);

  if (item) {
    item.isSelected = true;
    defaultCardList.value.push(item);
  } else if (!item) {
    const newItem = reactive({
      promptZH: newCardValue.value,
      weight: 1,
      showWeight: false,
      isSelected: true,
      isCustom: true,
    }) as CardItem;
    cardHistoryList.value.push(newItem);
    defaultCardList.value.unshift(newItem);
  }
  newCardValue.value = "";
}

function onCloseWriteKeyWordDialog() {
  dialogVisible.writeKeyWord = false;

  const item = keyWordHistoryList.value.find((x) => x.promptZH === newKeyWordValue.value);

  if (item) {
    item.isSelected = true;
    defaultKeyWordList.value.push(item);
  } else if (!item) {
    const newItem = reactive({
      promptZH: newKeyWordValue.value,
      weight: 1,
      showWeight: false,
      isSelected: true,
      isCustom: true,
    }) as CustomKeyWord;
    keyWordHistoryList.value.push(newItem);

    defaultKeyWordList.value.unshift(newItem);
  }
  newKeyWordValue.value = "";
}

async function onCloseParamsDialog() {
  dialogVisible.params = false;
  paramsList.value = parameterRef.value?.data;
}

function onCloseWriteCustomDialog() {
  dialogVisible.writeCustomKeyWord = false;

  defaultCustomKeyWord.value.push({
    promptZH: newCustomKeyWord.value,
    isCustom: true,
    isSelected: true,
    weight: 1,
    showWeight: false,
  } as CustomKeyWord);

  newCustomKeyWord.value = "";
}

function onSelectAIParams(
  type: MidJourneyParams | "writeCard" | "writekeyword" | "writeCustomKeyWord" | ""
) {
  switch (type) {
    case "prompt":
      dialogVisible.prompt = true;

      break;
    case "card":
      dialogVisible.card = true;

      break;
    case "writeCard":
      dialogVisible.writeCard = true;

      break;
    case "keyword":
      dialogVisible.keyWord = true;

      break;
    case "dpi":
      dialogVisible.dpi = true;

      break;
    case "params":
      dialogVisible.params = true;

      break;
    case "img":
      if (defaultImgList.value.filter((x) => x.isSelected).length >= 10) {
        ElMessage({
          type: "warning",
          message: "您已选中10张图片",
        });
        return;
      }
      dialogVisible.img = true;

      break;
    case "writekeyword":
      dialogVisible.writeKeyWord = true;

      break;
    case "writeCustomKeyWord":
      dialogVisible.writeCustomKeyWord = true;

      break;
  }
}
const detailItemData = ref<PromptTemplate>();
function addDefaultPromptList(list:object[],detailItemData:PromptTemplate){
  if(defaultPromptList.value.filter(item =>{
    return item.fileUrl == detailItemData.value.fileUrl
  }).length == 0){
    defaultPromptList.value.unshift(detailItemData.value);
  }
  closePromptTemplateDialog(list);
}
// 详情dialog
function clickCard(item:PromptTemplate){
  dialogVisible.detail = true;
  item.isSelected = true;
  detailItemData.value = item;
}
// 关闭详情
function closeDetailDialog(){
  dialogVisible.detail = false;
}
// 使用详情
async function useDetailData(){
  dialogVisible.detail = false;
  window.scrollTo(0, document.documentElement.clientHeight * 2);
  let list = detailTagList(detailItemData);
  closePromptTemplateDialog(list)
}
function closePromptTemplateDialog(detailList: object[]) {
  dialogVisible.prompt = false;
  // defaultPromptList.value.forEach((item) => {
  //   item.isSelected = false;
  // });
  defaultCardList.value.forEach((item) => {
    item.isSelected = false;
  });
  defaultKeyWordList.value.forEach((item) => {
    item.isSelected = false;
  });
  defaultDpiList.value.forEach((item) => {
    item.isSelected = false;
  });
  defaultCustomKeyWord.value = detailList;
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
</script>

<template>
  <main
    class="container-params ma lt-lg:max-w-660px lg:max-w-828px xl:max-w-1176px 2xl:max-w-1336px"
  >
    <div flex="~" mt-4 mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('prompt')">
        <p text-20px color-dark-400>
          <i class="icon-fengge icon-big mr-2 -mb-1"></i>选择参考图
        </p>
        <div i-carbon:add></div>
        <p ml-8px self-center text-14px class="text-[#AAAAAA]">
          画一张相似的，让画面与原图更接近，这些词会自动加在翻译的句尾
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
        v-for="item in defaultPromptList"
        :key="item.promptEN"
        @click="clickCard(item)"
        :title="item.details ? item.details : ''"
      >
        <PromptItem v-bind="item" />
      </div>
    </div>
    <div flex="~" mt-4 mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('card')">
        <div hover:bg-gray-200 flex style="border-radius: 5px">
          <p text-20px color-dark-400>
            <i class="icon-fengge icon-big mr-2 -mb-1"></i>选择作画风格
          </p>
          <div i-carbon:add></div>
        </div>
        <p ml-8px self-center text-14px class="text-[#AAAAAA]">
          这些词可能会让画面更好看，选中它，翻译时就会加在句尾
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
      <Tag class="no-mark-tag" content="自定义" @click="onSelectAIParams('writeCard')">
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="(item, index) in defaultCardList"
        weight-type="mid"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        :weight="item.weight"
        :show-weight="item.showWeight"
        @delete="onDeleteCard(index)"
        @click.stop.self="onClickKeyWordTag(item)"
        @reduce-weight="(value) => onReduceWeight(value, item)"
        @add-weight="(value) => onAddWeight(value, item)"
        @click-tag="(value) => onShowWeightTag(value, item)"
      ></Tag>
    </div>
    <div flex="~" mt-4 mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('keyword')">
        <div hover:bg-gray-200 flex style="border-radius: 5px">
          <p text-20px color-dark-400>
            <i class="icon-tishici icon-big mr-2 -mb-1"></i>选择提示词
          </p>
          <div i-carbon:add></div>
        </div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" p="x-2px" justify-start items-stretch class="more">
      <Tag class="no-mark-tag" content="自定义" @click="onSelectAIParams('writekeyword')">
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="(item, index) in defaultKeyWordList"
        weight-type="mid"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        :weight="item.weight"
        :show-weight="item.showWeight"
        @click.stop.self="onClickKeyWordTag(item)"
        @delete="onDeleteKeyword(index)"
        @reduce-weight="(value) => onReduceWeight(value, item)"
        @add-weight="(value) => onAddWeight(value, item)"
        @click-tag="(value) => onShowWeightTag(value, item)"
      ></Tag>
    </div>
    <div flex="~" mt-4 mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('dpi')">
        <div hover:bg-gray-200 flex style="border-radius: 5px">
          <p text-20px color-dark-400>
            <i class="icon-bili icon-big mr-2 -mb-1"></i>选择画面比例
          </p>
          <div i-carbon:add></div>
        </div>
      </div>
    </div>
    <div flex="~ gap-3 wrap col" p="x-2px" items-start class="more">
      <div flex="~ gap-3 wrap">
        <Tag
          v-if="dpiParams.width && dpiParams.height"
          class="no-mark-tag"
          type="dpi"
          :content="dpiParams.options"
          :is-selected="dpiParams.isSelected"
          :is-custom="dpiParams.isCustom"
          @click="onClickDpiTag(dpiParams)"
          @delete="onDeleteDpi"
        >
          <span class="text-[#AAAAAA]"
            >{{ dpiParams.width }} : {{ dpiParams.height }}</span
          >
        </Tag>
        <Tag
          class="no-mark-tag"
          v-for="item in defaultDpiList"
          type="dpi"
          :content="item.options"
          :is-selected="item.isSelected"
          @click="onClickDpiTag(item)"
        >
          <span class="text-[#AAAAAA]">{{ item.width }} : {{ item.height }}</span>
        </Tag>
      </div>
    </div>
    <div flex="~" mt-4 mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('params')">
        <div hover:bg-gray-200 flex style="border-radius: 5px">
          <p text-20px color-dark-400>
            <i class="icon-canshu icon-big mr-2 -mb-1"></i>选择作画参数
          </p>
          <div i-carbon:add></div>
        </div>
      </div>
    </div>
    <div p="x-2px" class="more">
      <MidjourneyParams
        :data="paramsList"
        :is-hide-no-selected="true"
        :dialog-visible="dialogVisible.params"
      ></MidjourneyParams>
    </div>
    <div flex="~" mt-4 mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('img')">
        <div hover:bg-gray-200 flex style="border-radius: 5px">
          <p text-20px color-dark-400>
            <i class="icon-wangzhi icon-big mr-2 -mb-1"></i>参考图片网址
          </p>
          <div i-carbon:add></div>
        </div>
      </div>
    </div>
    <div
      class="more"
      p="x-2px"
      overflow-auto
      flex="~ gap-4"
      justify-start
      items-stretch
      will-change-scroll
    >
      <ImgCard :data="defaultImgList"></ImgCard>
    </div>
    <div flex="~" mt-4 mb-8px class="readmore-title">
      <div cursor-pointer flex>
        <div hover:bg-gray-200 flex style="border-radius: 5px">
          <p text-20px color-dark-400>
            <i class="icon-tishici icon-big mr-2 -mb-1"></i>参考图tag
          </p>
          <div i-carbon:add></div>
        </div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" p="x-2px" justify-start items-stretch class="more">
      <Tag
        class="no-mark-tag"
        content="自定义"
        @click="onSelectAIParams('writeCustomKeyWord')"
      >
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="(item, index) in defaultCustomKeyWord"
        weight-type="mid"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        :weight="item.weight"
        :show-weight="item.showWeight"
        @click.stop.self="onClickKeyWordTag(item)"
        @delete="onDeleteCudtomKeyword(index)"
        @reduce-weight="(value) => onReduceWeight(value, item)"
        @add-weight="(value) => onAddWeight(value, item)"
        @click-tag="(value) => onShowWeightTag(value, item)"
      ></Tag>
    </div>
  </main>
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
      :list="promptList"
      :dialog-visible="dialogVisible.prompt"
      @childClose="addDefaultPromptList"
    ></PromptTemplateDialog>
  </el-dialog>
  <el-dialog
    v-model="dialogVisible.card"
    class="dialog-media"
    title="作画风格"
    center
    draggable
    destroy-on-close
    :close-on-click-modal="false"
  >
    <CardDialog
      ref="cardDialogRef"
      :list="cardList"
      :dialog-visible="dialogVisible.card"
    ></CardDialog>
    <template #footer>
      <span class="dialog-footer">
        <el-button class="dialogBtn" type="primary" @click="onCloseCardDialog"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="输入作画风格"
    v-model="dialogVisible.writeCard"
    center
    width="456px"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <el-input
      type="textarea"
      v-model="newCardValue"
      maxlength="30"
      show-word-limit
      placeholder="请输入"
      :rows="4"
    ></el-input>

    <template #footer>
      <span>
        <el-button
          class="dialogBtn"
          :disabled="newCardValue.length < 1"
          type="primary"
          @click="onCloseWriteCardDialog"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="输入提示词"
    v-model="dialogVisible.writeKeyWord"
    center
    width="456px"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <el-input
      type="textarea"
      v-model="newKeyWordValue"
      maxlength="30"
      show-word-limit
      placeholder="请输入"
      :rows="4"
    ></el-input>

    <template #footer>
      <span>
        <el-button
          class="dialogBtn"
          :disabled="newKeyWordValue.length < 1"
          type="primary"
          @click="onCloseWriteKeyWordDialog"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="提示词"
    class="dialog-media"
    v-model="dialogVisible.keyWord"
    center
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <KeywordDialog
      ref="keywordDialogRef"
      :list="keyWordList"
      :dialog-visible="dialogVisible.keyWord"
    ></KeywordDialog>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onCloseKeyWordDialog"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="画面比例"
    class="dialog-media"
    v-model="dialogVisible.dpi"
    center
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <DpiDialog
      ref="dpiDialogRef"
      :list="dpiList"
      :dpi-custom="{ ...dpiParams }"
      :dialog-visible="dialogVisible.dpi"
      @childCloseDpiDialog="onCloseDpiDialog"
    ></DpiDialog>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary" @click="onCloseDpiDialog"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="作画参数"
    class="dialog-media"
    style="width: 890px"
    v-model="dialogVisible.params"
    center
    :close-on-click-modal="false"
  >
    <MidjourneyParams
      class="h-full overflow-auto"
      ref="parameterRef"
      :data="cloneDeep(paramsList)"
      :dialog-visible="dialogVisible.params"
    ></MidjourneyParams>
    <template #footer>
      <span class="dialog-footer">
        <el-button class="dialogBtn" type="primary" @click="onCloseParamsDialog"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="输入图片网址"
    v-model="dialogVisible.img"
    center
    width="456px"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <el-input
      type="textarea"
      v-model="newImgAddressValue"
      maxlength="300"
      show-word-limit
      placeholder="原网址需以PNG、JPG等图片格式结尾"
      :rows="4"
    ></el-input>

    <template #footer>
      <span>
        <el-button
          class="dialogBtn"
          :disabled="newImgAddressValue.length < 1"
          type="primary"
          @click="
            dialogVisible.img = false;
            imgCustomsList.push({
              img: newImgAddressValue,
              isSelected: true,
            });
            newImgAddressValue = '';
          "
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="参考图tag"
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
        <el-button class="dialogBtn" type="primary" @click="onCloseWriteCustomDialog"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
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
<style scoped>
.readmore-title .icon-big {
  width: 24px;
}
</style>
