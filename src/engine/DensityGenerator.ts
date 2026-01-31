import type { Step, Hit, DrumSymbol } from '../types/pattern';

/**
 * DensityGenerator adds ghost notes to create fuller, busier patterns.
 *
 * - At low density: Occasionally adds soft hi-hat hits on rest steps
 * - At high density: Adds ghost notes on many rest steps, plus extra hits on existing steps
 *
 * Ghost notes are generated on bar boundaries for consistency within each bar.
 * Uses a seeded random approach per-bar to ensure regeneration produces the same pattern.
 */
export class DensityGenerator {
  // Ghost note velocity (moderate ~50% - audible but not overpowering)
  private static readonly GHOST_VELOCITY = 0.5;

  /**
   * Generate a pattern with density-based ghost notes added.
   * This should be called on bar boundaries to regenerate density for the next bar.
   *
   * @param originalSteps The base pattern steps
   * @param density The density amount (0-1)
   * @param barIndex The current bar index (used for seeded randomness)
   * @returns New array of steps with ghost notes added
   */
  static generateWithDensity(
    originalSteps: Step[],
    density: number,
    barIndex: number
  ): Step[] {
    if (density <= 0) {
      return originalSteps;
    }

    // Create a seeded random function for this bar
    const random = this.createSeededRandom(barIndex);

    return originalSteps.map((step, stepIndex) => {
      // Decide what to add based on density and step state
      if (step.isRest || step.hits.length === 0) {
        // Rest step: potentially add ghost note
        return this.maybeAddGhostNote(step, density, random, stepIndex);
      } else {
        // Active step: at high density, potentially add extra layer
        return this.maybeAddExtraLayer(step, density, random, stepIndex);
      }
    });
  }

  /**
   * Maybe add a ghost note to a rest step.
   */
  private static maybeAddGhostNote(
    step: Step,
    density: number,
    random: () => number,
    stepIndex: number
  ): Step {
    // Base probability scales with density
    // At density 0.5: 40% chance, at density 1.0: 80% chance
    const probability = density * 0.8;

    if (random() > probability) {
      return step; // No change
    }

    // Prefer hi-hat on offbeats (2, 6, 10, 14 in 16-step bar)
    const positionInBar = stepIndex % 16;
    const isOffbeat = positionInBar % 2 === 1;

    // Choose symbol based on position
    const symbol: DrumSymbol = isOffbeat ? 'h' : (random() > 0.7 ? 'r' : 'h');

    const ghostHit: Hit = {
      symbol,
      velocity: this.GHOST_VELOCITY + random() * 0.1, // Slight velocity variation
      offset: 0
    };

    return {
      hits: [ghostHit],
      isRest: false
    };
  }

  /**
   * Maybe add an extra layer to an active step (at high density).
   */
  private static maybeAddExtraLayer(
    step: Step,
    density: number,
    random: () => number,
    _stepIndex: number
  ): Step {
    // Only at high density (>0.6), and lower probability
    if (density < 0.6) {
      return step;
    }

    const probability = (density - 0.6) * 0.5; // 0-20% at density 0.6-1.0

    if (random() > probability) {
      return step;
    }

    // Check what's already in the step
    const hasHat = step.hits.some(h => h.symbol === 'h' || h.symbol === 'H');
    const hasRide = step.hits.some(h => h.symbol === 'r');

    // Don't add if already has hi-hat or ride
    if (hasHat || hasRide) {
      return step;
    }

    // Add a soft hi-hat
    const extraHit: Hit = {
      symbol: 'h',
      velocity: this.GHOST_VELOCITY,
      offset: 0
    };

    return {
      hits: [...step.hits, extraHit],
      isRest: false
    };
  }

  /**
   * Create a simple seeded random function.
   * Uses a basic LCG (Linear Congruential Generator).
   */
  private static createSeededRandom(seed: number): () => number {
    // Use a combination of bar index and a large prime for variation
    let state = (seed * 2654435761) >>> 0 || 1;

    return () => {
      // LCG parameters (same as glibc)
      state = (state * 1103515245 + 12345) >>> 0;
      return (state >>> 16) / 32768;
    };
  }

  /**
   * Quick check if pattern should have density applied.
   * Returns false if density is 0 or pattern is empty.
   */
  static shouldApplyDensity(density: number, stepsLength: number): boolean {
    return density > 0 && stepsLength > 0;
  }
}
