import { ref, reactive, computed } from "vue";

import type {
  DpiOptions,
  Options,
  CustomKeyWord,
  CardItem,
  ImgOptions,
  HistoryKeyWord,
} from "@/models";
import {
  DPI_CUSTOM_LIST,
  CARD_CUSTOM_LIST,
  KEYWORD_CUSTOM_LIST,
  PARAM_CUSTOM_LIST,
  IMG_CUSTOM_LIST,
  KEYWORD_HISTORY_LIST,
} from "@/constants";

import { useFetch, useStorage } from "@vueuse/core";

export const useMidJourneyData = () => {
  const dpiParams = reactive<{
    options: string;
    isSelected: boolean;
    isCustom: boolean;
    width: undefined | string;
    height: undefined | string;
  }>({
    options: "自定义",
    isSelected: false,
    isCustom: true,
    width: undefined,
    height: undefined,
  });

  const cardList = ref<CardItem[]>([]);
  const keyWordList = ref<Partial<CustomKeyWord>[]>([]);
  const paramsList = ref<Options[]>([]);
  const dpiList = ref<DpiOptions[]>([]);

  const cardCustomList = useStorage<CardItem[]>(CARD_CUSTOM_LIST, [], localStorage);
  const keyWordCustomList = useStorage<CustomKeyWord[]>(
    KEYWORD_CUSTOM_LIST,
    [],
    localStorage
  );
  const dpiCustomsList = useStorage<DpiOptions[]>(DPI_CUSTOM_LIST, [], localStorage);
  const paramCustomsList = useStorage<Options[]>(PARAM_CUSTOM_LIST, [], localStorage);
  const imgCustomsList = useStorage<ImgOptions[]>(IMG_CUSTOM_LIST, [], localStorage);

  const keyWordHistoryList = useStorage<HistoryKeyWord[]>(
    KEYWORD_HISTORY_LIST,
    [],
    localStorage
  );

  // TODO: 使用watch + ref
  const defaultCardList = computed(() => reactive([...cardCustomList.value]));
  const defaultKeyWordList = computed(() => reactive([...keyWordCustomList.value]));
  const defaultDpiList = computed(() => reactive([...dpiCustomsList.value]));
  const defaultParamList = computed(() => reactive([...paramCustomsList.value]));
  const defaultImgList = computed(() => reactive([...imgCustomsList.value]));

  const tooltiplist = computed<(CardItem & DpiOptions & CustomKeyWord & ImgOptions)[]>(
    () => {
      return [].concat(
        defaultCardList.value.find((x) => x.isSelected) || ([] as any),
        defaultKeyWordList.value.find((x) => x.isSelected) || ([] as any),
        [...defaultDpiList.value, dpiParams].find((x) => x.isSelected) || ([] as any),
        defaultImgList.value.find((x) => x.isSelected) || ([] as any)
      );
    }
  );

  // function initCustomList() {
  //   [
  //     ...cardCustomList.value,
  //     ...keyWordCustomList.value,
  //     ...keyWordHistoryList.value,
  //     ...dpiCustomsList.value,
  //     ...imgCustomsList.value,
  //   ].forEach((x) => (x.isSelected = false));
  // }

  function formatData(data: CardItem[]) {
    return data.map((x) => ({
      ...x,
      imgUrl: x.image === "yes" ? `/img-style/${x.promptEN}.png` : "/img-style/empty.png",
    }));
  }

  async function fetchCardListData() {
    const { data } = await useFetch("/json/midjourneyStyle.json");
    cardList.value = formatData(JSON.parse(data.value as string));
  }
  
  async function fetchKeyWordData() {
    const { data } = await useFetch("/json/midjourneyPrompt.json");
    keyWordList.value = JSON.parse(data.value as string);
  }
  
  async function fetchParamsData() {
    const { data } = await useFetch("/json/midjourneyParameter.json");
    paramsList.value = JSON.parse(data.value as string);
  }
  
  async function fetchDpiData() {
    const { data } = await useFetch("/json/midjourneyCanvas.json");
    dpiList.value = JSON.parse(data.value as string);
  }
  
  function fetch() {
    fetchKeyWordData();
    fetchCardListData();
    fetchParamsData();
    fetchDpiData();
  }

  return {
    // json Data
    cardList,
    keyWordList,
    paramsList,
    dpiList,

    // Storage data
    cardCustomList,
    keyWordCustomList,
    dpiCustomsList,
    paramCustomsList,
    imgCustomsList,
    keyWordHistoryList,

    // computed data
    defaultCardList,
    defaultKeyWordList,
    defaultDpiList,
    defaultParamList,
    defaultImgList,
    tooltiplist,

    // fn
    fetch
  }
}
