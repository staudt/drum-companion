import type { SpriteDefinition } from '../types/audio';

/**
 * Loads and manages audio sprite sheets for drum samples.
 * Uses Web Audio API to load a single audio file with multiple samples.
 */
export class SampleLoader {
  private context: AudioContext;
  private audioBuffer: AudioBuffer | null = null;
  private sprites: SpriteDefinition = {};
  private isLoaded = false;

  constructor(context: AudioContext) {
    this.context = context;
  }

  /**
   * Load a sprite sheet from audio file and sprite definition JSON
   */
  async loadSpriteSheet(audioPath: string, spritePath: string): Promise<void> {
    try {
      // Load sprite definitions
      const spriteResponse = await fetch(spritePath);
      if (!spriteResponse.ok) {
        throw new Error(`Failed to load sprite definitions: ${spriteResponse.statusText}`);
      }
      this.sprites = await spriteResponse.json();
      console.log('✅ Sprite definitions loaded:', Object.keys(this.sprites).length, 'samples');

      // Load audio file
      const audioResponse = await fetch(audioPath);
      if (!audioResponse.ok) {
        throw new Error(`Failed to load audio file: ${audioResponse.statusText}`);
      }
      const arrayBuffer = await audioResponse.arrayBuffer();

      // Decode audio data
      this.audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      console.log('✅ Audio buffer loaded:', this.audioBuffer.duration.toFixed(2), 'seconds');

      this.isLoaded = true;
    } catch (error) {
      console.error('❌ Failed to load sprite sheet:', error);
      throw error;
    }
  }

  /**
   * Play a specific sprite from the loaded audio buffer
   *
   * @param spriteName - Name of sprite (e.g., 'kick', 'snare')
   * @param when - When to play (Web Audio time)
   * @param velocity - Volume (0-1)
   * @param destination - Audio node to connect to (usually context.destination)
   */
  playSample(
    spriteName: string,
    when: number,
    velocity: number,
    destination: AudioNode
  ): void {
    if (!this.isLoaded || !this.audioBuffer) {
      console.warn('⚠️  Audio not loaded yet, cannot play sample');
      return;
    }

    const sprite = this.sprites[spriteName];
    if (!sprite) {
      console.warn(`⚠️  Sprite not found: ${spriteName}`);
      return;
    }

    // Create buffer source
    const source = this.context.createBufferSource();
    source.buffer = this.audioBuffer;

    // Create gain node for velocity control
    const gainNode = this.context.createGain();
    gainNode.gain.value = Math.max(0, Math.min(1, velocity)); // Clamp 0-1

    // Connect: source → gain → destination
    source.connect(gainNode);
    gainNode.connect(destination);

    // Play sprite: start(when, offset, duration)
    // Convert milliseconds to seconds
    const offset = sprite[0] / 1000;
    const duration = sprite[1] / 1000;

    source.start(when, offset, duration);
  }

  /**
   * Check if samples are loaded and ready
   */
  get ready(): boolean {
    return this.isLoaded && this.audioBuffer !== null;
  }

  /**
   * Get list of available sprite names
   */
  getSpriteNames(): string[] {
    return Object.keys(this.sprites);
  }
}
