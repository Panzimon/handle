import type { CellData, HintUsage } from '../types';

// 获取当前期数（基于日期）
function getDayNumber(): number {
  const start = new Date(2022, 0, 1);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

// 格式化时间为文本格式
export function formatTimeForText(elapsedTime: number): string {
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}分${seconds}秒`;
}

// 生成分享文本
export function generateShareText(
  grid: CellData[][],
  attempts: number,
  isWin: boolean,
  hintUsage: HintUsage,
  elapsedTime: number
): string {
  const dayNumber = getDayNumber();
  let text = `汉兜 · 第 ${dayNumber} 期\n`;

  // 添加提示状态
  if (hintUsage.used) {
    if (hintUsage.level === 1) {
      text += '🔤 拼音提示\n';
    } else if (hintUsage.level === 2) {
      text += '💡 汉字提示\n';
    }
  } else {
    text += '🏆 无提示辅助\n';
  }

  text += '\n';

  // 生成 emoji 矩阵
  const matrix = grid
    .filter(row => row.some(cell => cell.charState !== 'empty'))
    .map(row =>
      row.map(cell => {
        if (cell.charState === 'correct') return '🟩';
        if (cell.charState === 'present') return '🟨';
        return '⬜';
      }).join('')
    ).join('\n');

  text += matrix + '\n';

  // 添加结果
  if (isWin) {
    text += `\n用了 ${attempts} 次猜中！`;
  } else {
    text += '\n没猜出来，下次加油！';
  }

  // 添加计时信息
  text += `\n用时 ${formatTimeForText(elapsedTime)}`;

  return text;
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}
