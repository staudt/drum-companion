import { useAppStore } from '../../store/useAppStore';
import { BPMControl } from './BPMControl';
import { PlaybackControls } from './PlaybackControls';

function HamburgerButton() {
  const ui = useAppStore((state) => state.ui);
  const setUIState = useAppStore((state) => state.setUIState);

  const toggleSidebar = () => {
    setUIState({ sidebarOpen: !ui.sidebarOpen });
  };

  return (
    <button
      onClick={toggleSidebar}
      className="lg:hidden p-2 bg-gray-700 rounded-lg
        hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle sidebar"
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {ui.sidebarOpen ? (
          <path d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );
}

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
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger (left of Play) */}
        <HamburgerButton />

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

        {/* Fill Button (smaller than Play) */}
        <button
          onClick={onTriggerFill}
          disabled={!isPlaying}
          className={`
            px-3 py-2 rounded-lg font-medium text-sm
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
            transition-all duration-200 flex-shrink-0
            ${isPlaying
              ? 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
          aria-label={isPlaying ? 'Trigger drum fill' : 'Play first to trigger fills'}
          title={isPlaying ? 'Trigger fill (or click active pattern pad)' : 'Play first to trigger fills'}
        >
          Fill
        </button>

        <div className="border-l border-gray-600 h-8" />

        <div className="flex-1 min-w-0">
          <BPMControl
            value={currentSet.bpm}
            onChange={setBPM}
          />
        </div>

        <div className="border-l border-gray-600 h-8" />

        {/* Set Name + Save (moved from top row) */}
        <PlaybackControls />
      </div>
    </div>
  );
}
