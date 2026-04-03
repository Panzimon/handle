import pinyin from 'pinyin';
import type { PinyinPart } from './types';

// 获取汉字的拼音信息
export function getPinyin(char: string): PinyinPart {
  // 检查是否是中文字符
  if (!/[\u4e00-\u9fa5]/.test(char)) {
    return {
      initial: '',
      final: '',
      tone: 0,
    };
  }

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
