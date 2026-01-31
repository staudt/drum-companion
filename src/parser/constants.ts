import type { DrumSymbol } from '../types/pattern';

// Valid drum symbols
export const VALID_DRUM_SYMBOLS: readonly DrumSymbol[] = ['k', 's', 'h', 'H', 'c', 'r', 't'] as const;

// Check if a character is a valid drum symbol
export function isValidDrumSymbol(char: string): char is DrumSymbol {
  return VALID_DRUM_SYMBOLS.includes(char as DrumSymbol);
}

// Map drum symbols to sprite names
export const SPRITE_MAP: Record<DrumSymbol, string> = {
  'k': 'kick',
  's': 'snare',
  'h': 'hatClosed',
  'H': 'hatOpen',
  'c': 'crash',
  'r': 'ride',
  't': 'midTom'
};

// Default velocity for normal hits
export const DEFAULT_VELOCITY = 0.8;
