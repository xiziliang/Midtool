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
  HistoryKeyWord,
} from "@/models";
import {
  DPI_CUSTOM_LIST,
  CARD_CUSTOM_LIST,
  KEYWORD_CUSTOM_LIST,
  PARAM_CUSTOM_LIST,
  IMG_CUSTOM_LIST,
  KEYWORD_HISTORY_LIST,
  ApiPrefix,
} from "@/constants";

import { copyText } from "@/utils";
import { useFetch, useStorage, useElementBounding } from "@vueuse/core";

// instance
const parameterRef = ref<InstanceType<typeof MidjourneyParams> | null>(null);
const dpiDialogRef = ref<InstanceType<typeof DpiDialog> | null>(null);
const keywordDialogRef = ref<InstanceType<typeof KeywordDialog> | null>(null);
const cardDialogRef = ref<InstanceType<typeof CardDialog> | null>(null);
const headerRef = ref<HTMLElement | null>(null);

// hooks
const { top: headRefTop } = useElementBounding(headerRef);

const dpiCustom = ref(false);
const loading = ref(false);

// input value
const inputValue = ref("");
const translationResult = ref("");
const newKeyWordValue = ref("");
const newImgAddressValue = ref("");
const qq = ref(123456789);

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

const keyWordHistoryList = useStorage<HistoryKeyWord[]>(
  KEYWORD_HISTORY_LIST,
  [],
  localStorage
);

// TODO: 使用watch + ref
const defaultCardList = computed(() => reactive([...cardCustomList.value]));
const defaultKeyWordList = computed(() => reactive([...keyWordCustomList.value]));
const defaultDpiList = computed(() => reactive([...dpiCustomsList.value]));
const defaultParamList = computed(() => reactive([...paramCustomsList.value]));
const defaultImgList = computed(() => reactive([...imgCustomsList.value]));

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

initCustomList();
fetch();

function initCustomList() {
  [
    ...cardCustomList.value,
    ...keyWordCustomList.value,
    ...keyWordHistoryList.value,
    ...dpiCustomsList.value,
    ...imgCustomsList.value,
  ].forEach((x) => (x.isSelected = false));
}

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
  loading.value = true;
  const { data } = await useFetch(`${ApiPrefix}/translate`).post({
    origin: keyWord ? inputValue.value + "," + keyWord : inputValue.value,
  });
  loading.value = false;
  translationResult.value = JSON.parse(data.value as string).data;

  joinField();
}

function joinField() {
  // TODO: 拼接 params 去掉多余逗号
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
      : defaultDpiList.value.filter((x) => x.isSelected).length
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

function onDelete(value: string) {
  const index = defaultKeyWordList.value.findIndex(
    (x) => x.isCustom && x.promptZH === value
  );

  defaultKeyWordList.value.splice(index, 1);
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
  dpiCustomsList.value = dpiDialogRef.value?.dpiCustomsList;
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
  <div class="home-page">
    <div class="logo" max-h-194px pt-4 overflow-hidden>
      <img w-572px ma src="@/assets/img/logo.png" alt="logo" />
      <div class="tips" p="t-2 x-2" absolute w-full top-0px flex>
        <label class="title" text-18px font-600
          ><span>prompt</span> <span>Tool</span> <span>词图</span></label
        >
        <span class="qq-style btn" m="l-a">
          <i class="icon-ren icon" mb-3px></i>
          QQ群 {{ qq }}</span
        >
      </div>
    </div>
    <header
      ref="headerRef"
      :style="{
        'box-shadow': headRefTop === 0 ? '0px 2px 16px rgba(0, 0, 0, 0.15)' : '',
      }"
      class="container-input"
      p="y-4 x-2"
    >
      <div class="input-group" flex="~" justify-center items-stretch w="100%">
        <div
          class="lt-md:max-w-500px md:max-w-688px search-input relative"
          h-auto
          p-2
          flex="~ grow shrink wrap gap-2"
          border="3 gray-800 rounded-12px"
        >
          <el-input
            text-16px
            style="width: calc(100% - 4rem)"
            v-model="inputValue"
            :autosize="{ minRows: 1, maxRows: 3 }"
            type="textarea"
            placeholder="搜罗好词、给词配图、一键翻译，让AI画家更好的作画。"
            @keypress.enter.prevent="translation"
          />
          <el-button
            class="copy hover:bg-gray-200 active:bg-gray-300"
            type="primary"
            size="default"
            @click="copy('input')"
          >
            <div class="i-carbon-copy"></div>
          </el-button>
          <div v-show="tooltiplist.length" class="tooltiplist" flex="~ gap-3" p="y-2 b-0">
            <Tag
              v-for="item in tooltiplist"
              :content="item?.promptZH || item?.options || item?.img"
              :slice="16"
            ></Tag>
          </div>
        </div>
        <el-button
          p="x-40px y-20px"
          m="l-2"
          text-24px
          h-60px
          type="primary"
          @click="translation"
        >
          翻译
        </el-button>
      </div>
      <div class="translation-result" flex="~" px-4 justify-center items-start>
        <div
          class="lt-md:w-600px md:w-790px"
          p="y-15px x-4px"
          flex="~ gap-3"
          items-center
        >
          <template v-if="!translationResult.length && !loading">
            <p color-gray-300>翻译结果: A lazy cat prone on the ground of the window</p>
          </template>
          <template v-if="loading">
            <i class="icon-loading icon"></i>
            <p color-gray-300>正在翻译...</p>
          </template>
          <template v-else-if="translationResult.length > 0 && !loading">
            <code class="tracking-0.5px" color-gray-500 max-w-38rem break-words>{{
              translationResult
            }}</code>
            <el-button
              class="copy hover:bg-gray-200 active:bg-gray-300"
              type="primary"
              size="default"
              @click="copy('translation')"
            >
              <div class="i-carbon-copy"></div>
            </el-button>
          </template>
        </div>
      </div>
    </header>
    <main
      class="container-params ma lt-lg:max-w-660px lg:max-w-828px xl:max-w-1176px 2xl:max-w-1332px"
    >
      <div flex="~" mt-4 class="readmore-title">
        <div cursor-pointer flex @click="onSelectAIParams('card')">
          <p><i class="icon-fengge icon-big mr-4px"></i>选择作画风格</p>
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
        pt-4
        class="more"
      >
        <Card :data="defaultCardList"></Card>
      </div>
      <div flex="~" mt-4 mb-4 class="readmore-title" @click="onSelectAIParams('keyword')">
        <div cursor-pointer flex>
          <p><i class="icon-tishici icon-big mr-2"></i>选择提示词</p>
          <div i-carbon:add></div>
        </div>
      </div>
      <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
        <Tag content="填写" @click="onSelectAIParams('writekeyword')"></Tag>
        <Tag
          slice
          tooltip
          v-for="item in defaultKeyWordList"
          :content="item.promptZH!"
          :is-selected="item.isSelected"
          :is-custom="item.isCustom"
          @click="item.isSelected = !item.isSelected"
          @delete="onDelete"
        ></Tag>
      </div>
      <div flex="~" m="t-4 b-4" class="readmore-title">
        <div cursor-pointer flex @click="onSelectAIParams('dpi')">
          <p><i class="icon-bili icon-big mr-2"></i>选择画面比例</p>
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
          <p><i class="icon-canshu icon-big mr-2"></i>选择作画参数</p>
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
          <p><i class="icon-wangzhi icon-big mr-2"></i>参考图片网址</p>
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
            <el-button class="dialogBtn" type="primary" @click="onCloseKeyWordDialog"
              >完成</el-button
            >
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
        width="30%"
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
          :autosize="{ minRows: 3, maxRows: 3 }"
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
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.search-input::before {
  content: url(/src/assets/img/jiantou.png);
  position: absolute;
  width: 30px;
  height: 30px;
  left: -12px;
  bottom: -25px;
  transform: scale(0.5);
}
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
