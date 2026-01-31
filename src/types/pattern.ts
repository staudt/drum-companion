// Drum symbols
// k=kick, s=snare, h=hatClosed, H=hatOpen, c=crash, r=ride
// t=midTom, T=hiTom, L=lowTom
// p=clap, w=cowbell, m=tambourine, S=splash, x=china
// a=hiAgogo, A=lowAgogo
export type DrumSymbol =
  | 'k' | 's' | 'h' | 'H' | 'c' | 'r'
  | 't' | 'T' | 'L'
  | 'p' | 'w' | 'm' | 'S' | 'x'
  | 'a' | 'A';

// A single hit at a specific time
export interface Hit {
  symbol: DrumSymbol;
  velocity: number;  // 0-1, affected by accents/humanization
  offset: number;    // Timing offset in seconds (for swing/humanize)
}

// A step in the pattern (one or more hits)
export interface Step {
  hits: Hit[];
  isRest: boolean;
}

// A complete pattern (numbered 1-10)
export interface Pattern {
  id: number;        // Pattern number 1-10
  text: string;      // User-entered text
  steps: Step[];     // Parsed steps
  bars: number;      // Number of bars (derived from steps)
}

// Feel types
export type Feel = 'straight' | 'swing' | 'shuffle';

// A complete drumset with up to 10 patterns
export interface DrumSet {
  id: string;
  name: string;
  patterns: Pattern[];  // Dynamic array, max 10 patterns
  selectedKit: string;  // e.g., 'kit-default'
  bpm: number;
  feel: Feel;
  humanize: number;  // 0-1
  density: number;   // 0-1
  volume: number;    // 0-1
  version?: number;  // For migration detection (V1 = undefined, V2 = 2)
}
