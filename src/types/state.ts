import type { DrumSet, Feel, PlaybackMode } from './pattern';
import type { PlaybackState } from './audio';
import type { UIState } from './ui';

// Application state
export interface AppState {
  // Current drum set
  currentSet: DrumSet;

  // Playback state
  playback: PlaybackState;

  // Saved sets
  savedSets: DrumSet[];

  // UI state (not persisted)
  ui: UIState;

  // Actions - Pattern management
  setPatternText: (patternId: number, text: string) => void;
  setPatternName: (patternId: number, name: string) => void;
  setPatternRepeat: (patternId: number, repeat: number) => void;
  togglePatternIncludeInCycle: (patternId: number) => void;
  addPattern: () => void;  // Add new pattern
  removePattern: (patternId: number) => void;  // Remove pattern (min 1)
  reorderPatterns: (fromIndex: number, toIndex: number) => void;  // Reorder patterns with auto-renumbering
  switchPattern: (patternId: number) => void;

  // Actions - Set properties
  setBPM: (bpm: number) => void;
  setFeel: (feel: Feel) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  setHumanize: (value: number) => void;
  setDensity: (value: number) => void;
  setVolume: (value: number) => void;
  setKit: (kitName: string) => void;  // NEW: For future multi-kit support
  updateSetName: (name: string) => void;

  // Actions - Playback
  play: () => void;
  stop: () => void;
  triggerFill: () => void;
  updatePlaybackState: (step: number, bar: number) => void;
  applyPendingPatternSwitch: () => void;
  handlePatternLoop: () => void;  // For cycle mode repeat tracking

  // Actions - Set management
  saveSet: (name: string) => void;
  loadSet: (id: string) => void;
  deleteSet: (id: string) => void;
  exportSet: () => string;
  importSet: (jsonString: string) => void;

  // Actions - UI state
  setUIState: (updates: Partial<UIState>) => void;
}
