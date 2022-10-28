import { ref, watch, computed, nextTick } from "vue";
import type { ComputedRef, Ref } from "vue";

import { useIntersectionObserver } from "@vueuse/core";

export function useTabScroll<T extends Array<any>>(allData: ComputedRef<T> | Ref<T>) {
  // instance
  const tab2Ref = ref<HTMLElement[] | null>();
  const scrollBoxRef = ref<HTMLElement[] | null>();

  const isClickScroll = ref(false);
  // tab-pane是否在页面中显示的映射
  const map = ref<Record<string, any>>({});
  // tab v-model
  const currentTab = ref<string | undefined>('');
  const currentTab2 = ref<string | undefined>('');

  // tab list
  const tabList = computed(() => Array.from(new Set(allData.value.map((x) => x.KeyWord))));
  const tab2List = computed(() => {
    return Array.from(
      new Set(
        allData.value.filter((x) => x.KeyWord === currentTab?.value).map((x) => x.KeyWord2)
      )
    );
  });

  /** 添加监听: 元素显示0r隐藏 */
  function addElementVisibility() {
    const scrollTarget = scrollBoxRef.value?.find((x) =>
      x.className.includes(currentTab.value!)
    );

    const targets = tab2Ref.value?.filter((x) => {
      return tab2List.value.includes(x.classList[1]);
    });

    targets?.forEach((x) => {
      const isVisible = ref(false);
      const { stop } = useIntersectionObserver(
        x,
        ([{ isIntersecting }]) => {
          isVisible.value = isIntersecting;
        },
        {
          root: scrollTarget,
        }
      );

      map.value[x.classList[1]] = {
        stop,
        isVisible,
      };
    });
  }

  function scrollTo(className: string) {
    document.getElementsByClassName(className)[0].scrollIntoView({
      behavior: "smooth",
    });
  }
  
  function clearScroll() {
    for (const key in map.value) {
      map.value[key].stop();
    }
    map.value = {};
  }

  watch(
    tabList,
    () => {
      currentTab.value = tabList?.value[0] as string;
    },
    { immediate: true }
  );
  
  watch(
    tab2List,
    async () => {
      if (!tab2List.value.length) return;
  
      currentTab2.value = tab2List.value[0] as string;
  
      await nextTick();
      currentTab2.value ? scrollTo(currentTab2.value) : undefined;
  
      clearScroll();
      addElementVisibility();
    },
    { immediate: true }
  );
  
  watch(
    map,
    () => {
      if (Object.entries(map.value).length < 0) return;
  
      if (isClickScroll.value) return;
  
      const firstShowEl = Object.entries(map.value).find((x) => x[1].isVisible);
      currentTab2.value = firstShowEl?.[0];
    },
    { deep: true }
  );

  return {
    tab2Ref,
    scrollBoxRef,

    isClickScroll,

    currentTab,
    currentTab2,

    tabList,
    tab2List,

    // fn
    scrollTo,
    clearScroll,
  }
}
