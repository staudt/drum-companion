import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface PatternPadsProps {
  onTriggerFill?: () => void;
}

export function PatternPads({ onTriggerFill }: PatternPadsProps) {
  const playback = useAppStore((state) => state.playback);
  const switchPattern = useAppStore((state) => state.switchPattern);
  const [fillOnTransition, setFillOnTransition] = useState(true);

  const patternIds: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  const handlePadClick = (id: 'A' | 'B' | 'C' | 'D') => {
    // If clicking the currently playing pattern, trigger fill
    if (playback.isPlaying && playback.currentPattern === id) {
      onTriggerFill?.();
    } else {
      // Switch pattern
      switchPattern(id);
      // If playing and fill on transition is enabled, trigger fill
      if (playback.isPlaying && fillOnTransition) {
        onTriggerFill?.();
      }
    }
  };

  const getPadStyle = (id: 'A' | 'B' | 'C' | 'D') => {
    const isActive = playback.currentPattern === id;
    const isPending = playback.nextPattern === id;

    if (isActive) {
      return 'bg-green-600 hover:bg-green-700 text-white border-green-500 scale-105';
    }
    if (isPending) {
      return 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 animate-pulse';
    }
    return 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600';
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-white">
        Pattern Selection
      </h2>

      <div className="grid grid-cols-4 gap-3">
        {patternIds.map((id) => (
          <button
            key={id}
            onClick={() => handlePadClick(id)}
            className={`
              px-6 py-4 rounded-lg font-bold text-xl
              border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${getPadStyle(id)}
            `}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {playback.isPlaying ? (
            <>
              Click <span className="text-green-400">active pad</span> = fill •{' '}
              Click other = switch
            </>
          ) : (
            <>Click to select pattern • Press Play to start</>
          )}
        </p>

        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={fillOnTransition}
            onChange={(e) => setFillOnTransition(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
          />
          Fill on switch
        </label>
      </div>
    </div>
  );
}
