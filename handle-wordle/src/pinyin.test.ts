import { getPinyin, getFullPinyin, getPinyinWithoutTone } from './pinyin';

describe('pinyin functions', () => {
  test('should get pinyin information for Chinese character', () => {
    const result = getPinyin('测');
    expect(result.initial).toBe('c');
    expect(result.final).toBe('e');
    expect(result.tone).toBe(4);
  });

  test('should get pinyin information for Chinese character with complex initial', () => {
    const result = getPinyin('中');
    expect(result.initial).toBe('zh');
    expect(result.final).toBe('ong');
    expect(result.tone).toBe(1);
  });

  test('should get pinyin information for Chinese character without initial', () => {
    const result = getPinyin('阿');
    expect(result.initial).toBe('');
    expect(result.final).toBe('a');
    expect(result.tone).toBe(1);
  });

  test('should return empty pinyin information for non-Chinese character', () => {
    const result = getPinyin('a');
    expect(result.initial).toBe('');
    expect(result.final).toBe('');
    expect(result.tone).toBe(0);
  });

  test('should get full pinyin for Chinese character', () => {
    const result = getFullPinyin('测');
    expect(result).toBe('cè');
  });

  test('should get empty string for non-Chinese character in getFullPinyin', () => {
    const result = getFullPinyin('a');
    expect(result).toBe('');
  });

  test('should get pinyin without tone for Chinese character', () => {
    const result = getPinyinWithoutTone('测');
    expect(result).toBe('ce');
  });

  test('should get pinyin without tone for Chinese character with complex initial', () => {
    const result = getPinyinWithoutTone('中');
    expect(result).toBe('zhong');
  });

  // 多音字测试
  test('should get pinyin for multi-tone character (default tone)', () => {
    const result = getPinyin('行');
    expect(result.tone).toBeGreaterThan(0);
  });

  // 生僻字测试
  test('should get pinyin for less common Chinese character', () => {
    const result = getPinyin('魑');
    expect(result.initial).toBe('ch');
    expect(result.final).toBe('i');
    expect(result.tone).toBe(1);
  });

  test('should get full pinyin for less common Chinese character', () => {
    const result = getFullPinyin('魑');
    expect(result).toBe('chī');
  });

  // 特殊字符测试
  test('should return empty pinyin for number', () => {
    const result = getPinyin('1');
    expect(result.initial).toBe('');
    expect(result.final).toBe('');
    expect(result.tone).toBe(0);
  });

  test('should return empty pinyin for punctuation', () => {
    const result = getPinyin('!');
    expect(result.initial).toBe('');
    expect(result.final).toBe('');
    expect(result.tone).toBe(0);
  });

  test('should return empty pinyin for space', () => {
    const result = getPinyin(' ');
    expect(result.initial).toBe('');
    expect(result.final).toBe('');
    expect(result.tone).toBe(0);
  });

  // 边界情况测试
  test('should handle empty string input', () => {
    const result = getPinyin('');
    expect(result.initial).toBe('');
    expect(result.final).toBe('');
    expect(result.tone).toBe(0);
  });

  test('should handle null input', () => {
    expect(() => getPinyin(null as any)).not.toThrow();
    const result = getPinyin(null as any);
    expect(result.initial).toBe('');
    expect(result.final).toBe('');
    expect(result.tone).toBe(0);
  });

  test('should handle undefined input', () => {
    expect(() => getPinyin(undefined as any)).not.toThrow();
    const result = getPinyin(undefined as any);
    expect(result.initial).toBe('');
    expect(result.final).toBe('');
    expect(result.tone).toBe(0);
  });

  // 性能测试
  test('should get pinyin information quickly', () => {
    const startTime = performance.now();
    const result = getPinyin('测');
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(10); // 应该在10ms内完成
    expect(result.initial).toBe('c');
    expect(result.final).toBe('e');
    expect(result.tone).toBe(4);
  });

  test('should get full pinyin quickly', () => {
    const startTime = performance.now();
    const result = getFullPinyin('测');
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(10); // 应该在10ms内完成
    expect(result).toBe('cè');
  });

  test('should get pinyin without tone quickly', () => {
    const startTime = performance.now();
    const result = getPinyinWithoutTone('测');
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(10); // 应该在10ms内完成
    expect(result).toBe('ce');
  });

  // 随机测试
  test('should handle random Chinese characters', () => {
    const testChars = ['你', '好', '世', '界', '汉', '字', '拼', '音'];
    testChars.forEach(char => {
      const result = getPinyin(char);
      expect(result.tone).toBeGreaterThan(0);
    });
  });
});