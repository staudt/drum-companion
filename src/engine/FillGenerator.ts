import type { Step, Hit, DrumSymbol } from '../types/pattern';

/**
 * FillGenerator creates drum fills that replace portions of a pattern.
 *
 * Fill Philosophy:
 * - Keep kicks from original pattern (maintains groove)
 * - Replace hi-hats, snares, rides with tom/snare patterns
 * - Progressive build: sparse -> dense -> crash
 * - Crash scheduled separately for next bar's beat 1
 */
export class FillGenerator {
  private static readonly FILL_VELOCITY = 0.85;
  private static readonly ACCENT_VELOCITY = 1.0;

  /**
   * Generate a fill pattern from current step to end of pattern.
   *
   * @param originalPattern The current pattern being played
   * @param currentStep The current step position (0-based)
   * @param patternLength The length of the pattern (for short patterns)
   * @returns Object with fillSteps and shouldCrash flag
   */
  static generateFill(
    originalPattern: Step[],
    currentStep: number,
    patternLength?: number
  ): { fillSteps: Step[]; shouldCrash: boolean } {
    // Use provided pattern length or fall back to original pattern length
    const effectiveLength = patternLength ?? originalPattern.length;
    const positionInPattern = currentStep % effectiveLength;
    const remainingSteps = effectiveLength - positionInPattern;

    // If on last step or no steps remaining, don't fill
    if (remainingSteps <= 1) {
      return {
        fillSteps: originalPattern,
        shouldCrash: false
      };
    }

    // Copy original pattern, we'll modify from positionInPattern onward
    const fillSteps = originalPattern.map(step => ({
      hits: step.hits.map(hit => ({ ...hit })),
      isRest: step.isRest
    }));

    // Replace hits from positionInPattern to end of pattern
    for (let i = positionInPattern; i < effectiveLength && i < fillSteps.length; i++) {
      const stepsToEnd = effectiveLength - i;
      fillSteps[i] = this.generateFillStep(
        fillSteps[i],
        i,
        stepsToEnd,
        remainingSteps
      );
    }

    return {
      fillSteps,
      shouldCrash: true
    };
  }

  /**
   * Generate a single fill step.
   * Keeps kicks, replaces other sounds with fill pattern.
   */
  private static generateFillStep(
    originalStep: Step,
    positionInBar: number,
    stepsToEnd: number,
    totalFillLength: number
  ): Step {
    // Extract kick hits to preserve
    const kickHits = originalStep.hits.filter(h => h.symbol === 'k');

    // Generate fill hits based on position
    const fillHits = this.selectFillHits(positionInBar, stepsToEnd, totalFillLength);

    const allHits = [...kickHits, ...fillHits];

    return {
      hits: allHits,
      isRest: allHits.length === 0
    };
  }

  /**
   * Select fill sounds based on position in bar and remaining time.
   */
  private static selectFillHits(
    _positionInBar: number,
    stepsToEnd: number,
    totalFillLength: number
  ): Hit[] {
    if (totalFillLength <= 4) {
      return this.generateSnareRoll(stepsToEnd);
    } else if (totalFillLength <= 8) {
      return this.generateMediumFill(stepsToEnd, totalFillLength);
    } else if (totalFillLength <= 12) {
      return this.generateLongFill(stepsToEnd, totalFillLength);
    } else {
      return this.generateFullFill(stepsToEnd, totalFillLength);
    }
  }

  /**
   * Short fill (1-4 steps): Snare roll to finish
   */
  private static generateSnareRoll(stepsToEnd: number): Hit[] {
    // Snare on every step, accent final 2 steps
    const velocity = stepsToEnd <= 2 ? this.ACCENT_VELOCITY : this.FILL_VELOCITY;
    return [{ symbol: 's' as DrumSymbol, velocity, offset: 0 }];
  }

  /**
   * Medium fill (5-8 steps): Toms in first half, snares in second half
   */
  private static generateMediumFill(
    stepsToEnd: number,
    totalFillLength: number
  ): Hit[] {
    const halfway = Math.ceil(totalFillLength / 2);
    const progressInFill = totalFillLength - stepsToEnd;

    if (progressInFill < halfway) {
      // First half: alternating toms (hi -> mid)
      const tomSymbol: DrumSymbol = progressInFill % 2 === 0 ? 'T' : 't';
      return [{ symbol: tomSymbol, velocity: this.FILL_VELOCITY, offset: 0 }];
    } else {
      // Second half: snares building
      const velocity = stepsToEnd <= 2 ? this.ACCENT_VELOCITY : this.FILL_VELOCITY;
      return [{ symbol: 's' as DrumSymbol, velocity, offset: 0 }];
    }
  }

  /**
   * Long fill (9-12 steps): Progressive toms hi->mid->low, then snare build
   */
  private static generateLongFill(
    stepsToEnd: number,
    totalFillLength: number
  ): Hit[] {
    const third = Math.ceil(totalFillLength / 3);
    const progressInFill = totalFillLength - stepsToEnd;

    if (progressInFill < third) {
      // First third: hi tom (sparse - every other step)
      return progressInFill % 2 === 0
        ? [{ symbol: 'T' as DrumSymbol, velocity: this.FILL_VELOCITY, offset: 0 }]
        : [];
    } else if (progressInFill < third * 2) {
      // Second third: mid tom
      return [{ symbol: 't' as DrumSymbol, velocity: this.FILL_VELOCITY, offset: 0 }];
    } else {
      // Final third: snares
      const velocity = stepsToEnd <= 2 ? this.ACCENT_VELOCITY : this.FILL_VELOCITY;
      return [{ symbol: 's' as DrumSymbol, velocity, offset: 0 }];
    }
  }

  /**
   * Full bar fill (13-16 steps): Complete progressive build
   */
  private static generateFullFill(
    stepsToEnd: number,
    totalFillLength: number
  ): Hit[] {
    const quarter = Math.ceil(totalFillLength / 4);
    const progressInFill = totalFillLength - stepsToEnd;

    if (progressInFill < quarter) {
      // First quarter: sparse hi toms
      return progressInFill % 2 === 0
        ? [{ symbol: 'T' as DrumSymbol, velocity: this.FILL_VELOCITY * 0.9, offset: 0 }]
        : [];
    } else if (progressInFill < quarter * 2) {
      // Second quarter: mid toms
      return [{ symbol: 't' as DrumSymbol, velocity: this.FILL_VELOCITY, offset: 0 }];
    } else if (progressInFill < quarter * 3) {
      // Third quarter: low toms + mid toms alternating
      const symbol: DrumSymbol = progressInFill % 2 === 0 ? 'f' : 't';
      return [{ symbol, velocity: this.FILL_VELOCITY, offset: 0 }];
    } else {
      // Final quarter: snare roll building to accent
      const velocity = stepsToEnd <= 2 ? this.ACCENT_VELOCITY : this.FILL_VELOCITY;
      return [{ symbol: 's' as DrumSymbol, velocity, offset: 0 }];
    }
  }

  /**
   * Generate a crash hit for beat 1 of next bar.
   */
  static generateCrashHit(): Hit {
    return { symbol: 'c' as DrumSymbol, velocity: this.ACCENT_VELOCITY, offset: 0 };
  }
}
