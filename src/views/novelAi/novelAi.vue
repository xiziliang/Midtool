<script setup lang="ts">
import { ref, reactive, nextTick, computed, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { cloneDeep } from "lodash";

import type {
  NovelAiParams,
  HistoryKeyWord,
  DpiOptions,
  CustomKeyWord,
  CardItem,
} from "@/models";

import Card from "@/components/Card.vue";
import Tag from "@/components/Tag.vue";
import PromptItem from "@/components/PromptItem.vue";
import KeywordDialog from "@/components/KeywordDialog.vue";
import PromptTemplateDialog from "@/components/PromptTemplateDialog.vue";
import CardDialog from "@/components/CardDialog.vue";

import { useEventListener } from "@vueuse/core";
import { useNovelAiData } from "@/hooks";

const clearUp = useEventListener("click", clearWeight);

onBeforeUnmount(() => {
  clearUp();
});

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

  fetch,
} = useNovelAiData();

fetch();

const newCustomKeyWord = ref("");
const newComposeKeyWord = ref("");
const newPositiveKeyWord = ref("");

const currentShowWeightTag = ref("");

const dialogVisible = reactive({
  prompt: false,
  people: false,
  body: false,
  style: false,
  composeKeyWord: false,
  positiveKeyWord: false,

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
  currentShowWeightTag.value = "";
}

function onShowWeightTag(content: string, item: CustomKeyWord) {
  item.isSelected = !item.isSelected;
  if (currentShowWeightTag.value === content) return;

  currentShowWeightTag.value = content;
  allDefaultData.value.forEach((x: any) => (x.showWeight = false));
  item.showWeight = true;
}

function onReduceWeight(weight: number, item: any) {
  item.weight = weight - 1;
}

function onAddWeight(weight: number, item: any) {
  item.weight = weight + 1;
}

function closeDislog() {
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

defineExpose({
  tipsList: [
    {
      promptZH: "",
      options: "",
      img: "",
    },
  ],
  stringField: "",
});
</script>

<template>
  <main
    class="container-params ma lt-lg:max-w-660px lg:max-w-828px xl:max-w-1176px 2xl:max-w-1336px"
    mb-60px
  >
    <div flex="~" mt-4 class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('prompt')">
        <p><i class="icon-fengge icon-big mr-4px"></i>选择参考图</p>
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
    >
      <div
        class="card prompt-item no-mark-tag"
        v-for="item in defaultPromptTemplate"
        :key="item.promptEN"
        :class="{ selected: item.isSelected }"
        @click="item.isSelected = !item.isSelected"
      >
        <PromptItem v-bind="item" />
      </div>
    </div>
    <div flex="~" mt-28px mb-5px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('people')">
        <p><i class="icon-tishici icon-big mr-2"></i>画个人</p>
        <div i-carbon:add></div>
        <p self-center text-14px class="text-[#AAAAAA]">
          角色/身份/头发/面部/姿势/情绪/衣着...
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
      <Card :data="defaultDrawPeople"></Card>
    </div>
    <div flex="~" mt-28px mb-5px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('body')">
        <p><i class="icon-tishici icon-big mr-2"></i>画个物体</p>
        <div i-carbon:add></div>
        <p self-center text-14px class="text-[#AAAAAA]">添加物体/只画物体</p>
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
      <Card :data="defaultDrawBody"></Card>
    </div>
    <div flex="~" mt-28px mb-5px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('style')">
        <p><i class="icon-tishici icon-big mr-2"></i>画风</p>
        <div i-carbon:add></div>
        <p self-center text-14px class="text-[#AAAAAA]">动漫绘画为主</p>
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
      <Card :data="defaultDrawStyle"></Card>
    </div>
    <div flex="~" mt-28px mb-5px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('composeKeyWord')">
        <p><i class="icon-tishici icon-big mr-2"></i>构图</p>
        <div i-carbon:add></div>
        <p self-center text-14px class="text-[#AAAAAA]">焦距/距离/灯光...</p>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
      <Tag
        class="no-mark-tag"
        content="自定义"
        @click="onSelectParams('writeComposeKeyWord')"
      >
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="item in defaultComposeKeyWord"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        :weight="item.weight"
        :show-weight="item.showWeight"
        @click.stop.self
        @reduce-weight="(value) => onReduceWeight(value, item)"
        @add-weight="(value) => onAddWeight(value, item)"
        @click-tag="(value) => onShowWeightTag(value, item)"
      ></Tag>
    </div>
    <div flex="~" mt-28px mb-8px class="readmore-title">
      <div cursor-pointer flex @click="onSelectParams('positiveKeyWord')">
        <p><i class="icon-tishici icon-big mr-2"></i>正面tag</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
      <Tag
        class="no-mark-tag"
        content="自定义"
        @click="onSelectParams('writePositiveKeyWord')"
      >
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="item in defaultPositiveKeyWord"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        :weight="item.weight"
        :show-weight="item.showWeight"
        @click.stop.self
        @reduce-weight="(value) => onReduceWeight(value, item)"
        @add-weight="(value) => onAddWeight(value, item)"
        @click-tag="(value) => onShowWeightTag(value, item)"
      ></Tag>
    </div>
    <div flex="~" mt-28px mb-8px class="readmore-title">
      <div cursor-pointer flex>
        <p><i class="icon-tishici icon-big mr-2"></i>自己添加</p>
        <div i-carbon:add></div>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
      <Tag
        class="no-mark-tag"
        content="自定义"
        @click="onSelectParams('writeCustomKeyWord')"
      >
        <template #icon> <i class="icon-zidingyi icon"></i></template>
      </Tag>
      <Tag
        slice
        v-for="item in defaultCustomKeyWord"
        :content="item.promptZH!"
        :is-selected="item.isSelected"
        :is-custom="item.isCustom"
        :weight="item.weight"
        :show-weight="item.showWeight"
        @click.stop.self
        @reduce-weight="(value) => onReduceWeight(value, item)"
        @add-weight="(value) => onAddWeight(value, item)"
        @click-tag="(value) => onShowWeightTag(value, item)"
      ></Tag>
    </div>
  </main>
  <!-- dialog start ----------------->
  <el-dialog
    v-model="dialogVisible.prompt"
    top="30px"
    title="选择参考图"
    width="70%"
    center
    draggable
    destroy-on-close
    :close-on-click-modal="false"
  >
    <PromptTemplateDialog />
    <template #footer>
      <span class="dialog-footer">
        <el-button class="dialogBtn" type="primary">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="画个人"
    v-model="dialogVisible.people"
    top="30px"
    center
    width="70%"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="画个物体"
    v-model="dialogVisible.body"
    top="30px"
    center
    width="70%"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="画风"
    v-model="dialogVisible.style"
    top="30px"
    center
    width="70%"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="构图"
    v-model="dialogVisible.composeKeyWord"
    center
    width="50%"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <KeywordDialog
      :list="composeKeyWord"
      :dialog-visible="dialogVisible.composeKeyWord"
    ></KeywordDialog>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="正面tag"
    v-model="dialogVisible.positiveKeyWord"
    center
    width="50%"
    destroy-on-close
    draggable
    :close-on-click-modal="false"
  >
    <KeywordDialog
      :list="positiveKeyWord"
      :dialog-visible="dialogVisible.positiveKeyWord"
    ></KeywordDialog>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="添加构图"
    v-model="dialogVisible.writeComposeKeyWord"
    center
    width="30%"
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
    ></el-input>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="添加正面tag"
    v-model="dialogVisible.writePositiveKeyWord"
    center
    width="30%"
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
    ></el-input>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary">完成</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="自己添加"
    v-model="dialogVisible.writeCustomKeyWord"
    center
    width="30%"
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
    ></el-input>
    <template #footer>
      <span>
        <el-button class="dialogBtn" type="primary">完成</el-button>
      </span>
    </template>
  </el-dialog>
</template>
