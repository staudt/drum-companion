import { useState, useRef, useEffect } from 'react';
import type { Feel } from '../../types/pattern';

interface TransportControlsProps {
  bpm: number;
  feel: Feel;
  isPlaying: boolean;
  isLoading: boolean;
  onBpmChange: (bpm: number) => void;
  onFeelChange: (feel: Feel) => void;
  onPlay: () => void;
  onStop: () => void;
  tapTempoRef?: React.MutableRefObject<(() => void) | null>;
}

export function TransportControls({
  bpm,
  feel,
  isPlaying,
  isLoading,
  onBpmChange,
  onFeelChange,
  onPlay,
  onStop,
  tapTempoRef
}: TransportControlsProps) {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const tapTimeoutRef = useRef<number | null>(null);

  /**
   * Tap tempo: Calculate BPM from tap intervals
   */
  const handleTapTempo = () => {
    const now = Date.now();

    // Clear previous timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Add current tap time
    const newTapTimes = [...tapTimes, now];

    // Keep only last 4 taps (for averaging)
    const recentTaps = newTapTimes.slice(-4);

    // Calculate BPM if we have at least 2 taps
    if (recentTaps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < recentTaps.length; i++) {
        intervals.push(recentTaps[i] - recentTaps[i - 1]);
      }

      // Average interval in milliseconds
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Convert to BPM (60000 ms per minute)
      const calculatedBpm = Math.round(60000 / avgInterval);

      // Clamp to valid range (40-240)
      const clampedBpm = Math.max(40, Math.min(240, calculatedBpm));

      onBpmChange(clampedBpm);
    }

    setTapTimes(recentTaps);

    // Reset taps after 2 seconds of inactivity
    tapTimeoutRef.current = window.setTimeout(() => {
      setTapTimes([]);
    }, 2000);
  };

  // Expose tap tempo function through ref
  useEffect(() => {
    if (tapTempoRef) {
      tapTempoRef.current = handleTapTempo;
    }
  }, [tapTempoRef, handleTapTempo]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-bold text-white">Transport</h2>

      {/* BPM Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-300">BPM</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-400">{bpm}</span>
            <button
              onClick={handleTapTempo}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
              title="Click repeatedly to set tempo"
            >
              TAP
            </button>
          </div>
        </div>
        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Feel Selector */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300">Feel</label>
        <div className="flex gap-2">
          <button
            onClick={() => onFeelChange('straight')}
            className={`flex-1 px-4 py-2 rounded transition-colors ${
              feel === 'straight'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Straight
          </button>
          <button
            onClick={() => onFeelChange('swing')}
            className={`flex-1 px-4 py-2 rounded transition-colors ${
              feel === 'swing'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Swing
          </button>
          <button
            onClick={() => onFeelChange('shuffle')}
            className={`flex-1 px-4 py-2 rounded transition-colors ${
              feel === 'shuffle'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Shuffle
          </button>
        </div>
      </div>

      {/* Play/Stop */}
      <div className="flex gap-4">
        {!isPlaying ? (
          <button
            onClick={onPlay}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 text-lg rounded transition-colors"
          >
            ▶ Play
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-4 text-lg rounded transition-colors"
          >
            ■ Stop
          </button>
        )}
      </div>
    </div>
  );
}
