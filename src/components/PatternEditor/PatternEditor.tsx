import { useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PatternInput } from './PatternInput';

export function PatternEditor() {
  const currentSet = useAppStore((state) => state.currentSet);
  const playback = useAppStore((state) => state.playback);
  const setPatternText = useAppStore((state) => state.setPatternText);

  // Create stable onChange callbacks for each pattern to prevent debounce resets
  const createOnChange = useCallback((patternId: number) => {
    return (text: string) => setPatternText(patternId, text);
  }, [setPatternText]);

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
        {currentSet.patterns.map((pattern) => (
          <PatternInput
            key={pattern.id}
            id={pattern.id}
            text={pattern.text}
            isActive={playback.currentPattern === pattern.id}
            isPending={playback.nextPattern === pattern.id}
            isPlaying={playback.isPlaying}
            onChange={createOnChange(pattern.id)}
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
