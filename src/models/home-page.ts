export interface CardItem {
  Level1Label: string;
  KeyWord: string;
  KeyWord2: string;
  SecondLabel: string;
  promptZH: string;
  promptEN: string;
  imgName?: string;
  isSelected?: boolean;
}

export interface DpiOptions {
  SecondLabel?: string | null;
  KeyWord2?: string | null;
  options: string;
  width?: string;
  height?: string;
  isSelected?: boolean;
}



export interface KeyWord {
  Level1Label: string;
  KeyWord: string;
  SecondLabel: string;
  KeyWord2: string;
  promptZH: string;
  promptEN: string;
  isSelected: boolean;
}

 export interface CustomKeyWord extends KeyWord {
  isCustom: boolean;
}

export type OptionType = 'none' | 'textbox' | 'selector'| 'drag' | 'percentage';

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
