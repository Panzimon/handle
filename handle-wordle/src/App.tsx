import { useState } from 'react';
import { useGame } from './useGame';
import { Cell } from './Cell';

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
    handleSubmit,
    initGame,
  } = useGame();



  return (
    <div className="app">
      <header className="header">
        <h1 className="title">汉字 Wordle</h1>
        <p className="subtitle">猜四字成语</p>
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
      </main>
    </div>
  );
}

export default App;