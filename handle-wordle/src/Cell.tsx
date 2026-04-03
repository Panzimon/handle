import type { CellData } from './types';
import './Cell.css';

interface CellProps {
  data: CellData;
  isActive?: boolean;
  showPinyin?: boolean;
}

export function Cell({ data, isActive = false, showPinyin = true }: CellProps) {
  const { char, pinyin, charState, initialState, finalState } = data;

  const getStateClass = (state: string) => {
    switch (state) {
      case 'correct':
        return 'correct';
      case 'present':
        return 'present';
      case 'absent':
        return 'absent';
      default:
        return 'empty';
    }
  };

  // 添加声调标记到正确的位置
  const addToneMark = (initial: string, final: string, tone: number) => {
    if (tone === 0) {
      return initial + final;
    }
    
    const toneMarks = ['', 'āáǎà', 'ēéěè', 'īíǐì', 'ōóǒò', 'ūúǔù', 'ǖǘǚǜ'];
    const vowels = 'aeiouvü';
    
    // 找到韵母中的主要元音
    let mainVowel = '';
    let vowelIndex = -1;
    
    // 优先顺序：a > o > e > i > u > v/ü
    for (const vowel of vowels) {
      const index = final.toLowerCase().indexOf(vowel);
      if (index !== -1) {
        mainVowel = final[index];
        vowelIndex = index;
        break;
      }
    }
    
    if (vowelIndex === -1) {
      // 没有找到元音，直接在末尾添加声调
      return initial + final;
    }
    
    // 替换主要元音为带声调的版本
    let vowelWithTone = '';
    switch (mainVowel.toLowerCase()) {
      case 'a':
        vowelWithTone = toneMarks[1][tone-1];
        break;
      case 'e':
        vowelWithTone = toneMarks[2][tone-1];
        break;
      case 'i':
        vowelWithTone = toneMarks[3][tone-1];
        break;
      case 'o':
        vowelWithTone = toneMarks[4][tone-1];
        break;
      case 'u':
        vowelWithTone = toneMarks[5][tone-1];
        break;
      case 'v':
      case 'ü':
        vowelWithTone = toneMarks[6][tone-1];
        break;
      default:
        vowelWithTone = mainVowel;
    }
    
    // 构建最终的拼音
    const newFinal = final.substring(0, vowelIndex) + vowelWithTone + final.substring(vowelIndex + 1);
    return initial + newFinal;
  };

  // 生成带声调的完整拼音
  const fullPinyin = addToneMark(pinyin.initial, pinyin.final, pinyin.tone);

  return (
    <div className={`cell ${isActive ? 'active' : ''} ${charState || ''}`}>
      {showPinyin && char && (
        <div className="pinyin">
          {/* 显示带颜色标识的完整拼音 */}
          <div className="full-pinyin">
            <span className={`pinyin-part ${getStateClass(initialState)}`}>
              {pinyin.initial}
            </span>
            <span className={`pinyin-part ${getStateClass(finalState)}`}>
              {fullPinyin.substring(pinyin.initial.length)}
            </span>
          </div>
        </div>
      )}
      <div className="char">{char}</div>
    </div>
  );
}
