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

### ✅ Working Now (Milestones 1-7)

- ✅ **Dynamic Pattern System**: Up to 10 patterns (numbered 1-10)
- ✅ **Sidebar Layout**: Modern sidebar with all controls, collapsible on mobile
- ✅ **Live Pattern Editing**: Edit patterns while playing (500ms debounce)
- ✅ **Pattern Switching**: Click pattern pads to switch on bar boundaries
- ✅ **Add/Remove Patterns**: Dynamic pattern management (min 1, max 10)
- ✅ **Visual Feedback**: Green glow=active, Yellow pulse=queued, step/bar counters
- ✅ **Pattern Validation**: Min 2 steps, max 64 steps, real-time error feedback
- ✅ **Tempo Control**: BPM slider (40-240) with editable number input
- ✅ **Tap Tempo**: Calculate BPM by repeatedly tapping the TAP button
- ✅ **Feel Control**: Straight, swing (triplet), and shuffle timing feels
- ✅ **Humanize**: Subtle timing (±5ms) and velocity (±20%) variations
- ✅ **Density**: Add ghost notes to rests for fuller sound
- ✅ **Volume Control**: Master volume slider
- ✅ **Fills**: Progressive tom/snare fills with crash on beat 1
- ✅ **Keyboard Shortcuts**: Space (play/stop), F (cycle feel), 1-0 (patterns), T (tap)
- ✅ **Audio Engine**: Sprite-based sample loading, lookahead scheduler
- ✅ **State Persistence**: Auto-saves to localStorage with automatic migration
- ✅ **Responsive Design**: Touch-friendly on mobile with hamburger menu
- ✅ **Accessibility**: Full ARIA labels, keyboard navigation, focus states

### 🔜 Coming Soon (Milestone 8+)

- ⏳ **Export/Import**: Share sets as JSON files
- ⏳ **Pattern Templates**: Pre-made pattern library
- ⏳ **Multi-Kit Support**: Multiple drum kit options

### Planned Features (Future)

- MIDI controller support
- Advanced syntax (bar separators, subdivisions, accents)
- Grid editor view (alternative to text)
- Cloud sync and sharing
- Multiple drum kit support

## Pattern Syntax

### Basic Symbols

```
k  = kick drum (also B for bass)
s  = snare drum
h  = closed hi-hat (also x)
H  = open hi-hat
c  = crash cymbal
r  = ride cymbal
t  = tom (mid)
T  = hi-tom (high)
f  = low-tom (floor)
.  = rest (silence)
```

### Additional Percussion

```
p  = clap
w  = cowbell
m  = tambourine
S  = splash cymbal
C  = china cymbal
a  = hi agogo
A  = low agogo
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

## Live Demo

**🌐 Live App**: [https://typeabeat-32a5.web.app](https://typeabeat-32a5.web.app)

Try it now - no installation required!

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

1. **Type a pattern** in the default pattern boxes (starts with 4 patterns):
   ```
   Pattern 1: k h s h k h s h
   Pattern 2: k . s . k k s .
   Pattern 3: kh . sh . kh . sh .
   Pattern 4: k h sh h k . s h
   ```

2. **Press Play** (or hit Spacebar)

3. **Switch patterns**:
   - Click pattern number pads (1-10)
   - Or use keyboard shortcuts (1-9, 0 for pattern 10)
   - Switches on next bar boundary

4. **Trigger fill**:
   - Click the FILL button in top bar
   - Or click the currently playing pattern pad
   - Or press the keyboard number of the active pattern

5. **Adjust controls** (in left sidebar):
   - Volume: Master output level
   - Humanize: Subtle timing/velocity variations
   - Density: Ghost notes on rests
   - Kit: Drum kit selector (coming soon)
   - Feel: Straight / Swing / Shuffle

6. **Manage patterns**:
   - Click **+ Add Pattern** to create new patterns (max 10)
   - Click **X** button to remove patterns (min 1)
   - Patterns automatically renumber after removal

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

### Deployment

The app is deployed on Firebase Hosting. To deploy updates:

```bash
# Build and deploy in one command
npm run build && firebase deploy --only hosting

# Or deploy if already built
firebase deploy --only hosting
```

**Firebase Configuration**:
- **Hosting URL**: https://typeabeat-32a5.web.app
- **Project ID**: typeabeat-32a5
- **Build Directory**: `dist/`
- **Config Files**: [firebase.json](firebase.json), [.firebaserc](.firebaserc)

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
| `1-9` | Switch to Pattern 1-9 (or trigger fill if already active) |
| `0` | Switch to Pattern 10 (or trigger fill if already active) |
| `T` | Tap tempo |

**Note**: Pressing the number key of the currently playing pattern triggers a fill instead of switching.

## Use Cases

- **Guitar Practice**: Loop drum patterns while practicing riffs
- **Songwriting**: Quickly sketch drum ideas for songs
- **Live Performance**: Use MIDI pedal to switch patterns (v2 feature)
- **Teaching**: Demonstrate rhythms to students
- **Jamming**: Create backing tracks on the fly

## Contributing

This project is in active development. Current status: **Milestone 7 Complete ✅**

Next focus: **Milestone 8** (Export/Import, Pattern Templates)

See [CLAUDE.md](CLAUDE.md) for detailed implementation plan and architecture.

## Roadmap

- [x] **M1**: Project setup, parser, types ✅
- [x] **M2**: Audio engine, sample loading, live editing ✅
- [x] **M3**: 4-pattern system, pattern switching ✅
- [x] **M4**: Feel controls, tap tempo, keyboard shortcuts ✅
- [x] **M5**: Humanize, density, volume controls ✅
- [x] **M6**: Fills with progressive builds ✅
- [x] **M7**: UI refactor - sidebar layout, dynamic patterns (1-10) ✅
- [ ] **M8**: Export/import, pattern templates, multi-kit support 🔜

## Known Issues

- Vitest configuration preventing tests from running (test code is correct, config needs debugging)
- All features manually tested and working

## How to Test

1. `npm run dev` → Opens [http://localhost:5173](http://localhost:5173)
2. Click **Play** to start Pattern 1
3. **Edit patterns** while playing (changes apply automatically!)
4. **Click pattern pads** (1-10) to switch patterns on bar boundaries
5. **Click FILL button** or active pattern pad to trigger tom/snare fill
6. **Adjust controls** in left sidebar (volume, humanize, density, feel)
7. **Adjust BPM** slider or click number to edit directly
8. **Add/remove patterns** using + and X buttons
9. Watch visual feedback: Green glow=active, Yellow pulse=queued
10. Test on mobile: sidebar collapses to hamburger menu

## License

MIT (or your preferred license)

## Acknowledgments

- Drum samples provided by user
- Inspired by classic drum machines and the need for fast, text-based pattern entry

---

**Status**: Milestone 7 Complete ✅ + Firebase Deployed 🚀 | **LIVE** at [typeabeat-32a5.web.app](https://typeabeat-32a5.web.app)

Modern sidebar layout with dynamic patterns (1-10), fills, humanize, density all working! 🥁

For detailed technical documentation, see [CLAUDE.md](CLAUDE.md)
