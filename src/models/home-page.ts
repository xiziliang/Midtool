export interface CardItem {
  Level1Label: string;
  KeyWord: string;
  KeyWord2: string;
  SecondLabel: string;
  promptZH: string;
  promptEN: string;
  image: 'yes' | 'no';
  imgUrl?: string;
  /** 是否主页选中 */
  isSelected?: boolean;
  /** 是否是用户自定义 */
  isCustom: boolean;
  /** 权重 */
  weight: number;
  /** 是否显示权重 */
  showWeight: boolean;
  /** 是否是默认展示在主页的数据 */
  isDefault?: boolean;
}

export interface PromptTemplate {
  Level1Label: string;
  KeyWord: string;
  SecondLabel: string
  KeyWord2: string;
  promptZH: string;
  promptEN: string;
  image: 'yes' | 'no';
  // imgUrl?: string;
  imageLocation: string;
  title: string;
  detagEN: string;
  parameter: string,
  author: string;
  isSelected?: boolean;
}

export interface DpiOptions {
  SecondLabel?: string | null;
  KeyWord2?: string | null;
  options: string;
  width?: string;
  height?: string;
  /** 是否主页选中 */
  isSelected?: boolean;
}

export interface KeyWord {
  Level1Label: string;
  KeyWord: string;
  SecondLabel: string;
  KeyWord2: string;
  promptZH: string;
  promptEN: string;
  /** 是否主页选中 */
  isSelected: boolean;
  /** 是否显示权重 */
  showWeight: boolean;
  /** 权重 */
  weight: number;
  /** 是否是默认展示数据 */
  isDefault?: boolean;
}

 export interface CustomKeyWord extends KeyWord {
  /** 是否为用户自定义 */
  isCustom: boolean;
}

export type OptionType = 'none' | 'textbox' | 'selector'| 'drag' | 'percentage';

export type MidJourneyParams = 'card' | 'keyword' | 'params' | 'dpi' | 'img';

export type NovelAiParams = 'prompt' | 'people' | 'body' | 'style' | 'composeKeyWord' | 'positiveKeyWord' | 'customKeyword';

interface Option {
  [key: string]: string;
}

export interface Options {
  options: string;
  type: OptionType;
  describe: string;
  parameter: string;
  option: Option;
  min: string;
  max: string;
  gap: string;
  index?: number;
  value?: number;
  checked?: boolean;
}

export interface ImgOptions {
  img: string;
  isSelected: boolean;
  imgLoadError?: boolean;
}
