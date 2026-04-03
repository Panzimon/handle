/**
 * useGame Hook 测试套件
 * 
 * 测试目标：验证游戏逻辑的正确性、稳定性和边界条件处理
 * 测试范围：
 * - 游戏初始化
 * - 输入处理
 * - 猜测提交
 * - 游戏状态管理
 * - 边界条件处理
 * - 异常场景处理
 */

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
  // 在每个测试前重置所有模拟函数
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // 游戏初始化测试
  // ============================================
  describe('Game Initialization', () => {
    /**
     * 测试目的：验证游戏初始化时是否正确设置每日成语
     * 预期结果：
     * - 答案为每日成语
     * - 网格只有一行（空行）
     * - 当前输入为空
     * - 游戏状态为 playing
     * - 消息为空
     * - 抖动行为 null
     */
    test('should initialize game with daily idiom', () => {
      const { result } = renderHook(() => useGame());

      expect(result.current.answer).toBe('测试测试');
      expect(result.current.grid.length).toBe(1);
      expect(result.current.currentInput).toBe('');
      expect(result.current.gameState).toBe('playing');
      expect(result.current.message).toBe('');
      expect(result.current.shakeRow).toBe(null);
    });
  });

  // ============================================
  // 输入处理测试
  // ============================================
  describe('Input Handling', () => {
    /**
     * 测试目的：验证正常输入处理
     * 预期结果：输入的字符被正确添加到当前输入中
     */
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

    /**
     * 测试目的：验证输入长度限制
     * 边界条件：输入超过4个字符
     * 预期结果：超过长度限制的输入被忽略
     */
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

    /**
     * 测试目的：验证删除功能
     * 预期结果：删除操作正确移除最后一个字符
     */
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

    /**
     * 测试目的：验证空输入时的删除操作
     * 边界条件：输入为空时删除
     * 预期结果：删除操作不会导致错误
     */
    test('should handle delete on empty input', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.handleDelete();
      });

      expect(result.current.currentInput).toBe('');
    });

    /**
     * 测试目的：验证连续删除操作
     * 边界条件：连续删除多次
     * 预期结果：删除操作正确处理
     */
    test('should handle multiple consecutive deletes', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.handleInput('测');
        result.current.handleInput('试');
        result.current.handleInput('测');
        result.current.handleInput('试');
      });

      expect(result.current.currentInput).toBe('测试测试');

      act(() => {
        result.current.handleDelete();
        result.current.handleDelete();
        result.current.handleDelete();
        result.current.handleDelete();
        result.current.handleDelete(); // 第5次删除，应该无效
      });

      expect(result.current.currentInput).toBe('');
    });
  });

  // ============================================
  // 猜测提交测试
  // ============================================
  describe('Guess Submission', () => {
    /**
     * 测试目的：验证输入长度不足时的错误提示
     * 边界条件：输入少于4个字符
     * 预期结果：显示错误消息并触发抖动动画
     */
    test('should show error message for short input', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('测试');
        result.current.handleSubmit();
      });

      expect(result.current.message).toBe('请输入四个字');
      expect(result.current.shakeRow).toBe(0);
    });

    /**
     * 测试目的：验证无效成语的错误提示
     * 边界条件：输入的不是有效成语
     * 预期结果：显示错误消息并触发抖动动画
     */
    test('should show error message for invalid idiom', () => {
      const { result, rerender } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('无效成语');
      });

      rerender();

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.message).toBe('请输入有效的四字成语');
      expect(result.current.shakeRow).toBe(0);
    });

    /**
     * 测试目的：验证正确猜测的处理
     * 预期结果：游戏状态变为 won，显示恭喜消息
     */
    test('should handle valid guess correctly', () => {
      const { result, rerender } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('测试测试');
      });

      rerender();

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.gameState).toBe('won');
      expect(result.current.message).toBe('恭喜你，猜对了！');
      expect(result.current.grid.length).toBe(2); // 因为会添加一个新的空行
    });

    /**
     * 测试目的：验证错误猜测的处理
     * 预期结果：游戏继续，网格增加一行
     */
    test('should handle incorrect guess correctly', () => {
      const { result, rerender } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('有效成语');
      });

      rerender();

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.gameState).toBe('playing');
      expect(result.current.message).toBe('');
      expect(result.current.grid.length).toBe(2);
      expect(result.current.currentInput).toBe('');
    });

    /**
     * 测试目的：验证第9次猜测的处理
     * 边界条件：接近游戏结束
     * 预期结果：游戏继续
     */
    test('should handle 9th guess correctly', () => {
      const { result, rerender } = renderHook(() => useGame());

      // 模拟9次猜测都失败
      for (let i = 0; i < 9; i++) {
        act(() => {
          result.current.setCurrentInput('有效成语');
        });

        rerender();

        act(() => {
          result.current.handleSubmit();
        });

        rerender();
      }

      expect(result.current.gameState).toBe('playing');
      expect(result.current.grid.length).toBe(10);
    });

    /**
     * 测试目的：验证游戏结束的处理
     * 边界条件：用完所有猜测次数
     * 预期结果：游戏状态变为 lost，显示答案
     */
    test('should handle game over correctly', () => {
      const { result, rerender } = renderHook(() => useGame());

      // 模拟10次猜测都失败
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setCurrentInput('有效成语');
        });

        rerender();

        act(() => {
          result.current.handleSubmit();
        });

        rerender();
      }

      expect(result.current.gameState).toBe('lost');
      expect(result.current.message).toBe('游戏结束，答案是：测试测试');
    });
  });

  // ============================================
  // 游戏状态管理测试
  // ============================================
  describe('Game State Management', () => {
    /**
     * 测试目的：验证重新开始游戏功能
     * 预期结果：游戏状态重置，但保持当前成语
     */
    test('should reset game state when playAgain is called', () => {
      const { result, rerender } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('有效成语');
      });

      rerender();

      act(() => {
        result.current.handleSubmit();
      });

      rerender();

      expect(result.current.grid.length).toBe(2);

      act(() => {
        result.current.playAgain();
      });

      rerender();

      expect(result.current.grid.length).toBe(1);
      expect(result.current.currentInput).toBe('');
      expect(result.current.gameState).toBe('playing');
      expect(result.current.message).toBe('');
      expect(result.current.shakeRow).toBe(null);
      expect(result.current.answer).toBe('测试测试'); // 保持当前成语
    });

    /**
     * 测试目的：验证换词功能
     * 预期结果：游戏状态重置，并更换新的成语
     */
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

    /**
     * 测试目的：验证游戏结束后不能继续输入
     * 边界条件：游戏状态为 won
     * 预期结果：输入操作被忽略
     */
    test('should not handle input when game is won', () => {
      const { result, rerender } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('测试测试');
      });

      rerender();

      act(() => {
        result.current.handleSubmit();
      });

      rerender();

      expect(result.current.gameState).toBe('won');

      act(() => {
        result.current.handleInput('测');
      });

      rerender();

      expect(result.current.currentInput).toBe('测试测试'); // 游戏结束后，currentInput 不会被清空

      act(() => {
        result.current.handleDelete();
      });

      rerender();

      expect(result.current.currentInput).toBe('测试测试'); // 游戏结束后，currentInput 不会被清空

      act(() => {
        result.current.handleSubmit();
      });

      rerender();

      expect(result.current.gameState).toBe('won');
    });

    /**
     * 测试目的：验证游戏结束后不能继续输入
     * 边界条件：游戏状态为 lost
     * 预期结果：输入操作被忽略
     */
    test('should not handle input when game is lost', () => {
      const { result, rerender } = renderHook(() => useGame());

      // 模拟10次猜测都失败
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setCurrentInput('有效成语');
        });

        rerender();

        act(() => {
          result.current.handleSubmit();
        });

        rerender();
      }

      expect(result.current.gameState).toBe('lost');

      act(() => {
        result.current.handleInput('测');
      });

      rerender();

      expect(result.current.gameState).toBe('lost');
    });
  });

  // ============================================
  // 边界条件测试
  // ============================================
  describe('Boundary Conditions', () => {
    /**
     * 测试目的：验证空输入提交
     * 边界条件：输入为空
     * 预期结果：显示错误消息
     */
    test('should handle empty input submission', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('');
        result.current.handleSubmit();
      });

      expect(result.current.message).toBe('请输入四个字');
    });

    /**
     * 测试目的：验证单字输入提交
     * 边界条件：输入只有1个字符
     * 预期结果：显示错误消息
     */
    test('should handle single character input submission', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('测');
        result.current.handleSubmit();
      });

      expect(result.current.message).toBe('请输入四个字');
    });

    /**
     * 测试目的：验证双字输入提交
     * 边界条件：输入只有2个字符
     * 预期结果：显示错误消息
     */
    test('should handle two character input submission', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('测试');
        result.current.handleSubmit();
      });

      expect(result.current.message).toBe('请输入四个字');
    });

    /**
     * 测试目的：验证三字输入提交
     * 边界条件：输入只有3个字符
     * 预期结果：显示错误消息
     */
    test('should handle three character input submission', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('测试测');
        result.current.handleSubmit();
      });

      expect(result.current.message).toBe('请输入四个字');
    });

    /**
     * 测试目的：验证第一次猜测
     * 边界条件：游戏刚开始
     * 预期结果：猜测正常处理
     */
    test('should handle first guess correctly', () => {
      const { result, rerender } = renderHook(() => useGame());

      act(() => {
        result.current.setCurrentInput('有效成语');
      });

      rerender();

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.grid.length).toBe(2);
      expect(result.current.gameState).toBe('playing');
    });

    /**
     * 测试目的：验证最后一次猜测
     * 边界条件：最后一次猜测机会
     * 预期结果：游戏结束
     */
    test('should handle last guess correctly', () => {
      const { result, rerender } = renderHook(() => useGame());

      // 模拟9次猜测都失败
      for (let i = 0; i < 9; i++) {
        act(() => {
          result.current.setCurrentInput('有效成语');
        });

        rerender();

        act(() => {
          result.current.handleSubmit();
        });

        rerender();
      }

      // 第10次猜测
      act(() => {
        result.current.setCurrentInput('有效成语');
      });

      rerender();

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.gameState).toBe('lost');
      expect(result.current.grid.length).toBe(10);
    });
  });

  // ============================================
  // 性能测试
  // ============================================
  describe('Performance Tests', () => {
    /**
     * 测试目的：验证连续输入的性能
     * 性能指标：连续输入操作应该在合理时间内完成
     * 预期结果：所有输入操作正确处理
     */
    test('should handle rapid consecutive inputs', () => {
      const { result } = renderHook(() => useGame());

      const startTime = performance.now();

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.handleInput('测');
          result.current.handleDelete();
        }
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.current.currentInput).toBe('');
      expect(executionTime).toBeLessThan(100); // 应该在100ms内完成
    });

    /**
     * 测试目的：验证游戏初始化的性能
     * 性能指标：游戏初始化应该在合理时间内完成
     * 预期结果：初始化时间小于50ms
     */
    test('should initialize game quickly', () => {
      const startTime = performance.now();

      const { result } = renderHook(() => useGame());

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.current).toBeDefined();
      expect(executionTime).toBeLessThan(50); // 应该在50ms内完成
    });

    /**
     * 测试目的：验证状态更新的性能
     * 性能指标：状态更新应该在合理时间内完成
     * 预期结果：状态更新时间小于10ms
     */
    test('should update state quickly', () => {
      const { result, rerender } = renderHook(() => useGame());

      const startTime = performance.now();

      act(() => {
        result.current.setCurrentInput('测试测试');
      });

      rerender();

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.current.currentInput).toBe('测试测试');
      expect(executionTime).toBeLessThan(10); // 应该在10ms内完成
    });
  });
});