import { useAppStore } from '../../store/useAppStore';
import { PatternRow } from './PatternRow';

interface PatternAreaProps {
  onTriggerFill: () => void;
}

export function PatternArea({ onTriggerFill }: PatternAreaProps) {
  const currentSet = useAppStore((state) => state.currentSet);
  const playback = useAppStore((state) => state.playback);
  const addPattern = useAppStore((state) => state.addPattern);

  const canAddPattern = currentSet.patterns.length < 10;

  const handleAddPattern = () => {
    if (canAddPattern) {
      addPattern();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-gray-900 pb-4 z-10">
          <h2 className="text-lg font-bold text-white">
            Patterns ({currentSet.patterns.length}/10)
          </h2>
          {playback.isPlaying && (
            <span className="text-xs text-yellow-400">
              ✏️ Live editing enabled
            </span>
          )}
        </div>

        {/* Pattern Rows */}
        <div className="space-y-4">
          {currentSet.patterns.map((pattern) => (
            <PatternRow
              key={pattern.id}
              patternId={pattern.id}
              onTriggerFill={onTriggerFill}
            />
          ))}
        </div>

        {/* Add Pattern Button + Instructions */}
        <div className="flex items-center gap-3 p-2 -m-2 rounded-lg">
          <button
            onClick={handleAddPattern}
            disabled={!canAddPattern}
            className={`
              w-12 h-12 sm:w-14 sm:h-14 rounded-lg font-bold text-2xl
              border-2 border-dashed transition-all
              focus:outline-none focus:ring-2 focus:ring-blue-500
              flex-shrink-0
              ${canAddPattern
                ? 'border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                : 'border-gray-800 text-gray-700 cursor-not-allowed'
              }
            `}
            aria-label={canAddPattern ? 'Add new pattern' : 'Maximum 10 patterns reached'}
            title={canAddPattern ? 'Add new pattern' : 'Maximum 10 patterns reached'}
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
