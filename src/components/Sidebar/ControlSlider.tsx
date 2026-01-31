interface ControlSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  description?: string;
}

export function ControlSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  units = '%',
  description
}: ControlSliderProps) {
  const displayValue = units === '%'
    ? Math.round(value * 100)
    : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-300">
          {label}
        </label>
        <span className="text-sm text-blue-400 font-mono">
          {displayValue}{units}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
          accent-blue-500 hover:accent-blue-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      />

      {description && (
        <p className="text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}
