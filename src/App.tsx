import { useState, useEffect, useRef } from 'react';
import type { Feel } from './types/pattern';
import { AudioEngine } from './engine/AudioEngine';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TopBar } from './components/TopBar/TopBar';
import { PatternArea } from './components/PatternArea/PatternArea';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioEngineRef = useRef<AudioEngine | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  const tapTimeoutRef = useRef<number | null>(null);

  // Zustand store selectors
  const currentSet = useAppStore((state) => state.currentSet);
  const playback = useAppStore((state) => state.playback);
  const play = useAppStore((state) => state.play);
  const stop = useAppStore((state) => state.stop);
  const setBPM = useAppStore((state) => state.setBPM);
  const setFeel = useAppStore((state) => state.setFeel);
  const setHumanize = useAppStore((state) => state.setHumanize);
  const setDensity = useAppStore((state) => state.setDensity);
  const setVolume = useAppStore((state) => state.setVolume);
  const switchPattern = useAppStore((state) => state.switchPattern);
  const updatePlaybackState = useAppStore((state) => state.updatePlaybackState);
  const applyPendingPatternSwitch = useAppStore((state) => state.applyPendingPatternSwitch);

  // Initialize audio engine
  const initializeAudio = async () => {
    if (audioEngineRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const engine = new AudioEngine();
      await engine.initialize();

      // Set up step callback for UI feedback
      engine.onStep((step) => {
        const bar = engine.getCurrentBar();
        updatePlaybackState(step, bar);
      });

      // Set up bar boundary callback for pattern switching
      engine.onBarBoundary(() => {
        applyPendingPatternSwitch();
      });

      audioEngineRef.current = engine;
      setIsInitialized(true);
      console.log('🎵 Audio engine ready!');
    } catch (err) {
      console.error('Failed to initialize audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize audio');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle play
  const handlePlay = async () => {
    if (!audioEngineRef.current) {
      await initializeAudio();
    }

    const engine = audioEngineRef.current;
    if (!engine || !engine.ready) {
      setError('Audio engine not ready');
      return;
    }

    try {
      // Get fresh state directly from store to avoid stale closure issues
      const freshState = useAppStore.getState();
      const freshSet = freshState.currentSet;
      const freshPlayback = freshState.playback;

      const activePattern = freshSet.patterns.find(p => p.id === freshPlayback.currentPattern);
      if (!activePattern) {
        throw new Error(`Pattern ${freshPlayback.currentPattern} not found`);
      }
      engine.play(activePattern.steps, freshSet.bpm);
      engine.setFeel(freshSet.feel);
      engine.setHumanize(freshSet.humanize);
      engine.setDensity(freshSet.density);
      engine.setVolume(freshSet.volume);
      play();
      setError(null);
    } catch (err) {
      console.error('Failed to play:', err);
      setError(err instanceof Error ? err.message : 'Failed to play pattern');
    }
  };

  // Handle stop
  const handleStop = () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
      stop();
    }
  };

  // Handle fill trigger
  const handleTriggerFill = () => {
    if (audioEngineRef.current && playback.isPlaying) {
      audioEngineRef.current.triggerFill();
    }
  };

  // Handle tap tempo
  const handleTapTempo = () => {
    const now = Date.now();

    // Clear previous timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Add current tap time
    tapTimesRef.current = [...tapTimesRef.current, now];

    // Keep only last 4 taps (for averaging)
    const recentTaps = tapTimesRef.current.slice(-4);

    // Calculate BPM if we have at least 2 taps
    if (recentTaps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < recentTaps.length; i++) {
        intervals.push(recentTaps[i] - recentTaps[i - 1]);
      }

      // Average interval in milliseconds
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Convert to BPM: (60000 ms / interval) = beats per minute
      const calculatedBpm = Math.round(60000 / avgInterval);

      // Clamp to valid range (40-240)
      const clampedBpm = Math.max(40, Math.min(240, calculatedBpm));

      setBPM(clampedBpm);
    }

    tapTimesRef.current = recentTaps;

    // Reset tap times after 2 seconds of inactivity
    tapTimeoutRef.current = window.setTimeout(() => {
      tapTimesRef.current = [];
    }, 2000);
  };

  // Sync audio engine when controls change (BPM, feel, volume, humanize, density)
  useEffect(() => {
    if (!audioEngineRef.current || !playback.isPlaying) return;

    audioEngineRef.current.setBPM(currentSet.bpm);
  }, [currentSet.bpm, playback.isPlaying]);

  useEffect(() => {
    if (!audioEngineRef.current || !playback.isPlaying) return;

    audioEngineRef.current.setFeel(currentSet.feel);
  }, [currentSet.feel, playback.isPlaying]);

  useEffect(() => {
    if (!audioEngineRef.current) return;

    audioEngineRef.current.setVolume(currentSet.volume);
  }, [currentSet.volume]);

  useEffect(() => {
    if (!audioEngineRef.current) return;

    audioEngineRef.current.setHumanize(currentSet.humanize);
  }, [currentSet.humanize]);

  useEffect(() => {
    if (!audioEngineRef.current) return;

    audioEngineRef.current.setDensity(currentSet.density);
  }, [currentSet.density]);

  // Update audio engine when active pattern changes (text edit or pattern switch)
  useEffect(() => {
    if (!playback.isPlaying || !audioEngineRef.current) return;

    const activePattern = currentSet.patterns.find(p => p.id === playback.currentPattern);
    if (activePattern && activePattern.steps.length >= 2) {
      console.log(`🎵 Updating audio pattern ${playback.currentPattern}: ${activePattern.steps.length} steps`);
      audioEngineRef.current.updatePattern(activePattern.steps);
    }
  }, [currentSet.patterns, playback.currentPattern, playback.isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a text input/textarea (but allow sliders)
      if (e.target instanceof HTMLInputElement && e.target.type !== 'range' && e.target.type !== 'number') {
        return;
      }
      if (e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Space - Play/Stop
          e.preventDefault();
          if (playback.isPlaying) {
            handleStop();
          } else {
            handlePlay();
          }
          break;

        case 'f': // F - Cycle through feels
          e.preventDefault();
          const feels: Feel[] = ['straight', 'swing', 'shuffle'];
          const currentIndex = feels.indexOf(currentSet.feel);
          const nextFeel = feels[(currentIndex + 1) % feels.length];
          setFeel(nextFeel);
          break;

        case 't': // T - Tap tempo
          e.preventDefault();
          handleTapTempo();
          break;

        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9': case '0':
          // Keys 1-9 = patterns 1-9, Key 0 = pattern 10
          e.preventDefault();
          const patternId = e.key === '0' ? 10 : parseInt(e.key, 10);
          console.log('🔍 Key pressed:', e.key, '→ patternId:', patternId, '| Current pattern:', playback.currentPattern, '| Match:', playback.currentPattern === patternId);
          // Only switch if pattern exists
          if (patternId <= currentSet.patterns.length) {
            // If pressing the key for the currently playing pattern, trigger fill
            if (playback.isPlaying && playback.currentPattern === patternId) {
              console.log('🥁 Triggering fill');
              handleTriggerFill();
            } else {
              console.log('🔄 Switching to pattern', patternId);
              switchPattern(patternId);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playback.isPlaying, playback.currentPattern, currentSet.feel, currentSet.patterns.length, switchPattern, setFeel]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          isPlaying={playback.isPlaying}
          isLoading={isLoading}
          onPlay={handlePlay}
          onStop={handleStop}
          onTriggerFill={handleTriggerFill}
        />

        {/* Status Messages (if any) */}
        {error && (
          <div className="bg-red-900/20 border-b border-red-900 px-4 py-2">
            <p className="text-red-400 text-sm">❌ {error}</p>
          </div>
        )}
        {isLoading && (
          <div className="bg-yellow-900/20 border-b border-yellow-900 px-4 py-2">
            <p className="text-yellow-400 text-sm">⏳ Loading audio samples...</p>
          </div>
        )}

        {/* Pattern Area (Scrollable) */}
        <PatternArea onTriggerFill={handleTriggerFill} />
      </div>
    </div>
  );
}

export default App;
