import { test, expect } from 'vitest';
import { localDate, startOfMonth } from './dates.js';

// vitest.config pins TZ=Asia/Jakarta (UTC+7), where the UTC conversion bit.
test('start of month stays on the 1st', () => {
  expect(startOfMonth(new Date(2026, 9, 15, 10, 0))).toBe('2026-10-01');
});

test('today before 07:00 local is still today, not yesterday in UTC', () => {
  expect(localDate(new Date(2026, 10, 1, 3, 0))).toBe('2026-11-01');
});
