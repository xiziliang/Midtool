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
}

 export interface CustomKeyWord extends KeyWord {
  /** 是否为用户自定义 */
  isCustom: boolean;
}

export interface HistoryKeyWord extends CustomKeyWord {
  /** 是否删除 */
  isDelete: boolean;
}

export type OptionType = 'none' | 'textbox' | 'selector'| 'drag' | 'percentage';

export type AIParams = 'card' | 'keyword' | 'params' | 'dpi' | 'img';

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
}
