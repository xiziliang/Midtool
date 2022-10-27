<script setup lang="ts">
import { watchEffect, reactive, computed, ref } from "vue";
import { cloneDeep } from "lodash";

import { DPI_CUSTOM_LIST } from "@/constants";
import { useStorage } from "@vueuse/core";
import type { DpiOptions } from "@/models";
import Tag from "@/components/Tag.vue";

const props = defineProps<{
  list: DpiOptions[];
  dpiCustom: any;
  dialogVisible: boolean;
}>();

const dpiCustom = reactive({
  ...props.dpiCustom,
});

const dpiCustomsList = useStorage<DpiOptions[]>(DPI_CUSTOM_LIST, [], localStorage);

function sizeInputWidthFocusFun() {
  sizeInputWidthClass.value = "input-focus";
}
function sizeInputHeightFocusFun() {
  sizeInputHeightClass.value = "input-focus";
}
function sizeInputWidthBlurFun() {
  sizeInputWidthClass.value = "";
}
function sizeInputHeightBlurFun() {
  sizeInputHeightClass.value = "";
}
const sizeInputWidthClass = ref("");
const sizeInputHeightClass = ref("");

const formatList = computed<Record<string, DpiOptions[]>>(() => {
  const obj: any = {};
  // NOTE: cloneDeep 会使数据变为非响应式
  reactive(cloneDeep(props.list)).forEach((x) => {
    if (x.KeyWord2) {
      // NOTE: 使用数据覆盖
      // dpiCustomsList.value.forEach((x) => {
      //   const item = props.list.find((y) => y.options === x.options);
      //   if (item) Object.assign(item, x);
      // });
      dpiCustomsList.value.some((item) => item.options === x.options && item.isSelected)
        ? (x.isSelected = true)
        : (x.isSelected = false);
      if (obj[x.KeyWord2]) {
        obj[x.KeyWord2] = [...obj[x.KeyWord2], x];
      } else {
        obj[x.KeyWord2] = [x];
      }
    }
  });
  return obj;
});

function onSelect(item: DpiOptions) {
  Object.values(formatList.value)
    .flat()
    .forEach((x) => (x.isSelected = false));
  item.isSelected = true;
}

watchEffect(() => {
  if (!props.dialogVisible) {
    dpiCustomsList.value = Object.values(formatList.value)
      .flat()
      .filter((x) => x.isSelected);
  }
});

defineEmits(["childCloseDpiDialog"]);

defineExpose({
  dpiCustomsList,
  dpiCustom,
});
</script>
<template>
  <div h-full overflow-auto will-change-scroll>
    <div p="x-4 t-4 b-2">
      <div flex="~" mb-4 class="readmore-title">
        <div flex>
          <p class="readmore-title-dialog">添加尺寸/比例</p>
        </div>
      </div>
      <div flex="~ gap-3 wrap" justify-start items-stretch class="more size-box">
        <div flex="~ gap-3" max-w-156px items-center>
          <el-input
            :class="sizeInputWidthClass"
            v-model="dpiCustom.width"
            oninput="value=value.replace(/[^0-9.]/g,'')"
            @focus="sizeInputWidthFocusFun"
            @blur="sizeInputWidthBlurFun"
          >
            <template #prepend>宽:</template>
          </el-input>
        </div>
        <div flex="~ gap-3" max-w-156px items-center>
          <el-input
            v-model="dpiCustom.height"
            oninput="value=value.replace(/[^0-9.]/g,'')"
            @focus="sizeInputHeightFocusFun"
            @blur="sizeInputHeightBlurFun"
            :class="sizeInputHeightClass"
          >
            <template #prepend>高:</template>
          </el-input>
        </div>
        <div flex="~ gap-3">
          <el-button
            class="sizeBtn"
            :disabled="!(dpiCustom.width && dpiCustom.height)"
            type="primary"
            @click="$emit('childCloseDpiDialog')"
            >完成</el-button
          >
        </div>
      </div>
    </div>
    <div p="x-4 t-4 b-2" v-for="(dpilist, label) in formatList">
      <div flex="~" mb-4 class="readmore-title">
        <div flex>
          <p class="readmore-title-dialog">{{ label }}</p>
        </div>
      </div>
      <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
        <Tag
          class="no-mark-tag"
          v-for="item in dpilist"
          type="dpi"
          :content="item.options"
          :is-selected="item.isSelected"
          @click="onSelect(item)"
        >
          <span class="text-[#AAAAAA]">{{ item.width }} : {{ item.height }}</span>
        </Tag>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.readmore-title-dialog {
  margin-bottom: 8px;
  font-size: 16px;
  line-height: 32px;
  font-weight: 700;
  color: #222;
}
.size-box {
  :deep(.el-input-group__prepend) {
    background-color: #fff;
    padding-right: 10px;
    padding-left: 15px;
  }
  :deep(.el-input__wrapper) {
    padding-left: 0;
    box-shadow: none;
  }
  :deep(.el-input-group__prepend) {
    box-shadow: none;
  }
  .el-input,
  .el-button {
    height: 38px;
  }
  .el-input {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    &.input-focus {
      border-color: rgb(13, 215, 144);
    }
  }
}
</style>
