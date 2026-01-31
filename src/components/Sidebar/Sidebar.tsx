import { useAppStore } from '../../store/useAppStore';
import { ControlSlider } from './ControlSlider';
import { FeelSelector } from './FeelSelector';
import { KitSelector } from './KitSelector';

export function Sidebar() {
  const currentSet = useAppStore((state) => state.currentSet);
  const ui = useAppStore((state) => state.ui);
  const setVolume = useAppStore((state) => state.setVolume);
  const setHumanize = useAppStore((state) => state.setHumanize);
  const setDensity = useAppStore((state) => state.setDensity);
  const setFeel = useAppStore((state) => state.setFeel);
  const setKit = useAppStore((state) => state.setKit);
  const setUIState = useAppStore((state) => state.setUIState);

  const toggleSidebar = () => {
    setUIState({ sidebarOpen: !ui.sidebarOpen });
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg shadow-lg
          hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            // X icon when open
            <>
              <path d="M6 18L18 6M6 6l12 12" />
            </>
          ) : (
            // Hamburger icon when closed
            <>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </>
          )}
        </svg>
      </button>

      {/* Backdrop (mobile only, when open) */}
      {ui.sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0 h-screen w-80
          bg-gray-900 border-r border-gray-800
          p-6 overflow-y-auto
          z-50 transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🥁</span>
            <span>Drum Companion</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Pattern-based drum machine
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Volume */}
          <ControlSlider
            label="Volume"
            value={currentSet.volume}
            onChange={setVolume}
            description="Master output volume"
          />

          {/* Humanize */}
          <ControlSlider
            label="Humanize"
            value={currentSet.humanize}
            onChange={setHumanize}
            description="Timing & velocity variation"
          />

          {/* Density */}
          <ControlSlider
            label="Density"
            value={currentSet.density}
            onChange={setDensity}
            description="Ghost notes on rests"
          />

          {/* Divider */}
          <div className="border-t border-gray-800 my-6" />

          {/* Kit Selector */}
          <KitSelector
            value={currentSet.selectedKit}
            onChange={setKit}
          />

          {/* Feel Selector */}
          <FeelSelector
            value={currentSet.feel}
            onChange={setFeel}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Keyboard shortcuts:
            <br />
            <span className="text-gray-400">Space</span> = Play/Stop
            <br />
            <span className="text-gray-400">1-0</span> = Switch patterns
            <br />
            <span className="text-gray-400">F</span> = Cycle feel
            <br />
            <span className="text-gray-400">T</span> = Tap tempo
          </p>
        </div>
      </aside>
    </>
  );
}
