import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pattern, DrumSet, Feel } from '../types/pattern';
import { parsePattern, calculateBars } from '../parser/parsePattern';

// Helper to create a default pattern
const createDefaultPattern = (id: 'A' | 'B' | 'C' | 'D', text: string): Pattern => {
  const steps = parsePattern(text);
  return {
    id,
    text,
    steps,
    bars: calculateBars(steps.length)
  };
};

// Helper to create a default drum set
const createDefaultSet = (): DrumSet => ({
  id: 'default',
  name: 'Untitled Set',
  patterns: {
    A: createDefaultPattern('A', 'k h s h k h s h'),
    B: createDefaultPattern('B', 'k . s . k k s .'),
    C: createDefaultPattern('C', 'kh . sh . kh . sh .'),
    D: createDefaultPattern('D', 'k h sh h k . s h')
  },
  bpm: 120,
  feel: 'straight',
  humanize: 0,
  density: 0,
  volume: 0.8
});

interface PlaybackState {
  isPlaying: boolean;
  currentPattern: 'A' | 'B' | 'C' | 'D';
  nextPattern: 'A' | 'B' | 'C' | 'D' | null;
  currentStep: number;
  currentBar: number;
}

interface AppState {
  // Current drum set
  currentSet: DrumSet;

  // Playback state
  playback: PlaybackState;

  // Saved sets
  savedSets: DrumSet[];

  // Actions
  setPatternText: (patternId: 'A' | 'B' | 'C' | 'D', text: string) => void;
  setBPM: (bpm: number) => void;
  setFeel: (feel: Feel) => void;
  setHumanize: (value: number) => void;
  setDensity: (value: number) => void;
  setVolume: (value: number) => void;

  // Playback actions
  setPlaying: (isPlaying: boolean) => void;
  switchPattern: (patternId: 'A' | 'B' | 'C' | 'D') => void;
  applyPendingPatternSwitch: () => void;
  updatePlaybackState: (step: number, bar: number) => void;

  // Set management
  saveSet: (name: string) => void;
  loadSet: (id: string) => void;
  deleteSet: (id: string) => void;
  createNewSet: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSet: createDefaultSet(),
      playback: {
        isPlaying: false,
        currentPattern: 'A',
        nextPattern: null,
        currentStep: 0,
        currentBar: 0
      },
      savedSets: [],

      // Pattern text update
      setPatternText: (patternId, text) => {
        set((state) => {
          try {
            const steps = parsePattern(text);
            const bars = calculateBars(steps.length);

            const newPatterns = { ...state.currentSet.patterns };
            newPatterns[patternId] = {
              id: patternId,
              text,
              steps,
              bars
            };

            return {
              currentSet: {
                ...state.currentSet,
                patterns: newPatterns
              }
            };
          } catch (error) {
            console.error('Failed to parse pattern:', error);
            return state; // Keep previous state on error
          }
        });
      },

      // Set properties
      setBPM: (bpm) => {
        set((state) => ({
          currentSet: {
            ...state.currentSet,
            bpm
          }
        }));
      },

      setFeel: (feel) => {
        set((state) => ({
          currentSet: {
            ...state.currentSet,
            feel
          }
        }));
      },

      setHumanize: (humanize) => {
        set((state) => ({
          currentSet: {
            ...state.currentSet,
            humanize
          }
        }));
      },

      setDensity: (density) => {
        set((state) => ({
          currentSet: {
            ...state.currentSet,
            density
          }
        }));
      },

      setVolume: (volume) => {
        set((state) => ({
          currentSet: {
            ...state.currentSet,
            volume
          }
        }));
      },

      // Playback actions
      setPlaying: (isPlaying) => {
        set((state) => ({
          playback: {
            ...state.playback,
            isPlaying
          }
        }));
      },

      switchPattern: (patternId) => {
        set((state) => {
          // If not playing, switch immediately
          if (!state.playback.isPlaying) {
            return {
              playback: {
                ...state.playback,
                currentPattern: patternId,
                nextPattern: null
              }
            };
          }

          // If playing, queue for next bar
          return {
            playback: {
              ...state.playback,
              nextPattern: patternId
            }
          };
        });
      },

      applyPendingPatternSwitch: () => {
        set((state) => {
          if (state.playback.nextPattern) {
            console.log(`🔄 Switching pattern: ${state.playback.currentPattern} → ${state.playback.nextPattern}`);
            return {
              playback: {
                ...state.playback,
                currentPattern: state.playback.nextPattern,
                nextPattern: null
              }
            };
          }
          return state;
        });
      },

      updatePlaybackState: (step, bar) => {
        set((state) => ({
          playback: {
            ...state.playback,
            currentStep: step,
            currentBar: bar
          }
        }));
      },

      // Set management
      saveSet: (name) => {
        const state = get();
        const newSet = {
          ...state.currentSet,
          id: `set-${Date.now()}`,
          name
        };

        set({
          savedSets: [...state.savedSets, newSet]
        });
      },

      loadSet: (id) => {
        const state = get();
        const setToLoad = state.savedSets.find(s => s.id === id);

        if (setToLoad) {
          set({
            currentSet: { ...setToLoad }
          });
        }
      },

      deleteSet: (id) => {
        set((state) => ({
          savedSets: state.savedSets.filter(s => s.id !== id)
        }));
      },

      createNewSet: () => {
        set({
          currentSet: createDefaultSet()
        });
      }
    }),
    {
      name: 'drum-companion-storage',
      partialize: (state) => ({
        currentSet: state.currentSet,
        savedSets: state.savedSets
      })
    }
  )
);
