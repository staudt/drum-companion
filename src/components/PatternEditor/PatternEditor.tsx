import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PatternInput } from './PatternInput';

export function PatternEditor() {
  const currentSet = useAppStore((state) => state.currentSet);
  const playback = useAppStore((state) => state.playback);
  const setPatternText = useAppStore((state) => state.setPatternText);

  const patternIds: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  // Create stable onChange callbacks for each pattern to prevent debounce resets
  // (PatternInput's useEffect depends on onChange, so unstable references reset the 500ms timer)
  const onChangeA = useCallback((text: string) => setPatternText('A', text), [setPatternText]);
  const onChangeB = useCallback((text: string) => setPatternText('B', text), [setPatternText]);
  const onChangeC = useCallback((text: string) => setPatternText('C', text), [setPatternText]);
  const onChangeD = useCallback((text: string) => setPatternText('D', text), [setPatternText]);

  const onChangeHandlers = useMemo(() => ({
    A: onChangeA,
    B: onChangeB,
    C: onChangeC,
    D: onChangeD,
  }), [onChangeA, onChangeB, onChangeC, onChangeD]);

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
            onChange={onChangeHandlers[id]}
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
