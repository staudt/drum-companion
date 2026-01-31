import type { DrumSymbol } from './pattern';

// Sprite definition: [offsetMs, durationMs]
export interface SpriteDefinition {
  [key: string]: [number, number];
}

// Sample representation
export interface Sample {
  symbol: DrumSymbol;
  buffer: AudioBuffer;
}

// A note scheduled for playback
export interface ScheduledNote {
  symbol: DrumSymbol;
  time: number;      // Web Audio API time
  velocity: number;
  stepIndex: number; // For UI feedback
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  currentPattern: 'A' | 'B' | 'C' | 'D';
  nextPattern: 'A' | 'B' | 'C' | 'D' | null;  // Queued pattern switch
  currentBar: number;
  currentStep: number;
  fillActive: boolean;
  fillContinuous: boolean;  // Hold for continuous fills
}
