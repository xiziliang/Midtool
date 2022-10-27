<script setup lang="ts">
import { ref, reactive, nextTick, computed, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { cloneDeep } from "lodash";

import type { MidJourneyParams, DpiOptions, CustomKeyWord, CardItem } from "@/models";
import { ReplaceKey } from "@/constants";

import ImgCard from "@/components/ImgCard.vue";
import Tag from "@/components/Tag.vue";
import MidjourneyParams from "@/components/MidjourneyParams.vue";
import DpiDialog from "@/components/DpiDialog.vue";
import KeywordDialog from "@/components/KeywordDialog.vue";
import CardDialog from "@/components/CardDialog.vue";
import PromptItem from "@/components/PromptItem.vue";

import { useEventListener } from "@vueuse/core";
import { useMidJourneyData } from "@/hooks";

const {
  // JSON data
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
    "," +
    (cardListString ? cardListString + "," : "") +
    (keyWordString ? keyWordString + "," : "") +
    (dpiParams.isSelected
      ? `--ar ${dpiParams.height}:${dpiParams.width}`
      : defaultDpiList.value.filter((x) => x.isSelected).length
      ? `--ar ${defaultDpiList.value[0].height}:${defaultDpiList.value[0].width}`
      : "--ar 1:1") +
    "," +
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
  item.weight = weight - 0.25;
}

function onAddWeight(weight: number, item: CustomKeyWord | CardItem) {
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
  type: MidJourneyParams | "writeCard" | "writekeyword" | "writeCustomKeyWord"
) {
  switch (type) {
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
</script>

<template>
  <main
    class="container-params ma lt-lg:max-w-660px lg:max-w-828px xl:max-w-1176px 2xl:max-w-1336px"
  >
    <div flex="~" mt-4 mb-1 class="readmore-title">
      <div cursor-pointer flex>
        <p text-20px color-dark-400>
          <i class="icon-fengge icon-big mr-2 -mb-1"></i>选择参考图
        </p>
        <div i-carbon:add></div>
        <p self-center text-14px class="text-[#AAAAAA]">
          我们会自动选中对应的参考词，让画面与原图更接近，这些词会自动加在翻译的句尾
        </p>
      </div>
    </div>
    <div
      flex="~ gap-12px wrap"
      justify-start
      items-stretch
      will-change-scroll
      p="y-2 x-2px"
      class="more"
    ></div>
    <div flex="~" mt-8 mb-3 class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('card')">
        <p text-20px color-dark-400>
          <i class="icon-fengge icon-big mr-2 -mb-1"></i>选择作画风格
        </p>
        <div i-carbon:add></div>
        <p self-center text-14px class="text-[#AAAAAA]">
          这些词可能会让画面更好看，选中它，翻译时就会加在句尾
        </p>
      </div>
    </div>
    <div
      flex="~ gap-12px wrap"
      justify-start
      items-stretch
      will-change-scroll
      p="y-2 x-2px"
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
    <div flex="~" mt-8 mb-3 class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('keyword')">
        <p text-20px color-dark-400>
          <i class="icon-tishici icon-big mr-2 -mb-1"></i>选择提示词
        </p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" p="y-2 x-2px" justify-start items-stretch class="more">
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
    <div flex="~" m="t-4 b-4" class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('dpi')">
        <p text-20px color-dark-400>
          <i class="icon-bili icon-big mr-2 -mb-1"></i>选择画面比例
        </p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap col" p="y-2 x-2px" items-start class="more">
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
    <div flex="~" mt-4 mb-4 class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('params')">
        <p text-20px color-dark-400>
          <i class="icon-canshu icon-big mr-2 -mb-1"></i>选择作画参数
        </p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div p="y-2 x-2px" class="more">
      <MidjourneyParams
        :data="paramsList"
        :is-hide-no-selected="true"
        :dialog-visible="dialogVisible.params"
      ></MidjourneyParams>
    </div>
    <div flex="~" mt-4 mb-4 class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('img')">
        <p text-20px color-dark-400>
          <i class="icon-wangzhi icon-big mr-2 -mb-1"></i>参考图片网址
        </p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div
      class="more"
      p="y-2 x-2px"
      overflow-auto
      flex="~ gap-4"
      justify-start
      items-stretch
      will-change-scroll
    >
      <ImgCard :data="defaultImgList"></ImgCard>
    </div>
    <div flex="~" mt-4 mb-4 class="readmore-title">
      <div cursor-pointer flex>
        <p text-20px color-dark-400>
          <i class="icon-tishici icon-big mr-2 -mb-1"></i>自己添加
        </p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" p="y-2 x-2px" justify-start items-stretch class="more">
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
    v-model="dialogVisible.card"
    top="30px"
    title="作画风格"
    width="70%"
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
    v-model="dialogVisible.params"
    top="30px"
    width="60%"
    center
    :close-on-click-modal="false"
  >
    <MidjourneyParams
      class="max-h-2xl min-h-lg overflow-auto"
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
        <el-button class="dialogBtn" type="primary" @click="onCloseWriteCustomDialog"
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>
<style scoped>
.readmore-title .icon-big {
  width: 24px;
}
</style>
