import { getDailyIdiom, getRandomIdiom, isValidIdiom, IDIOMS } from './words';

describe('words functions', () => {
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
});