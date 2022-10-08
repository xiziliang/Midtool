<script setup lang="ts">
import { ref, reactive } from "vue";
import { cloneDeep } from "lodash";

import Card from "@/components/Card.vue";
import Tag from "@/components/Tag.vue";
import Parameters from "@/components/MidjourneyParams.vue";
import { getDpiList, getParamslist } from "@/assets/data";
import type { DpiOptions, Options, CustomKeyWord, CardItem } from "@/models";

import { useFetch } from "@vueuse/core";

const parameterRef = ref<InstanceType<typeof Parameters> | null>(null);

const description = ref("搜罗好词、词图预览、一键翻译，让AI画家更好的作画。");
const translationResult = ref("大家好大啊啊啊大大啊 大大啊啊啊大啊");
const inputValue = ref("");
const dpiOptions = ref<DpiOptions[]>(getDpiList());
const dpiCustom = ref(false);

const cardList = ref<CardItem[]>([]);
const keyWordList = ref<Partial<CustomKeyWord>[]>([]);
const paramsList = ref((getParamslist() as unknown) as Options[]);

const newKeyWordValue = ref<string>("");

const dialogVisible = reactive({
  params: false,
  keyWord: false,
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

function copy() {}

function translation() {
  console.log("translation");
}

function onClickTag(item: DpiOptions) {
  dpiOptions.value.forEach((x) => (x.isSelected = false));
  if (item.options === "自定义") {
    dpiCustom.value = true;
  } else {
    dpiCustom.value = false;
    item.isSelected = !item.isSelected;
  }
}

function onSelectParams() {
  dialogVisible.params = true;
}

function onCloseParamsDialog() {
  dialogVisible.params = false;
}

function onAddTag() {
  dialogVisible.keyWord = true;
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
        <el-button type="primary" size="default" @click="copy">
          <div class="i-carbon-copy"></div>
        </el-button>
        <div flex="~ gap-3" p="y-2 b-0">
          <Tag content="填写"></Tag>
          <Tag content="多彩的云"></Tag>
          <Tag content="宫崎骏"></Tag>
        </div>
      </div>
      <!-- <el-button type="primary" size="default" @click="translation"> 翻译 </el-button> -->
    </div>
    <div class="translation-result" flex="~" px-4 mt-8 justify-center items-center>
      <p color-gray-500 mr-4>翻译结果:</p>
      <div color-gray-500 mr-2>{{ translationResult }}</div>
      <el-button
        v-show="translationResult.length > 0"
        class="copy"
        type="primary"
        size="default"
        @click="copy"
      >
        <div class="i-carbon-copy"></div>
      </el-button>
    </div>
  </header>
  <main
    class="container-params ma px-4 sm:max-w-600px lg:max-w-1000px xl:max-w-1200px 2xl:max-w-1480px"
  >
    <div flex="~" mt-4 class="readmore-title">
      <div cursor-pointer flex @click="">
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
      <Card :data="cardList"></Card>
    </div>
    <div flex="~" mt-4 mb-4 class="readmore-title">
      <div cursor-pointer flex @click="onAddTag">
        <p>选择提示词</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
      <Tag content="填写" @click="onAddTag"></Tag>
      <Tag
        slice
        v-for="item in keyWordList"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        @click="item.isSelected = !item.isSelected"
      ></Tag>
    </div>
    <div flex="~" m="t-4 b-4" class="readmore-title">
      <div cursor-pointer flex @click="">
        <p>选择画面比例</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" items-start class="more">
      <Tag
        v-for="item in dpiOptions"
        :content="item.options"
        :is-selected="item.isSelected"
        @click="onClickTag(item)"
      ></Tag>
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
      <div cursor-pointer flex @click="onSelectParams">
        <p>选择作画参数</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div class="more">
      <Parameters
        :data="paramsList"
        :is-hide-no-selected="true"
        :dialog-visible="dialogVisible.params"
      ></Parameters>
    </div>
    <div flex="~" mt-4 mb-4 class="readmore-title" @click="">
      <div cursor-pointer flex @click="">
        <p>参考图片网址</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div
      class="more"
      overflow-auto
      flex="~ gap-4"
      justify-start
      items-stretch
      will-change-scroll
    >
      <Card :data="cardList"></Card>
    </div>
  </main>
  <footer>
    <el-divider />
  </footer>
  <!-- dialog start -->
  <el-dialog
    v-model="dialogVisible.params"
    top="30px"
    title="作画参数"
    width="80%"
    center
    :close-on-click-modal="false"
    @close="onCloseParamsDialog"
  >
    <Parameters
      ref="parameterRef"
      :data="cloneDeep(paramsList)"
      :dialog-visible="dialogVisible.params"
    ></Parameters>
    <template #footer>
      <span class="dialog-footer">
        <el-button
          type="primary"
          @click="
            dialogVisible.params = false;
            paramsList = parameterRef?.data;
          "
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>

  <el-dialog
    title="输入提示词"
    v-model="dialogVisible.keyWord"
    center
    width="35%"
    destroy-on-close
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
            dialogVisible.keyWord = false;
            keyWordList.push({
              promptZH: newKeyWordValue,
              isSelected: true,
              isCustom: true,
            });
            newKeyWordValue = '';
          "
          >完成</el-button
        >
      </span>
    </template>
  </el-dialog>
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
