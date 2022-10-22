export function getImageUrl (url: string){
  const images = import.meta.glob([
    './midjourney_cankaotu/*',
    './NovelAI_cankaotu/*',
    './NovelAI_huageren/*',
    './NovelAI_huagewuti/*',
  ], { eager: true });
  const imageUrl = (Object.entries(images).find(x => x[0].includes(url))?.[1] as any)?.default;

  return new URL(imageUrl, import.meta.url).href;
};
