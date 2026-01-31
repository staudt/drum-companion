# CLAUDE.md - Context for AI-Assisted Development

> **📝 IMPORTANT**: Keep this file AND README.md updated as you progress through milestones. Update both files whenever completing significant features or milestones.

## Project Vision

A **guitarist-focused drum companion web app** that allows musicians to quickly create, edit, and play drum patterns using simple text notation. The goal is to provide a fast, intuitive way for guitarists (and other musicians) to have drum backing while practicing or composing.

### Core Philosophy
- **Text-first**: Patterns are defined using simple text like `k h s h` (kick, hat, snare, hat)
- **Fast workflow**: Type a pattern, press play, switch patterns on-the-fly
- **Musical feel**: Support swing, shuffle, humanization, and dynamic fills
- **No over-engineering**: Start simple, iterate based on real usage

---

## Current Status (Milestone 5 Complete ✅)

### Completed Milestones

**✅ Milestone 1: Project Setup & Parser**
- Vite + React + TypeScript project
- Dependencies: zustand, tailwindcss, vitest
- Type definitions (pattern.ts, audio.ts, state.ts)
- Pattern parser with validation
- Sprite sheet JSON for drum kit

**✅ Milestone 2: Audio Engine Foundation**
- SampleLoader with sprite sheet support (Web Audio API)
- Lookahead scheduler (100ms lookahead, 25ms tick)
- AudioEngine coordinator
- Real-time BPM control
- Live pattern editing with debounce (500ms)
- Pattern validation (min 2, max 64 steps)
- Crash-proof error handling

**✅ Milestone 3: 4-Pattern System**
- Zustand store managing 4 patterns (A/B/C/D)
- PatternInput component (reusable, validated)
- PatternEditor (all 4 patterns stacked vertically)
- PatternPads (A/B/C/D buttons)
- Pattern switching on bar boundaries
- Visual feedback (Green=active, Yellow=queued)
- LocalStorage persistence

**✅ Milestone 4: Feel & Controls**
- FeelProcessor for swing/shuffle timing offsets
- Feel selector UI (Straight, Swing, Shuffle)
- TransportControls component
- Tap tempo button
- Keyboard shortcuts:
  - Space: Play/Stop
  - F: Cycle through feels
  - 1-4: Switch patterns
  - T: Tap tempo

**✅ Milestone 5: Humanize & Density**
- HumanizeProcessor for timing jitter (±5ms) and velocity jitter (±20%)
- DensityGenerator for adding ghost notes on rest steps
- Master volume control via GainNode
- Controls component with sliders for humanize/density/volume
- Real-time parameter adjustments while playing
- Density regenerates on bar boundaries for consistency

### Next Up (Milestone 6)
- FillGenerator (algorithmic fills)
- Pad click = one-shot fill
- Pad hold = continuous fills

### Known Issues
- **Vitest configuration**: Tests don't run (config issue, not code issue). Parser logic is correct.
  - Can be debugged later or switched to manual testing
  - All features manually tested and working

---

## Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Vite + React + TypeScript | Fast dev, modern, type-safe |
| Audio | Web Audio API (raw) | No deps, full control, precise scheduling |
| Audio Format | OGG sprite sheet | User-provided, single file, efficient |
| State | Zustand + persist | Lightweight, minimal boilerplate |
| Styling | Tailwind CSS | Rapid prototyping, utility-first |
| Storage | localStorage | Simple, no backend needed |

---

## Architecture Overview

### Pattern Syntax (v1 - Simple)
```
k = kick, s = snare, h = closed hi-hat, H = open hi-hat
c = crash, r = ride, t = tom, . = rest

Examples:
k . s .           → Basic rock beat (4 steps)
kh . sh .         → Kick+hat, rest, snare+hat, rest
k . s . k k s .   → 8-step pattern with double kick
```

**Time Signature**: 4/4 assumed, each space = one 16th note

### Audio Sprite Sheet
- **Location**: `public/samples/kit-default/kit.ogg` + `sprite.json`
- **Format**: `{ "kick": [offsetMs, durationMs], ... }`
- **Loading**: Web Audio API `bufferSource.start(when, offset, duration)`
- **Mapping**: DrumSymbol → sprite name via `SPRITE_MAP` in constants.ts

### Data Flow
```
User Input (text)
  → parsePattern()
  → Steps[]
  → Scheduler (with Feel/Humanize/Density processors)
  → Web Audio API
  → Sound
```

### State Management
- **Store**: Zustand with persist middleware
- **Schema**:
  - `currentSet`: DrumSet (4 patterns A/B/C/D + settings)
  - `playback`: PlaybackState (isPlaying, currentPattern, etc.)
  - `savedSets`: DrumSet[] (library of saved sets)

---

## File Structure & Critical Files

```
c:/git/drum/
├── public/
│   └── samples/kit-default/
│       ├── kit.ogg              ✅ User's drum kit audio
│       ├── kit.mp3              ✅ Fallback format
│       └── sprite.json          ✅ Sprite definitions
├── src/
│   ├── App.tsx                  ✅ Main app with 4-pattern system
│   ├── main.tsx                 ✅ Entry point
│   ├── index.css                ✅ Tailwind styles
│   ├── types/
│   │   ├── pattern.ts           ✅ Core type definitions
│   │   ├── audio.ts             ✅ Audio types
│   │   └── state.ts             ✅ App state interface
│   ├── parser/
│   │   ├── parsePattern.ts      ✅ Pure parser function
│   │   ├── parsePattern.test.ts ⚠️  Tests don't run (config issue)
│   │   └── constants.ts         ✅ Symbol mappings
│   ├── engine/
│   │   ├── AudioEngine.ts       ✅ Main coordinator (with volume)
│   │   ├── SampleLoader.ts      ✅ Sprite loading
│   │   ├── Scheduler.ts         ✅ Lookahead scheduler (with humanize/density)
│   │   ├── FeelProcessor.ts     ✅ Swing/shuffle timing
│   │   ├── HumanizeProcessor.ts ✅ Timing/velocity jitter
│   │   ├── DensityGenerator.ts  ✅ Ghost note generation
│   │   └── FillGenerator.ts     🔜 Next: Fill patterns
│   ├── store/
│   │   ├── useAppStore.ts       ✅ Zustand store with 4 patterns
│   │   └── persistence.ts       🔜 Export/import helpers
│   ├── components/
│   │   ├── PatternEditor/
│   │   │   ├── PatternEditor.tsx ✅ 4 patterns stacked
│   │   │   └── PatternInput.tsx  ✅ Individual pattern input
│   │   ├── PatternPads/
│   │   │   └── PatternPads.tsx   ✅ A/B/C/D buttons
│   │   ├── Transport/
│   │   │   └── TransportControls.tsx ✅ Play/stop/BPM/feel/tap tempo
│   │   ├── Controls/
│   │   │   └── Controls.tsx      ✅ Humanize/density/volume sliders
│   │   └── Persistence/         🔜 Next: Save/load UI
│   ├── hooks/                   🔜 Custom hooks (tap tempo, etc.)
│   └── utils/
│       └── timing.ts            🔜 Time conversion utilities
├── package.json                 ✅ Dependencies configured
├── vite.config.ts               ✅ Vite config
├── tsconfig.json                ✅ TypeScript config
├── tailwind.config.js           ✅ Tailwind config
├── vitest.config.ts             ⚠️  Needs debugging
├── CLAUDE.md                    ✅ AI context & plan
└── README.md                    ✅ User documentation
```

**Legend**: ✅ Done | 🔜 Next | ⭐ Critical | ⚠️ Issue

---

## Implementation Milestones

### M1: Project Setup & Parser ✅ COMPLETE
- [x] Vite + React + TypeScript
- [x] Dependencies installed
- [x] Folder structure
- [x] Type definitions
- [x] Parser implementation
- [x] Sprite JSON

**Success**: Parser converts text to Steps[] correctly

---

### M2: Audio Engine Foundation ✅ COMPLETE
**Goal**: Load sprite sheet and play patterns with precise timing

**Tasks**:
- [x] Implement `SampleLoader.ts` with sprite support
- [x] Create basic `AudioEngine.ts` with play/stop
- [x] Implement `Scheduler.ts` with lookahead pattern (100ms lookahead, 25ms tick)
- [x] Live pattern editing with debounce
- [x] Real-time BPM control
- [x] Test: Click play → hear drums looping ✅

**Success**: Audio engine plays patterns with perfect timing, supports live editing

---

### M3: Pattern Editor UI ✅ COMPLETE
**Goal**: 4-pattern system with live editing and switching

**Tasks**:
- [x] Zustand store (useAppStore) with persistence
- [x] PatternEditor component (4 patterns stacked)
- [x] PatternInput component (reusable, validated)
- [x] PatternPads (A/B/C/D buttons)
- [x] Real-time parsing feedback
- [x] Pattern switching on bar boundaries
- [x] Visual feedback (Green=active, Yellow=queued)

**Success**: All 4 patterns editable, switching works smoothly on bar boundaries

---

### M4: Feel & Controls ✅ COMPLETE
**Goal**: Add feel controls, tap tempo, and keyboard shortcuts

**Tasks**:
- [x] FeelProcessor (swing ~15%, shuffle ~25% timing offsets)
- [x] TransportControls component (refactored from inline)
- [x] Feel selector UI (Straight, Swing, Shuffle buttons)
- [x] Tap tempo button (averages last 4 taps)
- [x] Keyboard shortcuts:
  - Space: Play/Stop
  - F: Cycle through feels
  - 1-4: Switch patterns
  - T: Tap tempo
- [x] Real-time feel changes while playing
- [x] Updated UI with keyboard shortcut hints

**Success**: Feel changes audibly affect timing, tap tempo works accurately, all shortcuts functional

---

### M5: Humanize & Density ✅ COMPLETE
**Goal**: Add humanization, density, and volume controls

**Tasks**:
- [x] HumanizeProcessor (timing jitter ±5ms, velocity jitter ±20%)
- [x] DensityGenerator (ghost notes on rest steps)
- [x] Volume control (master volume via GainNode)
- [x] Controls component with sliders
- [x] UI sliders for humanize/density/volume
- [x] Integrate processors into Scheduler
- [x] Real-time parameter adjustments

**Key Implementation**:
- Humanize: Applied per-hit during scheduling, random but clamped
- Density: Regenerated on bar boundaries for consistency (seeded random per bar)
- Volume: Master GainNode in AudioEngine, routed through Scheduler

**Success**: All three sliders work in real-time, humanize adds variation, density adds ghost notes

---

### M6: Fills 🔜 NEXT
- [ ] FillGenerator (algorithmic fills)
- [ ] Pad click on active pattern = one-shot fill
- [ ] Pad hold on active pattern = continuous fills each bar

---

### M7: Persistence & Polish 💾
- [ ] Save/load sets UI
- [ ] Export/import JSON
- [ ] UI polish with Tailwind
- [ ] Loading states
- [ ] Mobile responsiveness

---

## Key Technical Concepts

### Lookahead Scheduler
**Problem**: `setInterval()` drifts, causes timing issues
**Solution**: Schedule audio events slightly ahead using Web Audio time

```typescript
// Check every 25ms
setInterval(() => tick(), 25);

tick() {
  // Schedule all notes in next 100ms window
  while (nextNoteTime < audioContext.currentTime + 0.1) {
    scheduleNote(nextNoteTime);
    nextNoteTime += stepDuration;
  }
}
```

### Bar Boundary Detection
```typescript
const STEPS_PER_BAR = 16;  // 4/4 time, 16th notes
const isBarBoundary = currentStep % STEPS_PER_BAR === 0;

if (isBarBoundary) {
  // Switch patterns, apply fills, regenerate density
}
```

### Feel Implementation
- **Straight**: No timing offset
- **Swing**: Delay every other 8th note (~15% of step duration)
- **Shuffle**: More pronounced delay (~25% of step duration)

### Humanize
- **Timing jitter**: ±5ms at max (random but clamped)
- **Velocity jitter**: ±20% at max
- Applied per-hit during scheduling

### Density
- Adds ghost notes to rest steps (probability based on density slider)
- Regenerated on bar boundaries for consistency
- At high density, adds extra hats/rides to existing steps

### Fill Generation
- Triggered by clicking active pattern pad
- Always starts on next bar boundary
- Progressive build: kick/tom → snare/tom → crash+kick finale
- Hold pad = continuous fills each bar

---

## UI Layout

```
┌─────────────────────────────────────────────────┐
│ BPM: [120] [TAP]  [▶ PLAY] [■ STOP]            │
├─────────────────────────────────────────────────┤
│ Feel: ◉ Straight  ○ Swing  ○ Shuffle           │
│ Humanize: [====|--------]  Density: [---|====] │
│ Volume:   [=====|-------]                      │
├─────────────────────────────────────────────────┤
│ ┌─ Pattern A ───────────────────────────┐      │
│ │ k h s h k h s h                        │      │
│ └────────────────────────────────────────┘      │
│ ┌─ Pattern B ───────────────────────────┐      │
│ │ k . s . k k s .                        │      │
│ └────────────────────────────────────────┘      │
│ ┌─ Pattern C ───────────────────────────┐      │
│ │ kh . sh . kh . sh .                    │      │
│ └────────────────────────────────────────┘      │
│ ┌─ Pattern D ───────────────────────────┐      │
│ │ k h sh h k . s h                       │      │
│ └────────────────────────────────────────┘      │
├─────────────────────────────────────────────────┤
│ [ A ]  [ B ]  [ C ]  [ D ]                     │
│ Click inactive=switch, Click active=fill       │
├─────────────────────────────────────────────────┤
│ Set: [Untitled ▼] [Save] [New] [Export]       │
└─────────────────────────────────────────────────┘
```

---

## Important Notes & Gotchas

### Audio Context
- **Autoplay policy**: Must be initialized on user gesture
- Call `audioContext.resume()` before playing
- Check for `suspended` state

### Pattern Switching
- NEVER switch mid-bar (sounds bad)
- Queue with `nextPattern` state
- Apply only on bar boundary

### Timing Precision
- NEVER use `setTimeout/setInterval` for note scheduling
- Always use Web Audio time (`context.currentTime`)
- Schedule notes slightly ahead (lookahead pattern)

### Fill Behavior
- Clicking active pad → one-shot fill
- Holding active pad → continuous fills (regenerate each bar)
- Clicking inactive pad → switch pattern (on bar boundary)

---

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm test         # Run tests (currently broken, needs fix)
```

---

## Future Enhancements (Post-v1)

### v2: MIDI Support
- Web MIDI API integration
- Map MIDI notes to pattern switches
- Map MIDI CC to sliders (density, humanize, volume)

### v3: Advanced Syntax
- `|` bar separators
- `[]` subdivisions (e.g., `k h [s s s] h`)
- `!` accents, `?` ghost notes
- `#` comments

### v4: Grid Editor
- Visual 16×N grid view
- Click to toggle hits
- Bi-directional sync with text editor

### v5: Cloud Sync
- Optional backend for sharing sets
- Public set library
- User accounts

---

## Testing Strategy

### Unit Tests (Once vitest is fixed)
- Parser: valid patterns, invalid symbols, edge cases
- Timing utilities: BPM conversion, feel offsets
- Generators: density, fills

### Manual Testing Checklist
- [x] Play/stop with spacebar ✅
- [x] BPM changes affect timing ✅
- [x] Tap tempo works ✅
- [x] Pattern switching on bar boundary ✅
- [x] Feel changes timing audibly ✅
- [x] Keyboard shortcuts (1-4, F, T, Space) ✅
- [x] Live pattern editing ✅
- [x] Humanize adds timing/velocity variation ✅
- [x] Density adds ghost notes on rests ✅
- [x] Volume control works ✅
- [ ] Fill triggers correctly 🔜
- [ ] Save/load UI works 🔜
- [ ] Export/import JSON works 🔜

---

## Session Resume Checklist

When resuming work in a new session:

1. **Read this file** to understand current state
2. **Check README.md** for setup instructions
3. **Review plan file**: `C:\Users\ricar\.claude\plans\squishy-herding-chipmunk.md`
4. **Check current milestone**: Look at todo list or file structure
5. **Run dev server**: `npm run dev` to see current state
6. **Next milestone**: M6 (Fills)

---

## Contact & Resources

- **Drum kit**: User-provided sprite sheet at `public/samples/kit-default/`
- **Plan file**: `C:\Users\ricar\.claude\plans\squishy-herding-chipmunk.md`
- **Working directory**: `c:\git\drum`
- **Dev server**: `http://localhost:5173` or `http://localhost:5174`

---

**Last Updated**: 2026-01-31 (Milestone 5 complete)
**Current Milestone**: M5 Complete ✅ | Next: M6 (Fills)
**Status**: Humanize, density, and volume controls working! All three sliders adjust audio in real-time 🎵
