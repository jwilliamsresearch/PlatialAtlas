import { describe, it, expect } from 'vitest';
import { isValidRes, parseBbox } from '@/lib/h3';

describe('h3 utils', () => {
  it('validates resolution', () => {
    expect(isValidRes(6)).toBe(true);
    expect(isValidRes(10)).toBe(true);
    expect(isValidRes(5)).toBe(false);
    expect(isValidRes(11)).toBe(false);
  });
  it('parses bbox strings', () => {
    expect(parseBbox('-1,52,-0.5,53')).toEqual([-1, 52, -0.5, 53]);
  });
});

