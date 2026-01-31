import type { DrumSymbol } from '../types/pattern';

// Valid drum symbols
// t=midTom, T=hiTom, L=lowTom (toms)
// p=clap, w=cowbell, m=tambourine, S=splash, x=china, a=hiAgogo, A=lowAgogo
export const VALID_DRUM_SYMBOLS: readonly DrumSymbol[] = [
  'k', 's', 'h', 'H', 'c', 'r',
  't', 'T', 'L',
  'p', 'w', 'm', 'S', 'x',
  'a', 'A'
] as const;

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
  't': 'midTom',
  'T': 'hiTom',
  'L': 'lowTom',
  'p': 'clap',
  'w': 'cowbell',
  'm': 'tamb',
  'S': 'splash',
  'x': 'china',
  'a': 'hiAgogo',
  'A': 'lowAgogo'
};

// Default velocity for normal hits
export const DEFAULT_VELOCITY = 0.8;
