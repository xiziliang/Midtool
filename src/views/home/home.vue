<script setup lang="ts">
import { ref, reactive, computed, nextTick } from "vue";
import { cloneDeep } from "lodash";
import { ElMessage } from "element-plus";

import Card from "@/components/Card.vue";
import ImgCard from "@/components/ImgCard.vue";
import Tag from "@/components/Tag.vue";
import MidjourneyParams from "@/components/MidjourneyParams.vue";
import DpiDialog from "@/components/DpiDialog.vue";
import KeywordDialog from "@/components/KeywordDialog.vue";
import CardDialog from "@/components/CardDialog.vue";
import { getDpiList, getParamslist } from "@/assets/data";
import type {
  DpiOptions,
  Options,
  CustomKeyWord,
  CardItem,
  AIParams,
  ImgOptions,
} from "@/models";
import {
  DPI_CUSTOM_LIST,
  CARD_CUSTOM_LIST,
  KEYWORD_CUSTOM_LIST,
  PARAM_CUSTOM_LIST,
  IMG_CUSTOM_LIST,
  ApiPrefix,
} from "@/constants";

import { copyText } from "@/utils";
import { useFetch, useStorage } from "@vueuse/core";

// instance
const parameterRef = ref<InstanceType<typeof MidjourneyParams> | null>(null);
const dpiDialogRef = ref<InstanceType<typeof DpiDialog> | null>(null);
const keywordDialogRef = ref<InstanceType<typeof KeywordDialog> | null>(null);
const cardDialogRef = ref<InstanceType<typeof CardDialog> | null>(null);

const dpiCustom = ref(false);

// input value
const inputValue = ref("");
const description = ref("搜罗好词、词图预览、一键翻译,让AI画家更好的作画。");
const translationResult = ref("");
const newKeyWordValue = ref("");
const newImgAddressValue = ref("");

// data
const cardList = ref<CardItem[]>([]);
const keyWordList = ref<Partial<CustomKeyWord>[]>([]);
const paramsList = ref((getParamslist() as unknown) as Options[]);
const dpiList = ref<DpiOptions[]>(getDpiList());

const cardCustomList = useStorage<CardItem[]>(CARD_CUSTOM_LIST, [], localStorage);
const keyWordCustomList = useStorage<CustomKeyWord[]>(
  KEYWORD_CUSTOM_LIST,
  [],
  localStorage
);
const dpiCustomsList = useStorage<DpiOptions[]>(DPI_CUSTOM_LIST, [], localStorage);
const paramCustomsList = useStorage<Options[]>(PARAM_CUSTOM_LIST, [], localStorage);
const imgCustomsList = useStorage<ImgOptions[]>(IMG_CUSTOM_LIST, [], localStorage);

const defaultCardList = computed(() => [...cardCustomList.value]);
const defaultKeyWordList = computed(() => [...keyWordCustomList.value]);
const defaultDpiList = computed(() => [...dpiCustomsList.value]);
const defaultParamList = computed(() => [...paramCustomsList.value]);
const defaultImgList = computed(() => [...imgCustomsList.value]);

const tooltiplist = computed<(CardItem & DpiOptions & CustomKeyWord & ImgOptions)[]>(
  () => {
    return [].concat(
      defaultCardList.value.find((x) => x.isSelected) || ([] as any),
      defaultKeyWordList.value.find((x) => x.isSelected) || ([] as any),
      defaultDpiList.value.find((x) => x.isSelected) || ([] as any),
      defaultImgList.value.find((x) => x.isSelected) || ([] as any)
    );
  }
);

// reactive
const dialogVisible = reactive({
  params: false,
  writeKeyWord: false,
  keyWord: false,
  dpi: false,
  card: false,
  img: false,
});
const dpiParams = reactive({
  width: undefined,
  height: undefined,
});

fetch();

async function fetchKeyWordData() {
  const { data } = await useFetch("/json/tishici.json");
  keyWordList.value = JSON.parse(data.value as string);
}

async function fetchCardListData() {
  const { data } = await useFetch("/json/zuohuafengge.json");
  cardList.value = JSON.parse(data.value as string);
}

function fetch() {
  fetchKeyWordData();
  fetchCardListData();
}

function copy(type: "input" | "translation") {
  switch (type) {
    case "input":
      copyText(inputValue.value);

      break;
    case "translation":
      copyText(translationResult.value);
      break;
  }
}

async function translation() {
  // NOTE: 拼接keyWord
  const keyWord = defaultKeyWordList.value
    .filter((x) => x.isCustom && x.isSelected)
    .map((x) => x.promptZH)
    .join(",");

  const { data } = await useFetch(`${ApiPrefix}/translate`).post({
    origin: keyWord ? inputValue.value + "," + keyWord : inputValue.value,
  });
  translationResult.value = JSON.parse(data.value as string).data;

  joinField();
}

function joinField() {
  // TODO: 拼接 params
  translationResult.value =
    translationResult.value +
    "," +
    defaultCardList.value
      .filter((x) => x.isSelected)
      .map((x) => x.promptEN)
      .join(",") +
    "," +
    defaultKeyWordList.value
      .filter((x) => x.isSelected && !x.isCustom)
      .map((x) => x.promptEN)
      .join(",") +
    "," +
    (dpiCustom.value
      ? `--ar ${dpiParams.height}:${dpiParams.width}`
      : defaultDpiList.value.filter((x) => x.isSelected)
      ? `--ar ${defaultDpiList.value[0].height}:${defaultDpiList.value[0].width}`
      : "--ar 1:1") +
    "," +
    paramsList.value
      .filter((x) => x.checked)
      .map((x) => x.parameter)
      .join(",") +
    "," +
    defaultImgList.value
      .filter((x) => x.isSelected)
      .map((x) => x.img)
      .join(",");
}

function onClickTag(item: DpiOptions) {
  dpiList.value.forEach((x) => (x.isSelected = false));
  if (item.options === "自定义") {
    dpiCustom.value = true;
  } else {
    dpiCustom.value = false;
    item.isSelected = !item.isSelected;
  }
}

async function onCloseCardDialog() {
  dialogVisible.card = false;
  await nextTick();
  cardCustomList.value = cardDialogRef.value?.cardCustomList;
}

async function onCloseDpiDialog() {
  dialogVisible.dpi = false;
  await nextTick();
  dpiCustomsList.value = dpiDialogRef.value?.dpiCustomsList;
}

async function onCloseKeyWordDialog() {
  dialogVisible.keyWord = false;
  await nextTick();
  keyWordCustomList.value = keywordDialogRef.value?.keyWordCustomList;
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
  <div class="logo" flex="~ col" justify-center items-center py-4>
    <h2 text-3xl font-mono>Midtool 米涂</h2>
    <p class="description" mt-8 color-gray-400>{{ description }}</p>
  </div>
  <header class="container-input" p="y-4 x-2">
    <div class="input-group" flex="~" justify-center items-stretch w="100%">
      <div
        class="sm:max-w-400px lg:max-w-800px xl:max-w-1000px 2xl:max-w-1300px"
        h-auto
        p-2
        flex="~ grow shrink wrap gap-2"
        border="3 gray-800 rounded-2"
      >
        <el-input
          style="width: calc(100% - 4rem)"
          v-model="inputValue"
          :autosize="{ minRows: 1, maxRows: 3 }"
          type="textarea"
          placeholder="The prompt will appear as it gets built. Give this your favorite AI!"
          @keypress.enter.prevent="translation"
        />
        <el-button type="primary" size="default" @click="copy('input')">
          <div class="i-carbon-copy"></div>
        </el-button>
        <div class="tooltiplist" flex="~ gap-3" p="y-2 b-0">
          <Tag
            v-for="item in tooltiplist"
            :content="item?.promptZH || item?.options || item?.img"
            :slice="16"
          ></Tag>
        </div>
      </div>
      <!-- <el-button type="primary" size="default" @click="translation"> 翻译 </el-button> -->
    </div>
    <div
      v-show="translationResult.length > 0"
      class="translation-result"
      flex="~"
      px-4
      mt-8
      justify-center
      items-start
    >
      <p color-gray-500 mr-4>翻译结果:</p>
      <code class="tracking-0.5px" color-gray-500 mx-2 max-w-2xl break-words>{{
        translationResult
      }}</code>
      <el-button class="copy" type="primary" size="default" @click="copy('translation')">
        <div class="i-carbon-copy"></div>
      </el-button>
    </div>
  </header>
  <main
    class="container-params ma px-4 sm:max-w-600px lg:max-w-1000px xl:max-w-1200px 2xl:max-w-1480px"
  >
    <div flex="~" mt-4 class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('card')">
        <p>选择作画风格</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div
      overflow-auto
      flex="~ gap-4"
      justify-start
      items-stretch
      will-change-scroll
      pt-4
      class="more"
    >
      <Card :data="defaultCardList"></Card>
    </div>
    <div flex="~" mt-4 mb-4 class="readmore-title" @click="onSelectAIParams('keyword')">
      <div cursor-pointer flex>
        <p>选择提示词</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
      <Tag content="填写" @click="onSelectAIParams('writekeyword')"></Tag>
      <Tag
        slice
        v-for="item in defaultKeyWordList"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        @click="item.isSelected = !item.isSelected"
      ></Tag>
    </div>
    <div flex="~" m="t-4 b-4" class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('dpi')">
        <p>选择画面比例</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap col" items-start class="more">
      <div flex="~ gap-3 wrap">
        <Tag content="自定义" @click="dpiCustom = !dpiCustom"></Tag>
        <Tag
          v-for="item in defaultDpiList"
          :content="item.options"
          :is-selected="item.isSelected"
          @click="onClickTag(item)"
        ></Tag>
      </div>
      <div v-if="dpiCustom" class="dpi-custom" flex="~" pl-2>
        <div mt-2>
          <p mb-2 text-neutral class="text-4.5">Width</p>
          <div class="dpi-custom-text">
            <el-input-number
              v-model="dpiParams.width"
              placeholder="Width"
              :controls="false"
              :min="0"
              :max="999999"
            ></el-input-number>
            <span class="input-group-text">px</span>
          </div>
        </div>
        <div mt-2 ml-8>
          <p mb-2 text-neutral class="text-4.5">Height</p>
          <div class="dpi-custom-text">
            <el-input-number
              v-model="dpiParams.height"
              placeholder="Height"
              :controls="false"
              :min="0"
              :max="999999"
            ></el-input-number>
            <span class="input-group-text">px</span>
          </div>
        </div>
      </div>
    </div>
    <div flex="~" mt-4 mb-4 class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('params')">
        <p>选择作画参数</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div class="more">
      <MidjourneyParams
        :data="paramsList"
        :is-hide-no-selected="true"
        :dialog-visible="dialogVisible.params"
      ></MidjourneyParams>
    </div>
    <div flex="~" mt-4 mb-4 class="readmore-title">
      <div cursor-pointer flex @click="onSelectAIParams('img')">
        <p>参考图片网址</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div
      class="more"
      p="y-4"
      overflow-auto
      flex="~ gap-4"
      justify-start
      items-stretch
      will-change-scroll
    >
      <ImgCard :data="defaultImgList"></ImgCard>
    </div>
  </main>
  <footer>
    <el-divider />
    <!-- dialog start ----------------- -->
    <el-dialog
      v-model="dialogVisible.card"
      top="30px"
      title="作画风格"
      width="70%"
      center
      draggable
      :close-on-click-modal="false"
    >
      <CardDialog
        ref="cardDialogRef"
        :list="cardList"
        :dialog-visible="dialogVisible.card"
      ></CardDialog>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="onCloseCardDialog">完成</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      title="输入提示词"
      v-model="dialogVisible.writeKeyWord"
      center
      width="35%"
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
      ></el-input>

      <template #footer>
        <span>
          <el-button
            :disabled="newKeyWordValue.length < 1"
            type="primary"
            @click="
            dialogVisible.writeKeyWord = false;
            defaultKeyWordList.push({
              promptZH: newKeyWordValue,
              isSelected: true,
              isCustom: true,
            } as CustomKeyWord);
            newKeyWordValue = '';
          "
            >完成</el-button
          >
        </span>
      </template>
    </el-dialog>
    <el-dialog
      title="提示词"
      v-model="dialogVisible.keyWord"
      center
      width="50%"
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
          <el-button type="primary" @click="onCloseKeyWordDialog">完成</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      title="画面比例"
      v-model="dialogVisible.dpi"
      center
      width="40%"
      destroy-on-close
      draggable
      :close-on-click-modal="false"
    >
      <DpiDialog
        ref="dpiDialogRef"
        :list="dpiList"
        :dialog-visible="dialogVisible.dpi"
      ></DpiDialog>
      <template #footer>
        <span>
          <el-button type="primary" @click="onCloseDpiDialog">完成</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      v-model="dialogVisible.params"
      top="30px"
      title="作画参数"
      width="80%"
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
          <el-button type="primary" @click="onCloseParamsDialog">完成</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      title="输入图片网址"
      v-model="dialogVisible.img"
      center
      width="40%"
      destroy-on-close
      draggable
      :close-on-click-modal="false"
    >
      <el-input
        type="textarea"
        v-model="newImgAddressValue"
        maxlength="300"
        show-word-limit
        placeholder="请输入网址"
        :autosize="{ minRows: 3, maxRows: 3 }"
      ></el-input>

      <template #footer>
        <span>
          <el-button
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
  </footer>
</template>

<style lang="scss" scoped>
.container-input {
  position: sticky;
  top: 0;
  z-index: 99;
  background-color: var(--el-fill-color-blank);
}
.readmore-title {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.5rem;
  font-family: "DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

.dpi-custom {
  &-text {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    width: 100%;

    :deep(.el-input__wrapper) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .input-group-text {
      display: flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5;
      color: #c9d1d9;
      text-align: center;
      white-space: nowrap;
      border-radius: 0.25rem;
      background-color: #e9ecef;
      border: 1px solid #ced4da;

      margin-left: -1px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}
</style>
