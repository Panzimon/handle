import html2canvas from 'html2canvas';
import type { CellData, HintUsage } from '../types';

// 获取当前期数（基于日期）
function getDayNumber(): number {
  const start = new Date(2022, 0, 1);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

// 提示状态配置
const HINT_STATUS_CONFIG = {
  0: {
    icon: '🏆',
    text: '无提示辅助',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  1: {
    icon: '🔤',
    text: '拼音提示',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  2: {
    icon: '💡',
    text: '汉字提示',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
};

// 创建分享图片 DOM 元素
export function createShareImageElement(
  grid: CellData[][],
  attempts: number,
  isWin: boolean,
  hintUsage: HintUsage,
  elapsedTime: number
): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 320px;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: white;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  `;

  // 标题
  const title = document.createElement('div');
  title.style.cssText = `
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 12px;
  `;
  title.textContent = `汉兜 · 第 ${getDayNumber()} 期`;
  container.appendChild(title);

  // 提示状态徽章
  const config = hintUsage.used ? HINT_STATUS_CONFIG[hintUsage.level as keyof typeof HINT_STATUS_CONFIG] || HINT_STATUS_CONFIG[1] : HINT_STATUS_CONFIG[0];
  const badgeWrapper = document.createElement('div');
  badgeWrapper.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    width: 100%;
  `;

  const badge = document.createElement('div');
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 4px 10px;
    background-color: ${config.bgColor};
    border: 1px solid ${config.borderColor};
    border-radius: 12px;
    font-size: 10px;
    font-weight: 500;
    color: ${config.color};
    white-space: nowrap;
  `;
  badge.innerHTML = `
    <span style="font-size: 12px;">${config.icon}</span>
    <span>${config.text}</span>
  `;

  badgeWrapper.appendChild(badge);
  container.appendChild(badgeWrapper);

  // 游戏网格
  const gridElement = document.createElement('div');
  gridElement.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  `;

  // 渲染每一行
  grid
    .filter(row => row.some(cell => cell.charState !== 'empty'))
    .forEach(row => {
      const rowElement = document.createElement('div');
      rowElement.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 8px;
      `;

      row.forEach(cell => {
        const cellElement = document.createElement('div');
        const bgColor = cell.charState === 'correct' ? '#6aaa64' :
                       cell.charState === 'present' ? '#c9b458' : '#787c7e';

        cellElement.style.cssText = `
          width: 56px;
          height: 56px;
          background-color: ${bgColor};
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          padding: 4px;
          box-sizing: border-box;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        `;
        
        // 添加拼音显示
        if (cell.pinyin.initial || cell.pinyin.final) {
          const pinyinElement = document.createElement('div');
          pinyinElement.style.cssText = `
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 2px;
            text-align: center;
            width: 100%;
            z-index: 10;
          `;
          
          // 构建带声调的拼音字符串
          let pinyinText = '';
          if (cell.pinyin.initial) {
            pinyinText += cell.pinyin.initial;
          }
          if (cell.pinyin.final) {
            pinyinText += cell.pinyin.final;
          }
          
          // 添加声调
          if (cell.pinyin.tone > 0) {
            // 简单的声调标记实现
            const toneMarks = ['', 'āáǎà', 'ēéěè', 'īíǐì', 'ōóǒò', 'ūúǔù', 'ǖǘǚǜ'];
            const vowels = 'aeiouvü';
            let mainVowel = '';
            let vowelIndex = -1;
            for (const vowel of vowels) {
              const index = pinyinText.toLowerCase().indexOf(vowel);
              if (index !== -1) {
                mainVowel = pinyinText[index];
                vowelIndex = index;
                break;
              }
            }
            if (vowelIndex !== -1) {
              let vowelWithTone = '';
              switch (mainVowel.toLowerCase()) {
                case 'a': vowelWithTone = toneMarks[1][cell.pinyin.tone-1]; break;
                case 'e': vowelWithTone = toneMarks[2][cell.pinyin.tone-1]; break;
                case 'i': vowelWithTone = toneMarks[3][cell.pinyin.tone-1]; break;
                case 'o': vowelWithTone = toneMarks[4][cell.pinyin.tone-1]; break;
                case 'u': vowelWithTone = toneMarks[5][cell.pinyin.tone-1]; break;
                case 'v':
                case 'ü': vowelWithTone = toneMarks[6][cell.pinyin.tone-1]; break;
                default: vowelWithTone = mainVowel;
              }
              pinyinText = pinyinText.substring(0, vowelIndex) + vowelWithTone + pinyinText.substring(vowelIndex + 1);
            }
          }
          
          pinyinElement.textContent = pinyinText;
          cellElement.appendChild(pinyinElement);
        }
        
        const charElement = document.createElement('div');
        charElement.style.cssText = `
          font-size: 20px;
          font-weight: bold;
          text-align: center;
        `;
        charElement.textContent = cell.char;
        cellElement.appendChild(charElement);
        rowElement.appendChild(cellElement);
      });

      gridElement.appendChild(rowElement);
    });

  container.appendChild(gridElement);

  // 结果文本
  const result = document.createElement('div');
  result.style.cssText = `
    text-align: center;
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 8px;
  `;
  result.textContent = isWin
    ? `用了 ${attempts} 次猜中！🎉`
    : `没猜出来，下次加油！💪`;
  container.appendChild(result);

  // 添加计时信息
  const timeInfo = document.createElement('div');
  timeInfo.style.cssText = `
    text-align: center;
    font-size: 14px;
    opacity: 0.8;
  `;
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  timeInfo.textContent = `用时 ${minutes}:${seconds.toString().padStart(2, '0')}`;
  container.appendChild(timeInfo);

  // 隐藏并添加到 body（用于 html2canvas 截图）
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  return container;
}

// 保存图片到本地
export async function saveShareImage(
  element: HTMLElement,
  filename: string = '汉兜-分享.png'
): Promise<boolean> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    // 创建下载链接
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    // 清理
    document.body.removeChild(element);

    return true;
  } catch (err) {
    console.error('保存图片失败:', err);
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    return false;
  }
}
