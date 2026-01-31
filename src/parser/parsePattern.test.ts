import { describe, it, expect } from 'vitest';
import { parsePattern, ParseError, calculateBars } from './parsePattern';

describe('parsePattern', () => {
  it('should parse a simple pattern with single hits', () => {
    const result = parsePattern('k h s h');
    expect(result).toHaveLength(4);
    expect(result[0].hits).toHaveLength(1);
    expect(result[0].hits[0].symbol).toBe('k');
    expect(result[0].isRest).toBe(false);
  });

  it('should parse rest steps', () => {
    const result = parsePattern('k . s .');
    expect(result).toHaveLength(4);
    expect(result[1].isRest).toBe(true);
    expect(result[1].hits).toHaveLength(0);
    expect(result[3].isRest).toBe(true);
  });

  it('should parse multi-hit steps', () => {
    const result = parsePattern('kh sh');
    expect(result).toHaveLength(2);
    expect(result[0].hits).toHaveLength(2);
    expect(result[0].hits[0].symbol).toBe('k');
    expect(result[0].hits[1].symbol).toBe('h');
  });

  it('should handle all valid drum symbols', () => {
    const result = parsePattern('k s h H c r t');
    expect(result).toHaveLength(7);
    expect(result.map(step => step.hits[0].symbol)).toEqual(['k', 's', 'h', 'H', 'c', 'r', 't']);
  });

  it('should throw ParseError for invalid symbols', () => {
    expect(() => parsePattern('k x s')).toThrow(ParseError);
    expect(() => parsePattern('k x s')).toThrow("Invalid drum symbol: 'x'");
  });

  it('should handle empty input', () => {
    expect(parsePattern('')).toEqual([]);
    expect(parsePattern('   ')).toEqual([]);
  });

  it('should handle multiple spaces', () => {
    const result = parsePattern('k    h    s');
    expect(result).toHaveLength(3);
  });

  it('should set default velocity', () => {
    const result = parsePattern('k');
    expect(result[0].hits[0].velocity).toBe(0.8);
  });

  it('should set default offset', () => {
    const result = parsePattern('k');
    expect(result[0].hits[0].offset).toBe(0);
  });

  it('should parse complex real-world pattern', () => {
    const result = parsePattern('kh . sh . kh . sh h');
    expect(result).toHaveLength(8);
    expect(result[0].hits).toHaveLength(2); // kh
    expect(result[1].isRest).toBe(true);     // .
    expect(result[2].hits).toHaveLength(2); // sh
    expect(result[7].hits).toHaveLength(1); // h
  });
});

describe('calculateBars', () => {
  it('should calculate bars correctly', () => {
    expect(calculateBars(16)).toBe(1);
    expect(calculateBars(8)).toBe(1);
    expect(calculateBars(32)).toBe(2);
    expect(calculateBars(17)).toBe(2);
    expect(calculateBars(48)).toBe(3);
  });

  it('should handle edge cases', () => {
    expect(calculateBars(0)).toBe(0);
    expect(calculateBars(1)).toBe(1);
  });
});
