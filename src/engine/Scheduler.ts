import type { Step, Feel } from '../types/pattern';
import type { SampleLoader } from './SampleLoader';
import { SPRITE_MAP } from '../parser/constants';
import { FeelProcessor } from './FeelProcessor';
import { HumanizeProcessor } from './HumanizeProcessor';
import { DensityGenerator } from './DensityGenerator';

/**
 * Lookahead scheduler for precise audio timing.
 * Schedules notes slightly ahead of when they should play,
 * avoiding drift issues with setInterval/setTimeout.
 */
export class Scheduler {
  private context: AudioContext;
  private sampleLoader: SampleLoader;
  private destination: AudioNode;

  // Lookahead settings
  private scheduleAheadTime = 0.1;  // 100ms lookahead
  private schedulerInterval = 25;   // Check every 25ms

  // Playback state
  private isPlaying = false;
  private timerID: number | null = null;
  private nextStepTime = 0;
  private currentStep = 0;
  private pattern: Step[] = [];
  private processedPattern: Step[] = []; // Pattern with density applied
  private bpm = 120;
  private feel: Feel = 'straight';
  private humanize = 0;
  private density = 0;
  private stepsPerBar = 16;
  private currentBar = 0;

  // Callbacks
  private onStepCallback?: (stepIndex: number) => void;
  private onBarBoundaryCallback?: (barIndex: number) => void;

  constructor(context: AudioContext, sampleLoader: SampleLoader, destination: AudioNode) {
    this.context = context;
    this.sampleLoader = sampleLoader;
    this.destination = destination;
  }

  /**
   * Start playing a pattern
   */
  start(pattern: Step[], bpm: number): void {
    if (this.isPlaying) {
      this.stop();
    }

    this.pattern = pattern;
    this.bpm = bpm;
    this.currentStep = 0;
    this.currentBar = 0;
    this.nextStepTime = this.context.currentTime;
    this.isPlaying = true;

    // Apply density processing to pattern
    this.processedPattern = DensityGenerator.generateWithDensity(
      this.pattern,
      this.density,
      this.currentBar
    );

    console.log(`▶️  Starting scheduler: ${pattern.length} steps @ ${bpm} BPM (humanize: ${this.humanize}, density: ${this.density})`);

    // Start the scheduler loop
    this.scheduleLoop();
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    if (this.timerID !== null) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }

    console.log('⏹️  Scheduler stopped');
  }

  /**
   * Update BPM without stopping
   */
  setBPM(bpm: number): void {
    this.bpm = bpm;
  }

  /**
   * Update feel without stopping
   */
  setFeel(feel: Feel): void {
    this.feel = feel;
    console.log(`🎵 Feel changed to: ${feel}`);
  }

  /**
   * Update humanize amount without stopping (0-1)
   */
  setHumanize(humanize: number): void {
    this.humanize = Math.max(0, Math.min(1, humanize));
    console.log(`🎵 Humanize changed to: ${this.humanize}`);
  }

  /**
   * Update density amount without stopping (0-1)
   * Note: Takes effect on next bar boundary
   */
  setDensity(density: number): void {
    this.density = Math.max(0, Math.min(1, density));
    console.log(`🎵 Density changed to: ${this.density}`);
  }

  /**
   * Update pattern while playing (safe - doesn't interrupt playback)
   */
  updatePattern(pattern: Step[]): void {
    if (pattern.length === 0) {
      console.warn('⚠️  Cannot update to empty pattern');
      return;
    }

    console.log(`🔄 Pattern updated: ${this.pattern.length} → ${pattern.length} steps`);
    this.pattern = pattern;

    // Regenerate processed pattern with density
    this.processedPattern = DensityGenerator.generateWithDensity(
      this.pattern,
      this.density,
      this.currentBar
    );

    // If current step is beyond new pattern length, reset to 0
    if (this.currentStep >= pattern.length) {
      this.currentStep = 0;
    }
  }

  /**
   * Set callback for when each step plays
   */
  onStep(callback: (stepIndex: number) => void): void {
    this.onStepCallback = callback;
  }

  /**
   * Set callback for bar boundaries
   */
  onBarBoundary(callback: (barIndex: number) => void): void {
    this.onBarBoundaryCallback = callback;
  }

  /**
   * Get current step index
   */
  getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * Get current bar index
   */
  getCurrentBar(): number {
    return this.currentBar;
  }

  /**
   * Main scheduler loop - checks every 25ms and schedules notes in lookahead window
   */
  private scheduleLoop(): void {
    if (!this.isPlaying) return;

    // Schedule all notes that fall within the lookahead window
    while (this.nextStepTime < this.context.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }

    // Check again in 25ms
    this.timerID = window.setTimeout(() => this.scheduleLoop(), this.schedulerInterval);
  }

  /**
   * Schedule a single step to play at the specified time
   */
  private scheduleStep(stepIndex: number, time: number): void {
    if (!this.processedPattern.length) return;

    const step = this.processedPattern[stepIndex % this.processedPattern.length];

    // Skip rest steps
    if (step.isRest || step.hits.length === 0) {
      return;
    }

    // Calculate step duration for feel processing
    const secondsPerBeat = 60.0 / this.bpm;
    const stepDuration = secondsPerBeat / 4; // 16th note duration

    // Apply feel offset to the base time
    const feelOffset = FeelProcessor.applyFeel(stepIndex, stepDuration, this.feel);

    // Schedule each hit in this step
    for (const hit of step.hits) {
      const spriteName = SPRITE_MAP[hit.symbol];
      if (!spriteName) {
        console.warn(`⚠️  No sprite mapping for symbol: ${hit.symbol}`);
        continue;
      }

      // Apply humanization (timing jitter and velocity jitter)
      const { timingOffset, velocity } = HumanizeProcessor.applyHumanize(
        hit.velocity,
        this.humanize
      );

      // Play sample with humanized velocity, hit offset, feel offset, and timing jitter
      const when = time + hit.offset + feelOffset + timingOffset;
      this.sampleLoader.playSample(
        spriteName,
        when,
        velocity,
        this.destination
      );
    }
  }

  /**
   * Advance to next step and handle bar boundaries
   */
  private advanceStep(): void {
    // Calculate step duration based on BPM
    // 4/4 time, 16th notes: 1 beat = 60/BPM seconds, 16th = beat/4
    const secondsPerBeat = 60.0 / this.bpm;
    const secondsPer16th = secondsPerBeat / 4;

    this.nextStepTime += secondsPer16th;

    // Advance step
    this.currentStep++;

    // Loop pattern if we've reached the end
    if (this.currentStep >= this.pattern.length) {
      this.currentStep = 0;
    }

    // Notify step callback
    if (this.onStepCallback) {
      this.onStepCallback(this.currentStep);
    }

    // Check for bar boundary AFTER advancing
    const isOnBarBoundary = this.currentStep % this.stepsPerBar === 0;

    if (isOnBarBoundary) {
      this.currentBar++;

      // Regenerate density pattern for the new bar
      this.processedPattern = DensityGenerator.generateWithDensity(
        this.pattern,
        this.density,
        this.currentBar
      );

      // Debug: count ghost notes added
      if (this.density > 0) {
        const originalHits = this.pattern.reduce((sum, s) => sum + (s.isRest ? 0 : s.hits.length), 0);
        const processedHits = this.processedPattern.reduce((sum, s) => sum + (s.isRest ? 0 : s.hits.length), 0);
        if (processedHits > originalHits) {
          console.log(`🎵 Bar ${this.currentBar}: Density added ${processedHits - originalHits} ghost notes`);
        }
      }

      if (this.onBarBoundaryCallback) {
        this.onBarBoundaryCallback(this.currentBar);
      }
    }
  }

  /**
   * Check if scheduler is playing
   */
  get playing(): boolean {
    return this.isPlaying;
  }
}
