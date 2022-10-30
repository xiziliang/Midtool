<script setup lang="ts">
import { ref, watch } from "vue";
import type { PromptTemplate } from "@/models";
const props = defineProps<{
  detailData: PromptTemplate;
}>();
const data = ref();//全部数据
let dataZH = ref<string>();//promptZH
let detagEN = ref<string>()//detagEN
let dataEN = ref<string>();//promptEN
let imgClass = ref('header-img header-img-height');

defineExpose({
  data
});
function handleWeight(data:string){
  if(data){
    data = data.replace(/,/g, "，").replace(/[(]|[)]|[{]|[}]|[（]|[）]/g, "")
  }else {
    data = ""
  }
  return data
}
function imgLoad(img:object){
  let imgWidth = img.path[0].width;
  let imgHeight = img.path[0].height;
  if(imgWidth >= (imgHeight * 1.4)){
    imgClass.value = 'header-img'
  }else {
    imgClass.value = 'header-img header-img-height'
  }
}
watch(
  () => props.detailData,
  (value) => {
    if(value){
      data.value = value;
      dataZH.value = handleWeight(props.detailData.promptZH);
      detagEN.value = handleWeight(props.detailData.detagEN);
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
    <div :class="imgClass">
      <img :src="props.detailData.fileUrl" alt="" @load="imgLoad">
    </div>
    <div style="height: 230px">
      <div class="detail-title" p="x-25px t-8px">
        {{props.detailData.title}}
      </div>
      <div class="detail-tag-positive clamp2 detail-text" p="x-25px t-8px">
        正面tag：{{dataZH}}
      </div>
      <div class="detail-tag-side clamp2 detail-text" p="x-25px t-12px" v-if="detagEN">
        反面tag：{{detagEN}}
      </div>
      <div class="detail-tag-side clamp2 detail-text" p="x-25px t-12px" v-else>
        正面tag：{{dataEN}}
      </div>
      <div class="detail-tag-parameter clamp2 detail-text" p="x-25px t-12px" v-if="props.detailData.parameter">
        参数：{{props.detailData.parameter}}
      </div>
      <div class="detail-tag-author detail-text" p="x-25px t-12px" v-if="props.detailData.author">
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
  padding-bottom: calc((100vh - 64px) * 0.6);
  overflow: hidden;
  &.header-img-height {
    height: calc((100vh - 64px) * 0.6);
    padding-bottom: 0;
    img {
      height: 100%;
      width: auto;
      margin: 0 auto;
    }
  }
  img {
    width: 100%;
  }
}
.detail-box {
  border-radius: 28px;
  overflow: hidden;
}
</style>