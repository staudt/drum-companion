interface KitSelectorProps {
  value: string;
  onChange: (kitName: string) => void;
}

export function KitSelector({ value, onChange }: KitSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-300">
        Kit
      </label>

      <select
        value={value}
        onChange={handleChange}
        disabled
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
          text-white text-sm
          opacity-60 cursor-not-allowed"
        title="Multiple kits coming soon"
      >
        <option value="kit-default">Default Kit</option>
      </select>

      <p className="text-xs text-gray-500">
        Multiple kits coming soon
      </p>
    </div>
  );
}
