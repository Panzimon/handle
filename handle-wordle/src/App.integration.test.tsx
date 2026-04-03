import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// 模拟 useGame 钩子
const mockPlayAgain = jest.fn();
const mockChangeWord = jest.fn();
const mockSetCurrentInput = jest.fn();
const mockHandleSubmit = jest.fn();

jest.mock('./useGame', () => {
  return {
    useGame: jest.fn(() => ({
      grid: [
        [
          { char: '测', pinyin: { initial: 'c', final: 'e', tone: 4 }, charState: 'correct', initialState: 'correct', finalState: 'correct', toneState: 'correct' },
          { char: '试', pinyin: { initial: 's', final: 'hi', tone: 4 }, charState: 'present', initialState: 'present', finalState: 'present', toneState: 'present' },
          { char: '测', pinyin: { initial: 'c', final: 'e', tone: 4 }, charState: 'absent', initialState: 'absent', finalState: 'absent', toneState: 'absent' },
          { char: '试', pinyin: { initial: 's', final: 'hi', tone: 4 }, charState: 'absent', initialState: 'absent', finalState: 'absent', toneState: 'absent' },
        ],
        [
          { char: '', pinyin: { initial: '', final: '', tone: 0 }, charState: 'empty', initialState: 'empty', finalState: 'empty', toneState: 'empty' },
          { char: '', pinyin: { initial: '', final: '', tone: 0 }, charState: 'empty', initialState: 'empty', finalState: 'empty', toneState: 'empty' },
          { char: '', pinyin: { initial: '', final: '', tone: 0 }, charState: 'empty', initialState: 'empty', finalState: 'empty', toneState: 'empty' },
          { char: '', pinyin: { initial: '', final: '', tone: 0 }, charState: 'empty', initialState: 'empty', finalState: 'empty', toneState: 'empty' },
        ],
      ],
      currentInput: '',
      setCurrentInput: mockSetCurrentInput,
      gameState: 'playing',
      message: '',
      shakeRow: null,
      answer: '测试测试',
      handleSubmit: mockHandleSubmit,
      playAgain: mockPlayAgain,
      changeWord: mockChangeWord,
    })),
  };
});

// 模拟 pinyin 模块
jest.mock('./pinyin', () => ({
  getPinyin: jest.fn((char) => {
    const pinyinMap: Record<string, { initial: string; final: string; tone: number }> = {
      '测': { initial: 'c', final: 'e', tone: 4 },
      '试': { initial: 's', final: 'hi', tone: 4 },
    };
    return pinyinMap[char] || { initial: '', final: '', tone: 0 };
  }),
}));

// 导入 useGame 钩子
import { useGame } from './useGame';
const useGameMock = useGame as jest.MockedFunction<typeof useGame>;

describe('App Component Integration Tests', () => {
  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
  });

  test('should handle modal interactions correctly', async () => {
    render(<App />);

    // 点击提示按钮
    fireEvent.click(screen.getByText('提示'));

    // 检查提示模态框是否打开
    expect(screen.getByText('游戏提示')).toBeInTheDocument();

    // 点击关闭按钮
    fireEvent.click(screen.getByText('×'));

    // 检查提示模态框是否关闭
    expect(screen.queryByText('游戏提示')).not.toBeInTheDocument();

    // 点击速查表按钮
    fireEvent.click(screen.getByText('速查表'));

    // 检查速查表模态框是否打开
    expect(screen.getByText('拼音速查表')).toBeInTheDocument();

    // 点击关闭按钮
    fireEvent.click(screen.getByText('×'));

    // 检查速查表模态框是否关闭
    expect(screen.queryByText('拼音速查表')).not.toBeInTheDocument();

    // 点击玩法介绍按钮
    fireEvent.click(screen.getByText('玩法介绍'));

    // 检查玩法介绍模态框是否打开
    expect(screen.getByText('游戏规则')).toBeInTheDocument();

    // 点击关闭按钮
    fireEvent.click(screen.getByText('×'));

    // 检查玩法介绍模态框是否关闭
    expect(screen.queryByText('游戏规则')).not.toBeInTheDocument();
  });

  test('should handle input events correctly', async () => {
    render(<App />);

    const input = screen.getByPlaceholderText('输入四字成语');

    // 输入汉字
    fireEvent.change(input, { target: { value: '测试' } });

    // 检查 setCurrentInput 函数是否被调用
    expect(mockSetCurrentInput).toHaveBeenCalledWith('测试');
  });
});