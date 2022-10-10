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
  // NOTE: cloneDeep 会使数据变为非响应式
  reactive(cloneDeep(props.list)).forEach((x) => {
    if (x.KeyWord2) {
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

defineExpose({
  dpiCustomsList,
});
</script>
<template>
  <div p-4 v-for="(dpilist, label) in formatList">
    <div flex="~" mb-4 class="readmore-title">
      <div flex>
        <p>{{ label }}</p>
      </div>
    </div>
    <div flex="~ gap-3 wrap" justify-start items-stretch class="more">
      <Tag
        v-for="item in dpilist"
        :content="item.options"
        :is-selected="item.isSelected"
        @click="onSelect(item)"
      ></Tag>
    </div>
  </div>
</template>
