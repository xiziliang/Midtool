<script setup lang="ts">
import { ref } from "vue";
import Card from "@/components/Card.vue";
import { cardlist } from "@/assets/data";

const description = ref("搜罗好词、词图预览、一键翻译，让AI画家更好的作画。");
const translationResult = ref("大家好大啊啊啊大大啊 大大啊啊啊大啊");
const inputValue = ref("");

const cardList = ref(cardlist);

function copy() {}

function translation() {}
</script>

<template>
  <div class="logo" flex="~ col" justify-center items-center py-4>
    <h2 text-3xl font-mono>Midtool 米涂</h2>
    <p class="description" mt-8 color-gray-400>{{ description }}</p>
  </div>
  <header class="container-input py-4 px-2">
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
    <div class="translation-result px-4 mt-8" flex="~" justify-center items-center>
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
    <div flex="~" class="ai-style readmore-title cursor-pointer">
      选择作画风格
      <div i-carbon:add></div>
    </div>
    <div class="more" overflow-auto flex="~ gap-3" justify-start items-stretch>
      <Card :data="cardList"></Card>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.container-input {
  position: sticky;
  top: 0;
  // z-index: 99;
}
.readmore-title {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.5rem;
  font-family: "DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
</style>
