<script setup lang="ts">
import { ref, reactive, nextTick, computed } from "vue";
import { ElMessage } from "element-plus";
import { cloneDeep } from "lodash";

import type { AIParams, HistoryKeyWord, DpiOptions } from "@/models";

import Card from "@/components/Card.vue";
import ImgCard from "@/components/ImgCard.vue";
import Tag from "@/components/Tag.vue";
import MidjourneyParams from "@/components/MidjourneyParams.vue";
import DpiDialog from "@/components/DpiDialog.vue";
import KeywordDialog from "@/components/KeywordDialog.vue";
import CardDialog from "@/components/CardDialog.vue";

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

  // computed data
  defaultCardList,
  defaultKeyWordList,
  defaultDpiList,
  defaultParamList,
  defaultImgList,
  tooltiplist,

  fetch,
} = useMidJourneyData();

fetch();

const parameterRef = ref<InstanceType<typeof MidjourneyParams> | null>(null);
const dpiDialogRef = ref<InstanceType<typeof DpiDialog> | null>(null);
const keywordDialogRef = ref<InstanceType<typeof KeywordDialog> | null>(null);
const cardDialogRef = ref<InstanceType<typeof CardDialog> | null>(null);

const newKeyWordValue = ref("");
const newImgAddressValue = ref("");

const stringField = computed(() => {
  const cardListString = defaultCardList.value
    .filter((x) => x.isSelected)
    .map((x) => x.promptEN)
    .join(",");

  const keyWordString = defaultKeyWordList.value
    .filter((x) => x.isSelected && !x.isCustom)
    .map((x) => x.promptEN)
    .join(",");

  const paramsListString = paramsList.value
    .filter((x) => x.checked)
    .map((x) => x.parameter)
    .join(",");

  return (
    (cardListString ? cardListString + "," : "") +
    (keyWordString ? keyWordString + "," : "") +
    (dpiParams.isSelected
      ? `--ar ${dpiParams.height}:${dpiParams.width}`
      : defaultDpiList.value.filter((x) => x.isSelected).length
      ? `--ar ${defaultDpiList.value[0].height}:${defaultDpiList.value[0].width}`
      : "--ar 1:1") +
    "," +
    (paramsListString ? paramsListString + "," : "") +
    defaultImgList.value
      .filter((x) => x.isSelected)
      .map((x) => x.img)
      .join(",")
  );
});

const dialogVisible = reactive({
  params: false,
  writeKeyWord: false,
  keyWord: false,
  dpi: false,
  card: false,
  img: false,
});

const dpiParams = reactive<{
  options: string;
  isSelected: boolean;
  isCustom: boolean;
  width: undefined | string;
  height: undefined | string;
}>({
  options: "自定义",
  isSelected: false,
  isCustom: true,
  width: undefined,
  height: undefined,
});

defineExpose({
  defaultKeyWordList,
  /** 用于翻译后拼接 */
  stringField,
  /** input下方的tooltip提示 */
  tipsList: tooltiplist,
});

function onClickTag(item: DpiOptions) {
  defaultDpiList.value.forEach((x) => (x.isSelected = false));
  dpiParams.isSelected = false;

  item.isSelected = true;
}
function onDelete(value: string) {
  const index = defaultKeyWordList.value.findIndex(
    (x) => x.isCustom && x.promptZH === value
  );

  defaultKeyWordList.value.splice(index, 1);
  ElMessage.success("删除成功");
}

function onDeleteDpi() {
  dpiParams.isSelected = false;
  dpiParams.width = "";
  dpiParams.height = "";

  ElMessage.success("删除成功");
}

async function onCloseCardDialog() {
  dialogVisible.card = false;
  await nextTick();
  cardCustomList.value = cardDialogRef.value?.cardCustomList;
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

  defaultKeyWordList.value.push(...keyWordHistoryList.value.filter((x) => x.isSelected));
}

function onCloseWriteKeyWordDialog() {
  dialogVisible.writeKeyWord = false;

  const item = keyWordHistoryList.value.find((x) => x.promptZH === newKeyWordValue.value);

  if (item) {
    item.isSelected = true;
    defaultKeyWordList.value.push(item);
  } else if (!item) {
    keyWordHistoryList.value.push(
      reactive({
        promptZH: newKeyWordValue.value,
        isSelected: true,
        isCustom: true,
      }) as HistoryKeyWord
    );

    defaultKeyWordList.value.push(
      keyWordHistoryList.value.find(
        (x) => x.promptZH === newKeyWordValue.value
      ) as HistoryKeyWord
    );
  }
  newKeyWordValue.value = "";
}

async function onCloseParamsDialog() {
  dialogVisible.params = false;
  paramsList.value = parameterRef.value?.data;
}

function onSelectAIParams(type: AIParams | "writekeyword") {
  switch (type) {
    case "card":
      dialogVisible.card = true;

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
  }
}
</script>

<template>
  <main
    class="container-params ma lt-lg:max-w-660px lg:max-w-828px xl:max-w-1176px 2xl:max-w-1332px"
  >
    <div flex="~" mt-4 mb-1 class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('card')">
        <p text-20px color-dark-400><i class="icon-fengge icon-big mr-2 -mb-1"></i>选择作画风格</p>
        <div i-carbon:add></div>
        <p self-center text-14px class="text-[#AAAAAA]">
          这些词可能会让画面更好看，选中它，翻译时就会加在句尾
        </p>
      </div>
    </div>
    <div
      overflow-auto
      flex="~ gap-12px"
      justify-start
      items-stretch
      will-change-scroll
      p="y-2 x-2px"
      class="more"
    >
      <Card :data="defaultCardList"></Card>
    </div>
    <div flex="~" mt-8 mb-3 class="readmore-title" @click="onSelectAIParams('keyword')">
      <div cursor-pointer flex>
        <p text-20px color-dark-400><i class="icon-tishici icon-big mr-2 -mb-1"></i>选择提示词</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
      <Tag content="自定义" @click="onSelectAIParams('writekeyword')">
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="item in defaultKeyWordList"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        @click="item.isSelected = !item.isSelected"
        @delete="onDelete"
      ></Tag>
    </div>
    <div flex="~" m="t-8 b-3" class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('dpi')">
        <p text-20px color-dark-400><i class="icon-bili icon-big mr-2 -mb-1"></i>选择画面比例</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap col" items-start class="more">
      <div flex="~ gap-3 wrap">
        <Tag
          v-if="dpiParams.width && dpiParams.height"
          type="dpi"
          :content="dpiParams.options"
          :is-selected="dpiParams.isSelected"
          :is-custom="dpiParams.isCustom"
          @click="onClickTag(dpiParams)"
          @delete="onDeleteDpi"
        >
          <span class="text-[#AAAAAA]"
            >{{ dpiParams.width }} : {{ dpiParams.height }}</span
          >
        </Tag>
        <Tag
          v-for="item in defaultDpiList"
          type="dpi"
          :content="item.options"
          :is-selected="item.isSelected"
          @click="onClickTag(item)"
        >
          <span class="text-[#AAAAAA]">{{ item.width }} : {{ item.height }}</span>
        </Tag>
      </div>
    </div>
    <div flex="~" mt-8 class="readmore-title -mb-1">
      <div cursor-pointer flex @click="onSelectAIParams('params')">
        <p text-20px color-dark-400><i class="icon-canshu icon-big mr-2 -mb-1"></i>选择作画参数</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~" mt-8 mb-1 class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('img')">
        <p text-20px color-dark-400><i class="icon-wangzhi icon-big mr-2 -mb-1"></i>参考图片网址</p>
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
    v-model="dialogVisible.params"
    top="30px"
    title="作画参数"
    class="dialog-media"
    center
    :close-on-click-modal="false"
  >
    <MidjourneyParams
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
</template>
<style scoped>
.readmore-title .icon-big {
  width: 24px;
}
</style>
