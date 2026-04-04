export type CellState = 'correct' | 'present' | 'absent' | 'empty';

export interface PinyinPart {
  initial: string;
  final: string;
  tone: number;
}

export interface CellData {
  char: string;
  pinyin: PinyinPart;
  charState: CellState;
  initialState: CellState;
  finalState: CellState;
  toneState: CellState;
}

export interface RowData {
  cells: CellData[];
}

export type GameState = 'playing' | 'won' | 'lost';

export interface GameStats {
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  gamesWon: number;
}

// 计时器状态
export interface TimerState {
  startTime: number;      // 开始时间戳（performance.now()）
  pauseTime: number;      // 暂停时间戳
  isRunning: boolean;     // 是否运行中
  elapsedTime: number;    // 总耗时（毫秒）
}

// 提示使用状态
export interface HintUsage {
  used: boolean;          // 是否使用了提示
  level: number;         // 提示级别：0=无提示, 1=拼音提示, 2=汉字提示
}
