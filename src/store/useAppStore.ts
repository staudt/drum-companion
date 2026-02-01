import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pattern, DrumSet, Feel, PlaybackMode } from '../types/pattern';
import type { AppState } from '../types/state';
import type { PlaybackState } from '../types/audio';
import { parsePattern, calculateBars } from '../parser/parsePattern';
import { migrateStateV1toV2, createDefaultState } from './migrations';

// Helper to create a default pattern
const createDefaultPattern = (id: number, text: string): Pattern => {
  const steps = parsePattern(text);
  return {
    id,
    text,
    steps,
    bars: calculateBars(steps.length),
    repeat: 2  // Default repeat count for cycle mode
  };
};

// Helper to create a default drum set (V2 schema)
const createDefaultSet = (): DrumSet => ({
  id: crypto.randomUUID(),
  name: 'Untitled Set',
  patterns: [
    createDefaultPattern(1, 'k h s h'),
    createDefaultPattern(2, 'k . s . k k s .'),
    createDefaultPattern(3, 'kh . sh . kh . sh .'),
    createDefaultPattern(4, 'k h sh h k . s h')
  ],
  selectedKit: 'kit-default',
  bpm: 120,
  feel: 'straight',
  playbackMode: 'loop',
  humanize: 0,
  density: 0,
  volume: 0.7,
  version: 2
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSet: createDefaultSet(),
      playback: {
        isPlaying: false,
        currentPattern: 1,
        nextPattern: null,
        currentStep: 0,
        currentBar: 0,
        fillActive: false,
        fillContinuous: false,
        repeatCount: 0
      },
      savedSets: [],
      ui: {
        sidebarOpen: true
      },

      // Pattern text update
      setPatternText: (patternId, text) => {
        set((state) => {
          try {
            const steps = parsePattern(text);
            const bars = calculateBars(steps.length);

            const newPatterns = state.currentSet.patterns.map(p =>
              p.id === patternId
                ? { ...p, text, steps, bars }
                : p
            );

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

      // Set pattern repeat count
      setPatternRepeat: (patternId, repeat) => {
        set((state) => {
          const clampedRepeat = Math.max(1, Math.min(99, repeat));
          const newPatterns = state.currentSet.patterns.map(p =>
            p.id === patternId
              ? { ...p, repeat: clampedRepeat }
              : p
          );

          return {
            currentSet: {
              ...state.currentSet,
              patterns: newPatterns
            }
          };
        });
      },

      // Add new pattern (max 10)
      addPattern: () => {
        set((state) => {
          if (state.currentSet.patterns.length >= 10) {
            console.warn('Maximum 10 patterns reached');
            return state;
          }

          const newId = state.currentSet.patterns.length + 1;
          const newPattern = createDefaultPattern(newId, 'k h s h');

          return {
            currentSet: {
              ...state.currentSet,
              patterns: [...state.currentSet.patterns, newPattern]
            }
          };
        });
      },

      // Remove pattern (min 1)
      removePattern: (patternId) => {
        set((state) => {
          if (state.currentSet.patterns.length <= 1) {
            console.warn('Cannot remove last pattern');
            return state;
          }

          const patterns = state.currentSet.patterns;
          const removedPattern = patterns.find(p => p.id === patternId);
          if (!removedPattern) return state;

          // Filter out the removed pattern
          const filteredPatterns = patterns.filter(p => p.id !== patternId);

          // Renumber patterns sequentially (1, 2, 3, ...)
          const renumberedPatterns = filteredPatterns.map((p, idx) => ({
            ...p,
            id: idx + 1
          }));

          // Update current pattern if needed
          let newCurrentPattern = state.playback.currentPattern;

          if (state.playback.currentPattern === patternId) {
            // Removing current pattern: switch to previous or pattern 1
            newCurrentPattern = patternId > 1 ? patternId - 1 : 1;
          } else if (state.playback.currentPattern > patternId) {
            // Pattern number shifted down
            newCurrentPattern = state.playback.currentPattern - 1;
          }

          // Clear next pattern if it was the removed one
          let newNextPattern = state.playback.nextPattern;
          if (newNextPattern === patternId) {
            newNextPattern = null;
          } else if (newNextPattern && newNextPattern > patternId) {
            newNextPattern = newNextPattern - 1;
          }

          return {
            currentSet: {
              ...state.currentSet,
              patterns: renumberedPatterns
            },
            playback: {
              ...state.playback,
              currentPattern: newCurrentPattern,
              nextPattern: newNextPattern
            }
          };
        });
      },

      // Switch pattern
      switchPattern: (patternId) => {
        set((state) => {
          // Validate pattern exists
          if (!state.currentSet.patterns.find(p => p.id === patternId)) {
            console.warn(`Pattern ${patternId} does not exist`);
            return state;
          }

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

      setPlaybackMode: (playbackMode) => {
        set((state) => ({
          currentSet: {
            ...state.currentSet,
            playbackMode
          },
          playback: {
            ...state.playback,
            repeatCount: 0  // Reset repeat count when mode changes
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

      setKit: (kitName) => {
        set((state) => ({
          currentSet: {
            ...state.currentSet,
            selectedKit: kitName
          }
        }));
      },

      updateSetName: (name) => {
        set((state) => ({
          currentSet: {
            ...state.currentSet,
            name
          }
        }));
      },

      // Playback actions
      play: () => {
        set((state) => ({
          playback: {
            ...state.playback,
            isPlaying: true
          }
        }));
      },

      stop: () => {
        set((state) => ({
          playback: {
            ...state.playback,
            isPlaying: false
          }
        }));
      },

      triggerFill: () => {
        // Fill is handled by AudioEngine, this is just for store updates if needed
        console.log('[Store] Fill triggered');
      },

      // Playback state updates (for UI feedback)
      updatePlaybackState: (step: number, bar: number) => {
        set((state) => ({
          playback: {
            ...state.playback,
            currentStep: step,
            currentBar: bar
          }
        }));
      },

      applyPendingPatternSwitch: () => {
        set((state) => {
          if (state.playback.nextPattern) {
            console.log(`🔄 Switching pattern: ${state.playback.currentPattern} → ${state.playback.nextPattern}`);
            return {
              playback: {
                ...state.playback,
                currentPattern: state.playback.nextPattern,
                nextPattern: null,
                repeatCount: 0  // Reset repeat count when switching patterns
              }
            };
          }
          return state;
        });
      },

      // Handle pattern loop completion (for cycle mode)
      handlePatternLoop: () => {
        set((state) => {
          // Only handle in cycle mode
          if (state.currentSet.playbackMode !== 'cycle') {
            return state;
          }

          // Don't process if a pattern switch is already pending
          if (state.playback.nextPattern !== null) {
            return state;
          }

          const currentPattern = state.currentSet.patterns.find(
            p => p.id === state.playback.currentPattern
          );
          if (!currentPattern) return state;

          const targetRepeats = currentPattern.repeat ?? 2;
          const newRepeatCount = state.playback.repeatCount + 1;

          console.log(`🔁 Pattern ${currentPattern.id} repeat: ${newRepeatCount}/${targetRepeats}`);

          // Check if we've completed all repeats
          if (newRepeatCount >= targetRepeats) {
            // Queue next pattern
            const patternCount = state.currentSet.patterns.length;
            const currentIndex = state.currentSet.patterns.findIndex(
              p => p.id === state.playback.currentPattern
            );
            const nextIndex = (currentIndex + 1) % patternCount;
            const nextPatternId = state.currentSet.patterns[nextIndex].id;

            console.log(`🔄 Cycle: queuing pattern ${nextPatternId} (after ${targetRepeats} repeats)`);

            return {
              playback: {
                ...state.playback,
                nextPattern: nextPatternId,
                repeatCount: 0
              }
            };
          }

          // Just increment repeat count
          return {
            playback: {
              ...state.playback,
              repeatCount: newRepeatCount
            }
          };
        });
      },

      // Set management
      saveSet: (name) => {
        const state = get();
        const newSet = {
          ...state.currentSet,
          id: crypto.randomUUID(),
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
            currentSet: { ...setToLoad },
            playback: {
              ...state.playback,
              currentPattern: 1,  // Reset to first pattern
              nextPattern: null,
              isPlaying: false,
              repeatCount: 0
            }
          });
        }
      },

      deleteSet: (id) => {
        set((state) => ({
          savedSets: state.savedSets.filter(s => s.id !== id)
        }));
      },

      exportSet: () => {
        const state = get();
        return JSON.stringify(state.currentSet, null, 2);
      },

      importSet: (jsonString) => {
        try {
          const importedSet = JSON.parse(jsonString);
          // TODO: Validate imported set structure
          set({
            currentSet: importedSet
          });
        } catch (error) {
          console.error('Failed to import set:', error);
        }
      },

      // UI state
      setUIState: (updates) => {
        set((state) => ({
          ui: {
            ...state.ui,
            ...updates
          }
        }));
      }
    }),
    {
      name: 'drum-companion-storage',
      version: 2,
      partialize: (state) => ({
        currentSet: state.currentSet,
        savedSets: state.savedSets
      }),
      migrate: (persistedState: any, version: number) => {
        console.log(`[Store] Migrating from version ${version} to 2`);

        // If version is 0 or undefined, it's V1 (old schema)
        if (version === 0 || version === undefined) {
          try {
            const migratedState = migrateStateV1toV2(persistedState);
            console.log('[Store] Migration complete');
            return migratedState as any;
          } catch (error) {
            console.error('[Store] Migration failed, using default state', error);
            return createDefaultState() as any;
          }
        }

        return persistedState;
      }
    }
  )
);
