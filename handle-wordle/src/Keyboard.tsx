import './Keyboard.css';

interface KeyboardProps {
  onInput: (char: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

// 常用汉字键盘布局（按拼音首字母分组）
const KEYBOARD_ROWS = [
  ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
  ['人', '大', '小', '中', '上', '下', '左', '右', '天', '地'],
  ['水', '火', '木', '金', '土', '日', '月', '星', '云', '风'],
  ['山', '河', '海', '江', '湖', '石', '田', '林', '草', '花'],
  ['鸟', '鱼', '虫', '马', '牛', '羊', '狗', '猫', '虎', '龙'],
  ['东', '西', '南', '北', '春', '夏', '秋', '冬', '年', '岁'],
];

export function Keyboard({ onInput, onDelete, onSubmit, disabled = false }: KeyboardProps) {
  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((char) => (
            <button
              key={char}
              className="keyboard-key"
              onClick={() => onInput(char)}
              disabled={disabled}
            >
              {char}
            </button>
          ))}
        </div>
      ))}
      <div className="keyboard-row">
        <button
          className="keyboard-key wide"
          onClick={onDelete}
          disabled={disabled}
        >
          删除
        </button>
        <button
          className="keyboard-key enter"
          onClick={onSubmit}
          disabled={disabled}
        >
          输入
        </button>
      </div>
    </div>
  );
}
