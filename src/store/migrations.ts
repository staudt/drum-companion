import type { DrumSet, Pattern } from '../types/pattern';
import type { AppState } from '../types/state';
import type { PlaybackState } from '../types/audio';

// Type for old V1 state structure
interface DrumSetV1 {
  id: string;
  name: string;
  patterns: Record<'A' | 'B' | 'C' | 'D', any>;
  bpm: number;
  feel: 'straight' | 'swing' | 'shuffle';
  humanize: number;
  density: number;
  volume: number;
  version?: number;
}

interface AppStateV1 {
  currentSet: DrumSetV1;
  playback: {
    isPlaying: boolean;
    currentPattern: 'A' | 'B' | 'C' | 'D';
    nextPattern: 'A' | 'B' | 'C' | 'D' | null;
    currentBar: number;
    currentStep: number;
    fillActive: boolean;
    fillContinuous: boolean;
  };
  savedSets: DrumSetV1[];
}

/**
 * Check if a DrumSet is V1 (old schema with Record patterns)
 */
export function isV1DrumSet(set: any): boolean {
  return !set.version && set.patterns && 'A' in set.patterns;
}

/**
 * Convert pattern letter to number (A→1, B→2, C→3, D→4)
 */
export function patternLetterToNumber(letter: 'A' | 'B' | 'C' | 'D'): number {
  const mapping = { A: 1, B: 2, C: 3, D: 4 };
  return mapping[letter];
}

/**
 * Migrate a single DrumSet from V1 to V2
 */
export function migrateDrumSetV1toV2(oldSet: DrumSetV1): DrumSet {
  // Convert patterns from Record to Array
  const patterns: Pattern[] = [
    { ...oldSet.patterns.A, id: 1 },
    { ...oldSet.patterns.B, id: 2 },
    { ...oldSet.patterns.C, id: 3 },
    { ...oldSet.patterns.D, id: 4 },
  ];

  return {
    ...oldSet,
    patterns,
    selectedKit: 'kit-default',
    version: 2,
  };
}

/**
 * Migrate PlaybackState from V1 to V2
 */
export function migratePlaybackStateV1toV2(
  oldPlayback: AppStateV1['playback']
): PlaybackState {
  return {
    ...oldPlayback,
    currentPattern: patternLetterToNumber(oldPlayback.currentPattern),
    nextPattern: oldPlayback.nextPattern
      ? patternLetterToNumber(oldPlayback.nextPattern)
      : null,
  };
}

/**
 * Main migration function: V1 → V2
 * Handles full AppState migration
 */
export function migrateStateV1toV2(oldState: any): Partial<AppState> {
  // Check if migration is needed
  if (!isV1DrumSet(oldState.currentSet)) {
    console.log('[Migration] State is already V2 or newer, skipping migration');
    return oldState;
  }

  console.log('[Migration] Migrating state from V1 to V2...');

  try {
    // Migrate current set
    const migratedCurrentSet = migrateDrumSetV1toV2(oldState.currentSet);

    // Migrate saved sets
    const migratedSavedSets = (oldState.savedSets || []).map((set: DrumSetV1) =>
      isV1DrumSet(set) ? migrateDrumSetV1toV2(set) : set
    );

    // Migrate playback state
    const migratedPlayback = migratePlaybackStateV1toV2(oldState.playback);

    const migratedState = {
      ...oldState,
      currentSet: migratedCurrentSet,
      savedSets: migratedSavedSets,
      playback: migratedPlayback,
      ui: {
        sidebarOpen: true,  // Default to open on desktop
      },
    };

    console.log('[Migration] Migration successful!', {
      patternsCount: migratedCurrentSet.patterns.length,
      currentPattern: migratedPlayback.currentPattern,
      savedSetsCount: migratedSavedSets.length,
    });

    return migratedState;
  } catch (error) {
    console.error('[Migration] Migration failed:', error);
    console.warn('[Migration] Falling back to corrupted state (will use defaults)');
    throw error;  // Let the store handle fallback
  }
}

/**
 * Create default V2 state (for new users or corrupted data)
 */
export function createDefaultState(): Partial<AppState> {
  const defaultPatterns: Pattern[] = [
    {
      id: 1,
      text: 'k h s h',
      steps: [],  // Will be populated by parser
      bars: 1,
    },
    {
      id: 2,
      text: 'k . s . k k s .',
      steps: [],
      bars: 1,
    },
    {
      id: 3,
      text: 'kh . sh . kh . sh .',
      steps: [],
      bars: 1,
    },
    {
      id: 4,
      text: 'k h sh h k . s h',
      steps: [],
      bars: 1,
    },
  ];

  return {
    currentSet: {
      id: crypto.randomUUID(),
      name: 'Untitled Set',
      patterns: defaultPatterns,
      selectedKit: 'kit-default',
      bpm: 120,
      feel: 'straight',
      humanize: 0,
      density: 0,
      volume: 0.7,
      version: 2,
    },
    playback: {
      isPlaying: false,
      currentPattern: 1,
      nextPattern: null,
      currentBar: 0,
      currentStep: 0,
      fillActive: false,
      fillContinuous: false,
    },
    savedSets: [],
    ui: {
      sidebarOpen: true,
    },
  };
}
