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
  options: string;
  width?: number;
  height?: number;
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
}
