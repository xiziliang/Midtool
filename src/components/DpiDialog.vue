<script setup lang="ts">
import { watchEffect, reactive, computed } from "vue";
import { cloneDeep } from "lodash";

import { DPI_CUSTOM_LIST } from "@/constants";
import { useStorage } from "@vueuse/core";
import type { DpiOptions } from "@/models";
import Tag from "@/components/Tag.vue";

const props = defineProps<{
  list: DpiOptions[];
  dialogVisible: boolean;
}>();

const dpiCustomsList = useStorage<DpiOptions[]>(DPI_CUSTOM_LIST, [], localStorage);

const formatList = computed<Record<string, DpiOptions[]>>(() => {
  const obj: any = {};
  // NOTE: cloneDeep 可以中断响应式
  reactive(cloneDeep(props.list)).forEach((x) => {
    if (x.KeyWord2) {
      dpiCustomsList.value.some((item) => item.options === x.options)
        ? (x.isShow = true)
        : (x.isShow = false);
      if (obj[x.KeyWord2]) {
        obj[x.KeyWord2] = [...obj[x.KeyWord2], x];
      } else {
        obj[x.KeyWord2] = [x];
      }
    }
  });
  return obj;
});

watchEffect(() => {
  if (!props.dialogVisible) {
    console.log(1);
    dpiCustomsList.value = Object.values(formatList.value)
      .flat()
      .filter((x) => x.isShow);
  }
});

defineExpose({
  dpiCustomsList,
});
</script>
<template>
  <div p-4 v-for="(dpilist, label) in formatList">
    <div flex="~" mt-4 mb-4 class="readmore-title">
      <div flex>
        <p>{{ label }}</p>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
      <Tag
        v-for="item in dpilist"
        :content="item.options"
        :is-selected="item.isShow"
        @click="item.isShow = !item.isShow"
      ></Tag>
    </div>
  </div>
</template>
