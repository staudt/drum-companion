import type { Feel } from '../types/pattern';

/**
 * FeelProcessor applies timing offsets to create swing and shuffle feels.
 *
 * - Straight: No timing offset
 * - Swing: Delays every other 8th note by ~15% of step duration (triplet feel)
 * - Shuffle: More pronounced delay (~25% of step duration)
 *
 * In a 16th note grid (4/4 time):
 * - Steps 0, 4, 8, 12 = downbeats (no offset)
 * - Steps 1, 5, 9, 13 = first 16th after beat (no offset)
 * - Steps 2, 6, 10, 14 = "and" of each beat (delayed for swing/shuffle)
 * - Steps 3, 7, 11, 15 = last 16th of each beat (no offset)
 */
export class FeelProcessor {
  /**
   * Calculate timing offset for a step based on feel.
   * @param stepIndex The index of the step in the pattern (0-based)
   * @param stepDuration The duration of one step in seconds
   * @param feel The current feel setting
   * @returns The timing offset in seconds to apply to this step
   */
  static getTimingOffset(
    stepIndex: number,
    stepDuration: number,
    feel: Feel
  ): number {
    if (feel === 'straight') {
      return 0;
    }

    // Determine if this is an "offbeat" step (2, 6, 10, 14 in a 16-step bar)
    // These are the "and" of each beat in 4/4 time
    const positionInBar = stepIndex % 16;
    const isOffbeat = positionInBar % 4 === 2;

    if (!isOffbeat) {
      return 0;
    }

    // Apply delay based on feel type
    if (feel === 'swing') {
      // Swing: ~15% delay creates a triplet feel (closer to 1:2 ratio)
      return stepDuration * 0.15;
    } else if (feel === 'shuffle') {
      // Shuffle: ~25% delay creates a more pronounced swing
      return stepDuration * 0.25;
    }

    return 0;
  }

  /**
   * Apply feel to all hits in a step.
   * Returns the timing offset that should be added to the scheduled time.
   */
  static applyFeel(
    stepIndex: number,
    stepDuration: number,
    feel: Feel
  ): number {
    return this.getTimingOffset(stepIndex, stepDuration, feel);
  }
}
