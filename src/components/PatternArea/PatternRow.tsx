import { useCallback } from 'react';
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
  const setPatternRepeat = useAppStore((state) => state.setPatternRepeat);
  const switchPattern = useAppStore((state) => state.switchPattern);
  const removePattern = useAppStore((state) => state.removePattern);

  const pattern = currentSet.patterns.find(p => p.id === patternId);
  const isActive = playback.currentPattern === patternId;
  const isPending = playback.nextPattern === patternId;
  const isLoopMode = (currentSet.playbackMode ?? 'loop') === 'loop';

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

    removePattern(patternId);
  };

  // Use useCallback to stabilize the onChange callback
  const handlePatternChange = useCallback((text: string) => {
    setPatternText(patternId, text);
  }, [setPatternText, patternId]);

  const handleRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setPatternRepeat(patternId, value);
    }
  };

  const incrementRepeat = () => {
    const current = pattern.repeat ?? 2;
    if (current < 99) {
      setPatternRepeat(patternId, current + 1);
    }
  };

  const decrementRepeat = () => {
    const current = pattern.repeat ?? 2;
    if (current > 1) {
      setPatternRepeat(patternId, current - 1);
    }
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
    <div className="flex items-end gap-3 p-2 -m-2 rounded-lg hover:bg-gray-800/50 transition-colors">
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

      {/* Repeat Input with custom +/- buttons */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center mb-1">
          <label className="text-xs text-gray-500">Repeat</label>
        </div>
        <div
          className={`
            flex items-center rounded border-2 overflow-hidden
            ${isLoopMode ? 'border-gray-700' : 'border-gray-600'}
          `}
          title={isLoopMode
            ? 'Repeat count is ignored in Loop mode'
            : 'Number of times to play this pattern before moving to next'
          }
        >
          <button
            onClick={decrementRepeat}
            disabled={isLoopMode || (pattern.repeat ?? 2) <= 1}
            className={`
              w-8 h-10 flex items-center justify-center text-lg font-bold
              transition-colors focus:outline-none
              ${isLoopMode
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
            `}
            aria-label="Decrease repeat count"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={99}
            value={pattern.repeat ?? 2}
            onChange={handleRepeatChange}
            className={`
              w-10 h-10 font-mono text-sm text-center border-0
              focus:outline-none focus:ring-0
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              ${isLoopMode
                ? 'bg-gray-800 text-gray-500'
                : 'bg-gray-800 text-white'
              }
            `}
          />
          <button
            onClick={incrementRepeat}
            disabled={isLoopMode || (pattern.repeat ?? 2) >= 99}
            className={`
              w-8 h-10 flex items-center justify-center text-lg font-bold
              transition-colors focus:outline-none
              ${isLoopMode
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
            `}
            aria-label="Increase repeat count"
          >
            +
          </button>
        </div>
      </div>

      {/* Remove Button - aligned with pattern text box */}
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
