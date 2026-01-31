import { useAppStore } from '../../store/useAppStore';
import { PatternInput } from './PatternInput';

export function PatternEditor() {
  const currentSet = useAppStore((state) => state.currentSet);
  const playback = useAppStore((state) => state.playback);
  const setPatternText = useAppStore((state) => state.setPatternText);

  const patternIds: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Patterns
        </h2>
        {playback.isPlaying && (
          <span className="text-xs text-yellow-400">
            ✏️ Live editing enabled
          </span>
        )}
      </div>

      <div className="space-y-3">
        {patternIds.map((id) => (
          <PatternInput
            key={id}
            id={id}
            text={currentSet.patterns[id].text}
            isActive={playback.currentPattern === id}
            isPending={playback.nextPattern === id}
            isPlaying={playback.isPlaying}
            onChange={(text) => setPatternText(id, text)}
          />
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        <span className="text-blue-400">k</span>=kick{' '}
        <span className="text-blue-400">s</span>=snare{' '}
        <span className="text-blue-400">h</span>=hat{' '}
        <span className="text-blue-400">H</span>=open-hat{' '}
        <span className="text-blue-400">c</span>=crash{' '}
        <span className="text-blue-400">r</span>=ride{' '}
        <span className="text-blue-400">t</span>=tom{' '}
        <span className="text-blue-400">.</span>=rest
      </p>
    </div>
  );
}
