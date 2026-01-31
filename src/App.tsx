import { useState, useEffect, useRef } from 'react';
import { AudioEngine } from './engine/AudioEngine';
import { useAppStore } from './store/useAppStore';
import { PatternEditor } from './components/PatternEditor/PatternEditor';
import { PatternPads } from './components/PatternPads/PatternPads';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioEngineRef = useRef<AudioEngine | null>(null);

  // Zustand store selectors
  const currentSet = useAppStore((state) => state.currentSet);
  const playback = useAppStore((state) => state.playback);
  const setPlaying = useAppStore((state) => state.setPlaying);
  const setBPM = useAppStore((state) => state.setBPM);
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
      const activePattern = currentSet.patterns[playback.currentPattern];
      engine.play(activePattern.steps, currentSet.bpm);
      setPlaying(true);
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
      setPlaying(false);
    }
  };

  // Handle BPM change
  const handleBpmChange = (newBpm: number) => {
    setBPM(newBpm);
    if (audioEngineRef.current && playback.isPlaying) {
      audioEngineRef.current.setBPM(newBpm);
    }
  };

  // Update pattern when active pattern text changes (while playing)
  useEffect(() => {
    if (!playback.isPlaying || !audioEngineRef.current) return;

    const activePattern = currentSet.patterns[playback.currentPattern];
    if (activePattern.steps.length >= 2) {
      audioEngineRef.current.updatePattern(activePattern.steps);
    }
  }, [currentSet.patterns, playback.currentPattern, playback.isPlaying]);

  // Apply pending pattern switches to audio engine
  useEffect(() => {
    if (!playback.isPlaying || !audioEngineRef.current) return;

    // When pattern switches, update audio engine
    const activePattern = currentSet.patterns[playback.currentPattern];
    if (activePattern.steps.length >= 2) {
      console.log(`🎵 Switching audio to pattern ${playback.currentPattern}`);
      audioEngineRef.current.updatePattern(activePattern.steps);
    }
  }, [playback.currentPattern, playback.isPlaying, currentSet.patterns]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">
            🥁 Drum Companion
          </h1>
          <p className="text-gray-400">
            {playback.isPlaying ? 'Now Playing' : 'Milestone 3: 4-Pattern System'}
          </p>
        </div>

        {/* Status */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          {isLoading && (
            <p className="text-yellow-400">⏳ Loading audio samples...</p>
          )}
          {isInitialized && !isLoading && (
            <p className="text-green-400">✅ Audio engine ready</p>
          )}
          {!isInitialized && !isLoading && (
            <p className="text-gray-400">Click Play to initialize audio</p>
          )}
          {error && (
            <p className="text-red-400 mt-2">❌ {error}</p>
          )}
        </div>

        {/* Transport Controls */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Transport</h2>

          {/* BPM Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-300">
                BPM
              </label>
              <span className="text-2xl font-bold text-blue-400">
                {currentSet.bpm}
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="240"
              value={currentSet.bpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Play/Stop */}
          <div className="flex gap-4">
            {!playback.isPlaying ? (
              <button
                onClick={handlePlay}
                disabled={isLoading}
                className="flex-1 btn btn-success py-4 text-lg disabled:opacity-50"
              >
                ▶️ Play
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex-1 btn btn-danger py-4 text-lg"
              >
                ⏹️ Stop
              </button>
            )}
          </div>

          {/* Playback Info */}
          {playback.isPlaying && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-400">Pattern</p>
                <p className="text-xl font-bold text-green-400">
                  {playback.currentPattern}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Step</p>
                <p className="text-xl font-bold text-blue-400">
                  {playback.currentStep}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Bar</p>
                <p className="text-xl font-bold text-purple-400">
                  {playback.currentBar}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pattern Pads */}
        <div className="bg-gray-800 rounded-lg p-6">
          <PatternPads />
        </div>

        {/* Pattern Editor */}
        <div className="bg-gray-800 rounded-lg p-6">
          <PatternEditor />
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6 text-sm text-gray-300 space-y-2">
          <h3 className="font-bold text-white mb-2">How to Use:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Edit any of the 4 patterns (A/B/C/D)</li>
            <li>Click Play to start with Pattern A</li>
            <li>Click pattern pads to switch (queued to next bar)</li>
            <li><strong className="text-green-400">Edit while playing</strong> - changes apply automatically!</li>
            <li>Adjust BPM while playing</li>
            <li>Click Stop when done</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;
