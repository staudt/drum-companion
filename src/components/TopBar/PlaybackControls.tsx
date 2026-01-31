import { useAppStore } from '../../store/useAppStore';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onStop: () => void;
}

export function PlaybackControls({
  isPlaying,
  isLoading,
  onPlay,
  onStop
}: PlaybackControlsProps) {
  const currentSet = useAppStore((state) => state.currentSet);
  const savedSets = useAppStore((state) => state.savedSets);
  const loadSet = useAppStore((state) => state.loadSet);
  const saveSet = useAppStore((state) => state.saveSet);

  const handleSave = () => {
    const name = prompt('Enter a name for this set:', currentSet.name);
    if (name && name.trim()) {
      saveSet(name.trim());
    }
  };

  const handleLoadSet = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const setId = e.target.value;
    if (setId) {
      loadSet(setId);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Play/Stop Button */}
      <button
        onClick={isPlaying ? onStop : onPlay}
        disabled={isLoading}
        className={`
          px-6 py-2 rounded-lg font-semibold text-white
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
          transition-all duration-200 min-w-[100px]
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

      {/* Set Selector */}
      <select
        value={currentSet.id}
        onChange={handleLoadSet}
        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
          text-white text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          cursor-pointer hover:bg-gray-650 transition-colors"
        aria-label="Select drum set"
      >
        <option value={currentSet.id}>{currentSet.name}</option>
        {savedSets.map((set) => (
          <option key={set.id} value={set.id}>
            {set.name}
          </option>
        ))}
      </select>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
          transition-colors font-semibold text-sm"
        aria-label="Save current drum set"
      >
        💾 Save
      </button>
    </div>
  );
}
