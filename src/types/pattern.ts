// Drum symbols
// k/B=kick (bass), s=snare, h/x=hatClosed, H=hatOpen, c=crash, r=ride
// t=midTom, T=hiTom, f=lowTom (floor tom)
// p=clap, w=cowbell, m=tambourine, S=splash, C=china
// a=hiAgogo, A=lowAgogo
export type DrumSymbol =
  | 'k' | 'B' | 's' | 'h' | 'x' | 'H' | 'c' | 'r'
  | 't' | 'T' | 'f'
  | 'p' | 'w' | 'm' | 'S' | 'C'
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
  repeat: number;    // Number of times to repeat in Cycle mode (default 2)
  name?: string;     // Optional custom name (defaults to "Pattern <id>")
}

// Feel types
export type Feel = 'straight' | 'swing' | 'shuffle';

// Playback mode types
export type PlaybackMode = 'loop' | 'cycle';

// A complete drumset with up to 10 patterns
export interface DrumSet {
  id: string;
  name: string;
  patterns: Pattern[];  // Dynamic array, max 10 patterns
  selectedKit: string;  // e.g., 'kit-default'
  bpm: number;
  feel: Feel;
  playbackMode: PlaybackMode;  // 'loop' = repeat same pattern, 'cycle' = play through set
  humanize: number;  // 0-1
  density: number;   // 0-1
  volume: number;    // 0-1
  version?: number;  // For migration detection (V1 = undefined, V2 = 2)
}
