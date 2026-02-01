import type { Feel } from '../../types/pattern';

interface FeelSelectorProps {
  value: Feel;
  onChange: (feel: Feel) => void;
}

const FEEL_OPTIONS: Array<{ value: Feel; label: string }> = [
  { value: 'straight', label: 'Straight' },
  { value: 'swing', label: 'Swing' },
  { value: 'shuffle', label: 'Shuffle' }
];

export function FeelSelector({ value, onChange }: FeelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-300">
        Feel
      </label>

      <div className="flex gap-1">
        {FEEL_OPTIONS.map((option) => (
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
            title={`${option.label} feel${option.value === 'swing' ? ' (~15% delay)' : option.value === 'shuffle' ? ' (~25% delay)' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
