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
