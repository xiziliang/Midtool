### midjourneyStyle -> 作画风格
- 如果image字段是yes，前度自动根据英文名去读取图片，如果为no，则自动填充empty.png
### midjourneyPrompt -> 提示词
### midjourneyParameter -> 参数

- 作画参数 数据比较特殊，就是除了type： none的，其他的数据option字段需要有默认值；

- type：selector时，需要遵循一下数据格式，option是数组, 表示目前可选的值有哪几个，value是默认值，index是默认值在option中的索引。

  如下图所示：

  ```json
    {
      "options": "质量",
      "type": "selector",
      "describe": "让你或多或少地给算法思考时间。它还会改变图像的成本。",
      "parameter": "--q",
      "min": "",
      "max": "",
      "gap": "",
      "option": [
        0.25,
        0.5,
        1,
        2,
        5
      ],
      "value": 1,
      "index": 2
    }
  ```

### midjourneyCanvas -> 画面比例

tips: keyword、keyword2都是必须的
