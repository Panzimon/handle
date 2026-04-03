import React from 'react';
import { render, screen } from '@testing-library/react';
import { Cell } from './Cell';
import type { CellData } from './types';

describe('Cell Component Color Display', () => {
  // 测试完全正确情况
  test('should display correct colors for fully correct case', () => {
    const cellData: CellData = {
      char: '班',
      pinyin: { initial: 'b', final: 'an', tone: 1 },
      charState: 'correct',
      initialState: 'correct',
      finalState: 'correct',
      toneState: 'correct',
    };

    // 使用容器包裹 Cell 组件，以便于选择
    const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

    // 获取单元格元素
    const cell = container.querySelector('[data-testid="cell-container"] > div');
    expect(cell).toHaveClass('bg-primary'); // 绿色背景
    expect(cell).toHaveClass('text-white'); // 白色文字

    const initial = screen.getByText('b');
    expect(initial).toHaveClass('text-white'); // 白色拼音

    const final = screen.getByText('ān');
    expect(final).toHaveClass('text-white'); // 白色声调
  });

  // 测试部分匹配情况
  test('should display correct colors for partially correct case', () => {
    const cellData: CellData = {
      char: '水',
      pinyin: { initial: 'sh', final: 'ui', tone: 3 },
      charState: 'present',
      initialState: 'present',
      finalState: 'present',
      toneState: 'present',
    };

    // 使用容器包裹 Cell 组件，以便于选择
    const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

    // 获取单元格元素
    const cell = container.querySelector('[data-testid="cell-container"] > div');
    expect(cell).toHaveClass('bg-secondary'); // 橙色背景
    expect(cell).toHaveClass('text-white'); // 白色文字

    const initial = screen.getByText('sh');
    expect(initial).toHaveClass('text-white'); // 白色拼音

    const final = screen.getByText('uǐ');
    expect(final).toHaveClass('text-white'); // 白色声调
  });

  // 测试完全不匹配情况 - 拼音也完全不匹配
  test('should display correct colors for fully incorrect case with all incorrect pinyin', () => {
    const cellData: CellData = {
      char: '天',
      pinyin: { initial: 't', final: 'ian', tone: 1 },
      charState: 'absent',
      initialState: 'absent',
      finalState: 'absent',
      toneState: 'absent',
    };

    // 使用容器包裹 Cell 组件，以便于选择
    const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

    // 获取单元格元素
    const cell = container.querySelector('[data-testid="cell-container"] > div');
    expect(cell).toHaveClass('bg-neutral'); // 灰色背景
    expect(cell).toHaveClass('text-white'); // 白色文字

    const initial = screen.getByText('t');
    expect(initial).toHaveClass('text-white'); // 白色拼音

    const final = screen.getByText('iān');
    expect(final).toHaveClass('text-white'); // 白色声调
  });

  // 测试完全不匹配情况 - 拼音部分正确
  test('should display correct colors for fully incorrect case with partially correct pinyin', () => {
    const cellData: CellData = {
      char: '天',
      pinyin: { initial: 't', final: 'ian', tone: 1 },
      charState: 'absent',
      initialState: 'correct',
      finalState: 'present',
      toneState: 'absent',
    };

    // 使用容器包裹 Cell 组件，以便于选择
    const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

    // 获取单元格元素
    const cell = container.querySelector('[data-testid="cell-container"] > div');
    expect(cell).toHaveClass('bg-neutral'); // 灰色背景
    expect(cell).toHaveClass('text-white'); // 白色文字

    const initial = screen.getByText('t');
    expect(initial).toHaveClass('text-primary'); // 青色拼音

    const final = screen.getByText('iān');
    expect(final).toHaveClass('text-secondary'); // 橙色声调
  });

  // 测试空单元格情况
  test('should display correct colors for empty cell', () => {
    const cellData: CellData = {
      char: '',
      pinyin: { initial: '', final: '', tone: 0 },
      charState: 'empty',
      initialState: 'empty',
      finalState: 'empty',
      toneState: 'empty',
    };

    // 使用容器包裹 Cell 组件，以便于选择
    const { container } = render(<div data-testid="cell-container"><Cell data={cellData} /></div>);

    // 获取单元格元素
    const cell = container.querySelector('[data-testid="cell-container"] > div');
    expect(cell).toHaveClass('bg-white'); // 白色背景
    expect(cell).toHaveClass('text-gray-900'); // 灰色文字
  });
});