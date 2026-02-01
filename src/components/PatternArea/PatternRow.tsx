import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PatternInput } from '../PatternEditor/PatternInput';

interface PatternRowProps {
  patternId: number;
  index: number;
  onTriggerFill: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  isDraggedOver: boolean;
}

export function PatternRow({
  patternId,
  index,
  onTriggerFill,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDraggedOver
}: PatternRowProps) {
  const currentSet = useAppStore((state) => state.currentSet);
  const playback = useAppStore((state) => state.playback);
  const setPatternText = useAppStore((state) => state.setPatternText);
  const setPatternName = useAppStore((state) => state.setPatternName);
  const setPatternRepeat = useAppStore((state) => state.setPatternRepeat);
  const togglePatternIncludeInCycle = useAppStore((state) => state.togglePatternIncludeInCycle);
  const switchPattern = useAppStore((state) => state.switchPattern);
  const removePattern = useAppStore((state) => state.removePattern);

  const pattern = currentSet.patterns.find(p => p.id === patternId);
  const isActive = playback.currentPattern === patternId;
  const isPending = playback.nextPattern === patternId;
  const isLoopMode = (currentSet.playbackMode ?? 'loop') === 'loop';

  // Calculate current step index for this pattern (if active and playing)
  const currentStepIndex = useMemo(() => {
    if (!pattern || !isActive || !playback.isPlaying) return undefined;

    const tokens = pattern.text.trim().split(/\s+/).filter(Boolean);
    const patternLength = tokens.length;

    if (patternLength === 0) return undefined;

    return playback.currentStep % patternLength;
  }, [pattern, isActive, playback.isPlaying, playback.currentStep]);

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

  const handleNameChange = useCallback((name: string) => {
    setPatternName(patternId, name);
  }, [setPatternName, patternId]);

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

  const handleToggleIncludeInCycle = () => {
    togglePatternIncludeInCycle(patternId);
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
    <div
      className={`flex items-end gap-2 p-2 -m-2 rounded-lg hover:bg-gray-800/50 transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isDraggedOver ? 'border-t-2 border-blue-500' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      {/* Drag Handle */}
      <div
        className="flex-shrink-0 h-12 sm:h-14 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors -ml-2 -mr-1"
        aria-label="Drag to reorder"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-6 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
        </svg>
      </div>

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
          name={pattern.name}
          isActive={isActive}
          isPending={isPending}
          isPlaying={playback.isPlaying}
          currentStepIndex={currentStepIndex}
          onChange={handlePatternChange}
          onNameChange={handleNameChange}
        />
      </div>

      {/* Cycle Checkbox */}
      <div className="flex-shrink-0">
        <div className="flex items-end justify-center h-5 mb-1">
          <label
            htmlFor={`cycle-${patternId}`}
            className={`text-xs transition-colors ${
              isLoopMode ? 'text-gray-600' : 'text-gray-500'
            }`}
          >
            Cycle
          </label>
        </div>
        <div
          className={`
            flex items-center justify-center h-9 px-2 border-2 border-transparent
            ${isLoopMode ? 'opacity-50' : 'opacity-100'}
            transition-opacity
          `}
          title={
            isLoopMode
              ? 'Include this pattern when in Cycle mode'
              : pattern.includeInCycle
              ? 'This pattern is included in the cycle'
              : 'This pattern is excluded from the cycle'
          }
        >
          <input
            type="checkbox"
            id={`cycle-${patternId}`}
            checked={pattern.includeInCycle ?? true}
            onChange={handleToggleIncludeInCycle}
            className={`
              w-5 h-5 rounded cursor-pointer
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
              ${isLoopMode
                ? 'border-gray-700 text-gray-600'
                : 'border-gray-600 text-blue-600'
              }
              bg-gray-800 border-2
            `}
            aria-label={`Include pattern ${patternId} in cycle mode`}
          />
        </div>
      </div>

      {/* Repeat Input with custom +/- buttons */}
      <div className="flex-shrink-0">
        <div className="flex items-end justify-center h-5 mb-1">
          <label className="text-xs text-gray-500">Repeat</label>
        </div>
        <div
          className={`
            flex items-center rounded border-2 overflow-hidden
            ${isLoopMode ? 'border-gray-700' : 'border-gray-600'}
          `}
          title={isLoopMode
            ? 'Repeat count is ignored in Loop mode (but you can still edit it for Cycle mode)'
            : 'Number of times to play this pattern before moving to next'
          }
        >
          <button
            onClick={decrementRepeat}
            disabled={(pattern.repeat ?? 2) <= 1}
            className={`
              w-8 h-9 flex items-center justify-center text-lg font-bold
              transition-colors focus:outline-none
              ${isLoopMode
                ? 'bg-gray-800 text-gray-600 hover:bg-gray-750 hover:text-gray-500'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
              ${(pattern.repeat ?? 2) <= 1 ? 'cursor-not-allowed opacity-50' : ''}
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
              w-10 h-9 font-mono text-sm text-center border-0
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
            disabled={(pattern.repeat ?? 2) >= 99}
            className={`
              w-8 h-9 flex items-center justify-center text-lg font-bold
              transition-colors focus:outline-none
              ${isLoopMode
                ? 'bg-gray-800 text-gray-600 hover:bg-gray-750 hover:text-gray-500'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
              ${(pattern.repeat ?? 2) >= 99 ? 'cursor-not-allowed opacity-50' : ''}
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
          w-9 h-9 rounded-lg flex items-center justify-center
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
