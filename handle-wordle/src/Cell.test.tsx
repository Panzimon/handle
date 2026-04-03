/**
 * Cell 组件测试套件
 * 
 * 测试目标：验证单元格组件的颜色显示逻辑和渲染正确性
 * 测试范围：
 * - 颜色显示逻辑
 * - 拼音和声调显示
 * - 边界条件处理
 * - 异常场景处理
 * - 性能测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Cell } from './Cell';
import type { CellData } from './types';

describe('Cell Component Color Display', () => {
  // ============================================
  // 完全正确情况测试
  // ============================================
  describe('Fully Correct Cases', () => {
    /**
     * 测试目的：验证完全正确情况下的颜色显示
     * 预期结果：
     * - 文字框底色：绿色 (#6aaa64)
     * - 文字：白色
     * - 拼音：白色
     * - 声调：白色
     */
    test('should display correct colors for fully correct case', () => {
      const cellData: CellData = {
        char: '班',
        pinyin: { initial: 'b', final: 'an', tone: 1 },
        charState: 'correct',
        initialState: 'correct',
        finalState: 'correct',
        toneState: 'correct',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-primary'); // 绿色背景
      expect(cell).toHaveClass('text-white'); // 白色文字

      const initial = screen.getByText('b');
      expect(initial).toHaveClass('text-white'); // 白色拼音

      const final = screen.getByText('ān');
      expect(final).toHaveClass('text-white'); // 白色声调
    });

    /**
     * 测试目的：验证复杂声母的正确显示
     * 边界条件：声母为 zh, ch, sh
     * 预期结果：正确显示复杂声母
     */
    test('should display complex initial correctly', () => {
      const cellData: CellData = {
        char: '中',
        pinyin: { initial: 'zh', final: 'ong', tone: 1 },
        charState: 'correct',
        initialState: 'correct',
        finalState: 'correct',
        toneState: 'correct',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-primary');
      expect(cell).toHaveClass('text-white');

      const initial = screen.getByText('zh');
      expect(initial).toHaveClass('text-white');

      const final = screen.getByText('ōng');
      expect(final).toHaveClass('text-white');
    });

    /**
     * 测试目的：验证零声母的正确显示
     * 边界条件：声母为空
     * 预期结果：正确显示零声母
     */
    test('should display zero initial correctly', () => {
      const cellData: CellData = {
        char: '阿',
        pinyin: { initial: '', final: 'a', tone: 1 },
        charState: 'correct',
        initialState: 'correct',
        finalState: 'correct',
        toneState: 'correct',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-primary');
      expect(cell).toHaveClass('text-white');

      const final = screen.getByText('ā');
      expect(final).toHaveClass('text-white');
    });
  });

  // ============================================
  // 部分匹配情况测试
  // ============================================
  describe('Partially Correct Cases', () => {
    /**
     * 测试目的：验证部分匹配情况下的颜色显示
     * 预期结果：
     * - 文字框底色：橙色 (#c9b458)
     * - 文字：白色
     * - 拼音：白色
     * - 声调：白色
     */
    test('should display correct colors for partially correct case', () => {
      const cellData: CellData = {
        char: '水',
        pinyin: { initial: 'sh', final: 'ui', tone: 3 },
        charState: 'present',
        initialState: 'present',
        finalState: 'present',
        toneState: 'present',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-secondary'); // 橙色背景
      expect(cell).toHaveClass('text-white'); // 白色文字

      const initial = screen.getByText('sh');
      expect(initial).toHaveClass('text-white'); // 白色拼音

      const final = screen.getByText('uǐ');
      expect(final).toHaveClass('text-white'); // 白色声调
    });

    /**
     * 测试目的：验证汉字正确但拼音位置不对的情况
     * 边界条件：汉字匹配但拼音不匹配
     * 预期结果：汉字显示橙色，拼音根据匹配情况显示
     */
    test('should display correct colors for correct char with incorrect pinyin position', () => {
      const cellData: CellData = {
        char: '水',
        pinyin: { initial: 'sh', final: 'ui', tone: 3 },
        charState: 'present',
        initialState: 'absent',
        finalState: 'absent',
        toneState: 'absent',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-secondary'); // 橙色背景
      expect(cell).toHaveClass('text-white'); // 白色文字

      const initial = screen.getByText('sh');
      expect(initial).toHaveClass('text-white'); // 白色拼音

      const final = screen.getByText('uǐ');
      expect(final).toHaveClass('text-white'); // 白色声调
    });
  });

  // ============================================
  // 完全不匹配情况测试
  // ============================================
  describe('Fully Incorrect Cases', () => {
    /**
     * 测试目的：验证完全不匹配情况下的颜色显示（拼音也完全不匹配）
     * 预期结果：
     * - 文字框底色：灰色 (#787c7e)
     * - 文字：白色
     * - 拼音：白色
     * - 声调：白色
     */
    test('should display correct colors for fully incorrect case with all incorrect pinyin', () => {
      const cellData: CellData = {
        char: '天',
        pinyin: { initial: 't', final: 'ian', tone: 1 },
        charState: 'absent',
        initialState: 'absent',
        finalState: 'absent',
        toneState: 'absent',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-neutral'); // 灰色背景
      expect(cell).toHaveClass('text-white'); // 白色文字

      const initial = screen.getByText('t');
      expect(initial).toHaveClass('text-white'); // 白色拼音

      const final = screen.getByText('iān');
      expect(final).toHaveClass('text-white'); // 白色声调
    });

    /**
     * 测试目的：验证完全不匹配情况下的颜色显示（拼音部分正确）
     * 预期结果：
     * - 文字框底色：灰色 (#787c7e)
     * - 文字：白色
     * - 拼音：根据匹配情况显示青色、橙色或白色
     * - 声调：根据匹配情况显示青色、橙色或白色
     */
    test('should display correct colors for fully incorrect case with partially correct pinyin', () => {
      const cellData: CellData = {
        char: '天',
        pinyin: { initial: 't', final: 'ian', tone: 1 },
        charState: 'absent',
        initialState: 'correct',
        finalState: 'present',
        toneState: 'absent',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-neutral'); // 灰色背景
      expect(cell).toHaveClass('text-white'); // 白色文字

      const initial = screen.getByText('t');
      expect(initial).toHaveClass('text-primary'); // 青色拼音

      const final = screen.getByText('iān');
      expect(final).toHaveClass('text-secondary'); // 橙色声调
    });

    /**
     * 测试目的：验证完全不匹配情况下的颜色显示（声母正确）
     * 预期结果：声母显示青色
     */
    test('should display correct colors for fully incorrect case with correct initial', () => {
      const cellData: CellData = {
        char: '天',
        pinyin: { initial: 't', final: 'ian', tone: 1 },
        charState: 'absent',
        initialState: 'correct',
        finalState: 'absent',
        toneState: 'absent',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-neutral');

      const initial = screen.getByText('t');
      expect(initial).toHaveClass('text-primary'); // 青色拼音

      const final = screen.getByText('iān');
      expect(final).toHaveClass('text-white'); // 白色声调
    });

    /**
     * 测试目的：验证完全不匹配情况下的颜色显示（韵母正确）
     * 预期结果：韵母显示青色
     */
    test('should display correct colors for fully incorrect case with correct final', () => {
      const cellData: CellData = {
        char: '天',
        pinyin: { initial: 't', final: 'ian', tone: 1 },
        charState: 'absent',
        initialState: 'absent',
        finalState: 'correct',
        toneState: 'absent',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-neutral');

      const initial = screen.getByText('t');
      expect(initial).toHaveClass('text-white'); // 白色拼音

      const final = screen.getByText('iān');
      expect(final).toHaveClass('text-primary'); // 青色声调
    });

    /**
     * 测试目的：验证完全不匹配情况下的颜色显示（声母和韵母都不匹配）
     * 预期结果：声母和韵母都显示白色
     */
    test('should display correct colors for fully incorrect case with all absent', () => {
      const cellData: CellData = {
        char: '天',
        pinyin: { initial: 't', final: 'ian', tone: 1 },
        charState: 'absent',
        initialState: 'absent',
        finalState: 'absent',
        toneState: 'absent',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-neutral');

      const initial = screen.getByText('t');
      expect(initial).toHaveClass('text-white'); // 白色拼音

      const final = screen.getByText('iān');
      expect(final).toHaveClass('text-white'); // 白色声调
    });
  });

  // ============================================
  // 空单元格情况测试
  // ============================================
  describe('Empty Cell Cases', () => {
    /**
     * 测试目的：验证空单元格的颜色显示
     * 预期结果：
     * - 文字框底色：白色
     * - 文字：灰色
     */
    test('should display correct colors for empty cell', () => {
      const cellData: CellData = {
        char: '',
        pinyin: { initial: '', final: '', tone: 0 },
        charState: 'empty',
        initialState: 'empty',
        finalState: 'empty',
        toneState: 'empty',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-white'); // 白色背景
      expect(cell).toHaveClass('text-gray-900'); // 灰色文字
    });
  });

  // ============================================
  // 边界条件测试
  // ============================================
  describe('Boundary Conditions', () => {
    /**
     * 测试目的：验证所有状态都为 correct 的情况
     * 边界条件：所有状态都匹配
     * 预期结果：所有元素都显示白色
     */
    test('should handle all correct states', () => {
      const cellData: CellData = {
        char: '班',
        pinyin: { initial: 'b', final: 'an', tone: 1 },
        charState: 'correct',
        initialState: 'correct',
        finalState: 'correct',
        toneState: 'correct',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-primary');
      expect(cell).toHaveClass('text-white');
    });

    /**
     * 测试目的：验证所有状态都为 absent 的情况
     * 边界条件：所有状态都不匹配
     * 预期结果：所有元素都显示白色
     */
    test('should handle all absent states', () => {
      const cellData: CellData = {
        char: '天',
        pinyin: { initial: 't', final: 'ian', tone: 1 },
        charState: 'absent',
        initialState: 'absent',
        finalState: 'absent',
        toneState: 'absent',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-neutral');
      expect(cell).toHaveClass('text-white');
    });

    /**
     * 测试目的：验证所有状态都为 present 的情况
     * 边界条件：所有状态都部分匹配
     * 预期结果：所有元素都显示白色
     */
    test('should handle all present states', () => {
      const cellData: CellData = {
        char: '水',
        pinyin: { initial: 'sh', final: 'ui', tone: 3 },
        charState: 'present',
        initialState: 'present',
        finalState: 'present',
        toneState: 'present',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-secondary');
      expect(cell).toHaveClass('text-white');
    });

    /**
     * 测试目的：验证混合状态的情况
     * 边界条件：不同状态混合
     * 预期结果：根据各自状态显示颜色
     */
    test('should handle mixed states', () => {
      const cellData: CellData = {
        char: '天',
        pinyin: { initial: 't', final: 'ian', tone: 1 },
        charState: 'absent',
        initialState: 'correct',
        finalState: 'present',
        toneState: 'absent',
      };

      const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const cell = container.querySelector('[data-testid="cell-container"] > div');
      expect(cell).toHaveClass('bg-neutral');

      const initial = screen.getByText('t');
      expect(initial).toHaveClass('text-primary');

      const final = screen.getByText('iān');
      expect(final).toHaveClass('text-secondary');
    });
  });

  // ============================================
  // 性能测试
  // ============================================
  describe('Performance Tests', () => {
    /**
     * 测试目的：验证单元格渲染性能
     * 性能指标：单个单元格渲染时间应该小于10ms
     * 预期结果：渲染时间符合要求
     */
    test('should render cell quickly', () => {
      const cellData: CellData = {
        char: '班',
        pinyin: { initial: 'b', final: 'an', tone: 1 },
        charState: 'correct',
        initialState: 'correct',
        finalState: 'correct',
        toneState: 'correct',
      };

      const startTime = performance.now();

      render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(10); // 应该在10ms内完成
    });

    /**
     * 测试目的：验证连续渲染多个单元格的性能
     * 性能指标：渲染40个单元格（10行×4列）应该在100ms内完成
     * 预期结果：渲染时间符合要求
     */
    test('should render multiple cells quickly', () => {
      const startTime = performance.now();

      const cells = [];
      for (let i = 0; i < 40; i++) {
        const cellData: CellData = {
          char: '班',
          pinyin: { initial: 'b', final: 'an', tone: 1 },
          charState: 'correct',
          initialState: 'correct',
          finalState: 'correct',
          toneState: 'correct',
        };
        cells.push(<Cell key={i} data={cellData} />);
      }

      render(<div>{cells}</div>);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});