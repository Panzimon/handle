
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// 模拟 useGame 钩子
jest.mock('./useGame', () => ({
  useGame: () => ({
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
    currentInput: '测试',
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

describe('App Component', () => {
  test('should render game grid correctly', () => {
    render(<App />);

    // 检查游戏网格是否渲染
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // 检查网格中的单元格是否渲染
    const cells = main.querySelectorAll('div > div');
    expect(cells.length).toBeGreaterThan(0);
  });

  test('should render input field correctly', () => {
    render(<App />);

    // 检查输入框是否渲染
    const input = screen.getByPlaceholderText('输入四字成语');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('测试');
  });

  test('should render control buttons correctly', () => {
    render(<App />);

    // 检查控制按钮是否渲染
    expect(screen.getByText('提示')).toBeInTheDocument();
    expect(screen.getByText('速查表')).toBeInTheDocument();
    expect(screen.getByText('玩法介绍')).toBeInTheDocument();
  });

  test('should open hint modal when hint button is clicked', () => {
    render(<App />);

    // 点击提示按钮
    fireEvent.click(screen.getByText('提示'));

    // 检查提示模态框是否打开
    expect(screen.getByText('游戏提示')).toBeInTheDocument();
  });

  test('should open cheat sheet modal when cheat sheet button is clicked', () => {
    render(<App />);

    // 点击速查表按钮
    fireEvent.click(screen.getByText('速查表'));

    // 检查速查表模态框是否打开
    expect(screen.getByText('拼音速查表')).toBeInTheDocument();
  });

  test('should open how to play modal when how to play button is clicked', () => {
    render(<App />);

    // 点击玩法介绍按钮
    fireEvent.click(screen.getByText('玩法介绍'));

    // 检查玩法介绍模态框是否打开
    expect(screen.getByText('游戏规则')).toBeInTheDocument();
  });

  test('should show toast for invalid input', async () => {
    render(<App />);

    // 输入英文
    const input = screen.getByPlaceholderText('输入四字成语');
    fireEvent.change(input, { target: { value: 'test' } });

    // 等待 toast 显示
    await waitFor(() => {
      expect(screen.getByText('请使用中文输入，不要包含英文字符')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  test('should show toast for input with spaces', async () => {
    render(<App />);

    // 输入包含空格
    const input = screen.getByPlaceholderText('输入四字成语');
    fireEvent.change(input, { target: { value: '测 试' } });

    // 等待 toast 显示
    await waitFor(() => {
      expect(screen.getByText('请不要输入空格')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  test('should show toast for input with special characters', async () => {
    render(<App />);

    // 输入包含特殊字符
    const input = screen.getByPlaceholderText('输入四字成语');
    fireEvent.change(input, { target: { value: '测试123' } });

    // 等待 toast 显示
    await waitFor(() => {
      expect(screen.getByText('请只输入汉字')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  test('should show toast for input length less than 4 when submitting', async () => {
    render(<App />);

    // 输入少于4个汉字
    const input = screen.getByPlaceholderText('输入四字成语');
    fireEvent.change(input, { target: { value: '测试' } });

    // 按 Enter 键提交
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // 等待 toast 显示
    await waitFor(() => {
      expect(screen.getByText('请输入4个汉字')).toBeInTheDocument();
    }, { timeout: 500 });
  });
});