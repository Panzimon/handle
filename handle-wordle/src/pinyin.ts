import pinyin from 'pinyin';
import type { PinyinPart } from './types';

// 特殊成语的拼音映射表
const SPECIAL_IDIOMS: Record<string, string[]> = {
  '虚与委蛇': ['xu1', 'yu3', 'wei3', 'yi2'], // 虚与委蛇：第四个字读 yi 第二声
};

// 获取汉字的拼音信息（支持特殊成语）
export function getPinyin(char: string, idiom?: string): PinyinPart {
  // 检查是否是中文字符
  if (!/[\u4e00-\u9fa5]/.test(char)) {
    return {
      initial: '',
      final: '',
      tone: 0,
    };
  }

  // 检查是否是特殊成语中的字
  if (idiom && SPECIAL_IDIOMS[idiom]) {
    const charIndex = idiom.indexOf(char);
    if (charIndex !== -1 && charIndex < SPECIAL_IDIOMS[idiom].length) {
      const specialPinyin = SPECIAL_IDIOMS[idiom][charIndex];
      // 解析特殊拼音
      const toneMatch = specialPinyin.match(/(\D*)(\d)$/);
      if (toneMatch) {
        const tone = parseInt(toneMatch[2], 10);
        const pinyinWithoutTone = toneMatch[1];

        // 定义声母列表
        const initials = [
          'b', 'p', 'm', 'f', 'd', 't', 'n', 'l',
          'g', 'k', 'h', 'j', 'q', 'x',
          'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'
        ];

        // 提取声母
        let initial = '';
        let final = pinyinWithoutTone;

        for (const i of initials) {
          if (pinyinWithoutTone.startsWith(i)) {
            initial = i;
            final = pinyinWithoutTone.slice(i.length);
            break;
          }
        }

        return {
          initial,
          final,
          tone,
        };
      }
    }
  }

  // 普通拼音处理
  const result = pinyin(char, {
    style: pinyin.STYLE_TONE2,
    heteronym: false,
  });

  if (!result || !result[0] || !result[0][0]) {
    return {
      initial: '',
      final: '',
      tone: 0,
    };
  }

  const py = result[0][0];

  // 解析拼音：提取声母、韵母和声调
  const toneMatch = py.match(/(\D*)(\d)$/);
  const tone = toneMatch ? parseInt(toneMatch[2], 10) : 0;
  const pinyinWithoutTone = toneMatch ? toneMatch[1] : py;

  // 定义声母列表
  const initials = [
    'b', 'p', 'm', 'f', 'd', 't', 'n', 'l',
    'g', 'k', 'h', 'j', 'q', 'x',
    'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'
  ];

  // 提取声母
  let initial = '';
  let final = pinyinWithoutTone;

  for (const i of initials) {
    if (pinyinWithoutTone.startsWith(i)) {
      initial = i;
      final = pinyinWithoutTone.slice(i.length);
      break;
    }
  }

  return {
    initial,
    final,
    tone,
  };
}

// 获取完整的拼音字符串
export function getFullPinyin(char: string): string {
  // 检查是否是中文字符
  if (!/[\u4e00-\u9fa5]/.test(char)) {
    return '';
  }

  const result = pinyin(char, {
    style: pinyin.STYLE_TONE,
    heteronym: false,
  });
  return result && result[0] && result[0][0] ? result[0][0] : '';
}

// 获取无声调的拼音
export function getPinyinWithoutTone(char: string): string {
  // 检查是否是中文字符
  if (!/[\u4e00-\u9fa5]/.test(char)) {
    return '';
  }

  const result = pinyin(char, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false,
  });
  return result && result[0] && result[0][0] ? result[0][0] : '';
}
