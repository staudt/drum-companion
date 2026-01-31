interface ControlsProps {
  humanize: number;
  density: number;
  volume: number;
  onHumanizeChange: (value: number) => void;
  onDensityChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
}

export function Controls({
  humanize,
  density,
  volume,
  onHumanizeChange,
  onDensityChange,
  onVolumeChange
}: ControlsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-bold text-white">Controls</h2>

      {/* Volume */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-300">Volume</label>
          <span className="text-sm font-bold text-blue-400">{Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(parseInt(e.target.value) / 100)}
          className="w-full"
        />
      </div>

      {/* Humanize */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-300">Humanize</label>
          <span className="text-sm font-bold text-purple-400">{Math.round(humanize * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(humanize * 100)}
          onChange={(e) => onHumanizeChange(parseInt(e.target.value) / 100)}
          className="w-full"
        />
        <p className="text-xs text-gray-500">Adds timing and velocity variation</p>
      </div>

      {/* Density */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-300">Density</label>
          <span className="text-sm font-bold text-green-400">{Math.round(density * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(density * 100)}
          onChange={(e) => onDensityChange(parseInt(e.target.value) / 100)}
          className="w-full"
        />
        <p className="text-xs text-gray-500">Adds ghost notes on rest steps</p>
      </div>
    </div>
  );
}
