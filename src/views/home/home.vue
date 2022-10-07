<script setup lang="ts">
import { ref, reactive } from "vue";

import Card from "@/components/Card.vue";
import Tag from "@/components/Tag.vue";
import Parameters from "@/components/MidjourneyParams.vue";
import { cardlist, keywordlist, dpiList, paramslist } from "@/assets/data";
import type { DpiOptions, Options } from "@/models";

const description = ref("搜罗好词、词图预览、一键翻译，让AI画家更好的作画。");
const translationResult = ref("大家好大啊啊啊大大啊 大大啊啊啊大啊");
const inputValue = ref("");
const dpiValue = ref("");
const dpiOptions = ref<DpiOptions[] | null>(dpiList);
const dpiCustom = ref(false);
const dpiParams = ref({
  width: undefined,
  height: undefined,
});

const cardList = ref(cardlist);
const keyWordList = ref(keywordlist);
const paramsList = ref((paramslist as unknown) as Options[]);
const dialogVisible = reactive({
  params: false,
});

function copy() {}

function translation() {}

function dpiChange(value: string) {
  if (value === "自定义") {
    dpiCustom.value = true;
  } else dpiCustom.value = false;
}

function onSelectParams() {
  dialogVisible.params = true;
}
</script>

<template>
  <div class="logo" flex="~ col" justify-center items-center py-4>
    <h2 text-3xl font-mono>Midtool 米涂</h2>
    <p class="description" mt-8 color-gray-400>{{ description }}</p>
  </div>
  <header class="container-input" py-4 px-2>
    <div class="input-group" flex="~" items-stretch w="100%">
      <el-input
        flex-1
        v-model="inputValue"
        placeholder="The prompt will appear as it gets built. Give this your favorite AI!"
      ></el-input>
      <el-button class="copy" type="primary" size="default" @click="copy">
        <div class="i-carbon-copy"></div>
      </el-button>

      <el-button type="primary" size="default" @click="translation"> 翻译 </el-button>
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
    <div flex="~" mt-4 cursor-pointer class="readmore-title">
      选择作画风格
      <div i-carbon:add></div>
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
      <Card v-model:data="cardList"></Card>
    </div>
    <div flex="~" mt-4 mb-4 cursor-pointer class="readmore-title">
      选择提示词
      <div i-carbon:add></div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
      <Tag content="填写"></Tag>
      <Tag v-for="item in keyWordList" :content="item"></Tag>
    </div>
    <div flex="~" mt-4 mb-4 cursor-pointer class="readmore-title">
      选择画面比例
      <div i-carbon:add></div>
    </div>
    <div class="more">
      <el-select v-model="dpiValue" placeholder="请选择画面比例" @change="dpiChange">
        <el-option
          v-for="item in dpiOptions"
          :key="item.options"
          :label="item.options"
          :value="item.options"
        >
          <span style="float: left">{{ item.options }}</span>
          <span v-if="item.width && item.height" style="float: right; font-size: 13px">{{
            item.width + " * " + item.height
          }}</span>
        </el-option>
      </el-select>
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
    <div flex="~" mt-4 mb-4 cursor-pointer class="readmore-title" @click="onSelectParams">
      选择作画参数
      <div i-carbon:add></div>
    </div>
    <div class="more">
      <Parameters
        :data="paramsList"
        :is-hide-no-selected="true"
        :dialog-visible="dialogVisible.params"
      ></Parameters>
    </div>
    <div flex="~" mt-4 mb-4 cursor-pointer class="readmore-title" @click="">
      参考图片网址
      <div i-carbon:add></div>
    </div>
    <div
      class="more"
      overflow-auto
      flex="~ gap-4"
      justify-start
      items-stretch
      will-change-scroll
    >
      <Card v-model:data="cardList"></Card>
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
  >
    <Parameters :data="paramsList" :dialog-visible="dialogVisible.params"></Parameters>
    <template #footer>
      <span class="dialog-footer">
        <el-button
          type="primary"
          :disabled="!paramsList.some((x) => x.checked)"
          @click="dialogVisible.params = false"
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
