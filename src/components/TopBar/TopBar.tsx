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
      {/* Row 1: Playback Controls | Fill Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Playback Controls */}
        <PlaybackControls
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlay={onPlay}
          onStop={onStop}
        />

        {/* Right: Fill Controls */}
        <FillControls
          onTriggerFill={onTriggerFill}
          isPlaying={isPlaying}
        />
      </div>

      {/* Row 2: BPM Control */}
      <BPMControl
        value={currentSet.bpm}
        onChange={setBPM}
      />
    </div>
  );
}
