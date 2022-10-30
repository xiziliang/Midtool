import { ElMessage } from "element-plus";

export async function copyText(value: string, { successMsg = '复制成功', errorMsg = '复制失败' } = {}) {
  let status: boolean;
  if (navigator.clipboard) {
    status = await navigator.clipboard.writeText(value).then(() => true, () => false);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    document.body.appendChild(textarea);
    textarea.select();
    status = document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  if (status) {
    ElMessage.success(successMsg);
  } else {
    ElMessage.error(errorMsg);
  }
}

/** 
 * 添加中英文括号
 * @param value 文字
 * @param weight 权重
 * @param lang 字体（默认英文）
 */
export function addParentheses(value: string, weight: number, lang: 'EN' | 'ZH' = 'EN') {
  const Parentheses = {
    EN: {
      leftP: '{',
      rightP: '}',
    },
    ZH: {
      leftP: '（',
      rightP: '）',
    }
  }
  return weight === 1 ? value : Parentheses[lang].leftP.repeat(weight) + value + Parentheses[lang].rightP.repeat(weight)
}
