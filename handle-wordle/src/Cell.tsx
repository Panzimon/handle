import type { CellData } from './types';
import { getFullPinyin } from './pinyin';

interface CellProps {
  data: CellData;
  isActive?: boolean;
  showPinyin?: boolean;
}

export function Cell({ data, isActive = false, showPinyin = true }: CellProps) {
  const { char, pinyin, charState, initialState, finalState, toneState } = data;

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



  // 渲染带声调的拼音
  const renderPinyin = () => {
    try {
      // 使用 pinyin 对象中的数据
      const initial = pinyin.initial;
      const final = pinyin.final;
      const tone = pinyin.tone;
      
      // 声调符号映射
      const toneSymbols = ['', 'ˉ', 'ˊ', 'ˇ', 'ˋ'];
      const toneSymbol = toneSymbols[tone] || '';
      
      // 查找韵母中的主要元音，按照标调规则：a > o > e > i > u > ü
      let vowelIndex = -1;
      let vowel = '';
      
      // 第一步：查找a
      if (final.includes('a')) {
        vowelIndex = final.indexOf('a');
        vowel = 'a';
      }
      // 第二步：查找o
      else if (final.includes('o')) {
        vowelIndex = final.indexOf('o');
        vowel = 'o';
      }
      // 第三步：查找e
      else if (final.includes('e')) {
        vowelIndex = final.indexOf('e');
        vowel = 'e';
      }
      // 第四步：处理i和u的情况
      else if (final.includes('i') && final.includes('u')) {
        // iu和ui的情况，标在后面的字母上
        if (final.endsWith('u')) {
          vowelIndex = final.lastIndexOf('u');
          vowel = 'u';
        } else {
          vowelIndex = final.lastIndexOf('i');
          vowel = 'i';
        }
      }
      // 第五步：查找i
      else if (final.includes('i')) {
        vowelIndex = final.indexOf('i');
        vowel = 'i';
      }
      // 第六步：查找u
      else if (final.includes('u')) {
        vowelIndex = final.indexOf('u');
        vowel = 'u';
      }
      // 第七步：查找ü
      else if (final.includes('ü')) {
        vowelIndex = final.indexOf('ü');
        vowel = 'ü';
      }
      
      if (vowelIndex !== -1 && toneSymbol) {
        const beforeVowel = final.substring(0, vowelIndex);
        const afterVowel = final.substring(vowelIndex + 1);
        
        return (
          <>
            {initial && (
              <span className={`${getPinyinColorClass(initialState)}`}>
                {initial}
              </span>
            )}
            {beforeVowel && (
              <span className={`${getPinyinColorClass(finalState)}`}>
                {beforeVowel}
              </span>
            )}
            <span className="relative inline-block text-center">
              <span className={`${getPinyinColorClass(finalState)}`}>
                {vowel}
              </span>
              <span className={`${getPinyinColorClass(toneState)} absolute -top-0.5 left-0 w-full text-center`}>
                {toneSymbol}
              </span>
            </span>
            {afterVowel && (
              <span className={`${getPinyinColorClass(finalState)}`}>
                {afterVowel}
              </span>
            )}
          </>
        );
      }
      
      // 如果没有找到元音或没有声调，直接显示
      return (
        <>
          {initial && (
            <span className={`${getPinyinColorClass(initialState)}`}>
              {initial}
            </span>
          )}
          <span className={`${getPinyinColorClass(finalState)}`}>
            {final}
          </span>
        </>
      );
    } catch (error) {
      // 当出现错误时，使用默认逻辑
      return (
        <>
          {pinyin.initial && (
            <span className={`${getPinyinColorClass(initialState)}`}>
              {pinyin.initial}
            </span>
          )}
          <span className={`${getPinyinColorClass(finalState)}`}>
            {pinyin.final}
          </span>
        </>
      );
    }
  };

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
        <div className="flex items-center justify-center text-xs sm:text-sm font-bold mb-1 z-10">
          {renderPinyin()}
        </div>
      )}
      <div className="text-xl sm:text-2xl font-bold text-center">{char}</div>
    </div>
  );
}
