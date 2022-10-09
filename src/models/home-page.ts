export interface CardItem {
  Level1Label: string;
  KeyWord: string;
  KeyWord2: string;
  SecondLabel: string;
  promptZH: string;
  promptEN: string;
  imgName?: string;
  /** 是否主页选中 */
  isSelected?: boolean;
  /** 是否在dialog中选中 */
  isShow: boolean;
  /** 是否是用户自定义 */
  isCustom: boolean;
}

export interface DpiOptions {
  SecondLabel?: string | null;
  KeyWord2?: string | null;
  options: string;
  width?: string;
  height?: string;
  /** 是否主页选中 */
  isSelected?: boolean;
  /** 是否在dialog中选中 */
  isShow?: boolean;
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
  /** 是否在dialog中选中 */
  isShow: boolean;
}

 export interface CustomKeyWord extends KeyWord {
  isCustom: boolean;
}

export type OptionType = 'none' | 'textbox' | 'selector'| 'drag' | 'percentage';

export type AIParams = 'card' | 'keyword' | 'params' | 'dpi';

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
