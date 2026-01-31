import type { Feel } from '../../types/pattern';

interface FeelSelectorProps {
  value: Feel;
  onChange: (feel: Feel) => void;
}

const FEEL_OPTIONS: Array<{ value: Feel; label: string; description: string }> = [
  { value: 'straight', label: 'Straight', description: 'No swing' },
  { value: 'swing', label: 'Swing', description: '~15% delay' },
  { value: 'shuffle', label: 'Shuffle', description: '~25% delay' }
];

export function FeelSelector({ value, onChange }: FeelSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as Feel);
  };

  const currentOption = FEEL_OPTIONS.find(opt => opt.value === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-300">
        Feel
      </label>

      <select
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
          text-white text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          cursor-pointer hover:bg-gray-650 transition-colors"
      >
        {FEEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {currentOption && (
        <p className="text-xs text-gray-500">
          {currentOption.description}
        </p>
      )}
    </div>
  );
}
