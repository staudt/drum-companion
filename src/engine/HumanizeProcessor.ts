/**
 * HumanizeProcessor adds timing and velocity jitter to create a more human feel.
 *
 * - Timing jitter: ±5ms at max humanize (1.0)
 * - Velocity jitter: ±20% at max humanize (1.0)
 *
 * Both values scale linearly with the humanize parameter (0-1).
 * Jitter is random but clamped to valid ranges.
 */
export class HumanizeProcessor {
  // Maximum timing jitter in seconds (20ms - noticeable but musical)
  private static readonly MAX_TIMING_JITTER = 0.020;

  // Maximum velocity jitter as a fraction (40% - noticeable dynamics)
  private static readonly MAX_VELOCITY_JITTER = 0.4;

  /**
   * Calculate timing jitter for a hit.
   * @param humanize The humanize amount (0-1)
   * @returns The timing offset in seconds (can be positive or negative)
   */
  static getTimingJitter(humanize: number): number {
    if (humanize <= 0) return 0;

    // Scale jitter range by humanize amount
    const jitterRange = this.MAX_TIMING_JITTER * Math.min(1, humanize);

    // Random value between -jitterRange and +jitterRange
    return (Math.random() * 2 - 1) * jitterRange;
  }

  /**
   * Apply velocity jitter to a base velocity.
   * @param baseVelocity The original velocity (0-1)
   * @param humanize The humanize amount (0-1)
   * @returns The adjusted velocity, clamped to 0-1
   */
  static applyVelocityJitter(baseVelocity: number, humanize: number): number {
    if (humanize <= 0) return baseVelocity;

    // Scale jitter range by humanize amount
    const jitterRange = this.MAX_VELOCITY_JITTER * Math.min(1, humanize);

    // Random multiplier between (1 - jitterRange) and (1 + jitterRange)
    const multiplier = 1 + (Math.random() * 2 - 1) * jitterRange;

    // Apply and clamp to valid range
    const result = baseVelocity * multiplier;
    return Math.max(0.1, Math.min(1, result)); // Min 0.1 to keep notes audible
  }

  /**
   * Apply humanization to timing and velocity.
   * @param baseVelocity The original velocity
   * @param humanize The humanize amount (0-1)
   * @returns Object with timingOffset and adjustedVelocity
   */
  static applyHumanize(
    baseVelocity: number,
    humanize: number
  ): { timingOffset: number; velocity: number } {
    return {
      timingOffset: this.getTimingJitter(humanize),
      velocity: this.applyVelocityJitter(baseVelocity, humanize)
    };
  }
}
