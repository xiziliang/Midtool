<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { TabsPaneContext } from "element-plus";
import { ElMessage } from "element-plus";

import TooltipTag from "@/components/TooltipTag.vue";
import { ApiPrefix, ReplaceKey } from "@/constants";
import { copyText, addParentheses } from "@/utils";
import { useFetch, useElementBounding, onClickOutside } from "@vueuse/core";
import { $routes } from "@/router";

import NovelAi from "../novelAi/novelAi.vue";
import MidJourney from "../midJourney/midJourney.vue";

type Instance = typeof MidJourney & typeof NovelAi;
// instance
const headerRef = ref<HTMLElement | null>(null);
const currentTabRef = ref<InstanceType<Instance>>();
const clearBtnRef = ref<HTMLElement | null>();

// computed
const tipsList = computed(() => currentTabRef.value?.tipsList || []);
const stringField = computed(() => currentTabRef.value?.stringField || "");

// hooks
const { top: headRefTop } = useElementBounding(headerRef);

onClickOutside(clearBtnRef, () => {
  clearBtnVisible.value = true;
});

// route
const router = useRouter();
const route = useRoute();
const currentRouter = computed({
  set: (value) => {
    console.log(value);
  },
  get: () => route.name,
});
const routerList = ref(
  $routes[0].children?.map((x) => ({
    title: x.meta?.title as string,
    name: x.name,
  }))
);

// input value
const loading = ref(false);
const inputValue = ref("");
const qq = ref(123456789);
const website = ref([
  {
    label: "midjourney",
    value: "https://www.midjourney.com/home/",
  },
  {
    label: "DreamStudio",
    value: "https://beta.dreamstudio.ai",
  },
  {
    label: "huggingface",
    value: "https://huggingface.co/spaces/lnyan/stablediffusion-infinity",
  },
  {
    label: "DALL·E 2",
    value: "https://openai.com/dall-e-2/",
  },
]);
const clearBtnVisible = ref(true);
/** 翻译结果 */
const translationResult = ref("");
/** 翻译展示字段 */
const translationShow = computed(() => {
  let others: string | undefined;
  if (translationResult.value) {
    return stringField.value.replace(ReplaceKey, translationResult.value + ",");
  } else {
    if (currentRouter.value === "novelAi") {
      // NOTE: 拼接自定义 keyWord
      others = currentTabRef.value?.others
        .map((x) => addParentheses(x.promptZH, x.weight))
        .join(" ");
    } else if (currentRouter.value === "midJourney") {
      // NOTE: 拼接自定义 keyWord
      others = currentTabRef.value?.others
        .map((x) => (x.weight === 0 ? x.promptZH : x.promptZH + ":" + x.weight))
        .join(" ");
    }

    return stringField.value.replace(ReplaceKey, others ? others + "," : "");
  }
});

function onClickTab(context: TabsPaneContext) {
  router.push({
    name: context.paneName as string,
  });
}

function copy(type: "input" | "translation") {
  switch (type) {
    case "input":
      if (inputValue.value) {
        copyText(inputValue.value);
      } else {
        let copyString = "";
        for (let i = 0; i < tipsList.value.length; i++) {
          copyString +=
            tipsList.value[i]?.promptZH ||
            tipsList.value[i]?.options ||
            tipsList.value[i]?.img;
          copyString += i == tipsList.value.length - 1 ? "" : "，";
        }
        copyText(String(copyString));
      }

      break;
    case "translation":
      copyText(translationShow.value);
      break;
  }
}

async function translation() {
  let others: string | undefined;

  if (currentRouter.value === "novelAi") {
    // NOTE: 拼接自定义 keyWord
    others = currentTabRef.value?.others
      .map((x) => addParentheses(x.promptZH, x.weight))
      .join(" ");
  } else if (currentRouter.value === "midJourney") {
    // NOTE: 拼接自定义 keyWord
    others = currentTabRef.value?.others
      .map((x) => (x.weight === 0 ? x.promptZH : x.promptZH + ":" + x.weight))
      .join(" ");
  }

  loading.value = true;
  const { data } = await useFetch(`${ApiPrefix}/translate`).post({
    origin: others ? inputValue.value + "," + others : inputValue.value,
  });
  loading.value = false;
  translationResult.value = JSON.parse(data.value as string).data;
  // translationResult.value = stringField.value.replace(
  //   ReplaceKey,
  //   JSON.parse(data.value as string).data
  // );
}

function onClickClearBtn() {
  clearBtnVisible.value = true;
  currentTabRef.value?.allDefaultData.forEach((x: any) => (x.isSelected = false));
  ElMessage.success("选中数据清空完成");
}
</script>

<template>
  <div class="home-page" style="min-height: calc(100vh - 180px)">
    <div class="logo" max-h-224px pt-30px overflow-hidden>
      <img w-572px ma src="@/assets/img/logo.png" alt="logo" />
      <div class="tips" p="t-2 x-2" absolute w-full top-0px flex>
        <label class="title" text-18px font-600
          ><span>搜罗好词、给词配图、一键翻译，让AI画家更好的作画</span></label
        >
        <!-- <span class="qq-style btn" text-12px m="l-a">
          <i class="icon-ren icon" mb-3px></i>
          QQ群 {{ qq }}</span
        > -->
      </div>
    </div>
    <header
      ref="headerRef"
      :style="{
        'box-shadow': headRefTop === 0 ? '0px 2px 16px rgba(0, 0, 0, 0.15)' : '',
      }"
      class="container-input"
      p="b-4 x-2 t-4"
    >
      <div class="input-group" flex="~" justify-center items-stretch w="100%">
        <div
          class="lt-md:max-w-500px md:max-w-688px search-input relative"
          h-auto
          p="x-0.2rem y-0.2rem"
          flex="~ grow shrink wrap gap-2"
          border="2 #222 rounded-12px"
        >
          <el-input
            text-16px
            style="width: calc(100% - 4rem)"
            v-model="inputValue"
            :autosize="{ minRows: 1, maxRows: 3 }"
            type="textarea"
            placeholder="这里描述画面，在下方选择标签"
            @keypress.enter.prevent="translation"
          />
          <el-button
            class="copy h-48px"
            type="primary"
            size="default"
            @click="copy('input')"
          >
            <div class="i-carbon-copy"></div>
          </el-button>
          <div
            v-show="tipsList.length"
            class="tooltiplist"
            flex="~ gap-2"
            p="b-16px x-15px"
          >
            <TooltipTag
              v-for="item in tipsList.slice(0, 5)"
              :content="item?.promptZH || item?.options || item?.img"
              :slice="16"
            ></TooltipTag>
            <TooltipTag v-show="tipsList.length > 5" content="..." />
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
        <div class="lt-md:w-600px md:w-784px" p="y-15px x-2px" flex="~ gap-3">
          <template v-if="!translationShow.length && !loading">
            <p class="color-[#aaa]">
              翻译结果: 点击翻译按钮，复制这里的英文，就可以去绘画啦
            </p>
          </template>
          <template v-if="loading">
            <i class="icon-loading icon"></i>
            <p class="color-[#aaa]">正在翻译...</p>
          </template>
          <template v-else-if="translationShow.length > 0 && !loading">
            <code
              class="tracking-0.5px w-37rem text-3line"
              color-dark-400
              text-20px
              break-words
              cursor-pointer
              @click="copy('translation')"
              >{{ translationShow }}</code
            >
            <el-button
              class="copy h-48px"
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
    <div
      class="container-params ma lt-lg:max-w-660px lg:max-w-828px xl:max-w-1176px 2xl:max-w-1336px"
    >
      <el-tabs class="home-tabs" v-model="currentRouter" @tab-click="onClickTab">
        <el-tab-pane v-for="route in routerList" :label="route.title" :name="route.name">
        </el-tab-pane>
      </el-tabs>
    </div>
    <RouterView v-slot="{ Component }">
      <component :ref="(el: any) => currentTabRef = el" :is="Component" />
    </RouterView>
  </div>
  <footer class="bg-[#333333] mt-52px">
    <div
      class="footer ma lt-lg:max-w-660px lg:max-w-828px xl:max-w-1176px 2xl:max-w-1332px"
      flex="~ col"
    >
      <div min-h-180px flex="~ col" justify-center p="t-18px b-8" text-white>
        <div p="y-4" text-20px>复制翻译结果后，可以去这些网站完成绘画</div>
        <div flex="~ gap-4" text-14px>
          <a v-for="item in website" :href="item.value" target="_black">{{
            item.label
          }}</a>
        </div>
      </div>
    </div>
    <div border="t-1 solid gray-700"></div>
    <div flex="~ col" relative>
      <div min-h-80px flex="~" justify-center items-center py-24px text-white>
        <p>我们还有很多想法，当然，我们更想听听你们的想法，这里有一份</p>
        <p text-emerald>问卷</p>
      </div>
      <el-button
        v-if="clearBtnVisible"
        w-128px
        h-38px
        text-14px
        class="cleatBtn"
        type="primary"
        @click="clearBtnVisible = false"
        >清空全部选中</el-button
      >
      <div v-else ref="clearBtnRef" class="cleatBtn" flex="~ col">
        <el-button w-128px text-14px @click="clearBtnVisible = true">取消清空</el-button>
        <el-button w-128px text-14px m-0 mt-30px type="primary" @click="onClickClearBtn"
          >确定</el-button
        >
      </div>
    </div>
  </footer>
</template>
<style scoped>
:deep(.container-input .el-textarea__inner) {
  color: #222;
  padding-left: 15px;
  padding-right: 15px;
  line-height: 1.4;
}

.cleatBtn {
  position: fixed;
  right: 30px;
  bottom: 30px;
}
.text-3line {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
