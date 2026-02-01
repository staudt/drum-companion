import type { DrumSymbol } from '../types/pattern';

// Valid drum symbols
// k/B=kick (bass), h/x=hatClosed (x common in drum notation)
// t=midTom, T=hiTom, f=lowTom (floor tom)
// p=clap, w=cowbell, m=tambourine, S=splash, C=china, a=hiAgogo, A=lowAgogo
export const VALID_DRUM_SYMBOLS: readonly DrumSymbol[] = [
  'k', 'B', 's', 'h', 'x', 'H', 'c', 'r',
  't', 'T', 'f',
  'p', 'w', 'm', 'S', 'C',
  'a', 'A'
] as const;

// Check if a character is a valid drum symbol
export function isValidDrumSymbol(char: string): char is DrumSymbol {
  return VALID_DRUM_SYMBOLS.includes(char as DrumSymbol);
}

// Map drum symbols to sprite names
export const SPRITE_MAP: Record<DrumSymbol, string> = {
  'k': 'kick',
  'B': 'kick',      // B = bass (alias for kick)
  's': 'snare',
  'h': 'hatClosed',
  'x': 'hatClosed', // x = common hi-hat notation
  'H': 'hatOpen',
  'c': 'crash',
  'r': 'ride',
  't': 'midTom',
  'T': 'hiTom',
  'f': 'lowTom',    // f = floor tom
  'p': 'clap',
  'w': 'cowbell',
  'm': 'tamb',
  'S': 'splash',
  'C': 'china',     // C = china (moved from x)
  'a': 'hiAgogo',
  'A': 'lowAgogo'
};

// Default velocity for normal hits
export const DEFAULT_VELOCITY = 0.8;
