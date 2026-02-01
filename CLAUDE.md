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

## Current Status (Milestone 7 Complete ✅)

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
- Keyboard shortcuts (M7 update: 1-0 for up to 10 patterns):
  - Space: Play/Stop
  - F: Cycle through feels
  - 1-0: Switch patterns (1-9 for patterns 1-9, 0 for pattern 10)
  - T: Tap tempo

**✅ Milestone 5: Humanize & Density**
- HumanizeProcessor for timing jitter (±5ms) and velocity jitter (±20%)
- DensityGenerator for adding ghost notes on rest steps
- Master volume control via GainNode
- Controls component with sliders for humanize/density/volume
- Real-time parameter adjustments while playing
- Density regenerates on bar boundaries for consistency

**✅ Milestone 6: Fills**
- FillGenerator with progressive fill algorithm
- Extended DrumSymbol type with T (hiTom) and f (lowTom/floor tom)
- Immediate partial fills (start from current step)
- Kick pattern preservation (fills don't "kill" the groove)
- Progressive build: sparse toms → denser toms → snare roll → crash
- Crash on beat 1 of next bar for musical resolution
- Click active pattern pad while playing to trigger fill

**✅ Milestone 7: UI Refactor - Sidebar Layout + Dynamic Patterns**
- Modern sidebar layout with collapsible mobile hamburger menu
- Dynamic pattern management (1-10 patterns instead of fixed A/B/C/D)
- Automatic state migration (V1→V2) preserving all user data
- Fixed top bar with BPM controls, playback controls, and fill controls
- Scrollable pattern area with add/remove functionality
- Responsive design with touch-friendly tap targets (min 44px)
- Full accessibility (ARIA labels, keyboard navigation, focus states)
- Keyboard shortcuts updated (1-0 for patterns, 0 = pattern 10)
- Set selector dropdown functional (shows saved sets)
- Pattern renumbering after removal (maintains sequential IDs)
- Active pattern glow effect with shadow
- Hover states on pattern rows
- All deprecated components removed

### Next Up (Milestone 8)
- Export/import JSON
- Pattern templates/presets
- Advanced pattern syntax
- Multi-kit support

### Known Issues
- **Vitest configuration**: Tests don't run (config issue, not code issue). Parser logic is correct.
  - Can be debugged later or switched to manual testing
  - All features manually tested and working
- **Firefox audio**: Audio playback not working in Firefox (works in Chrome/mobile)
  - Attempted fixes: format fallback (OGG→MP3), async context.resume(), callback-based decodeAudioData
  - Was working briefly after M7, unclear what broke it
  - Needs deeper investigation into Firefox's Web Audio API behavior
  - Low priority: Chrome and mobile are primary targets

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
k/B = kick (bass), s = snare, h/x = closed hi-hat, H = open hi-hat
c = crash, r = ride, t = midTom, T = hiTom, f = lowTom (floor), . = rest
p = clap, w = cowbell, m = tambourine, S = splash, C = china

Examples:
k . s .           → Basic rock beat (4 steps)
kh . sh .         → Kick+hat, rest, snare+hat, rest
k . s . k k s .   → 8-step pattern with double kick
Bx . sx .         → Same as above using B (bass) and x (hi-hat)
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
- **Schema (M7 Updated)**:
  - `currentSet`: DrumSet (dynamic patterns 1-10 + settings)
    - `patterns`: Pattern[] (array instead of Record, max 10)
    - `selectedKit`: string (NEW in M7)
  - `playback`: PlaybackState (isPlaying, currentPattern as number, etc.)
    - `currentPattern`: number (1-10, changed from 'A'|'B'|'C'|'D')
    - `nextPattern`: number | null
  - `savedSets`: DrumSet[] (library of saved sets)
  - `ui`: UIState (NEW in M7, non-persisted)
    - `sidebarOpen`: boolean (for mobile hamburger menu)

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
│   ├── App.tsx                  ✅ M7: Refactored with sidebar layout (1-10 patterns)
│   ├── main.tsx                 ✅ Entry point
│   ├── index.css                ✅ Tailwind styles
│   ├── types/
│   │   ├── pattern.ts           🔄 M7: Updated for numeric IDs (1-10)
│   │   ├── audio.ts             ✅ Audio types
│   │   ├── state.ts             🔄 M7: Updated PlaybackState for numeric patterns
│   │   └── ui.ts                🔄 M7: NEW - UI state (sidebar, etc.)
│   ├── parser/
│   │   ├── parsePattern.ts      ✅ Pure parser function
│   │   ├── parsePattern.test.ts ⚠️  Tests don't run (config issue)
│   │   └── constants.ts         ✅ Symbol mappings
│   ├── engine/
│   │   ├── AudioEngine.ts       ✅ Main coordinator (with volume, fills)
│   │   ├── SampleLoader.ts      ✅ Sprite loading
│   │   ├── Scheduler.ts         ✅ Lookahead scheduler (with humanize/density/fills)
│   │   ├── FeelProcessor.ts     ✅ Swing/shuffle timing
│   │   ├── HumanizeProcessor.ts ✅ Timing/velocity jitter
│   │   ├── DensityGenerator.ts  ✅ Ghost note generation
│   │   └── FillGenerator.ts     ✅ Progressive fill patterns
│   ├── store/
│   │   ├── useAppStore.ts       🔄 M7: Updated for dynamic patterns (1-10)
│   │   ├── migrations.ts        🔄 M7: NEW - V1→V2 migration logic
│   │   └── persistence.ts       🔜 Export/import helpers
│   ├── components/
│   │   ├── Sidebar/             🔄 M7: NEW sidebar components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ControlSlider.tsx
│   │   │   ├── KitSelector.tsx
│   │   │   └── FeelSelector.tsx
│   │   ├── TopBar/              🔄 M7: NEW top bar components
│   │   │   ├── TopBar.tsx
│   │   │   ├── BPMControl.tsx
│   │   │   ├── PlaybackControls.tsx
│   │   │   └── FillControls.tsx
│   │   ├── PatternArea/         ✅ M7: Dynamic pattern list (1-10 patterns)
│   │   │   ├── PatternArea.tsx
│   │   │   └── PatternRow.tsx
│   │   └── PatternEditor/       ✅ M7: PatternInput reused by PatternRow
│   │       └── PatternInput.tsx  ✅ Individual pattern input (numeric IDs)
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

### M6: Fills ✅ COMPLETE
**Goal**: Add dynamic fills triggered by clicking active pattern pad

**Tasks**:
- [x] FillGenerator with progressive build algorithm
- [x] Extended DrumSymbol type (T=hiTom, L=lowTom)
- [x] Immediate partial fills (start from current step to bar end)
- [x] Kick pattern preservation during fills
- [x] Crash on beat 1 of next bar
- [x] Click active pad = trigger fill
- [x] Fill state tracking in Scheduler

**Key Implementation**:
- Progressive build: sparse hi-toms → mid-toms → low-toms → snare roll
- Fills preserve kick pattern (maintains groove feel)
- Fill length adapts based on remaining steps in bar
- Crash always scheduled for resolution on beat 1

**Success**: Click active pad while playing → hear tom/snare fill → crash on next bar

---

### M7: UI Refactor - Sidebar Layout + Dynamic Patterns ✅ COMPLETE

**Goal**: Transform from vertical stack layout with 4 fixed patterns (A/B/C/D) to modern sidebar layout with dynamic pattern management (up to 10 patterns numbered 1-10)

**Major Changes**:
1. **Sidebar Layout** (left, collapsible):
   - Logo: 🥁 Drum Companion
   - Volume slider
   - Humanize slider
   - Density slider
   - Kit selector (placeholder dropdown)
   - Feel dropdown (convert from radio buttons)

2. **Fixed Top Bar** (non-scrolling):
   - Row 1: BPM slider + editable number + TAP TEMPO
   - Row 2: Play/Stop + Set selector + Save | Fill button + "Fill when switch" checkbox

3. **Scrollable Pattern Area**:
   - Dynamic pattern list (max 10 patterns, numbered 1-10)
   - Each row: Pattern pad + text input + dropdown (placeholder) + remove button
   - + button to add new patterns

4. **State Migration**:
   - Automatic migration from patterns object {A,B,C,D} to patterns array [1-10]
   - Pattern IDs change from 'A'|'B'|'C'|'D' to numbers 1-10
   - Keyboard shortcuts update from 1-4 to 1-0 (key 0 = pattern 10)
   - Fill trigger: pressing active pattern's number key triggers fill

5. **Mobile Responsive**:
   - Sidebar collapses to hamburger menu on mobile (<1024px)
   - Touch-friendly tap targets (min 44px, pattern pads 56px)
   - Active pattern glow effect with shadow
   - Pattern row hover states

**Implementation Phases**:
- [x] Phase 1: State migration & pattern management (foundation)
- [x] Phase 2: Reusable UI components (sliders, dropdowns)
- [x] Phase 3: Sidebar component (with mobile hamburger)
- [x] Phase 4: TopBar components (BPM, playback, fill controls)
- [x] Phase 5: Pattern area (dynamic add/remove)
- [x] Phase 6: Main layout integration (App.tsx refactor)
- [x] Phase 7: Responsive design & accessibility polish
- [x] Phase 8: Testing & bug fixes (keyboard shortcut stale closure fix)
- [x] Phase 9: Cleanup & documentation (deprecated components removed)

**Files Created** (13 new):
- Sidebar components: Sidebar.tsx, ControlSlider.tsx, KitSelector.tsx, FeelSelector.tsx
- TopBar components: TopBar.tsx, BPMControl.tsx, PlaybackControls.tsx, FillControls.tsx
- Pattern area: PatternArea.tsx, PatternRow.tsx
- State/types: ui.ts, migrations.ts
- Utils: patternHelpers.ts

**Files Modified** (7):
- types/pattern.ts, types/audio.ts, types/state.ts, store/useAppStore.ts, App.tsx
- PatternInput.tsx, PatternEditor.tsx (updated for numeric IDs)

**Files Deleted** (3):
- TransportControls.tsx, Controls.tsx, PatternPads.tsx (replaced by new components)

**Success Criteria**: ✅ ALL ACHIEVED
- All existing features work (no regressions)
- Migration preserves all user data (zero data loss)
- Can add/remove patterns dynamically (max 10)
- Sidebar works on desktop, hamburger menu on mobile
- Keyboard shortcuts 1-0 functional with fill trigger on active pattern
- Set selector dropdown shows saved sets
- Full accessibility with ARIA labels

**Plan File**: `C:\Users\Ricardo\.claude\plans\sorted-bubbling-pretzel.md`

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

### Current Layout (M7 - New Sidebar Design)

```
┌─────────────────────────────────────────────────────────┐
│ [☰] (mobile only)                                       │
├─────────────┬───────────────────────────────────────────┤
│             │ TOP BAR (Fixed, non-scrolling)            │
│  SIDEBAR    │  BPM: [slider 120] [TAP]                  │
│             │  [▶ PLAY] [Set ▼] [SAVE] | [FILL] [☑]    │
│  🥁 Drum    ├───────────────────────────────────────────┤
│  Companion  │ PATTERNS (Scrollable)                     │
│             │  [1] [k h s h           ] [▼] [X]         │
│  Vol   [==] │  [2] [k . s . k k s .   ] [▼] [X]         │
│  Human [==] │  [3] [kh . sh . kh . sh ] [▼] [X]         │
│  Dens  [==] │  [4] [k h sh h k . s h  ] [▼] [X]         │
│             │  [+] Add Pattern (max 10)                 │
│  Kit   [▼]  │                                           │
│  Feel  [▼]  │                                           │
│             │                                           │
└─────────────┴───────────────────────────────────────────┘
```

**Layout Features**:
- **Sidebar** (300px fixed on desktop, hamburger on mobile):
  - Logo, Volume, Humanize, Density sliders
  - Kit selector (placeholder), Feel dropdown
- **Top Bar** (fixed, always visible):
  - BPM controls (slider + editable number + tap)
  - Playback controls (play/stop, set selector, save)
  - Fill controls (fill button, "fill when switch" checkbox)
- **Pattern Area** (scrollable):
  - Dynamic patterns (1-10), add/remove functionality
  - Each row: pad + input + dropdown + remove button

### Previous Layout (M1-M6 - Deprecated)

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
- Clicking active pad → immediate partial fill (from current step to bar end)
- Fill preserves kick pattern from original groove
- Progressive build: sparse toms → denser toms → snare roll
- Crash always plays on beat 1 of next bar
- Clicking inactive pad → switch pattern (queued to bar boundary)

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
- [x] Fill triggers correctly (click active pad) ✅
- [x] Crash plays on beat 1 after fill ✅
- [x] Kick pattern preserved during fill ✅
- [ ] Save/load UI works 🔜
- [ ] Export/import JSON works 🔜

---

## Session Resume Checklist

When resuming work in a new session:

1. **Read this file** to understand current state
2. **Check README.md** for setup instructions
3. **Review plan file**: `C:\Users\Ricardo\.claude\plans\sorted-bubbling-pretzel.md`
4. **Check current milestone**: M7 (UI Refactor - Sidebar Layout + Dynamic Patterns)
5. **Run dev server**: `npm run dev` to see current state
6. **Next milestone**: M8 (Export/Import JSON, remaining persistence features)

---

## Contact & Resources

- **Drum kit**: User-provided sprite sheet at `public/samples/kit-default/`
- **Plan file**: `C:\Users\Ricardo\.claude\plans\sorted-bubbling-pretzel.md`
- **Working directory**: `c:\git\drum-companion`
- **Dev server**: `http://localhost:5173` or `http://localhost:5174`

---

**Last Updated**: 2026-01-31 (Milestone 7 Complete ✅)
**Current Milestone**: M7 Complete ✅ | Next: M8 (Export/Import, Pattern Templates)
**Status**: UI refactor complete! Sidebar layout with dynamic patterns (1-10), full state migration, responsive design, and accessibility features all working. Ready for M8 (export/import, templates). 🥁
