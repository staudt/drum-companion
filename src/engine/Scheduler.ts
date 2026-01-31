import type { Step, Feel } from '../types/pattern';
import type { SampleLoader } from './SampleLoader';
import { SPRITE_MAP } from '../parser/constants';
import { FeelProcessor } from './FeelProcessor';

/**
 * Lookahead scheduler for precise audio timing.
 * Schedules notes slightly ahead of when they should play,
 * avoiding drift issues with setInterval/setTimeout.
 */
export class Scheduler {
  private context: AudioContext;
  private sampleLoader: SampleLoader;

  // Lookahead settings
  private scheduleAheadTime = 0.1;  // 100ms lookahead
  private schedulerInterval = 25;   // Check every 25ms

  // Playback state
  private isPlaying = false;
  private timerID: number | null = null;
  private nextStepTime = 0;
  private currentStep = 0;
  private pattern: Step[] = [];
  private bpm = 120;
  private feel: Feel = 'straight';
  private stepsPerBar = 16;

  // Callbacks
  private onStepCallback?: (stepIndex: number) => void;
  private onBarBoundaryCallback?: (barIndex: number) => void;

  constructor(context: AudioContext, sampleLoader: SampleLoader) {
    this.context = context;
    this.sampleLoader = sampleLoader;
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
    this.nextStepTime = this.context.currentTime;
    this.isPlaying = true;

    console.log(`▶️  Starting scheduler: ${pattern.length} steps @ ${bpm} BPM`);

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
   * Update pattern while playing (safe - doesn't interrupt playback)
   */
  updatePattern(pattern: Step[]): void {
    if (pattern.length === 0) {
      console.warn('⚠️  Cannot update to empty pattern');
      return;
    }

    console.log(`🔄 Pattern updated: ${this.pattern.length} → ${pattern.length} steps`);
    this.pattern = pattern;

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
    return Math.floor(this.currentStep / this.stepsPerBar);
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
    if (!this.pattern.length) return;

    const step = this.pattern[stepIndex % this.pattern.length];

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

      // Play sample with velocity, hit offset, and feel offset
      const when = time + hit.offset + feelOffset;
      this.sampleLoader.playSample(
        spriteName,
        when,
        hit.velocity,
        this.context.destination
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

    // Check for bar boundary BEFORE advancing
    const wasOnBarBoundary = this.currentStep % this.stepsPerBar === 0 && this.currentStep > 0;

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

    if (isOnBarBoundary && this.onBarBoundaryCallback) {
      const barIndex = Math.floor(this.currentStep / this.stepsPerBar);
      this.onBarBoundaryCallback(barIndex);
    }
  }

  /**
   * Check if scheduler is playing
   */
  get playing(): boolean {
    return this.isPlaying;
  }
}
