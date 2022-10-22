<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { TabsPaneContext } from "element-plus";

import TooltipTag from "@/components/TooltipTag.vue";
import { ApiPrefix } from "@/constants";
import { copyText } from "@/utils";
import { useFetch, useElementBounding } from "@vueuse/core";
import { $routes } from "@/router";

import NovelAi from "../novelAi/novelAi.vue";
import MidJourney from "../midJourney/midJourney.vue";

type Instance = typeof MidJourney | typeof NovelAi;
// instance
const headerRef = ref<HTMLElement | null>(null);
const currentTabRef = ref<InstanceType<Instance>>();

// computed
// const tipsList = computed(() => currentTabRef.value?.tipsList || []);
// const stringField = computed(() => currentTabRef.value?.stringField || "");

// hooks
const { top: headRefTop } = useElementBounding(headerRef);

const router = useRouter();
const currentRouter = ref("novelAi");
const routerList = ref(
  $routes[0].children?.map((x) => ({
    title: x.meta?.title as string,
    name: x.name,
  }))
);
// input value
const loading = ref(false);
const inputValue = ref("");
const translationResult = ref("");
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

function onClickTab(context: TabsPaneContext) {
  console.log(context);
  router.push({
    name: context.paneName as string,
  });
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
  // const keyWord = currentTabRef.value?.defaultKeyWordList
  //   .filter((x) => x.isCustom && x.isSelected)
  //   .map((x) => x.promptZH)
  //   .join(",");
  // const keyWord = "";
  // loading.value = true;
  // const { data } = await useFetch(`${ApiPrefix}/translate`).post({
  //   origin: keyWord ? inputValue.value + "," + keyWord : inputValue.value,
  // });
  // loading.value = false;
  // translationResult.value =
  //   JSON.parse(data.value as string).data + "," + stringField.value;
}
</script>

<template>
  <div class="home-page" style="min-height: calc(100vh - 180px)">
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
          p="x-0.2rem y-0.2rem"
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
            class="copy hover:bg-gray-200 active:bg-gray-300 h-48px"
            type="primary"
            size="default"
            @click="copy('input')"
          >
            <div class="i-carbon-copy"></div>
          </el-button>
          <!-- <div
            v-show="tipsList.length"
            class="tooltiplist"
            flex="~ gap-3"
            p="b-20px x-20px"
          >
            <TooltipTag
              v-for="item in tipsList"
              :content="item?.promptZH || item?.options || item?.img"
              :slice="16"
            ></TooltipTag>
          </div> -->
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
        <div class="lt-md:w-600px md:w-790px" p="y-15px x-4px" flex="~ gap-3">
          <template v-if="!translationResult.length && !loading">
            <p color-gray-300>翻译结果: A lazy cat prone on the ground of the window</p>
          </template>
          <template v-if="loading">
            <i class="icon-loading icon"></i>
            <p color-gray-300>正在翻译...</p>
          </template>
          <template v-else-if="translationResult.length > 0 && !loading">
            <code class="tracking-0.5px w-36.7rem" color-gray-500 break-words>{{
              translationResult
            }}</code>
            <el-button
              class="copy hover:bg-gray-200 active:bg-gray-300 h-48px"
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
      <el-tabs v-model="currentRouter" @tab-click="onClickTab">
        <el-tab-pane v-for="route in routerList" :label="route.title" :name="route.name">
        </el-tab-pane>
      </el-tabs>
    </div>
    <RouterView v-slot="{ Component }">
      <component :ref="(el: any) => currentTabRef = el" :is="Component" />
    </RouterView>
  </div>
  <footer>
    <div class="footer bg-[#333333]" flex="~ col">
      <div min-h-180px flex="~ col" justify-center p="x-40 y-8" text-white>
        <div p="y-4">复制翻译结果后，可以去这些网站完成绘画</div>
        <div flex="~ gap-4">
          <a
            hover:color-gray-300
            v-for="item in website"
            :href="item.value"
            target="_black"
            >{{ item.label }}</a
          >
        </div>
      </div>
      <div></div>
    </div>
  </footer>
</template>
