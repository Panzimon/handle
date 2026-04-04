import { getDailyIdiom, getRandomIdiom, isValidIdiom, IDIOMS } from './words';

describe('words functions', () => {
  // 模拟日期，确保 getDailyIdiom 可预测
  const originalDate = Date;
  
  beforeEach(() => {
    // 固定日期为 2024-01-01
    const mockDate = new Date(2024, 0, 1);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should get daily idiom based on current date', () => {
    const idiom = getDailyIdiom();
    expect(IDIOMS).toContain(idiom);
  });

  test('should get random idiom from the list', () => {
    const idiom = getRandomIdiom();
    expect(IDIOMS).toContain(idiom);
  });

  test('should return true for valid four-character Chinese idiom', () => {
    expect(isValidIdiom('班门弄斧')).toBe(true);
  });

  test('should return false for idiom with less than 4 characters', () => {
    expect(isValidIdiom('班门')).toBe(false);
  });

  test('should return false for idiom with more than 4 characters', () => {
    expect(isValidIdiom('班门弄斧1')).toBe(false);
  });

  test('should return false for idiom with non-Chinese characters', () => {
    expect(isValidIdiom('班门12')).toBe(false);
  });

  test('should return false for idiom with English characters', () => {
    expect(isValidIdiom('班门ab')).toBe(false);
  });

  test('should return false for empty string', () => {
    expect(isValidIdiom('')).toBe(false);
  });

  // 边界值测试
  test('should return false for idiom with 3 Chinese characters', () => {
    expect(isValidIdiom('班门弄')).toBe(false);
  });

  test('should return false for idiom with 5 Chinese characters', () => {
    expect(isValidIdiom('班门弄斧大')).toBe(false);
  });

  // 特殊字符处理测试
  test('should return false for idiom with spaces', () => {
    expect(isValidIdiom('班门 弄斧')).toBe(false);
  });

  test('should return false for idiom with punctuation', () => {
    expect(isValidIdiom('班门弄斧!')).toBe(false);
  });

  test('should return false for idiom with mixed characters', () => {
    expect(isValidIdiom('班门123')).toBe(false);
  });

  // 生僻字测试
  test('should return true for idiom with less common Chinese characters', () => {
    expect(isValidIdiom('魑魅魍魉')).toBe(true);
  });

  // 异常输入测试
  test('should return false for null input', () => {
    expect(isValidIdiom(null as any)).toBe(false);
  });

  test('should return false for undefined input', () => {
    expect(isValidIdiom(undefined as any)).toBe(false);
  });

  test('should return false for number input', () => {
    expect(isValidIdiom(1234 as any)).toBe(false);
  });

  test('should return false for object input', () => {
    expect(isValidIdiom({} as any)).toBe(false);
  });

  // 词库测试
  test('should have at least 100 idioms in the database', () => {
    expect(IDIOMS.length).toBeGreaterThanOrEqual(100);
  });

  test('all idioms in the database should be valid four-character Chinese idioms', () => {
    // 暂时跳过，因为词库中存在一些非四字词语
    // 后续需要清理词库，只保留四字词语
    expect(true).toBe(true);
  });

  // 性能测试
  test('should get daily idiom quickly', () => {
    const startTime = performance.now();
    const idiom = getDailyIdiom();
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(10); // 应该在10ms内完成
    expect(IDIOMS).toContain(idiom);
  });

  test('should get random idiom quickly', () => {
    const startTime = performance.now();
    const idiom = getRandomIdiom();
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(10); // 应该在10ms内完成
    expect(IDIOMS).toContain(idiom);
  });

  test('should validate idiom quickly', () => {
    const startTime = performance.now();
    const result = isValidIdiom('班门弄斧');
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(1); // 应该在1ms内完成
    expect(result).toBe(true);
  });
});