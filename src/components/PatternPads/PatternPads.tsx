import { useAppStore } from '../../store/useAppStore';

export function PatternPads() {
  const playback = useAppStore((state) => state.playback);
  const switchPattern = useAppStore((state) => state.switchPattern);

  const patternIds: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  const handlePadClick = (id: 'A' | 'B' | 'C' | 'D') => {
    switchPattern(id);
  };

  const getPadStyle = (id: 'A' | 'B' | 'C' | 'D') => {
    const isActive = playback.currentPattern === id;
    const isPending = playback.nextPattern === id;

    if (isActive) {
      return 'bg-green-600 hover:bg-green-700 text-white border-green-500 scale-105';
    }
    if (isPending) {
      return 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 animate-pulse';
    }
    return 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600';
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-white">
        Pattern Selection
      </h2>

      <div className="grid grid-cols-4 gap-3">
        {patternIds.map((id) => (
          <button
            key={id}
            onClick={() => handlePadClick(id)}
            className={`
              px-6 py-4 rounded-lg font-bold text-xl
              border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${getPadStyle(id)}
            `}
          >
            {id}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        {playback.isPlaying ? (
          <>
            Click to switch patterns (queued to next bar) •{' '}
            <span className="text-green-400">Green</span> = playing •{' '}
            <span className="text-yellow-400">Yellow</span> = queued
          </>
        ) : (
          <>Click to select pattern • Press Play to start</>
        )}
      </p>
    </div>
  );
}
