import type { Step, Feel } from '../types/pattern';
import { SampleLoader } from './SampleLoader';
import { Scheduler } from './Scheduler';

/**
 * Main audio engine that coordinates sample loading and playback.
 * Handles AudioContext initialization and provides simple play/stop interface.
 */
export class AudioEngine {
  private context: AudioContext | null = null;
  private sampleLoader: SampleLoader | null = null;
  private scheduler: Scheduler | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;

  /**
   * Initialize the audio context and load samples.
   * Must be called in response to a user gesture (browser autoplay policy).
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  Audio engine already initialized');
      return;
    }

    try {
      // Create audio context
      this.context = new AudioContext();
      console.log('✅ AudioContext created, state:', this.context.state);

      // Resume if suspended (browser autoplay policy)
      if (this.context.state === 'suspended') {
        await this.context.resume();
        console.log('✅ AudioContext resumed');
      }

      // Create master gain node for volume control
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.8; // Default volume
      this.masterGain.connect(this.context.destination);

      // Create components
      this.sampleLoader = new SampleLoader(this.context);
      this.scheduler = new Scheduler(this.context, this.sampleLoader, this.masterGain);

      // Load default drum kit
      await this.sampleLoader.loadSpriteSheet(
        '/samples/kit-default/kit.ogg',
        '/samples/kit-default/sprite.json'
      );

      this.initialized = true;
      console.log('✅ Audio engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize audio engine:', error);
      throw error;
    }
  }

  /**
   * Start playing a pattern
   */
  async play(pattern: Step[], bpm: number = 120): Promise<void> {
    if (!this.initialized || !this.scheduler) {
      console.error('❌ Audio engine not initialized. Call initialize() first.');
      return;
    }

    if (!this.sampleLoader?.ready) {
      console.error('❌ Samples not loaded yet');
      return;
    }

    // Resume context if suspended (can happen after page becomes inactive)
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }

    this.scheduler.start(pattern, bpm);
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (!this.initialized || !this.scheduler) {
      return;
    }

    this.scheduler.stop();
  }

  /**
   * Update BPM while playing
   */
  setBPM(bpm: number): void {
    if (!this.initialized || !this.scheduler) {
      return;
    }

    this.scheduler.setBPM(bpm);
  }

  /**
   * Update feel while playing
   */
  setFeel(feel: Feel): void {
    if (!this.initialized || !this.scheduler) {
      return;
    }

    this.scheduler.setFeel(feel);
  }

  /**
   * Update master volume (0-1)
   */
  setVolume(volume: number): void {
    if (!this.masterGain) {
      return;
    }

    // Clamp volume to valid range
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.value = clampedVolume;
  }

  /**
   * Update humanize amount (0-1)
   */
  setHumanize(humanize: number): void {
    if (!this.scheduler) {
      return;
    }

    this.scheduler.setHumanize(humanize);
  }

  /**
   * Update density amount (0-1)
   */
  setDensity(density: number): void {
    if (!this.scheduler) {
      return;
    }

    this.scheduler.setDensity(density);
  }

  /**
   * Update pattern while playing (safe - doesn't interrupt playback)
   * Can also be called when stopped to prepare for next play
   */
  updatePattern(pattern: Step[]): void {
    if (!this.initialized || !this.scheduler) {
      console.warn('⚠️  Cannot update pattern: engine not initialized');
      return;
    }

    // Always update the scheduler's pattern - this is safe whether playing or not
    this.scheduler.updatePattern(pattern);
  }

  /**
   * Set callback for when each step plays (for UI feedback)
   */
  onStep(callback: (stepIndex: number) => void): void {
    if (!this.scheduler) {
      console.warn('⚠️  Scheduler not initialized');
      return;
    }

    this.scheduler.onStep(callback);
  }

  /**
   * Set callback for bar boundaries (for pattern switching, fills)
   */
  onBarBoundary(callback: (barIndex: number) => void): void {
    if (!this.scheduler) {
      console.warn('⚠️  Scheduler not initialized');
      return;
    }

    this.scheduler.onBarBoundary(callback);
  }

  /**
   * Check if audio is currently playing
   */
  get isPlaying(): boolean {
    return this.scheduler?.playing ?? false;
  }

  /**
   * Check if audio engine is ready
   */
  get ready(): boolean {
    return this.initialized && (this.sampleLoader?.ready ?? false);
  }

  /**
   * Get current step index (for UI feedback)
   */
  getCurrentStep(): number {
    return this.scheduler?.getCurrentStep() ?? 0;
  }

  /**
   * Get current bar index
   */
  getCurrentBar(): number {
    return this.scheduler?.getCurrentBar() ?? 0;
  }

  /**
   * Trigger a fill at the current position.
   * Fill runs from current step to end of bar, then crashes on beat 1.
   */
  triggerFill(): void {
    if (!this.scheduler || !this.isPlaying) {
      console.warn('⚠️  Cannot trigger fill: not playing');
      return;
    }

    this.scheduler.triggerFill();
  }

  /**
   * Get list of available drum samples
   */
  getAvailableSamples(): string[] {
    return this.sampleLoader?.getSpriteNames() ?? [];
  }
}
