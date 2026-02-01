import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function PlaybackControls() {
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
    saveSet(currentSet.name);
  };

  const handleLoadSet = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const setId = e.target.value;
    if (setId && setId !== currentSet.id) {
      loadSet(setId);
    }
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
    <div className="flex items-center justify-end gap-2">
        {/* Set Name + Selector (combined) */}
        <div className="flex items-stretch gap-0 bg-gray-700 border border-gray-600 rounded-lg overflow-hidden
          focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent w-72">
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
                focus:outline-none min-w-0"
              placeholder="Set name"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="flex-1 px-3 py-2 text-left text-white text-sm hover:bg-gray-650 transition-colors
                focus:outline-none cursor-text truncate min-w-0"
              title="Click to edit set name"
            >
              {currentSet.name}
            </button>
          )}

          {/* Dropdown for loading saved sets */}
          <div className="relative flex-shrink-0 border-l border-gray-500">
            <select
              value=""
              onChange={handleLoadSet}
              className="appearance-none w-10 h-full bg-gray-600 hover:bg-gray-500 text-transparent
                focus:outline-none cursor-pointer transition-colors"
              aria-label="Load saved drum set"
              title="Load saved set"
            >
              <option value="" disabled></option>
              {savedSets.map((set) => (
                <option key={set.id} value={set.id} className="text-white bg-gray-700">
                  {set.name}
                </option>
              ))}
            </select>
            {/* Custom chevron icon */}
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
            transition-colors font-semibold text-sm flex-shrink-0"
          aria-label="Save current drum set"
        >
          Save
        </button>
    </div>
  );
}
