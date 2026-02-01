import type { PlaybackMode } from '../../types/pattern';

interface PlaybackModeSelectorProps {
  value: PlaybackMode;
  onChange: (mode: PlaybackMode) => void;
}

const MODE_OPTIONS: Array<{ value: PlaybackMode; label: string; tooltip: string }> = [
  {
    value: 'loop',
    label: 'Loop',
    tooltip: 'Repeat the selected pattern continuously'
  },
  {
    value: 'cycle',
    label: 'Cycle',
    tooltip: 'Play through all patterns in sequence, each repeating its set number of times'
  }
];

export function PlaybackModeSelector({ value, onChange }: PlaybackModeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-300">
        Playback
      </label>

      <div className="flex gap-1">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex-1 px-2 py-1.5 text-xs font-medium rounded
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
              ${value === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
            aria-pressed={value === option.value}
            title={option.tooltip}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
