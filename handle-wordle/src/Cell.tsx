import type { CellData } from './types';
import './Cell.css';

interface CellProps {
  data: CellData;
  isActive?: boolean;
  showPinyin?: boolean;
}

export function Cell({ data, isActive = false, showPinyin = true }: CellProps) {
  const { char, pinyin, charState, initialState, finalState, toneState } = data;

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

  // 获取声调显示
  const getToneDisplay = (tone: number) => {
    const toneMarks: Record<number, string> = {
      1: 'ˉ',
      2: 'ˊ',
      3: 'ˇ',
      4: 'ˋ',
      0: '•',
    };
    return toneMarks[tone] || '';
  };



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
              {pinyin.final}
              {pinyin.tone > 0 && (
                <span className={`pinyin-part tone ${getStateClass(toneState)}`}>
                  {getToneDisplay(pinyin.tone)}
                </span>
              )}
            </span>
          </div>
        </div>
      )}
      <div className="char">{char}</div>
    </div>
  );
}
