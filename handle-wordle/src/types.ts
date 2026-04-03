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
