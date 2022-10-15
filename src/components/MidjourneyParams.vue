<script setup lang="ts">
import { ref, watch } from "vue";

type OptionType = "none" | "textbox" | "selector" | "drag" | "percentage";

interface Options {
  options: string;
  type: OptionType;
  describe: string;
  parameter: string;
  option: any;
  min: string;
  max: string;
  gap: string;
  index?: number;
  value?: number;
  checked?: boolean;
}
const props = defineProps<{
  data: Options[];
  /** 模态框是否显示 */
  dialogVisible: boolean;
  /** 是否隐藏没选元素 */
  isHideNoSelected?: boolean;
}>();

const data = ref();

defineExpose({
  data,
});

watch(
  () => props.dialogVisible,
  (value) => {
    if (value && !props.isHideNoSelected) {
      data.value = props.data;
    } else {
      data.value = props.data?.filter((x) => x.checked);
    }
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="params-list" flex="~ col" border-rd-1>
    <div v-for="item in data" :key="item.options" class="params-list-container">
      <div class="params-list-item">
        <el-checkbox v-model="item.checked">
          <label
            class="params-list-text"
            text-ellipsis
            cursor-pointer
            @click="item.checked = !item.checked"
          >
            <strong color-gray-9 mr-2>{{ item.options }}</strong>
            <small text="[0.95em]" inline-block p="x-2 y-1" rounded color-gray-9>{{
              item.parameter
            }}</small>
            <small class="color-[#AAAAAA]" text="[0.95em]" inline-block p-3>{{
              item.describe
            }}</small>
          </label>
        </el-checkbox>
        <template v-if="item.type === 'textbox'">
          <el-input
            v-model="item.option"
            @focus="item.checked = true"
            placeholder="设置生成初始化期间使用的伪随机噪声"
          ></el-input>
        </template>
        <template v-else-if="item.type === 'drag'">
          <el-slider
            v-model="item.option"
            :min="+item.min"
            :max="+item?.max"
            :step="+item?.gap"
            show-input
            :show-tooltip="false"
            :show-input-controls="false"
            @change="item.checked = true"
          />
        </template>
        <template v-else-if="item.type === 'selector'">
          <div flex="~">
            <el-slider
              class="mr-30px"
              v-model="item.index"
              :min="0"
              :max="(item.option as []).length - 1"
              :show-tooltip="false"
              @change="
              item.checked = true;
              item.value = (item.option as number[])[item.index || 0];
            "
            />
            <el-input
              class="w-130px flex-shrink-0"
              v-model="item.value"
              disabled
            ></el-input>
          </div>
        </template>
        <template v-else-if="item.type === 'percentage'">
          <el-slider
            class="percentage"
            v-model="item.option"
            :min="+item.min"
            :max="+item.max"
            :step="+item.gap"
            show-input
            :show-tooltip="false"
            :show-input-controls="false"
            @change="item.checked = true"
          />
        </template>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.params-list-item {
  color: #222222;
  background-color: #fff;
  border-color: #eaeff3;

  display: flex;
  flex-direction: column;
  row-gap: 0.75rem;

  border-bottom: 1px solid #eaeff3 !important;
  padding: 1rem 1rem;

  :deep(.el-checkbox) {
    column-gap: 0.75rem;
  }

  :deep(.el-checkbox__label) {
    text-overflow: ellipsis;
    overflow: hidden;
    color: inherit;
  }
}

.params-list-container:first-child > .params-list-item {
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.params-list-container:last-child > .params-list-item {
  border-bottom-right-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}

.params-list-text {
  width: calc(100% - 2rem);
}
.percentage {
  max-width: calc(100% - 32px);

  :deep(.el-input-number.el-slider__input) {
    width: 100px;
  }

  :deep(.el-input-number::after) {
    content: "%";
    position: absolute;
    right: -2rem;
    top: 0;
  }
}
</style>
