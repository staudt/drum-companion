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
  // Convert patterns from Record to Array, adding default repeat count and names
  const patterns: Pattern[] = [
    { ...oldSet.patterns.A, id: 1, repeat: 2, name: 'Pattern 1' },
    { ...oldSet.patterns.B, id: 2, repeat: 2, name: 'Pattern 2' },
    { ...oldSet.patterns.C, id: 3, repeat: 2, name: 'Pattern 3' },
    { ...oldSet.patterns.D, id: 4, repeat: 2, name: 'Pattern 4' },
  ];

  return {
    ...oldSet,
    patterns,
    selectedKit: 'kit-default',
    playbackMode: 'loop',
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
    repeatCount: 0,
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
 * Check if a DrumSet is V2 (needs includeInCycle field added)
 */
export function isV2DrumSet(set: any): boolean {
  // V2 if version is explicitly 2, or if patterns array exists but lacks includeInCycle
  if (set.version === 2) return true;
  if (Array.isArray(set.patterns) && set.patterns.length > 0) {
    // Check if any pattern is missing includeInCycle
    return set.patterns.some((p: any) => p.includeInCycle === undefined);
  }
  return false;
}

/**
 * Migrate a single DrumSet from V2 to V3
 * Adds includeInCycle: true to all patterns
 */
export function migrateDrumSetV2toV3(oldSet: DrumSet): DrumSet {
  const patterns: Pattern[] = oldSet.patterns.map(p => ({
    ...p,
    includeInCycle: p.includeInCycle ?? true,  // Add includeInCycle if missing
  }));

  return {
    ...oldSet,
    patterns,
    version: 3,
  };
}

/**
 * Main migration function: V2 → V3
 * Handles full AppState migration
 */
export function migrateStateV2toV3(oldState: any): Partial<AppState> {
  // Check if migration is needed
  if (!isV2DrumSet(oldState.currentSet)) {
    console.log('[Migration] State is already V3 or newer, skipping V2→V3 migration');
    return oldState;
  }

  console.log('[Migration] Migrating state from V2 to V3...');

  try {
    // Migrate current set
    const migratedCurrentSet = migrateDrumSetV2toV3(oldState.currentSet);

    // Migrate saved sets
    const migratedSavedSets = (oldState.savedSets || []).map((set: DrumSet) =>
      isV2DrumSet(set) ? migrateDrumSetV2toV3(set) : set
    );

    const migratedState = {
      ...oldState,
      currentSet: migratedCurrentSet,
      savedSets: migratedSavedSets,
    };

    console.log('[Migration] V2→V3 migration successful!', {
      patternsCount: migratedCurrentSet.patterns.length,
      allPatternsHaveIncludeInCycle: migratedCurrentSet.patterns.every(
        (p: Pattern) => p.includeInCycle !== undefined
      ),
    });

    return migratedState;
  } catch (error) {
    console.error('[Migration] V2→V3 migration failed:', error);
    console.warn('[Migration] Falling back to corrupted state (will use defaults)');
    throw error;  // Let the store handle fallback
  }
}

/**
 * Create default V3 state (for new users or corrupted data)
 */
export function createDefaultState(): Partial<AppState> {
  const defaultPatterns: Pattern[] = [
    {
      id: 1,
      text: 'k h s h',
      steps: [],  // Will be populated by parser
      bars: 1,
      repeat: 2,
      name: 'Pattern 1',
      includeInCycle: true,
    },
    {
      id: 2,
      text: 'k . s . k k s .',
      steps: [],
      bars: 1,
      repeat: 2,
      name: 'Pattern 2',
      includeInCycle: true,
    },
    {
      id: 3,
      text: 'kh . sh . kh . sh .',
      steps: [],
      bars: 1,
      repeat: 2,
      name: 'Pattern 3',
      includeInCycle: true,
    },
    {
      id: 4,
      text: 'k h sh h k . s h',
      steps: [],
      bars: 1,
      repeat: 2,
      name: 'Pattern 4',
      includeInCycle: true,
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
      playbackMode: 'loop',
      humanize: 0,
      density: 0,
      volume: 0.7,
      version: 3,
    },
    playback: {
      isPlaying: false,
      currentPattern: 1,
      nextPattern: null,
      currentBar: 0,
      currentStep: 0,
      fillActive: false,
      fillContinuous: false,
      repeatCount: 0,
    },
    savedSets: [],
    ui: {
      sidebarOpen: true,
    },
  };
}
