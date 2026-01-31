import type { DrumSet, Feel } from './pattern';
import type { PlaybackState } from './audio';

// Application state
export interface AppState {
  // Current drum set
  currentSet: DrumSet;

  // Playback state
  playback: PlaybackState;

  // Saved sets
  savedSets: DrumSet[];

  // UI state
  selectedPattern: 'A' | 'B' | 'C' | 'D';  // For editing focus

  // Actions
  setPatternText: (patternId: 'A' | 'B' | 'C' | 'D', text: string) => void;
  setBPM: (bpm: number) => void;
  setFeel: (feel: Feel) => void;
  setHumanize: (value: number) => void;
  setDensity: (value: number) => void;
  setVolume: (value: number) => void;
  play: () => void;
  stop: () => void;
  triggerFill: () => void;
  switchPattern: (patternId: 'A' | 'B' | 'C' | 'D') => void;
  saveSet: (name: string) => void;
  loadSet: (id: string) => void;
  deleteSet: (id: string) => void;
  exportSet: () => string;
  importSet: (jsonString: string) => void;
}
