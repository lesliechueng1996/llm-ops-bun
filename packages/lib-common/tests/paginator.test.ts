import { describe, expect, test } from 'bun:test';
import { calculateTakeSkip } from '../lib/paginator';

describe('calculateTakeSkip', () => {
  test('should return correct take and skip values', () => {
    const result = calculateTakeSkip({ currentPage: 1, pageSize: 10 });
    expect(result).toEqual({ take: 10, skip: 0 });
  });
});
