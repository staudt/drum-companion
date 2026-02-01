import { useAppStore } from '../../store/useAppStore';
import { BPMControl } from './BPMControl';
import { PlaybackControls } from './PlaybackControls';
import { FillControls } from './FillControls';

interface TopBarProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onStop: () => void;
  onTriggerFill: () => void;
}

export function TopBar({
  isPlaying,
  isLoading,
  onPlay,
  onStop,
  onTriggerFill
}: TopBarProps) {
  const currentSet = useAppStore((state) => state.currentSet);
  const setBPM = useAppStore((state) => state.setBPM);

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 space-y-4">
      {/* Row 1: Set Name + Save */}
      <PlaybackControls />

      {/* Row 2: Play | BPM Control | Fill Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Stop Button */}
        <button
          onClick={isPlaying ? onStop : onPlay}
          disabled={isLoading}
          className={`
            px-6 py-2 rounded-lg font-semibold text-white
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
            transition-all duration-200 min-w-[100px] flex-shrink-0
            ${isPlaying
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label={isLoading ? 'Loading...' : isPlaying ? 'Stop playback (Space)' : 'Start playback (Space)'}
        >
          {isLoading ? '⏳' : isPlaying ? '⏹ Stop' : '▶ Play'}
        </button>

        <div className="border-l border-gray-600 h-8" />

        <div className="flex-1 min-w-0">
          <BPMControl
            value={currentSet.bpm}
            onChange={setBPM}
          />
        </div>

        <div className="border-l border-gray-600 h-8" />

        <FillControls
          onTriggerFill={onTriggerFill}
          isPlaying={isPlaying}
        />
      </div>
    </div>
  );
}
