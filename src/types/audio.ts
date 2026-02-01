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
  currentPattern: number;  // Pattern number 1-10
  nextPattern: number | null;  // Queued pattern switch
  currentBar: number;
  currentStep: number;
  fillActive: boolean;
  fillContinuous: boolean;  // Hold for continuous fills
  repeatCount: number;  // How many times current pattern has played (for cycle mode)
}
