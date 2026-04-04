import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { CellData, CellState, GameState, TimerState } from './types';
import { getPinyin } from './pinyin';
import { getDailyIdiom, getRandomIdiom, isValidIdiom } from './words';

const MAX_ATTEMPTS = 10;
const WORD_LENGTH = 4;

// 创建空的格子数据
function createEmptyCell(): CellData {
  return {
    char: '',
    pinyin: { initial: '', final: '', tone: 0 },
    charState: 'empty',
    initialState: 'empty',
    finalState: 'empty',
    toneState: 'empty',
  };
}

// 创建空行
function createEmptyRow(): CellData[] {
  return Array(WORD_LENGTH).fill(null).map(createEmptyCell);
}

// 检查猜测结果
export function checkGuess(guess: string, answer: string): CellData[] {
  const result: CellData[] = [];
  const answerPinyins = answer.split('').map(getPinyin);
  const guessPinyins = guess.split('').map(getPinyin);

  // 统计答案中每个组件的出现次数
  const charCount: Record<string, number> = {};
  const initialCount: Record<string, number> = {};
  const finalCount: Record<string, number> = {};
  const toneCount: Record<string, number> = {};

  answer.split('').forEach((char, i) => {
    const py = answerPinyins[i];
    charCount[char] = (charCount[char] || 0) + 1;
    initialCount[py.initial] = (initialCount[py.initial] || 0) + 1;
    finalCount[py.final] = (finalCount[py.final] || 0) + 1;
    toneCount[py.tone] = (toneCount[py.tone] || 0) + 1;
  });

  // 第一遍：标记正确的位置
  const charStates: CellState[] = [];
  const initialStates: CellState[] = [];
  const finalStates: CellState[] = [];
  const toneStates: CellState[] = [];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const guessChar = guess[i];
    const guessPy = guessPinyins[i];
    const answerChar = answer[i];
    const answerPy = answerPinyins[i];

    // 检查汉字
    if (guessChar === answerChar) {
      charStates[i] = 'correct';
      charCount[guessChar]--;
    } else {
      charStates[i] = 'absent';
    }

    // 检查声母
    if (guessPy.initial === answerPy.initial) {
      initialStates[i] = 'correct';
      initialCount[guessPy.initial]--;
    } else {
      initialStates[i] = 'absent';
    }

    // 检查韵母
    if (guessPy.final === answerPy.final) {
      finalStates[i] = 'correct';
      finalCount[guessPy.final]--;
    } else {
      finalStates[i] = 'absent';
    }

    // 检查声调
    if (guessPy.tone === answerPy.tone) {
      toneStates[i] = 'correct';
      toneCount[guessPy.tone]--;
    } else {
      toneStates[i] = 'absent';
    }
  }

  // 第二遍：标记存在但位置不对的情况
  for (let i = 0; i < WORD_LENGTH; i++) {
    const guessChar = guess[i];
    const guessPy = guessPinyins[i];

    // 汉字：如果不在正确位置，但在答案中存在
    if (charStates[i] !== 'correct') {
      if (charCount[guessChar] > 0) {
        charStates[i] = 'present';
        charCount[guessChar]--;
      }
    }

    // 声母
    if (initialStates[i] !== 'correct') {
      if (initialCount[guessPy.initial] > 0) {
        initialStates[i] = 'present';
        initialCount[guessPy.initial]--;
      }
    }

    // 韵母
    if (finalStates[i] !== 'correct') {
      if (finalCount[guessPy.final] > 0) {
        finalStates[i] = 'present';
        finalCount[guessPy.final]--;
      }
    }

    // 声调
    if (toneStates[i] !== 'correct') {
      if (toneCount[guessPy.tone] > 0) {
        toneStates[i] = 'present';
        toneCount[guessPy.tone]--;
      }
    }
  }

  // 构建结果
  for (let i = 0; i < WORD_LENGTH; i++) {
    result.push({
      char: guess[i],
      pinyin: guessPinyins[i],
      charState: charStates[i],
      initialState: initialStates[i],
      finalState: finalStates[i],
      toneState: toneStates[i],
    });
  }

  return result;
}

export function useGame() {
  const [answer, setAnswer] = useState<string>('');
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [message, setMessage] = useState('');
  const [shakeRow, setShakeRow] = useState<number | null>(null);

  // 计时器状态
  const [timer, setTimer] = useState<TimerState>({
    startTime: 0,
    pauseTime: 0,
    isRunning: false,
    elapsedTime: 0,
  });

  // 使用 ref 来存储 timer 的最新值，用于在 effect 中访问
  const timerRef = useRef(timer);
  timerRef.current = timer;

  // 计算格式化时间 (MM:SS)
  const formattedTime = useMemo(() => {
    const totalSeconds = Math.floor(timer.elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timer.elapsedTime]);

  // 启动计时器
  const startTimer = useCallback(() => {
    const now = performance.now();
    setTimer(prev => ({
      ...prev,
      startTime: now,
      isRunning: true,
    }));
  }, []);

  // 停止计时器
  const stopTimer = useCallback(() => {
    const now = performance.now();
    setTimer(prev => ({
      ...prev,
      pauseTime: now,
      isRunning: false,
      elapsedTime: prev.startTime > 0 ? now - prev.startTime : prev.elapsedTime,
    }));
  }, []);

  // 暂停计时器
  const pauseTimer = useCallback(() => {
    if (!timerRef.current.isRunning) return;
    const now = performance.now();
    setTimer(prev => ({
      ...prev,
      pauseTime: now,
      isRunning: false,
      elapsedTime: prev.startTime > 0 ? now - prev.startTime : prev.elapsedTime,
    }));
  }, []);

  // 恢复计时器
  const resumeTimer = useCallback(() => {
    if (timerRef.current.isRunning) return;
    const now = performance.now();
    setTimer(prev => ({
      ...prev,
      startTime: now - prev.elapsedTime,
      isRunning: true,
    }));
  }, []);

  // 重置计时器
  const resetTimer = useCallback(() => {
    setTimer({
      startTime: 0,
      pauseTime: 0,
      isRunning: false,
      elapsedTime: 0,
    });
  }, []);

  // 计时器更新 effect
  useEffect(() => {
    let animationFrameId: number;

    const updateTimer = () => {
      if (timerRef.current.isRunning && timerRef.current.startTime > 0) {
        const now = performance.now();
        const elapsed = now - timerRef.current.startTime;
        setTimer(prev => ({
          ...prev,
          elapsedTime: elapsed,
        }));
      }
      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 监听页面可见性变化（后台运行处理）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面隐藏，暂停计时
        if (timerRef.current.isRunning && gameState === 'playing') {
          pauseTimer();
        }
      } else {
        // 页面显示，恢复计时
        if (!timerRef.current.isRunning && gameState === 'playing') {
          resumeTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameState, pauseTimer, resumeTimer]);

  // 初始化游戏
  useEffect(() => {
    initGame();
  }, []);

  const initGame = useCallback(() => {
    const dailyIdiom = getDailyIdiom();
    setAnswer(dailyIdiom);
    // 初始只有一行空白框
    setGrid([createEmptyRow()]);
    setCurrentInput('');
    setGameState('playing');
    setMessage('');
    setShakeRow(null);
    // 重置并启动计时器
    resetTimer();
    setTimeout(() => {
      startTimer();
    }, 0);
  }, [resetTimer, startTimer]);

  // 再玩一次（使用当前成语）
  const playAgain = useCallback(() => {
    // 直接重置游戏状态，使用当前的answer
    setGrid([createEmptyRow()]);
    setCurrentInput('');
    setGameState('playing');
    setMessage('');
    setShakeRow(null);
    // 重置并启动计时器
    resetTimer();
    setTimeout(() => {
      startTimer();
    }, 0);
  }, [resetTimer, startTimer]);

  // 换一个词（随机获取新词）
  const changeWord = useCallback(() => {
    const randomIdiom = getRandomIdiom();
    setAnswer(randomIdiom);
    // 重置游戏状态
    setGrid([createEmptyRow()]);
    setCurrentInput('');
    setGameState('playing');
    setMessage('');
    setShakeRow(null);
    // 重置并启动计时器
    resetTimer();
    setTimeout(() => {
      startTimer();
    }, 0);
  }, [resetTimer, startTimer]);

  // 处理输入
  const handleInput = useCallback((char: string) => {
    if (gameState !== 'playing') return;
    setCurrentInput(prev => {
      if (prev.length < WORD_LENGTH) {
        return prev + char;
      }
      return prev;
    });
  }, [gameState]);

  // 删除字符
  const handleDelete = useCallback(() => {
    if (gameState !== 'playing') return;
    setCurrentInput(prev => prev.slice(0, -1));
  }, [gameState]);

  // 提交猜测
  const handleSubmit = useCallback(() => {
    if (gameState !== 'playing') return;
    if (currentInput.length !== WORD_LENGTH) {
      setMessage('请输入四个字');
      setShakeRow(grid.length - 1);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }

    if (!isValidIdiom(currentInput)) {
      setMessage('请输入有效的四字成语');
      setShakeRow(grid.length - 1);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }

    const result = checkGuess(currentInput, answer);
    
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[newGrid.length - 1] = result;
      // 如果还有次数，添加新的空行
      if (newGrid.length < MAX_ATTEMPTS) {
        newGrid.push(createEmptyRow());
      }
      return newGrid;
    });

    // 检查是否获胜
    const isWin = result.every(cell => cell.charState === 'correct');
    
    if (isWin) {
      setGameState('won');
      setMessage('恭喜你，猜对了！');
      // 停止计时器
      stopTimer();
    } else if (grid.length >= MAX_ATTEMPTS) {
      setGameState('lost');
      setMessage(`游戏结束，答案是：${answer}`);
      // 停止计时器
      stopTimer();
    } else {
      setCurrentInput('');
    }
  }, [currentInput, grid.length, answer, gameState, stopTimer]);



  return {
    grid,
    currentInput,
    setCurrentInput,
    gameState,
    message,
    shakeRow,
    answer,
    handleInput,
    handleDelete,
    handleSubmit,
    initGame,
    playAgain,
    changeWord,
    // 计时器相关
    elapsedTime: timer.elapsedTime,
    formattedTime,
    isTimerRunning: timer.isRunning,
  };
}
