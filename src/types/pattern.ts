// Basic drum symbols
// k=kick, s=snare, h=hatClosed, H=hatOpen, c=crash, r=ride
// t=midTom, T=hiTom, L=lowTom
export type DrumSymbol = 'k' | 's' | 'h' | 'H' | 'c' | 'r' | 't' | 'T' | 'L';

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

// A complete pattern (A, B, C, or D)
export interface Pattern {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;      // User-entered text
  steps: Step[];     // Parsed steps
  bars: number;      // Number of bars (derived from steps)
}

// Feel types
export type Feel = 'straight' | 'swing' | 'shuffle';

// A complete drumset with 4 patterns
export interface DrumSet {
  id: string;
  name: string;
  patterns: Record<'A' | 'B' | 'C' | 'D', Pattern>;
  bpm: number;
  feel: Feel;
  humanize: number;  // 0-1
  density: number;   // 0-1
  volume: number;    // 0-1
}
