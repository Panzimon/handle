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
});