import { ref, reactive, computed } from "vue";
import { cloneDeep } from 'lodash';

import type {
  DpiOptions,
  Options,
  KeyWord,
  CustomKeyWord,
  CardItem,
  ImgOptions,
  PromptTemplate,
} from "@/models";
import {
  DPI_CUSTOM_LIST,
  CARD_CUSTOM_LIST,
  PROMPT_CUSTOM_LIST,
  KEYWORD_CUSTOM_LIST,
  PARAM_CUSTOM_LIST,
  IMG_CUSTOM_LIST,
  KEYWORD_HISTORY_LIST,
  CARD_HISTORY_LIST,
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
  const promptList = ref<PromptTemplate[]>([]);

  const cardCustomList = useStorage<CardItem[]>(CARD_CUSTOM_LIST, [], localStorage);
  const promptCustomList = useStorage<PromptTemplate[]>(PROMPT_CUSTOM_LIST, [], localStorage);
  const keyWordCustomList = useStorage<CustomKeyWord[]>(
    KEYWORD_CUSTOM_LIST,
    [],
    localStorage
  );
  const dpiCustomsList = useStorage<DpiOptions[]>(DPI_CUSTOM_LIST, [], localStorage);
  const paramCustomsList = useStorage<Options[]>(PARAM_CUSTOM_LIST, [], localStorage);
  const imgCustomsList = useStorage<ImgOptions[]>(IMG_CUSTOM_LIST, [], localStorage);

  const cardHistoryList = useStorage<CardItem[]>(CARD_HISTORY_LIST, [], localStorage);
  const keyWordHistoryList = useStorage<CustomKeyWord[]>(
    KEYWORD_HISTORY_LIST,
    [],
    localStorage
  );

  const default5CardList = ref<CardItem[]>([]);
  const default5KeyWordList = ref<CustomKeyWord[]>([]);

  // TODO: 使用watch + ref
  const defaultCardList = computed(() => reactive([...cardCustomList.value, ...default5CardList.value]));
  const defaultPromptList = computed(() => reactive([...promptCustomList.value]));
  const defaultKeyWordList = computed(() => reactive([...keyWordCustomList.value, ...default5KeyWordList.value]));
  const defaultDpiList = computed(() => reactive([...dpiCustomsList.value]));
  const defaultParamList = computed(() => reactive([...paramCustomsList.value]));
  const defaultImgList = computed(() => reactive([...imgCustomsList.value]));
  const defaultCustomKeyWord = ref<CustomKeyWord[]>([]);

  // 默认权重数据
  const defaultWeightData = computed(() => [
    ...defaultKeyWordList.value,
    ...defaultCustomKeyWord.value,
    ...defaultCardList.value,
  ])

  // 默认所有数据
  const allDefaultData = computed(() => [
    ...defaultCardList.value,
    ...defaultKeyWordList.value,
    ...defaultDpiList.value,
    ...defaultParamList.value,
    ...defaultImgList.value,
    ...defaultCustomKeyWord.value,
  ])

  const tooltiplist = computed<(CardItem & DpiOptions & CustomKeyWord & ImgOptions)[]>(
    () => {
      return [].concat(
        defaultCardList.value.filter((x) => x.isSelected) as any || ([] as any),
        defaultPromptList.value.filter((x) => x.isSelected) as any || ([] as any),
        defaultKeyWordList.value.find((x) => x.isSelected) || ([] as any),
        [...defaultDpiList.value, dpiParams].find((x) => x.isSelected) || ([] as any),
        defaultImgList.value.find((x) => x.isSelected) || ([] as any)
      );
    }
  );

  function initCustomList() {
    [
      ...cardHistoryList.value, 
      ...keyWordHistoryList.value
    ].forEach(x => x.isSelected = false);
  }

  function formatData(data: CardItem[] & KeyWord[], _default = false) {
    _default ? data.forEach(x => x.isDefault = true) : null
    return data.map((x) => ({
      ...x,
      fileUrl: x.image === "yes" ? `/img-style/${x.promptEN}.png` : "/img-style/empty.png",
      weight: 1,
      showWeight: false,
    }));
  }

  async function fetchCardListData() {
    const { data } = await useFetch("/json/midjourneyStyle.json");
    default5CardList.value = formatData(JSON.parse(data.value as string), true).slice(0, 5);
    cardList.value = formatData(JSON.parse(data.value as string)).slice(5);
  }

  async function fetchPromptListData() {
    const { data } = await useFetch("/json/midjourneyStyle.json");
    promptList.value = JSON.parse(data.value as string);
  }
  
  async function fetchKeyWordData() {
    const { data } = await useFetch("/json/midjourneyPrompt.json");
    default5KeyWordList.value = formatData(JSON.parse(data.value as string), true).slice(0, 5) as CustomKeyWord[];
    keyWordList.value = formatData(JSON.parse(data.value as string)).slice(5);
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
    fetchPromptListData();
    fetchParamsData();
    fetchDpiData();

    initCustomList();
  }

  return {
    // json Data
    cardList,
    keyWordList,
    paramsList,
    dpiList,
    promptList,

    // Storage data
    cardCustomList,
    promptCustomList,
    keyWordCustomList,
    dpiCustomsList,
    paramCustomsList,
    imgCustomsList,
    keyWordHistoryList,
    cardHistoryList,

    // computed data
    defaultCardList,
    defaultKeyWordList,
    defaultDpiList,
    defaultParamList,
    defaultImgList,
    defaultCustomKeyWord,
    allDefaultData,
    // 默认有权重的数据
    defaultWeightData,
    tooltiplist,

    // 画面比例自定义
    dpiParams,

    // fn
    fetch
  }
}

export const useNovelAiData = () => {
  const promptTemplateList = ref<PromptTemplate[]>([]);
  const drawPeopleList = ref<CardItem[]>([]);
  const drawBodyList = ref<CardItem[]>([]);
  const drawStyleList = ref<CardItem[]>([]);
  /** 构图 */
  const composeKeyWord = ref<CustomKeyWord[]>([]);
  /** 正面  */
  const positiveKeyWord = ref<CustomKeyWord[]>([]);

  const defaultPromptTemplate = ref<PromptTemplate[]>([]);
  const defaultDrawPeople = ref<CardItem[]>([]);
  const defaultDrawBody = ref<CardItem[]>([]);
  const defaultDrawStyle = ref<CardItem[]>([]);
  const defaultComposeKeyWord = ref<CustomKeyWord[]>([]);
  const defaultPositiveKeyWord = ref<CustomKeyWord[]>([]);
  const defaultCustomKeyWord = ref<CustomKeyWord[]>([]);

  /** 所有的数据 */
  const allDefaultData = computed(() => [
    ...defaultPromptTemplate.value,
    ...defaultDrawPeople.value,
    ...defaultDrawBody.value,
    ...defaultDrawStyle.value,
    ...defaultComposeKeyWord.value,
    ...defaultPositiveKeyWord.value,
    ...defaultCustomKeyWord.value,
  ])

  const tooltiplist = computed(() => {
    return allDefaultData.value.filter(x => x.isSelected)
  })

  function formatData(data: any[]) {

    data.forEach(x => {
      x.weight = 1;
      x.showWeight = false;
    })

    return data;
  }

  function formatDefaultData(data: any[]) {

    data.forEach(x => {
      x.weight = 1;
      x.showWeight = false;
      // 默认数据
      x.isDefault = true;
    })

    return data;
  }

  async function fetchPrompt() {
    const { data } = await useFetch("/json/NovelAI_cankaotu.json");
    defaultPromptTemplate.value = cloneDeep(formatDefaultData(JSON.parse(data.value as string).slice(0, 5)));
    promptTemplateList.value = formatData(JSON.parse(data.value as string).slice(5));
  }
  async function fetchPeople() {
    const { data } = await useFetch("/json/NovelAI_huageren.json");
    defaultDrawPeople.value = cloneDeep(formatDefaultData(JSON.parse(data.value as string).slice(0, 5)));
    drawPeopleList.value = formatData(JSON.parse(data.value as string)).slice(5);
  }
  async function fetchBody() {
    const { data } = await useFetch("/json/NovelAI_huagewuti.json");
    defaultDrawBody.value = cloneDeep(formatDefaultData(JSON.parse(data.value as string).slice(0, 5)));
    drawBodyList.value = formatData(JSON.parse(data.value as string)).slice(5);
  }
  async function fetchStyle() {
    const { data } = await useFetch("/json/midjourneyStyle.json");
    defaultDrawStyle.value = cloneDeep(formatDefaultData(JSON.parse(data.value as string).slice(0, 5)));
    drawStyleList.value = formatData(JSON.parse(data.value as string)).slice(5);
  }
  async function fetchComposeKeyWord() {
    const { data } = await useFetch("/json/NovelAI_goutu.json");
    defaultComposeKeyWord.value = cloneDeep(formatDefaultData(JSON.parse(data.value as string).slice(0, 5)));
    composeKeyWord.value = formatData(JSON.parse(data.value as string)).slice(5);
  }
  async function fetchPositiveKeyWord() {
    const { data } = await useFetch("/json/NovelAI_zhengmiantag.json");
    defaultPositiveKeyWord.value = cloneDeep(formatDefaultData(JSON.parse(data.value as string).slice(0, 5)));
    positiveKeyWord.value = formatData(JSON.parse(data.value as string)).slice(5);
  }

  function fetch() {
    fetchPrompt();
    fetchPeople();
    fetchBody();
    fetchStyle();
    fetchComposeKeyWord();
    fetchPositiveKeyWord();
  }

  return {
    /** JSON数据 */
    promptTemplateList,
    drawPeopleList,
    drawBodyList,
    drawStyleList,
    composeKeyWord,
    positiveKeyWord,

    /** 默认展示数据 */
    defaultPromptTemplate,
    defaultDrawPeople,
    defaultDrawBody,
    defaultDrawStyle,
    defaultComposeKeyWord,
    defaultPositiveKeyWord,
    defaultCustomKeyWord,
    allDefaultData,

    /** input提示词 */
    tooltiplist,

    fetch,
  }
}
