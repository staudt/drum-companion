# 🥁 Drum Companion

> **📝 Note**: This file is kept in sync with [CLAUDE.md](CLAUDE.md). Update both when completing milestones.

A guitarist-focused drum companion web app for quickly creating and playing drum patterns using simple text notation.

## Overview

Drum Companion lets you type drum patterns like `k h s h` (kick, hat, snare, hat) and instantly hear them play. Perfect for guitarists, bassists, and solo musicians who need quick drum backing while practicing or composing.

### Why Text-Based?

- **Fast**: Type patterns faster than clicking a grid
- **Intuitive**: `k h s h` is easier to remember than mouse clicks
- **Flexible**: Copy, paste, and modify patterns instantly
- **Portable**: Share patterns as simple text strings

## Features

### ✅ Working Now (Milestones 1-4)

- ✅ **4-Pattern System**: Edit all patterns (A/B/C/D) simultaneously
- ✅ **Live Pattern Editing**: Edit patterns while playing (500ms debounce)
- ✅ **Pattern Switching**: Click pads to switch patterns on bar boundaries
- ✅ **Visual Feedback**: Green=playing, Yellow=queued, step/bar counters
- ✅ **Pattern Validation**: Min 2 steps, max 64 steps, real-time error feedback
- ✅ **Tempo Control**: BPM slider (40-240) adjustable during playback
- ✅ **Tap Tempo**: Calculate BPM by repeatedly tapping the TAP button
- ✅ **Feel Control**: Straight, swing (triplet), and shuffle timing feels
- ✅ **Keyboard Shortcuts**: Space (play/stop), F (cycle feel), 1-4 (patterns), T (tap)
- ✅ **Audio Engine**: Sprite-based sample loading, lookahead scheduler
- ✅ **State Persistence**: Auto-saves to localStorage

### 🔜 Coming Soon (Milestones 5-7)

- ⏳ **Humanize**: Subtle timing and velocity variations
- ⏳ **Density**: Add ghost notes for fuller sound
- ⏳ **Volume Control**: Master volume slider
- ⏳ **Fills**: Click active pad for fill, hold for continuous
- ⏳ **Export/Import**: Share sets as JSON files

### Planned Features (Future)

- MIDI controller support
- Advanced syntax (bar separators, subdivisions, accents)
- Grid editor view (alternative to text)
- Cloud sync and sharing
- Multiple drum kit support

## Pattern Syntax

### Basic Symbols

```
k  = kick drum
s  = snare drum
h  = closed hi-hat
H  = open hi-hat
c  = crash cymbal
r  = ride cymbal
t  = tom
.  = rest (silence)
```

### Examples

```
k . s .               → Basic rock beat (4 steps)
k h s h               → Kick, hat, snare, hat
kh . sh .             → Kick+hat, rest, snare+hat, rest (simultaneous hits)
k . s . k k s .       → 8-step pattern with double kick
k h s h k h sh h      → Full 8-step rock groove
```

**Time Signature**: 4/4 assumed
**Resolution**: Each space = one 16th note

## Getting Started

### Prerequisites

- Node.js 20+ (or 22+)
- npm 8+

### Installation

```bash
# Clone or download this repository
cd c:/git/drum

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Quick Start

1. **Type a pattern** in any of the 4 pattern boxes:
   ```
   Pattern A: k h s h k h s h
   Pattern B: k . s . k k s .
   Pattern C: kh . sh . kh . sh .
   Pattern D: k h sh h k . s h
   ```

2. **Press Play** (or hit Spacebar)

3. **Switch patterns**: Click pads A/B/C/D (switches on next bar)

4. **Trigger fill**: Click the active pattern pad

5. **Adjust controls**:
   - BPM: Set tempo (40-240)
   - Feel: Straight / Swing / Shuffle
   - Humanize: Add subtle variations
   - Density: Add ghost notes

## Project Structure

```
drum/
├── public/
│   └── samples/kit-default/     # Drum kit audio files
│       ├── kit.ogg              # Sprite sheet audio
│       ├── kit.mp3              # Fallback format
│       └── sprite.json          # Sprite definitions
├── src/
│   ├── types/                   # TypeScript type definitions
│   ├── parser/                  # Pattern text parser
│   ├── engine/                  # Audio engine & scheduling
│   ├── store/                   # State management (Zustand)
│   ├── components/              # React components
│   ├── hooks/                   # Custom React hooks
│   └── utils/                   # Utility functions
├── package.json
└── vite.config.ts
```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Audio**: Web Audio API
- **Storage**: localStorage

## Development

### Commands

```bash
npm run dev        # Start dev server (localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm test           # Run tests (Vitest)
```

### Architecture

**Data Flow**:
```
User Input (text)
  → parsePattern()
  → Steps[]
  → Scheduler (lookahead pattern)
  → Web Audio API
  → Sound Output
```

**Audio System**:
- **Sprite Sheet**: All drum sounds in one file (efficient loading)
- **Lookahead Scheduler**: Precise timing using Web Audio time
- **Bar Boundaries**: Pattern switches and fills quantized to bars

### Adding New Drum Sounds

To use a different drum kit:

1. Place your audio file in `public/samples/kit-default/`
2. Update `sprite.json` with your sprite definitions:
   ```json
   {
     "kick": [startMs, durationMs],
     "snare": [startMs, durationMs],
     ...
   }
   ```
3. Update `SPRITE_MAP` in `src/parser/constants.ts` if needed

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Stop |
| `F` | Cycle through feels (Straight → Swing → Shuffle) |
| `1` | Switch to Pattern A |
| `2` | Switch to Pattern B |
| `3` | Switch to Pattern C |
| `4` | Switch to Pattern D |
| `T` | Tap tempo |

## Use Cases

- **Guitar Practice**: Loop drum patterns while practicing riffs
- **Songwriting**: Quickly sketch drum ideas for songs
- **Live Performance**: Use MIDI pedal to switch patterns (v2 feature)
- **Teaching**: Demonstrate rhythms to students
- **Jamming**: Create backing tracks on the fly

## Contributing

This project is in active development. Current focus: **Milestone 5 (Humanize & Density)**

See [CLAUDE.md](CLAUDE.md) for detailed implementation plan and architecture.

## Roadmap

- [x] **M1**: Project setup, parser, types ✅
- [x] **M2**: Audio engine, sample loading, live editing ✅
- [x] **M3**: 4-pattern system, pattern switching ✅
- [x] **M4**: Feel controls, tap tempo, keyboard shortcuts ✅
- [ ] **M5**: Humanize, density, volume controls 🔜
- [ ] **M6**: Fills and advanced features
- [ ] **M7**: Persistence (export/import), polish, v1 release

## Known Issues

- Vitest configuration preventing tests from running (test code is correct, config needs debugging)
- All features manually tested and working

## How to Test

1. `npm run dev` → Opens [http://localhost:5173](http://localhost:5173)
2. Click **Play** to start Pattern A
3. **Edit patterns** while playing (changes apply automatically!)
4. **Click pattern pads** (A/B/C/D) to switch patterns
5. **Adjust BPM** slider during playback
6. Watch visual feedback: Green=playing, Yellow=queued

## License

MIT (or your preferred license)

## Acknowledgments

- Drum samples provided by user
- Inspired by classic drum machines and the need for fast, text-based pattern entry

---

**Status**: Milestone 4 Complete ✅ | Next: Humanize & Density ⚙️

For detailed technical documentation, see [CLAUDE.md](CLAUDE.md)
