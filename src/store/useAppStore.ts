import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pattern, DrumSet, Feel, PlaybackMode } from '../types/pattern';
import type { AppState } from '../types/state';
import type { PlaybackState } from '../types/audio';
import { parsePattern, calculateBars } from '../parser/parsePattern';
import {
  migrateStateV1toV2,
  migrateStateV2toV3,
  createDefaultState,
  isV1DrumSet,
  isV2DrumSet,
  migrateDrumSetV1toV2,
  migrateDrumSetV2toV3
} from './migrations';

// Helper to create a default pattern
const createDefaultPattern = (id: number, text: string): Pattern => {
  const steps = parsePattern(text);
  return {
    id,
    text,
    steps,
    bars: calculateBars(steps.length),
    repeat: 2,  // Default repeat count for cycle mode
    name: `Pattern ${id}`,  // Default name
    includeInCycle: true  // Include in cycle mode by default
  };
};

// Helper to create a default drum set (V3 schema)
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
  version: 3
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

      // Pattern name update
      setPatternName: (patternId, name) => {
        set((state) => {
          const newPatterns = state.currentSet.patterns.map(p =>
            p.id === patternId
              ? { ...p, name }
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

      // Toggle pattern includeInCycle flag
      togglePatternIncludeInCycle: (patternId) => {
        set((state) => {
          const newPatterns = state.currentSet.patterns.map(p =>
            p.id === patternId
              ? { ...p, includeInCycle: !p.includeInCycle }
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

      // Add new pattern
      addPattern: () => {
        set((state) => {
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
          // Also update default names if they match the pattern "Pattern <number>"
          const renumberedPatterns = filteredPatterns.map((p, idx) => {
            const newId = idx + 1;
            const isDefaultName = !p.name || p.name.match(/^Pattern \d+$/);
            return {
              ...p,
              id: newId,
              name: isDefaultName ? `Pattern ${newId}` : p.name
            };
          });

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

      // Reorder patterns (drag-and-drop)
      reorderPatterns: (fromIndex, toIndex) => {
        set((state) => {
          if (fromIndex === toIndex) return state;
          if (fromIndex < 0 || fromIndex >= state.currentSet.patterns.length) return state;
          if (toIndex < 0 || toIndex >= state.currentSet.patterns.length) return state;

          const patterns = [...state.currentSet.patterns];
          const [movedPattern] = patterns.splice(fromIndex, 1);
          patterns.splice(toIndex, 0, movedPattern);

          // Renumber patterns sequentially (1, 2, 3, ...)
          // Also update default names if they match the pattern "Pattern <number>"
          const renumberedPatterns = patterns.map((p, idx) => {
            const newId = idx + 1;
            const isDefaultName = !p.name || p.name.match(/^Pattern \d+$/);
            return {
              ...p,
              id: newId,
              name: isDefaultName ? `Pattern ${newId}` : p.name
            };
          });

          // Track which pattern moved where
          const oldIdToNewId = new Map<number, number>();
          renumberedPatterns.forEach((p, idx) => {
            const oldPattern = state.currentSet.patterns.find(old => old.text === p.text && old.name === p.name);
            if (oldPattern) {
              oldIdToNewId.set(oldPattern.id, p.id);
            }
          });

          // Update current pattern to follow the moved pattern
          let newCurrentPattern = state.playback.currentPattern;
          const mappedCurrent = oldIdToNewId.get(state.playback.currentPattern);
          if (mappedCurrent !== undefined) {
            newCurrentPattern = mappedCurrent;
          }

          // Update next pattern to follow the moved pattern
          let newNextPattern = state.playback.nextPattern;
          if (newNextPattern !== null) {
            const mappedNext = oldIdToNewId.get(newNextPattern);
            if (mappedNext !== undefined) {
              newNextPattern = mappedNext;
            }
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
            // Find next pattern that is included in cycle
            const patterns = state.currentSet.patterns;
            const includedPatterns = patterns.filter(p => p.includeInCycle);

            // Edge case: no patterns included in cycle
            if (includedPatterns.length === 0) {
              console.warn('⚠️ No patterns included in cycle, staying on current pattern');
              return {
                playback: {
                  ...state.playback,
                  repeatCount: 0  // Reset count but stay on current
                }
              };
            }

            // Find next included pattern (circular search)
            const currentIndex = patterns.findIndex(
              p => p.id === state.playback.currentPattern
            );
            let nextIndex = (currentIndex + 1) % patterns.length;
            let searchCount = 0;

            // Search for next pattern with includeInCycle === true
            while (!patterns[nextIndex].includeInCycle && searchCount < patterns.length) {
              nextIndex = (nextIndex + 1) % patterns.length;
              searchCount++;
            }

            const nextPatternId = patterns[nextIndex].id;

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

        // Check if a set with this name already exists
        const existingSetIndex = state.savedSets.findIndex(s => s.name === name);

        if (existingSetIndex !== -1) {
          // Replace existing set with same name
          const updatedSet = {
            ...state.currentSet,
            id: state.savedSets[existingSetIndex].id,  // Keep existing ID
            name
          };

          const newSavedSets = [...state.savedSets];
          newSavedSets[existingSetIndex] = updatedSet;

          set({
            savedSets: newSavedSets
          });
        } else {
          // Create new set
          const newSet = {
            ...state.currentSet,
            id: crypto.randomUUID(),
            name
          };

          set({
            savedSets: [...state.savedSets, newSet]
          });
        }
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
          let importedSet = JSON.parse(jsonString);

          // Migrate imported set if needed (V1 → V2 → V3)
          if (isV1DrumSet(importedSet)) {
            console.log('[Import] Migrating imported set from V1 to V2');
            importedSet = migrateDrumSetV1toV2(importedSet);
          }

          if (isV2DrumSet(importedSet)) {
            console.log('[Import] Migrating imported set from V2 to V3');
            importedSet = migrateDrumSetV2toV3(importedSet);
          }

          // Validate that all patterns have includeInCycle
          const allPatternsValid = importedSet.patterns?.every(
            (p: Pattern) => p.includeInCycle !== undefined
          );

          if (!allPatternsValid) {
            console.warn('[Import] Some patterns missing includeInCycle, adding default');
            importedSet.patterns = importedSet.patterns.map((p: Pattern) => ({
              ...p,
              includeInCycle: p.includeInCycle ?? true
            }));
          }

          set({
            currentSet: importedSet
          });

          console.log('[Import] Set imported successfully', {
            name: importedSet.name,
            version: importedSet.version,
            patterns: importedSet.patterns.length
          });
        } catch (error) {
          console.error('Failed to import set:', error);
          alert('Failed to import set. Please check the JSON format.');
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
      version: 3,
      partialize: (state) => ({
        currentSet: state.currentSet,
        savedSets: state.savedSets
      }),
      migrate: (persistedState: any, version: number) => {
        console.log(`[Store] Migrating from version ${version} to 3`);

        try {
          let state = persistedState;

          // V1 → V2 migration (if needed)
          if (version === 0 || version === undefined) {
            console.log('[Store] Running V1 → V2 migration');
            state = migrateStateV1toV2(state);
          }

          // V2 → V3 migration (if needed)
          if (version <= 2) {
            console.log('[Store] Running V2 → V3 migration');
            state = migrateStateV2toV3(state);
          }

          console.log('[Store] Migration complete');
          return state as any;
        } catch (error) {
          console.error('[Store] Migration failed, using default state', error);
          return createDefaultState() as any;
        }
      }
    }
  )
);
