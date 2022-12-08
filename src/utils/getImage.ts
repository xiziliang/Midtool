export function getImageUrl (url: string){
  const images = import.meta.glob([
    './midjourney_cankaotu/*',
    './NovelAI_cankaotu/*',
    './NovelAI_huageren/*',
    './NovelAI_huagewuti/*',
  ], { eager: true });
  const imageUrl = (Object.entries(images).find(x => x[0].includes(url))?.[1] as any)?.default;

  // NOTE: imageUrl是相对路径
  // NOTE: 通过相对路径我们就能得到一个被完整解析的静态资源 URL.
  return new URL(imageUrl, import.meta.url).href;
};
