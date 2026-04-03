import { renderHook, act } from '@testing-library/react';
import { useGame } from './useGame';
import { getDailyIdiom, getRandomIdiom, isValidIdiom } from './words';

// 模拟 words 模块
jest.mock('./words', () => ({
  getDailyIdiom: jest.fn(() => '测试测试'),
  getRandomIdiom: jest.fn(() => '随机成语'),
  isValidIdiom: jest.fn((idiom) => idiom === '测试测试' || idiom === '随机成语' || idiom === '有效成语'),
}));

// 模拟 pinyin 模块
jest.mock('./pinyin', () => ({
  getPinyin: jest.fn((char) => {
    const pinyinMap: Record<string, { initial: string; final: string; tone: number }> = {
      '测': { initial: 'c', final: 'e', tone: 4 },
      '试': { initial: 's', final: 'hi', tone: 4 },
      '随': { initial: 's', final: 'ui', tone: 2 },
      '机': { initial: 'j', final: 'i', tone: 1 },
      '成': { initial: 'ch', final: 'eng', tone: 2 },
      '语': { initial: 'y', final: 'u', tone: 3 },
      '有': { initial: 'y', final: 'ou', tone: 3 },
      '效': { initial: 'x', final: 'iao', tone: 4 },
    };
    return pinyinMap[char] || { initial: '', final: '', tone: 0 };
  }),
}));

describe('useGame Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize game with daily idiom', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.answer).toBe('测试测试');
    expect(result.current.grid.length).toBe(1);
    expect(result.current.currentInput).toBe('');
    expect(result.current.gameState).toBe('playing');
    expect(result.current.message).toBe('');
    expect(result.current.shakeRow).toBe(null);
  });

  test('should handle input correctly', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.handleInput('测');
    });

    expect(result.current.currentInput).toBe('测');

    act(() => {
      result.current.handleInput('试');
    });

    expect(result.current.currentInput).toBe('测试');
  });

  test('should not exceed word length limit', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.handleInput('测');
      result.current.handleInput('试');
      result.current.handleInput('测');
      result.current.handleInput('试');
      result.current.handleInput('测'); // 超过长度限制，应该被忽略
    });

    expect(result.current.currentInput).toBe('测试测试');
  });

  test('should handle delete correctly', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.handleInput('测');
      result.current.handleInput('试');
    });

    expect(result.current.currentInput).toBe('测试');

    act(() => {
      result.current.handleDelete();
    });

    expect(result.current.currentInput).toBe('测');

    act(() => {
      result.current.handleDelete();
    });

    expect(result.current.currentInput).toBe('');
  });

  test('should show error message for short input', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.setCurrentInput('测试');
      result.current.handleSubmit();
    });

    expect(result.current.message).toBe('请输入四个字');
    expect(result.current.shakeRow).toBe(0);
  });

  test('should show error message for invalid idiom', () => {
    const { result, rerender } = renderHook(() => useGame());

    // 先设置输入
    act(() => {
      result.current.setCurrentInput('无效成语');
    });

    // 重新渲染，确保状态更新
    rerender();

    // 然后提交
    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.message).toBe('请输入有效的四字成语');
    expect(result.current.shakeRow).toBe(0);
  });

  test('should handle valid guess correctly', () => {
    const { result, rerender } = renderHook(() => useGame());

    // 先设置输入
    act(() => {
      result.current.setCurrentInput('测试测试');
    });

    // 重新渲染，确保状态更新
    rerender();

    // 然后提交
    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.gameState).toBe('won');
    expect(result.current.message).toBe('恭喜你，猜对了！');
    expect(result.current.grid.length).toBe(2); // 因为会添加一个新的空行
  });

  test('should handle incorrect guess correctly', () => {
    const { result, rerender } = renderHook(() => useGame());

    // 先设置输入
    act(() => {
      result.current.setCurrentInput('有效成语');
    });

    // 重新渲染，确保状态更新
    rerender();

    // 然后提交
    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.gameState).toBe('playing');
    expect(result.current.message).toBe('');
    expect(result.current.grid.length).toBe(2);
    expect(result.current.currentInput).toBe('');
  });

  test('should handle game over correctly', () => {
    const { result, rerender } = renderHook(() => useGame());

    // 模拟10次猜测都失败
    for (let i = 0; i < 10; i++) {
      // 先设置输入
      act(() => {
        result.current.setCurrentInput('有效成语');
      });

      // 重新渲染，确保状态更新
      rerender();

      // 然后提交
      act(() => {
        result.current.handleSubmit();
      });

      // 重新渲染，确保状态更新
      rerender();
    }

    expect(result.current.gameState).toBe('lost');
    expect(result.current.message).toBe('游戏结束，答案是：测试测试');
  });

  test('should reset game state when playAgain is called', () => {
    const { result, rerender } = renderHook(() => useGame());

    // 先进行一次猜测
    // 先设置输入
    act(() => {
      result.current.setCurrentInput('有效成语');
    });

    // 重新渲染，确保状态更新
    rerender();

    // 然后提交
    act(() => {
      result.current.handleSubmit();
    });

    // 重新渲染，确保状态更新
    rerender();

    expect(result.current.grid.length).toBe(2);

    // 调用 playAgain
    act(() => {
      result.current.playAgain();
    });

    // 重新渲染，确保状态更新
    rerender();

    expect(result.current.grid.length).toBe(1);
    expect(result.current.currentInput).toBe('');
    expect(result.current.gameState).toBe('playing');
    expect(result.current.message).toBe('');
    expect(result.current.shakeRow).toBe(null);
    expect(result.current.answer).toBe('测试测试'); // 保持当前成语
  });

  test('should change word when changeWord is called', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.changeWord();
    });

    expect(result.current.answer).toBe('随机成语');
    expect(result.current.grid.length).toBe(1);
    expect(result.current.currentInput).toBe('');
    expect(result.current.gameState).toBe('playing');
    expect(result.current.message).toBe('');
    expect(result.current.shakeRow).toBe(null);
  });

  test('should not handle input when game is not playing', () => {
    const { result, rerender } = renderHook(() => useGame());

    // 先赢得游戏
    // 先设置输入
    act(() => {
      result.current.setCurrentInput('测试测试');
    });

    // 重新渲染，确保状态更新
    rerender();

    // 然后提交
    act(() => {
      result.current.handleSubmit();
    });

    // 重新渲染，确保状态更新
    rerender();

    expect(result.current.gameState).toBe('won');

    // 尝试输入，应该被忽略
    act(() => {
      result.current.handleInput('测');
    });

    // 重新渲染，确保状态更新
    rerender();

    expect(result.current.currentInput).toBe('测试测试'); // 游戏结束后，currentInput 不会被清空

    // 尝试删除，应该被忽略
    act(() => {
      result.current.handleDelete();
    });

    // 重新渲染，确保状态更新
    rerender();

    expect(result.current.currentInput).toBe('测试测试'); // 游戏结束后，currentInput 不会被清空

    // 尝试提交，应该被忽略
    act(() => {
      result.current.handleSubmit();
    });

    // 重新渲染，确保状态更新
    rerender();

    expect(result.current.gameState).toBe('won');
  });
});