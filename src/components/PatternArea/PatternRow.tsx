import { useAppStore } from '../../store/useAppStore';
import { PatternInput } from '../PatternEditor/PatternInput';

interface PatternRowProps {
  patternId: number;
  onTriggerFill: () => void;
}

export function PatternRow({ patternId, onTriggerFill }: PatternRowProps) {
  const currentSet = useAppStore((state) => state.currentSet);
  const playback = useAppStore((state) => state.playback);
  const setPatternText = useAppStore((state) => state.setPatternText);
  const switchPattern = useAppStore((state) => state.switchPattern);
  const removePattern = useAppStore((state) => state.removePattern);

  const pattern = currentSet.patterns.find(p => p.id === patternId);
  const isActive = playback.currentPattern === patternId;
  const isPending = playback.nextPattern === patternId;

  if (!pattern) return null;

  const handlePadClick = () => {
    // If clicking the currently playing pattern, trigger fill
    if (playback.isPlaying && isActive) {
      onTriggerFill();
    } else {
      // Switch pattern
      switchPattern(patternId);
    }
  };

  const handleRemove = () => {
    if (currentSet.patterns.length <= 1) {
      alert('Cannot remove the last pattern');
      return;
    }

    if (confirm(`Remove pattern ${patternId}?`)) {
      removePattern(patternId);
    }
  };

  const handlePatternChange = (text: string) => {
    setPatternText(patternId, text);
  };

  const getPadStyle = () => {
    if (isActive) {
      return 'bg-green-600 hover:bg-green-700 border-green-500 scale-105 shadow-lg shadow-green-500/50';
    }
    if (isPending) {
      return 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500 animate-pulse shadow-md shadow-yellow-500/30';
    }
    return 'bg-gray-700 hover:bg-gray-600 border-gray-600';
  };

  return (
    <div className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-800/50 transition-colors">
      {/* Pattern Pad (Number Button) */}
      <button
        onClick={handlePadClick}
        className={`
          w-12 h-12 sm:w-14 sm:h-14 rounded-lg font-bold text-xl
          border-2 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
          flex-shrink-0
          ${getPadStyle()}
        `}
        aria-label={
          isActive
            ? `Pattern ${patternId} - Active, click to trigger fill`
            : isPending
            ? `Pattern ${patternId} - Queued`
            : `Switch to pattern ${patternId}`
        }
        title={
          isActive
            ? 'Active pattern - click to trigger fill'
            : isPending
            ? 'Queued pattern'
            : 'Click to switch to this pattern'
        }
      >
        {patternId}
      </button>

      {/* Pattern Input (fills remaining width) */}
      <div className="flex-1">
        <PatternInput
          id={patternId}
          text={pattern.text}
          isActive={isActive}
          isPending={isPending}
          isPlaying={playback.isPlaying}
          onChange={handlePatternChange}
        />
      </div>

      {/* Dropdown Button (placeholder for future presets) */}
      <button
        disabled
        className="w-11 h-11 rounded-lg bg-gray-700 text-gray-500
          flex items-center justify-center
          cursor-not-allowed opacity-50 flex-shrink-0"
        title="Pattern presets coming soon"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={currentSet.patterns.length <= 1}
        className={`
          w-11 h-11 rounded-lg flex items-center justify-center
          transition-colors flex-shrink-0
          focus:outline-none focus:ring-2 focus:ring-red-500
          ${currentSet.patterns.length <= 1
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
            : 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white'
          }
        `}
        aria-label={
          currentSet.patterns.length <= 1
            ? 'Cannot remove last pattern'
            : `Remove pattern ${patternId}`
        }
        title={
          currentSet.patterns.length <= 1
            ? 'Cannot remove last pattern'
            : `Remove pattern ${patternId}`
        }
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
