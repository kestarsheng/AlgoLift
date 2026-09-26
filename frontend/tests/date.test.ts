import { describe, expect, it } from 'vitest';
import { formatDate } from '../src/utils/date';
describe('formatDate', () => {
  it('formats ISO 8601 to YYYY-MM-DD', () => { expect(formatDate('2026-09-25T00:00:00.000Z')).toBe('2026-09-25'); });
  it('passes through YYYY-MM-DD unchanged', () => { expect(formatDate('2026-09-25')).toBe('2026-09-25'); });
  it('handles null and undefined', () => { expect(formatDate(null)).toBe('—'); expect(formatDate(undefined)).toBe('—'); });
  it('handles empty string', () => { expect(formatDate('')).toBe('—'); });
});