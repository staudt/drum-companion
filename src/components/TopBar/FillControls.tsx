import { useState } from 'react';

interface FillControlsProps {
  onTriggerFill: () => void;
  isPlaying: boolean;
}

export function FillControls({ onTriggerFill, isPlaying }: FillControlsProps) {
  const [fillOnSwitch, setFillOnSwitch] = useState(true);

  const handleFillClick = () => {
    if (isPlaying) {
      onTriggerFill();
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Fill Button */}
      <button
        onClick={handleFillClick}
        disabled={!isPlaying}
        className={`
          px-5 py-2 rounded-lg font-semibold
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900
          transition-all duration-200
          ${isPlaying
            ? 'bg-orange-600 hover:bg-orange-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
        aria-label={isPlaying ? 'Trigger drum fill' : 'Play first to trigger fills'}
        title={isPlaying ? 'Trigger fill (or click active pattern pad)' : 'Play first to trigger fills'}
      >
        FILL
      </button>

      {/* Fill on Switch Checkbox */}
      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
        <input
          type="checkbox"
          checked={fillOnSwitch}
          onChange={(e) => setFillOnSwitch(e.target.checked)}
          className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500
            focus:ring-orange-500 focus:ring-offset-gray-900 cursor-pointer"
        />
        <span>Fill on Switch</span>
      </label>
    </div>
  );
}
