
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Input Validation System', () => {
  test('should show error toast for English input', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('输入四字成语');
    
    // 输入英文
    fireEvent.change(input, { target: { value: 'test' } });
    
    // 等待防抖
    await waitFor(() => {
      expect(screen.getByText('请使用中文输入，不要包含英文字符')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  test('should show error toast for input with spaces', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('输入四字成语');
    
    // 输入包含空格
    fireEvent.change(input, { target: { value: '测 试' } });
    
    // 等待防抖
    await waitFor(() => {
      expect(screen.getByText('请不要输入空格')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  test('should show error toast for input with special characters', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('输入四字成语');
    
    // 输入包含特殊字符
    fireEvent.change(input, { target: { value: '测试123' } });
    
    // 等待防抖
    await waitFor(() => {
      expect(screen.getByText('请只输入汉字')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  test('should show error toast for input length less than 4 when submitting', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('输入四字成语');
    
    // 输入少于4个汉字
    fireEvent.change(input, { target: { value: '测试' } });
    
    // 按 Enter 键提交
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // 检查是否显示错误提示
    expect(screen.getByText('请输入4个汉字')).toBeInTheDocument();
  });

  test('should not show error toast for valid Chinese input', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('输入四字成语');
    
    // 输入有效的四字成语
    fireEvent.change(input, { target: { value: '测试测试' } });
    
    // 等待防抖
    await waitFor(() => {
      // 检查是否没有错误提示
      expect(screen.queryByText('请使用中文输入，不要包含英文字符')).not.toBeInTheDocument();
      expect(screen.queryByText('请不要输入空格')).not.toBeInTheDocument();
      expect(screen.queryByText('请只输入汉字')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });

  test('should handle composition events correctly', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('输入四字成语');
    
    // 直接输入拼音，模拟组合输入结束后的状态
    fireEvent.change(input, { target: { value: 'ceshi' } });
    
    // 等待防抖
    await waitFor(() => {
      // 检查是否显示错误提示
      expect(screen.getByText('请使用中文输入，不要包含英文字符')).toBeInTheDocument();
    }, { timeout: 500 });
  });
});