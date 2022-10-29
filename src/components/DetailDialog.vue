<script setup lang="ts">
import { ref, watch } from "vue";
import type { PromptTemplate } from "@/models";
const props = defineProps<{
  detailData: PromptTemplate;
}>();
const data = ref();//全部数据
const dataZH = ref<string>();//promptZH
const dataEN = ref<string>()//promptEN

defineExpose({
  data
});
function handleWeight(data:string){
  data = data.replace(/,/g, "，").replace(/[(]|[)]|[{]|[}]|[（]|[）]|\s*/g, "")
  return data
}
watch(
  () => props.detailData,
  (value) => {
    if(value){
      data.value = value;
      dataZH.value = handleWeight(props.detailData.promptZH);
      dataEN.value = handleWeight(props.detailData.promptEN);
    }
  },
  {
    immediate: true,
  }
);
</script>
<template>
  <div class="detail-box">
    <div class="header-img">
      <img :src="props.detailData.fileUrl" alt="">
    </div>
    <div style="height: 230px">
      <div class="detail-title" p="x-25px t-8px">
        {{props.detailData.title}}
      </div>
      <div class="detail-tag-positive clamp2 detail-text" p="x-25px t-8px">
        正面tag：{{dataZH}}
      </div>
      <div class="detail-tag-side clamp2 detail-text" p="x-25px t-12px">
        反面tag：{{dataEN}}
      </div>
      <div class="detail-tag-parameter clamp2 detail-text" p="x-25px t-12px">
        参数：{{props.detailData.detagEN}}
      </div>
      <div class="detail-tag-author detail-text" p="x-25px t-12px">
        作者：{{props.detailData.author}}
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.clamp2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  -webkit-line-clamp: 2;
}
.detail-title {
  font-weight: 600;
  color: #222;
  font-size: 16px;
  line-height: 24px;
}
.detail-text {
  color: #aaa;
  font-size: 14px;
  line-height: 22px;
}
.header-img {
  height: 0;
  width: 100%;
  display: block;
  padding-bottom: 50%;
  overflow: hidden;
  img {
    width: 100%;
  }
}
.detail-box {
  border-radius: 28px;
  overflow: hidden;
}
</style>