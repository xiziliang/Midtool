export const cardlist = [
  {
    promptZH: 'Annibale Carracci',
    promptEN: 'Annibale Carracci',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Annibale_Carracci.webp',
    isSelected: false,
  },
  {
    promptZH: 'Anthony Van Dyck',
    promptEN: 'Anthony Van Dyck',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Anthony_Van_Dyck.webp',
    isSelected: false,
  },
  {
    promptZH: '黄飞鸿',
    promptEN: 'huangfeihong',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Anthony_Van_Dyck.webp',
    isSelected: false,
  },
  {
    promptZH: '鬼脚七',
    promptEN: 'guijiaoqi',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Anthony_Van_Dyck.webp',
  },
  {
    promptZH: '十三姨',
    promptEN: 'shisanyi',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Anthony_Van_Dyck.webp',
  },
  {
    promptZH: '李鸿章',
    promptEN: 'lihongzhang',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Anthony_Van_Dyck.webp',
  },
  {
    promptZH: '夜的第七章',
    promptEN: 'yedediqizhang',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Anthony_Van_Dyck.webp',
  },
  {
    promptZH: '发如雪',
    promptEN: 'faruxue',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Anthony_Van_Dyck.webp',
  },
  {
    promptZH: '超人不会飞',
    promptEN: 'chaorenbuhuifei',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Anthony_Van_Dyck.webp',
  },
  {
    promptZH: '夜曲',
    promptEN: 'yequ',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Anthony_Van_Dyck.webp',
  },
  {
    promptZH: '宫崎骏',
    promptEN: 'Hayao miyazaki',
    imgName: 'https://d3v6oh1fdmotvf.cloudfront.net/0-7-0/mj/landscape/by_Fernando_Botero.webp',
  },
]

export const keywordlist = ['绚丽多彩的', '五彩滨纷的'];

export const dpiList = [
  {
    options: 'A4',
    width: 2480,
    height: 3508,
  },
  {
    options: '自定义'
  }
];

export const paramslist = [
  {
    options: "测试模型", 
    type: "none",
    describe: "使用新的通用艺术测试模式。你得到两个使用正方形纵横比的图像；或者只是一个具有非方形纵横比的。",
    parameter: "--test",
    min: "",
    max: "",
    gap: "",
    option:"",
    checked: true,
  },
  {
    options: "图像权重", 
    type: "drag",
    describe: "默认图像权重为 0.25。Midjourney 仅支持单个图片权重参数，并且您必须至少有一个图片提示。",
    parameter: "--iw",
    min: "-10",
    max: "10",
    gap: "0.25",
    option: 0,
    checked: false,
  },
  {
    options: "随机种子", 
    type: "textbox",
    describe: "默认图像权重为 0.25。Midjourney 仅支持单个图片权重参数，并且您必须至少有一个图片提示。",
    parameter: "--seed",
    min: "",
    max: "",
    gap: "",
    option:"",
    checked: false,
  },
  {
    options: "停止", 
    type: "percentage", // drag
    describe: "默认图像权重为 0.25。Midjourney 仅支持单个图片权重参数，并且您必须至少有一个图片提示。",
    parameter: "--stop",
    min: "10",
    max: "100",
    gap: "1",
    option:"",
    checked: false,
  },
  {
    options: "质量", 
    type: "selector", // drag
    describe: "默认图像权重为 0.25。Midjourney 仅支持单个图片权重参数，并且您必须至少有一个图片提示。",
    parameter: "--q",
    min: "0.25",
    max: "5",
    gap: "",
    option: [0.25, 0.5, 1, 2, 5],
    value: 1,
    index: 2,
    checked: true,
  },
]
