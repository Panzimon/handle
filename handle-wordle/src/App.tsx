import { useState, useEffect } from 'react';
import { useGame } from './useGame';
import { Cell } from './Cell';
import { getPinyin } from './pinyin';
import Toast from './Toast';
import { generateShareText, copyToClipboard } from './utils/share';
import { createShareImageElement, saveShareImage } from './utils/imageShare';
import type { HintUsage } from './types';

const WORD_LENGTH = 4;
const MAX_ATTEMPTS = 10;

function App() {
  const {
    grid,
    currentInput,
    setCurrentInput,
    gameState,
    message,
    shakeRow,
    answer,
    handleSubmit,
    playAgain,
    changeWord: changeWordGame,
    // 计时器相关
    elapsedTime,
    formattedTime,
    isTimerRunning,
  } = useGame();

  const [showConfetti, setShowConfetti] = useState(false);
  const [showSadAnimation, setShowSadAnimation] = useState(false);
  const [showGuessAnimation, setShowGuessAnimation] = useState(false);
  const [guessAnimationRow, setGuessAnimationRow] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isInputComposing, setIsInputComposing] = useState(false);

  const changeWord = () => {
    changeWordGame();
    setCurrentHint(null);
    setHintGenerated(false);
    setShowConfetti(false);
    setShowSadAnimation(false);
    setShowGuessAnimation(false);
  };

  // 英文检测函数
  const detectEnglish = (text: string): boolean => {
    // 检测是否包含英文字母
    return /[a-zA-Z]/.test(text);
  };

  // 格式验证函数
  const validateInput = (text: string): { isValid: boolean; errorMessage?: string } => {
    // 检测英文
    if (detectEnglish(text)) {
      return {
        isValid: false,
        errorMessage: '请使用中文输入，不要包含英文字符',
      };
    }

    // 检测空格
    if (text.includes(' ')) {
      return {
        isValid: false,
        errorMessage: '请不要输入空格',
      };
    }

    // 检测特殊字符
    if (/[^\u4e00-\u9fa5]/.test(text)) {
      return {
        isValid: false,
        errorMessage: '请只输入汉字',
      };
    }

    // 检测长度
    if (text.length > WORD_LENGTH) {
      return {
        isValid: false,
        errorMessage: `请输入${WORD_LENGTH}个汉字`,
      };
    }

    return { isValid: true };
  };

  // 显示toast提示
  const showToast = (message: string, type: 'error' | 'warning' | 'success') => {
    setToast({ message, type });
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);

    // 跳过输入法组合输入状态
    if (isInputComposing) return;

    // 清除之前的防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 设置新的防抖定时器
    const timer = setTimeout(() => {
      const validation = validateInput(value);
      if (!validation.isValid) {
        showToast(validation.errorMessage!, 'error');
      }
    }, 300);

    setDebounceTimer(timer);
  };

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // 处理"再玩一次"按钮点击
  const handlePlayAgain = () => {
    // 先重置所有动画状态
    setShowConfetti(false);
    setShowSadAnimation(false);
    setShowGuessAnimation(false);
    setCurrentHint(null);
    setHintGenerated(false);
    
    // 添加小延迟确保动画状态完全重置后再重置游戏状态
    setTimeout(() => {
      playAgain();
    }, 50);
  };

  // 处理文本分享
  const handleTextShare = () => {
    const actualAttempts = grid.filter(row => 
      row.some(cell => cell.charState !== 'empty')
    ).length;
    
    const hintUsage: HintUsage = {
      used: hintGenerated,
      level: hintLevel,
    };
    
    const text = generateShareText(
      grid,
      actualAttempts,
      gameState === 'won',
      hintUsage,
      elapsedTime
    );
    
    copyToClipboard(text).then(success => {
      if (success) {
        showToast('已复制到剪贴板', 'success');
      } else {
        showToast('复制失败，请手动复制', 'error');
      }
    });
  };

  // 处理图片分享
  const handleImageShare = () => {
    const actualAttempts = grid.filter(row => 
      row.some(cell => cell.charState !== 'empty')
    ).length;
    
    const hintUsage: HintUsage = {
      used: hintGenerated,
      level: hintLevel,
    };
    
    const shareElement = createShareImageElement(
      grid,
      actualAttempts,
      gameState === 'won',
      hintUsage,
      elapsedTime
    );
    
    saveShareImage(shareElement).then(success => {
      if (success) {
        showToast('图片已保存', 'success');
      } else {
        showToast('保存图片失败，请重试', 'error');
      }
    });
  };

  // 播放音效
  const playSound = (type: 'win' | 'lose' | 'guess') => {
    try {
      const audio = new Audio();
      if (type === 'win') {
        // 成功音效 - 使用CDN
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3';
      } else if (type === 'lose') {
        // 失败音效 - 使用CDN
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-sad-game-over-trombone-471.mp3';
      } else {
        // 猜测音效 - 使用CDN
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3';
      }
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play error:', err));
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  // 处理猜测提交
  const handleGuessSubmit = () => {
    if (gameState === 'playing') {
      if (currentInput.length < WORD_LENGTH) {
        // 输入长度不足，显示toast提示
        showToast(`请输入${WORD_LENGTH}个汉字`, 'error');
        return;
      }
      
      if (currentInput.length === WORD_LENGTH) {
        // 触发猜测动画
        setShowGuessAnimation(true);
        setGuessAnimationRow(grid.length - 1);
        playSound('guess');
        
        // 执行猜测
        handleSubmit();
        
        // 300ms后关闭猜测动画
        setTimeout(() => {
          setShowGuessAnimation(false);
          setGuessAnimationRow(null);
        }, 300);
      } else {
        // 直接执行猜测（不需要动画）
        handleSubmit();
      }
    }
  };

  // 监听游戏结束状态
  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      let timeoutId: NodeJS.Timeout;
      
      if (gameState === 'won') {
        // 确保动画状态重置
        setShowConfetti(false);
        // 立即显示庆祝动画
        setTimeout(() => {
          setShowConfetti(true);
          playSound('win');
        }, 100);
        // 5秒后自动关闭庆祝动画
        timeoutId = setTimeout(() => {
          setShowConfetti(false);
        }, 5100);
      } else {
        // 确保动画状态重置
        setShowSadAnimation(false);
        // 立即显示失败动画
        setTimeout(() => {
          setShowSadAnimation(true);
          playSound('lose');
        }, 100);
        // 3秒后自动关闭失败动画
        timeoutId = setTimeout(() => {
          setShowSadAnimation(false);
        }, 3100);
      }
      
      // 清理函数
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [gameState]);

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [currentHint, setCurrentHint] = useState<{ char: string; pinyin: string } | null>(null);
  const [hintGenerated, setHintGenerated] = useState(false);

  const getPinyinState = (type: 'initial' | 'final', value: string) => {
    // 首先检查是否有correct状态的匹配（颜色锁定机制）
    for (let i = 0; i < grid.length; i++) {
      const row = grid[i];
      for (const cell of row) {
        if (type === 'initial' && cell.pinyin.initial === value && cell.initialState === 'correct') {
          return 'correct';
        } else if (type === 'final' && cell.pinyin.final === value && cell.finalState === 'correct') {
          return 'correct';
        }
      }
    }
    
    // 然后检查是否有present状态的匹配
    for (let i = grid.length - 1; i >= 0; i--) {
      const row = grid[i];
      for (const cell of row) {
        if (type === 'initial' && cell.pinyin.initial === value && cell.initialState === 'present') {
          return 'present';
        } else if (type === 'final' && cell.pinyin.final === value && cell.finalState === 'present') {
          return 'present';
        }
      }
    }
    
    return null;
  };

  const generateHint = () => {
    const randomIndex = Math.floor(Math.random() * answer.length);
    const hintChar = answer[randomIndex];
    const hintPinyin = getPinyin(hintChar);
    const pinyinWithTone = addToneMark(hintPinyin.initial, hintPinyin.final, hintPinyin.tone);
    const newHint = { char: hintChar, pinyin: pinyinWithTone };
    setCurrentHint(newHint);
    return newHint;
  };

  const addToneMark = (initial: string, final: string, tone: number) => {
    if (tone === 0) return initial + final;
    const toneMarks = ['', 'āáǎà', 'ēéěè', 'īíǐì', 'ōóǒò', 'ūúǔù', 'ǖǘǚǜ'];
    const vowels = 'aeiouvü';
    let mainVowel = '';
    let vowelIndex = -1;
    for (const vowel of vowels) {
      const index = final.toLowerCase().indexOf(vowel);
      if (index !== -1) {
        mainVowel = final[index];
        vowelIndex = index;
        break;
      }
    }
    if (vowelIndex === -1) return initial + final;
    let vowelWithTone = '';
    switch (mainVowel.toLowerCase()) {
      case 'a': vowelWithTone = toneMarks[1][tone-1]; break;
      case 'e': vowelWithTone = toneMarks[2][tone-1]; break;
      case 'i': vowelWithTone = toneMarks[3][tone-1]; break;
      case 'o': vowelWithTone = toneMarks[4][tone-1]; break;
      case 'u': vowelWithTone = toneMarks[5][tone-1]; break;
      case 'v':
      case 'ü': vowelWithTone = toneMarks[6][tone-1]; break;
      default: vowelWithTone = mainVowel;
    }
    const newFinal = final.substring(0, vowelIndex) + vowelWithTone + final.substring(vowelIndex + 1);
    return initial + newFinal;
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white font-sans">
      <header className="w-full text-center py-4 sm:py-5 border-b border-gray-200 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">汉字 Wordle</h1>
        <p className="text-sm sm:text-base text-gray-600">猜四字成语</p>
        <div className="flex justify-center gap-2 sm:gap-3 mt-3 flex-wrap">
          <button 
            onClick={() => setShowHowToPlay(true)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
          >
            玩法介绍
          </button>
          <button 
            onClick={() => {
              if (!hintGenerated) {
                generateHint();
                setHintGenerated(true);
                setHintLevel(1);
              }
              setShowHint(true);
            }}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
          >
            提示
          </button>
          <button 
            onClick={() => setShowCheatSheet(true)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
          >
            速查表
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 sm:p-5 gap-4 sm:gap-5 max-w-2xl w-full">
        <div className="text-center mb-2">
          <p className="text-gray-600 text-xs sm:text-sm">请输入四字成语，然后按 Enter 键提交</p>
        </div>

        <input
          type="text"
          className="w-full max-w-xs sm:max-w-md px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-base sm:text-lg font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoFocus
          placeholder="输入四字成语"
          maxLength={WORD_LENGTH}
          value={currentInput}
          disabled={gameState !== 'playing'}
          onChange={handleInputChange}
          onCompositionStart={() => setIsInputComposing(true)}
          onCompositionEnd={() => {
            setIsInputComposing(false);
            // 组合输入结束后再进行验证
            const validation = validateInput(currentInput);
            if (!validation.isValid) {
              showToast(validation.errorMessage!, 'error');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleGuessSubmit();
              e.preventDefault();
            }
          }}
        />

        <div className="text-center text-gray-600 text-xs sm:text-sm leading-relaxed px-2">
          <p>你有 <strong className="text-gray-900">{MAX_ATTEMPTS}</strong> 次机会猜一个四字成语</p>
          <p className="mt-1">每次猜测后，汉字与拼音的颜色将标识其与正确答案的区别</p>
        </div>

        <div className="w-full bg-gray-50 p-3 sm:p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2 sm:mb-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-md">
                <span className="text-base sm:text-lg">班</span>
                <span className="text-[10px] sm:text-xs mt-0.5 text-white font-bold">bān</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-700">
              <strong className="text-gray-900">青色</strong>表示汉字、声母、韵母、声调都正确
            </p>
          </div>
          <div className="flex items-center gap-3 mb-2 sm:mb-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-md">
                <span className="text-base sm:text-lg">水</span>
                <span className="text-[10px] sm:text-xs mt-0.5 text-white font-bold">shuǐ</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-700">
              <strong className="text-gray-900">橙色</strong>表示该元素存在于答案中但位置不对
            </p>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-md">
                <span className="text-base sm:text-lg">天</span>
                <span className="text-[10px] sm:text-xs mt-0.5 text-white font-bold">tiān</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-700">
              <strong className="text-gray-900">灰色</strong>表示该元素不存在于答案中
            </p>
          </div>
        </div>

        <div className="w-full max-w-xs sm:max-w-md mx-auto">
          {grid.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 ${shakeRow === rowIndex ? 'animate-shake' : ''} ${guessAnimationRow === rowIndex && showGuessAnimation ? 'animate-guess' : ''}`}
            >
              {row.map((cell, cellIndex) => (
                <Cell key={cellIndex} data={cell} />
              ))}
            </div>
          ))}
        </div>

        {message && (
          <div className={`px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm sm:text-base text-center transition-all ${gameState !== 'playing' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            {message}
          </div>
        )}

        {/* 成功动画 */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-fall"
                style={{
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  backgroundColor: [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA69E', '#98D4BB',
                    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
                  ][Math.floor(Math.random() * 10)],
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationTimingFunction: 'ease-in-out',
                }}
              />
            ))}
          </div>
        )}

        {/* 失败动画 */}
        {showSadAnimation && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-6xl text-gray-400 animate-pulse">😞</div>
          </div>
        )}

        {gameState !== 'playing' && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10 flex-wrap">
            <button 
              onClick={handlePlayAgain}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-600 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              再玩一次
            </button>
            <button 
              onClick={handleTextShare}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              📋 复制结果
            </button>
            <button 
              onClick={handleImageShare}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              💾 保存图片
            </button>
            <button 
              onClick={changeWord}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-amber-600 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              换一个词
            </button>
          </div>
        )}

        {/* 计时器显示 - 移动到下方，降低视觉权重 */}
        <div className="mt-4 sm:mt-5 mb-2 sm:mb-3 text-center">
          <span 
            className={`font-mono text-sm sm:text-base font-medium tracking-wide transition-all duration-200 ${
              isTimerRunning ? 'text-gray-600' : 'text-gray-500'
            }`}
          >
            用时 {formattedTime}
          </span>
        </div>

        <footer className="mt-auto py-4 sm:py-5 text-center text-gray-500 text-xs sm:text-sm">
          <p>
            inspired by <a href="https://handle.antfu.me/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Handle</a>
          </p>
        </footer>

        {showHowToPlay && (
          <div 
            onClick={() => setShowHowToPlay(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">游戏规则</h2>
                <button 
                  onClick={() => setShowHowToPlay(false)}
                  className="text-gray-500 hover:text-gray-900 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">你有<strong>十次</strong>的机会猜一个<strong>四字词语</strong>。</p>
                <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-700">每次猜测后，汉字与拼音的颜色将会标识其与正确答案的区别。</p>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {['班', '门', '弄', '斧'].map((char, i) => (
                        <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-md">
                          <span className="text-base sm:text-lg">{char}</span>
                          <span className="text-[10px] sm:text-xs mt-0.5 text-white font-bold">{['bān', 'mén', 'nòng', 'fǔ'][i]}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-xs sm:text-sm text-gray-700">第二个字 <strong>门</strong> 为<strong>青色</strong>，表示其出现在答案中且在正确的位置。</p>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {['水', '落', '石', '出'].map((char, i) => (
                        <div key={i} className={`w-12 h-12 sm:w-14 sm:h-14 ${i === 0 ? 'bg-secondary' : 'bg-neutral'} rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-md`}>
                          <span className="text-base sm:text-lg">{char}</span>
                          <span className="text-[10px] sm:text-xs mt-0.5 text-white font-bold">{['shuǐ', 'luò', 'shí', 'chū'][i]}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-xs sm:text-sm text-gray-700">第一个字 <strong>水</strong> 为<strong>橙色</strong>，表示其出现在答案中，但并不是第一个字。</p>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {['巧', '夺', '天', '工'].map((char, i) => (
                        <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-md">
                          <span className="text-base sm:text-lg">{char}</span>
                          <span className="text-[10px] sm:text-xs mt-0.5 text-white font-bold">{['qiǎo', 'duó', 'tiān', 'gōng'][i]}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-xs sm:text-sm text-gray-700 mb-2">每个格子的<strong>汉字、声母、韵母、声调</strong>都会独立进行颜色的指示。</p>
                    <p className="text-center text-[10px] sm:text-xs text-gray-600 mb-1">例如，第一个 <strong>巧</strong> 汉字为灰色，而其<strong>声母</strong>与<strong>韵母</strong>均为青色，代表该位置的正确答案为其同音字但非 <strong>巧</strong> 字本身。</p>
                    <p className="text-center text-[10px] sm:text-xs text-gray-600">同理，第二个字中韵母 <strong>uo</strong> 为橙色，代表其韵母出现在四个字之中，但非位居第二。以此类推。</p>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {['武', '运', '昌', '隆'].map((char, i) => (
                        <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-md">
                          <span className="text-base sm:text-lg">{char}</span>
                          <span className="text-[10px] sm:text-xs mt-0.5 text-white font-bold">{['wǔ', 'yùn', 'chāng', 'lóng'][i]}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-xs sm:text-sm text-gray-700">当四个格子都为青色时，你便赢得了游戏！</p>
                  </div>
                </div>

                <p className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs text-gray-500 italic">* 新题目每日零时更新</p>
              </div>
            </div>
          </div>
        )}

        {showHint && (
          <div 
            onClick={() => setShowHint(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">游戏提示</h2>
                <button 
                  onClick={() => setShowHint(false)}
                  className="text-gray-500 hover:text-gray-900 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <div className="p-4 sm:p-6 flex flex-col items-center text-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                  {hintLevel === 1 ? '答案包含以下字音' : '答案包含以下汉字'}
                </h3>
                <div className="w-28 h-28 sm:w-32 sm:h-32 border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center bg-white mb-6 sm:mb-8 shadow-inner">
                  <div className="text-lg sm:text-xl text-gray-900 font-mono mb-2">{currentHint?.pinyin || ''}</div>
                  {hintLevel === 2 ? (
                    <div className="text-3xl sm:text-4xl font-bold text-gray-900">{currentHint?.char || ''}</div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-bold text-gray-400">?</div>
                  )}
                </div>
                {hintLevel === 1 && (
                  <button 
                    onClick={() => setHintLevel(2)}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-amber-600 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    进一步提示
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showCheatSheet && (
          <div 
            onClick={() => setShowCheatSheet(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">拼音速查表</h2>
                <button 
                  onClick={() => setShowCheatSheet(false)}
                  className="text-gray-500 hover:text-gray-900 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="mb-5 sm:mb-6">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-2 border-b border-gray-200">声母</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'].map((initial) => {
                      const state = getPinyinState('initial', initial);
                      let bgClass = 'bg-gray-100 text-gray-700';
                      if (state === 'correct') bgClass = 'bg-primary text-white';
                      if (state === 'present') bgClass = 'bg-secondary text-white';
                      return (
                        <span 
                          key={initial} 
                          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-mono ${bgClass} transition-colors`}
                        >
                          {initial}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-5 sm:mb-6">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-2 border-b border-gray-200">韵母</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'].map((final) => {
                      const state = getPinyinState('final', final);
                      let bgClass = 'bg-gray-100 text-gray-700';
                      if (state === 'correct') bgClass = 'bg-primary text-white';
                      if (state === 'present') bgClass = 'bg-secondary text-white';
                      return (
                        <span 
                          key={final} 
                          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-mono ${bgClass} transition-colors`}
                        >
                          {final}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-2 border-b border-gray-200">声调</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {[
                      { mark: 'ˉ', name: '第一声（阴平）' },
                      { mark: 'ˊ', name: '第二声（阳平）' },
                      { mark: 'ˇ', name: '第三声（上声）' },
                      { mark: 'ˋ', name: '第四声（去声）' },
                    ].map((tone) => (
                      <div key={tone.name} className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-md">
                        <span className="text-xl sm:text-2xl text-gray-900 w-5 sm:w-6 text-center">{tone.mark}</span>
                        <span className="text-xs sm:text-sm text-gray-700">{tone.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast 提示 */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
