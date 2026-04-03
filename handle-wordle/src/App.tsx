import { useState } from 'react';
import { useGame } from './useGame';
import { Cell } from './Cell';
import { getPinyin } from './pinyin';

import './App.css';

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
    initGame: resetGame,
  } = useGame();

  // 重新开始游戏时重置提示状态
  const initGame = () => {
    resetGame();
    setCurrentHint(null);
    setHintGenerated(false);
  };

  // 提示和速查表模态框状态
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  // 提示状态
  const [hintLevel, setHintLevel] = useState(1); // 1: 字音提示, 2: 汉字提示
  const [currentHint, setCurrentHint] = useState<{ char: string; pinyin: string } | null>(null);
  const [hintGenerated, setHintGenerated] = useState(false); // 标记是否已经生成过提示

  // 计算速查表中声母和韵母的状态
  const getPinyinState = (type: 'initial' | 'final', value: string) => {
    // 遍历所有已提交的猜测，从最新的开始检查
    for (let i = grid.length - 1; i >= 0; i--) {
      const row = grid[i];
      for (const cell of row) {
        if (type === 'initial' && cell.pinyin.initial === value) {
          if (cell.initialState === 'correct') {
            return 'correct';
          } else if (cell.initialState === 'present') {
            return 'present';
          }
        } else if (type === 'final' && cell.pinyin.final === value) {
          if (cell.finalState === 'correct') {
            return 'correct';
          } else if (cell.finalState === 'present') {
            return 'present';
          }
        }
      }
    }
    return null;
  };

  // 生成提示信息
  const generateHint = () => {
    // 随机选择一个字作为提示
    const randomIndex = Math.floor(Math.random() * answer.length);
    const hintChar = answer[randomIndex];
    const hintPinyin = getPinyin(hintChar);
    
    // 构建带声调的拼音
    const pinyinWithTone = addToneMark(hintPinyin.initial, hintPinyin.final, hintPinyin.tone);
    
    const newHint = {
      char: hintChar,
      pinyin: pinyinWithTone
    };
    
    setCurrentHint(newHint);
    return newHint;
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
      return initial + final + toneMarks[0][tone];
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



  return (
    <div className="app">
      <header className="header">
        <h1 className="title">汉字 Wordle</h1>
        <p className="subtitle">猜四字成语</p>
        <div className="header-buttons">
          <button className="header-btn" onClick={() => setShowHowToPlay(true)}>玩法介绍</button>
          <button className="header-btn" onClick={() => {
            if (!hintGenerated) {
              generateHint();
              setHintGenerated(true);
              setHintLevel(1);
            }
            setShowHint(true);
          }}>提示</button>
          <button className="header-btn" onClick={() => setShowCheatSheet(true)}>速查表</button>
        </div>
      </header>

      <main className="game">
        {/* 输入提示 */}
        <div className="input-hint">
          <p>请输入四字成语，然后按 Enter 键提交</p>
        </div>

        {/* 输入框用于捕获键盘输入 */}
        <input
          type="text"
          className="game-input"
          autoFocus
          placeholder="输入四字成语"
          maxLength={WORD_LENGTH}
          value={currentInput}
          disabled={gameState !== 'playing'}
          onChange={(e) => {
            const inputValue = (e.target as HTMLInputElement).value;
            // 直接使用输入值，让浏览器处理默认行为
            setCurrentInput(inputValue);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
              e.preventDefault();
            }
          }}
        />
        {/* 游戏说明 */}
        <div className="instructions">
          <p>你有 <strong>{MAX_ATTEMPTS}</strong> 次机会猜一个四字成语</p>
          <p>每次猜测后，汉字与拼音的颜色将标识其与正确答案的区别</p>
        </div>

        {/* 示例说明 */}
        <div className="examples">
          <div className="example">
            <div className="example-cells">
              <div className="example-cell correct">
                <span className="example-char">班</span>
                <span className="example-pinyin">ban</span>
              </div>
            </div>
            <p className="example-text">
              <strong>青色</strong>表示汉字、声母、韵母、声调都正确
            </p>
          </div>
          <div className="example">
            <div className="example-cells">
              <div className="example-cell present">
                <span className="example-char">水</span>
                <span className="example-pinyin">shui</span>
              </div>
            </div>
            <p className="example-text">
              <strong>橙色</strong>表示该元素存在于答案中但位置不对
            </p>
          </div>
          <div className="example">
            <div className="example-cells">
              <div className="example-cell absent">
                <span className="example-char">天</span>
                <span className="example-pinyin">tian</span>
              </div>
            </div>
            <p className="example-text">
              <strong>灰色</strong>表示该元素不存在于答案中
            </p>
          </div>
        </div>

        {/* 游戏网格 */}
        <div className="grid">
          {grid.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid-row ${shakeRow === rowIndex ? 'shake' : ''}`}
            >
              {row.map((cell, cellIndex) => (
                <Cell key={cellIndex} data={cell} />
              ))}
            </div>
          ))}
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`message ${gameState !== 'playing' ? 'visible' : ''}`}>
            {message}
          </div>
        )}

        {/* 重新开始按钮 */}
        {gameState !== 'playing' && (
          <button className="restart-button" onClick={initGame}>
            再玩一次
          </button>
        )}



        {/* 页脚 */}
        <footer className="footer">
          <p>
            inspired by <a href="https://handle.antfu.me/" target="_blank" rel="noopener noreferrer">Handle</a>
          </p>
        </footer>

        {/* 玩法介绍模态框 */}
        {showHowToPlay && (
          <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>游戏规则</h2>
                <button className="modal-close" onClick={() => setShowHowToPlay(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>你有<strong>十次</strong>的机会猜一个<strong>四字词语</strong>。</p>
                <p>每次猜测后，汉字与拼音的颜色将会标识其与正确答案的区别。</p>
                
                <div className="hint-examples">
                  <div className="hint-example">
                    <div className="hint-cells">
                      <div className="hint-cell correct"><span className="hint-char">班</span><span className="hint-pinyin">ban</span></div>
                      <div className="hint-cell correct"><span className="hint-char">门</span><span className="hint-pinyin">men</span></div>
                      <div className="hint-cell correct"><span className="hint-char">弄</span><span className="hint-pinyin">nong</span></div>
                      <div className="hint-cell correct"><span className="hint-char">斧</span><span className="hint-pinyin">fu</span></div>
                    </div>
                    <p className="hint-text">第二个字 <strong>门</strong> 为<strong>青色</strong>，表示其出现在答案中且在正确的位置。</p>
                  </div>

                  <div className="hint-example">
                    <div className="hint-cells">
                      <div className="hint-cell present"><span className="hint-char">水</span><span className="hint-pinyin">shui</span></div>
                      <div className="hint-cell absent"><span className="hint-char">落</span><span className="hint-pinyin">luo</span></div>
                      <div className="hint-cell absent"><span className="hint-char">石</span><span className="hint-pinyin">shi</span></div>
                      <div className="hint-cell absent"><span className="hint-char">出</span><span className="hint-pinyin">chu</span></div>
                    </div>
                    <p className="hint-text">第一个字 <strong>水</strong> 为<strong>橙色</strong>，表示其出现在答案中，但并不是第一个字。</p>
                  </div>

                  <div className="hint-example">
                    <div className="hint-cells">
                      <div className="hint-cell absent"><span className="hint-char">巧</span><span className="hint-pinyin">qiao</span></div>
                      <div className="hint-cell absent"><span className="hint-char">夺</span><span className="hint-pinyin">duo</span></div>
                      <div className="hint-cell absent"><span className="hint-char">天</span><span className="hint-pinyin">tian</span></div>
                      <div className="hint-cell absent"><span className="hint-char">工</span><span className="hint-pinyin">gong</span></div>
                    </div>
                    <p className="hint-text">每个格子的<strong>汉字、声母、韵母、声调</strong>都会独立进行颜色的指示。</p>
                    <p className="hint-text-sub">例如，第一个 <strong>巧</strong> 汉字为灰色，而其<strong>声母</strong>与<strong>韵母</strong>均为青色，代表该位置的正确答案为其同音字但非 <strong>巧</strong> 字本身。</p>
                    <p className="hint-text-sub">同理，第二个字中韵母 <strong>uo</strong> 为橙色，代表其韵母出现在四个字之中，但非位居第二。以此类推。</p>
                  </div>

                  <div className="hint-example">
                    <div className="hint-cells">
                      <div className="hint-cell correct"><span className="hint-char">武</span><span className="hint-pinyin">wu</span></div>
                      <div className="hint-cell correct"><span className="hint-char">运</span><span className="hint-pinyin">yun</span></div>
                      <div className="hint-cell correct"><span className="hint-char">昌</span><span className="hint-pinyin">chang</span></div>
                      <div className="hint-cell correct"><span className="hint-char">隆</span><span className="hint-pinyin">long</span></div>
                    </div>
                    <p className="hint-text">当四个格子都为青色时，你便赢得了游戏！</p>
                  </div>
                </div>

                <p className="hint-footer">* 新题目每日零时更新</p>
              </div>
            </div>
          </div>
        )}

        {/* 提示模态框 */}
        {showHint && (
          <div className="modal-overlay" onClick={() => setShowHint(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>游戏提示</h2>
                <button className="modal-close" onClick={() => setShowHint(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="hint-container">
                  <h3 className="hint-title">{hintLevel === 1 ? '答案包含以下字音' : '答案包含以下汉字'}</h3>
                  <div className="hint-box">
                    <div className="hint-pinyin">{currentHint?.pinyin || ''}</div>
                    {hintLevel === 2 && (
                      <div className="hint-char">{currentHint?.char || ''}</div>
                    )}
                    {hintLevel === 1 && (
                      <div className="hint-question">?</div>
                    )}
                  </div>
                  {hintLevel === 1 && (
                    <button className="hint-button" onClick={() => setHintLevel(2)}>
                      进一步提示
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 速查表模态框 */}
        {showCheatSheet && (
          <div className="modal-overlay" onClick={() => setShowCheatSheet(false)}>
            <div className="modal-content cheat-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>拼音速查表</h2>
                <button className="modal-close" onClick={() => setShowCheatSheet(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="cheat-sheet-section">
                  <h3>声母</h3>
                  <div className="pinyin-grid">
                    {['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'].map((initial) => {
                      const state = getPinyinState('initial', initial);
                      return (
                        <span 
                          key={initial} 
                          className={`pinyin-item ${state || ''}`}
                        >
                          {initial}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="cheat-sheet-section">
                  <h3>韵母</h3>
                  <div className="pinyin-grid">
                    {['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'].map((final) => {
                      const state = getPinyinState('final', final);
                      return (
                        <span 
                          key={final} 
                          className={`pinyin-item ${state || ''}`}
                        >
                          {final}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="cheat-sheet-section">
                  <h3>声调</h3>
                  <div className="tone-examples">
                    <div className="tone-item">
                      <span className="tone-mark">ˉ</span>
                      <span className="tone-name">第一声（阴平）</span>
                    </div>
                    <div className="tone-item">
                      <span className="tone-mark">ˊ</span>
                      <span className="tone-name">第二声（阳平）</span>
                    </div>
                    <div className="tone-item">
                      <span className="tone-mark">ˇ</span>
                      <span className="tone-name">第三声（上声）</span>
                    </div>
                    <div className="tone-item">
                      <span className="tone-mark">ˋ</span>
                      <span className="tone-name">第四声（去声）</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;