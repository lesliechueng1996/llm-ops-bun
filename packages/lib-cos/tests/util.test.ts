import { describe, test, expect, setSystemTime } from 'bun:test';
import { generateFileKey } from '../lib/util';

describe('generateFileKey function', () => {
  test('should generate a file key', () => {
    setSystemTime(new Date('2025-03-09'));

    const fileKey = generateFileKey('txt');
    expect(fileKey).toBeDefined();
    expect(fileKey).toMatch(/^20250309\/[\w-]{21}\.txt$/);
  });
});
