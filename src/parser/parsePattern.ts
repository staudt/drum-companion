import type { Step, Hit, DrumSymbol } from '../types/pattern';
import { isValidDrumSymbol, DEFAULT_VELOCITY } from './constants';

// Custom error for parsing failures
export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Parses a pattern text string into structured steps.
 *
 * Examples:
 *   "k . s ." => 4 steps: kick, rest, snare, rest
 *   "kh . sh ." => kick+hihat, rest, snare+hihat, rest
 *   "k s h H c r t" => 7 steps, one per drum
 *
 * @param text - Pattern string with space-separated steps
 * @returns Array of steps
 * @throws ParseError if invalid symbols found
 */
export function parsePattern(text: string): Step[] {
  // Handle empty input
  if (!text || !text.trim()) {
    return [];
  }

  // Split by whitespace and filter empty tokens
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const steps: Step[] = [];

  for (const token of tokens) {
    // Rest step
    if (token === '.') {
      steps.push({ hits: [], isRest: true });
      continue;
    }

    // Parse hits in this step
    const hits: Hit[] = [];
    for (const char of token) {
      if (!isValidDrumSymbol(char)) {
        throw new ParseError(`Invalid drum symbol: '${char}' in token '${token}'`);
      }

      hits.push({
        symbol: char as DrumSymbol,
        velocity: DEFAULT_VELOCITY,
        offset: 0
      });
    }

    steps.push({ hits, isRest: hits.length === 0 });
  }

  return steps;
}

/**
 * Calculate number of bars from step count
 * Assumes 4/4 time signature with 16 steps per bar
 */
export function calculateBars(stepCount: number): number {
  const STEPS_PER_BAR = 16;
  return Math.ceil(stepCount / STEPS_PER_BAR);
}
