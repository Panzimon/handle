import type { CellData } from './types';

interface CellProps {
  data: CellData;
  isActive?: boolean;
  showPinyin?: boolean;
}

export function Cell({ data, isActive = false, showPinyin = true }: CellProps) {
  const { char, pinyin, charState, initialState, finalState } = data;

  // 根据状态获取背景色类名
  const getBgColorClass = () => {
    switch (charState) {
      case 'correct':
        return 'bg-primary';
      case 'present':
        return 'bg-secondary';
      case 'absent':
        return 'bg-neutral';
      default:
        return 'bg-white border-2 border-gray-300';
    }
  };

  // 根据状态获取文字颜色类名
  const getTextColorClass = () => {
    if (charState === 'correct' || charState === 'present' || charState === 'absent') {
      return 'text-white';
    }
    return 'text-gray-900';
  };

  // 根据拼音部分状态获取颜色类名
  const getPinyinColorClass = (state: string) => {
    // 完全正确情况：文字框绿色，文字白色，拼音白色
    if (charState === 'correct') {
      return 'text-white font-bold';
    }
    // 部分匹配情况：文字框橙色，文字白色，拼音白色
    if (charState === 'present') {
      return 'text-white font-bold';
    }
    // 完全不匹配情况：文字框灰色，文字白色，拼音根据匹配情况显示相应颜色
    if (charState === 'absent') {
      switch (state) {
        case 'correct':
          return 'text-primary font-bold'; // 青色
        case 'present':
          return 'text-secondary font-bold'; // 橙色
        case 'absent':
          return 'text-white font-bold'; // 白色
        default:
          return 'text-white font-bold'; // 白色
      }
    }
    // 当单元格无背景色时，根据状态显示不同颜色
    switch (state) {
      case 'correct':
        return 'text-primary font-bold'; // 青色
      case 'present':
        return 'text-secondary font-bold'; // 橙色
      case 'absent':
        return 'text-neutral font-bold'; // 灰色
      default:
        return 'text-gray-500 font-bold'; // 灰色
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
    
    const newFinal = final.substring(0, vowelIndex) + vowelWithTone + final.substring(vowelIndex + 1);
    return initial + newFinal;
  };

  // 生成带声调的拼音
  const fullPinyin = addToneMark(pinyin.initial, pinyin.final, pinyin.tone);
  const finalWithTone = fullPinyin.substring(pinyin.initial.length);

  return (
    <div 
      className={`
        w-16 h-16 sm:w-20 sm:h-20 
        rounded-lg 
        flex flex-col items-center justify-center 
        font-bold 
        transition-all duration-300 
        ${getBgColorClass()}
        ${getTextColorClass()}
        ${isActive ? 'ring-2 ring-gray-400 ring-offset-2' : ''}
        ${charState === 'empty' ? 'hover:shadow-md hover:border-gray-400' : 'shadow-lg'}
        hover:scale-105
      `}
    >
      {showPinyin && (pinyin.initial || pinyin.final) && (
        <div className="flex items-center justify-center gap-0.5 text-xs sm:text-sm font-bold mb-1 z-10">
          <span className={`${getPinyinColorClass(initialState)}`}>
            {pinyin.initial}
          </span>
          <span className={`${getPinyinColorClass(finalState)}`}>
            {finalWithTone}
          </span>
        </div>
      )}
      <div className="text-xl sm:text-2xl font-bold text-center">{char}</div>
    </div>
  );
}
