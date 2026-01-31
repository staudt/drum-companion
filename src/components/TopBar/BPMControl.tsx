import { useState, useRef, useEffect } from 'react';

interface BPMControlProps {
  value: number;
  onChange: (bpm: number) => void;
  min?: number;
  max?: number;
}

export function BPMControl({
  value,
  onChange,
  min = 40,
  max = 240
}: BPMControlProps) {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
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

      // Convert to BPM: (60000 ms / interval) = beats per minute
      const calculatedBpm = Math.round(60000 / avgInterval);

      // Clamp to valid range
      const clampedBpm = Math.max(min, Math.min(max, calculatedBpm));

      onChange(clampedBpm);
    }

    setTapTimes(recentTaps);

    // Reset taps after 2 seconds of inactivity
    tapTimeoutRef.current = window.setTimeout(() => {
      setTapTimes([]);
    }, 2000);
  };

  // Update edit value when external value changes
  useEffect(() => {
    if (!isEditingNumber) {
      setEditValue(value.toString());
    }
  }, [value, isEditingNumber]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  const handleNumberClick = () => {
    setIsEditingNumber(true);
    setEditValue(value.toString());
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleNumberBlur = () => {
    const numValue = parseInt(editValue, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
    setIsEditingNumber(false);
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNumberBlur();
    } else if (e.key === 'Escape') {
      setIsEditingNumber(false);
      setEditValue(value.toString());
    }
  };

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-semibold text-gray-300 flex-shrink-0">
        BPM:
      </label>

      {/* BPM Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={handleSliderChange}
        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
          accent-blue-500 hover:accent-blue-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label={`BPM: ${value}`}
      />

      {/* Editable BPM number */}
      {isEditingNumber ? (
        <input
          type="number"
          value={editValue}
          onChange={handleNumberChange}
          onBlur={handleNumberBlur}
          onKeyDown={handleNumberKeyDown}
          min={min}
          max={max}
          autoFocus
          className="w-16 px-2 py-1 text-lg font-bold text-blue-400 bg-gray-700 border border-blue-500 rounded
            text-center focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
        />
      ) : (
        <button
          onClick={handleNumberClick}
          className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors
            px-2 py-1 rounded hover:bg-gray-700 cursor-text min-w-[4rem] text-center flex-shrink-0"
          title="Click to edit BPM"
          aria-label={`BPM: ${value}, click to edit`}
        >
          {value}
        </button>
      )}

      {/* Tap Tempo button */}
      <button
        onClick={handleTapTempo}
        className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex-shrink-0"
        aria-label="Tap tempo to set BPM (T key)"
        title="Click repeatedly to set tempo (T key)"
      >
        TAP
      </button>
    </div>
  );
}
