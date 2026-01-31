import { useState, useEffect } from 'react';
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
  const updateSetName = useAppStore((state) => state.updateSetName);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(currentSet.name);

  // Update edit name when currentSet changes
  useEffect(() => {
    if (!isEditingName) {
      setEditName(currentSet.name);
    }
  }, [currentSet.name, isEditingName]);

  const handleSave = () => {
    const name = prompt('Enter a name for this set:', currentSet.name);
    if (name && name.trim()) {
      saveSet(name.trim());
    }
  };

  const handleLoadSet = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const setId = e.target.value;
    if (setId && setId !== currentSet.id) {
      loadSet(setId);
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    // Only allow editing if clicking the name, not the dropdown arrow
    const target = e.target as HTMLElement;
    if (target.tagName === 'SELECT') {
      return; // Let the dropdown handle it
    }
    setIsEditingName(true);
    setEditName(currentSet.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handleNameBlur = () => {
    if (editName.trim() && editName !== currentSet.name) {
      updateSetName(editName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditName(currentSet.name);
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

      {/* Set Name + Selector (combined) */}
      <div className="flex-1 flex items-stretch gap-0 bg-gray-700 border border-gray-600 rounded-lg overflow-hidden
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Editable Name */}
        {isEditingName ? (
          <input
            type="text"
            value={editName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            autoFocus
            className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm
              focus:outline-none"
            placeholder="Set name"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="flex-1 px-3 py-2 text-left text-white text-sm hover:bg-gray-650 transition-colors
              focus:outline-none cursor-text"
            title="Click to edit set name"
          >
            {currentSet.name}
          </button>
        )}

        {/* Dropdown for loading saved sets */}
        <select
          value={currentSet.id}
          onChange={handleLoadSet}
          className="px-2 py-2 bg-gray-600 hover:bg-gray-550 text-white text-sm border-l border-gray-500
            focus:outline-none cursor-pointer transition-colors flex-shrink-0"
          aria-label="Load saved drum set"
          title="Load saved set"
        >
          <option value={currentSet.id} disabled>Load...</option>
          {savedSets.map((set) => (
            <option key={set.id} value={set.id}>
              {set.name}
            </option>
          ))}
        </select>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
          transition-colors font-semibold text-sm flex-shrink-0"
        aria-label="Save current drum set"
      >
        💾 Save
      </button>
    </div>
  );
}
