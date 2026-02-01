import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PatternRow } from './PatternRow';
import type { PlaybackMode } from '../../types/pattern';

interface PatternAreaProps {
  onTriggerFill: () => void;
}

export function PatternArea({ onTriggerFill }: PatternAreaProps) {
  const [fillOnSwitch, setFillOnSwitch] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentSet = useAppStore((state) => state.currentSet);
  const playback = useAppStore((state) => state.playback);
  const addPattern = useAppStore((state) => state.addPattern);
  const setPlaybackMode = useAppStore((state) => state.setPlaybackMode);
  const reorderPatterns = useAppStore((state) => state.reorderPatterns);

  const playbackMode = currentSet.playbackMode ?? 'loop';  // Default to loop for existing data
  const isPlaying = playback.isPlaying;

  const handleFillClick = () => {
    if (isPlaying) {
      onTriggerFill();
    }
  };

  const MODE_OPTIONS: Array<{ value: PlaybackMode; label: string; tooltip: string }> = [
    { value: 'loop', label: 'Loop', tooltip: 'Repeat the selected pattern continuously' },
    { value: 'cycle', label: 'Cycle', tooltip: 'Play through all patterns in sequence' }
  ];

  const handleAddPattern = () => {
    addPattern();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // When dragging down, we need to adjust the target index
      // because the dragged item is removed from its original position first
      const adjustedTargetIndex = draggedIndex < dragOverIndex
        ? dragOverIndex - 1
        : dragOverIndex;
      reorderPatterns(draggedIndex, adjustedTargetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-gray-900 pb-4 z-10">
          <h2 className="text-lg font-bold text-white">
            Patterns ({currentSet.patterns.length})
          </h2>

          {/* Fill Controls + Loop/Cycle Mode Selector */}
          <div className="flex items-center gap-3">
            {/* Fill Button */}
            <button
              onClick={handleFillClick}
              disabled={!isPlaying}
              className={`
                px-4 py-1 text-xs font-medium rounded
                focus:outline-none focus:ring-2 focus:ring-orange-500
                transition-colors
                ${isPlaying
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
              aria-label={isPlaying ? 'Trigger drum fill' : 'Play first to trigger fills'}
              title={isPlaying ? 'Trigger fill (or click active pattern pad)' : 'Play first to trigger fills'}
            >
              Fill
            </button>

            {/* Fill on Switch Checkbox */}
            <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={fillOnSwitch}
                onChange={(e) => setFillOnSwitch(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-gray-700 border-gray-600 text-orange-500
                  focus:ring-orange-500 focus:ring-offset-gray-900 cursor-pointer"
              />
              <span>Fill on Switch</span>
            </label>

            {/* Separator */}
            <div className="border-l border-gray-600 h-5" />

            {/* Loop/Cycle Mode Selector */}
            <div className="flex gap-1">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPlaybackMode(option.value)}
                  className={`
                    px-3 py-1 text-xs font-medium rounded
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${playbackMode === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                  aria-pressed={playbackMode === option.value}
                  title={option.tooltip}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pattern Rows */}
        <div className="space-y-4">
          {currentSet.patterns.map((pattern, index) => (
            <PatternRow
              key={pattern.id}
              patternId={pattern.id}
              index={index}
              onTriggerFill={onTriggerFill}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              isDragging={draggedIndex === index}
              isDraggedOver={dragOverIndex === index}
            />
          ))}
        </div>

        {/* Add Pattern Button + Instructions */}
        <div className="flex items-center gap-2 p-2 -m-2 rounded-lg">
          {/* Spacer to match drag handle width */}
          <div className="flex-shrink-0 w-3 -ml-2 -mr-1" aria-hidden="true" />
          <button
            onClick={handleAddPattern}
            className="
              w-12 h-12 sm:w-14 sm:h-14 rounded-lg font-bold text-2xl
              border-2 border-dashed transition-all
              focus:outline-none focus:ring-2 focus:ring-blue-500
              flex-shrink-0
              border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10
            "
            aria-label="Add new pattern"
            title="Add new pattern"
          >
            +
          </button>

          {/* Pattern Syntax Instructions */}
          <div className="flex-1 text-xs text-gray-500 leading-relaxed">
            <p>
              <strong className="text-gray-400">Pattern Syntax:</strong>{' '}
              <span className="text-blue-400">.</span>=rest{' '}
              <span className="text-blue-400">k/B</span>=kick{' '}
              <span className="text-blue-400">s</span>=snare{' '}
              <span className="text-blue-400">h/x</span>=hat{' '}
              <span className="text-blue-400">H</span>=open-hat{' '}
              <span className="text-blue-400">c</span>=crash{' '}
              <span className="text-blue-400">r</span>=ride{' '}
              <span className="text-blue-400">t</span>=tom{' '}
              <span className="text-blue-400">T</span>=hi-tom{' '}
              <span className="text-blue-400">f</span>=floor-tom{' '}<br/>
              Use spaces to separate steps (each step = 16th note in 4/4 time)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
