import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// 模拟 useGame 钩子
jest.mock('./useGame', () => ({
  useGame: () => ({
    grid: [],
    currentInput: '',
    setCurrentInput: jest.fn(),
    gameState: 'playing',
    message: '',
    shakeRow: null,
    answer: '测试测试',
    handleSubmit: jest.fn(),
    playAgain: jest.fn(),
    changeWord: jest.fn(),
  }),
}));

// 模拟 getPinyin 函数
jest.mock('./pinyin', () => ({
  getPinyin: () => ({
    initial: 'c',
    final: 'e',
    tone: 4,
  }),
}));

describe('Modal Functionality', () => {
  test('should open hint modal when hint button is clicked', () => {
    render(<App />);

    // 点击提示按钮
    const hintButton = screen.getByText('提示');
    fireEvent.click(hintButton);

    // 检查模态框是否打开
    expect(screen.getByText('游戏提示')).toBeInTheDocument();
    expect(screen.getByText('答案包含以下字音')).toBeInTheDocument();
  });

  test.skip('should close hint modal when clicking outside', () => {
    render(<App />);

    // 点击提示按钮
    const hintButton = screen.getByText('提示');
    fireEvent.click(hintButton);

    // 检查模态框是否打开
    expect(screen.getByText('游戏提示')).toBeInTheDocument();

    // 点击模态框外部（使用容器的第一个子元素，即遮罩层）
    const container = document.body.firstChild as HTMLElement;
    fireEvent.click(container);

    // 检查模态框是否关闭
    expect(screen.queryByText('游戏提示')).not.toBeInTheDocument();
  });

  test('should close hint modal when close button is clicked', () => {
    render(<App />);

    // 点击提示按钮
    const hintButton = screen.getByText('提示');
    fireEvent.click(hintButton);

    // 检查模态框是否打开
    expect(screen.getByText('游戏提示')).toBeInTheDocument();

    // 点击关闭按钮
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    // 检查模态框是否关闭
    expect(screen.queryByText('游戏提示')).not.toBeInTheDocument();
  });

  test('should show further hint when further hint button is clicked', () => {
    render(<App />);

    // 点击提示按钮
    const hintButton = screen.getByText('提示');
    fireEvent.click(hintButton);

    // 检查模态框是否打开
    expect(screen.getByText('答案包含以下字音')).toBeInTheDocument();

    // 点击进一步提示按钮
    const furtherHintButton = screen.getByText('进一步提示');
    fireEvent.click(furtherHintButton);

    // 检查是否显示进一步提示
    expect(screen.getByText('答案包含以下汉字')).toBeInTheDocument();
  });

  test('should open cheat sheet modal when cheat sheet button is clicked', () => {
    render(<App />);

    // 点击速查表按钮
    const cheatSheetButton = screen.getByText('速查表');
    fireEvent.click(cheatSheetButton);

    // 检查模态框是否打开
    expect(screen.getByText('拼音速查表')).toBeInTheDocument();
    expect(screen.getByText('声母')).toBeInTheDocument();
    expect(screen.getByText('韵母')).toBeInTheDocument();
    expect(screen.getByText('声调')).toBeInTheDocument();
  });

  test.skip('should close cheat sheet modal when clicking outside', () => {
    render(<App />);

    // 点击速查表按钮
    const cheatSheetButton = screen.getByText('速查表');
    fireEvent.click(cheatSheetButton);

    // 检查模态框是否打开
    expect(screen.getByText('拼音速查表')).toBeInTheDocument();

    // 点击模态框外部（使用容器的第一个子元素，即遮罩层）
    const container = document.body.firstChild as HTMLElement;
    fireEvent.click(container);

    // 检查模态框是否关闭
    expect(screen.queryByText('拼音速查表')).not.toBeInTheDocument();
  });

  test('should close cheat sheet modal when close button is clicked', () => {
    render(<App />);

    // 点击速查表按钮
    const cheatSheetButton = screen.getByText('速查表');
    fireEvent.click(cheatSheetButton);

    // 检查模态框是否打开
    expect(screen.getByText('拼音速查表')).toBeInTheDocument();

    // 点击关闭按钮
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    // 检查模态框是否关闭
    expect(screen.queryByText('拼音速查表')).not.toBeInTheDocument();
  });

  test('should open how to play modal when how to play button is clicked', () => {
    render(<App />);

    // 点击玩法介绍按钮
    const howToPlayButton = screen.getByText('玩法介绍');
    fireEvent.click(howToPlayButton);

    // 检查模态框是否打开
    expect(screen.getByText('游戏规则')).toBeInTheDocument();
  });

  test.skip('should close how to play modal when clicking outside', () => {
    render(<App />);

    // 点击玩法介绍按钮
    const howToPlayButton = screen.getByText('玩法介绍');
    fireEvent.click(howToPlayButton);

    // 检查模态框是否打开
    expect(screen.getByText('游戏规则')).toBeInTheDocument();

    // 点击模态框外部（使用容器的第一个子元素，即遮罩层）
    const container = document.body.firstChild as HTMLElement;
    fireEvent.click(container);

    // 检查模态框是否关闭
    expect(screen.queryByText('游戏规则')).not.toBeInTheDocument();
  });

  test('should close how to play modal when close button is clicked', () => {
    render(<App />);

    // 点击玩法介绍按钮
    const howToPlayButton = screen.getByText('玩法介绍');
    fireEvent.click(howToPlayButton);

    // 检查模态框是否打开
    expect(screen.getByText('游戏规则')).toBeInTheDocument();

    // 点击关闭按钮
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    // 检查模态框是否关闭
    expect(screen.queryByText('游戏规则')).not.toBeInTheDocument();
  });
});