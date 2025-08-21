# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

### Design Principles

- **Modular Architecture**: Build with small, focused modules that do one thing well
- **Error-First Callbacks**: Always handle errors as the first parameter in callbacks
- **Async by Default**: Use async/await for all I/O operations
- **Fail Fast**: Validate inputs early and throw meaningful errors immediately
- **Security First**: Never trust user input, always validate and sanitize

## 🤖 AI Assistant Guidelines

### Context Awareness

- When implementing features, always check existing patterns first
- Prefer composition over inheritance in all designs
- Use existing utilities before creating new ones
- Check for similar functionality in other domains/features

### Common Pitfalls to Avoid

- Creating duplicate functionality
- Overwriting existing tests
- Modifying core frameworks without explicit instruction
- Adding dependencies without checking existing alternatives

### Workflow Patterns

- Prefferably create tests BEFORE implementation (TDD)
- Use "think hard" for architecture decisions
- Break complex tasks into smaller, testable units
- Validate understanding before implementation

### Search Command Requirements

**CRITICAL**: Always use `rg` (ripgrep) instead of traditional `grep` and `find` commands:

```bash
# ❌ Don't use grep
grep -r "pattern" .

# ✅ Use rg instead
rg "pattern"

# ❌ Don't use find with name
find . -name "*.js"

# ✅ Use rg with file filtering
rg --files | rg "\.js$"
# or
rg --files -g "*.js"
```

**Enforcement Rules:**

```
(
    r"^grep\b(?!.*\|)",
    "Use 'rg' (ripgrep) instead of 'grep' for better performance and features",
),
(
    r"^find\s+\S+\s+-name\b",
    "Use 'rg --files | rg pattern' or 'rg --files -g pattern' instead of 'find -name' for better performance",
),
```

## Project Overview

This is "To Swing a Cat" - a js13k 2025 competition entry. It's a pixel art platformer where you play as a cat that collects tails to gain new abilities and swing through levels. The game must fit within 13KB when zipped.

## Development Commands

```bash
npm start           # Start Vite dev server with hot reload
npm run build       # Production build with size report (currently ~17.48KB gzipped)
npx vitest          # Run tests once
npx vitest watch    # Run tests in watch mode
npx vitest run <file>  # Run specific test file
```

## Architecture Overview

### Game Engine

The game uses LittleJS Engine (v1.11.8) with TypeScript. The engine initialization flow:

1. `src/main.ts` - Entry point containing gameInit, gameUpdate, gameRender functions
2. Player entity extends EngineObject for physics and rendering
3. Level data loaded from LDTK files via custom Vite plugin

### Key Systems

**Level Loading**: LDTK integration via `ldtk/plugin.ts` automatically imports textures and generates collision data. Levels are stored as `.ldtk` files and processed at build time. Current level file: `swingcat-level-playground.ldtk`.

**Player State Machine**: The player uses a finite state machine (`state-machine.ts`) to manage states:

- States: Idle, Running, Jumping, Falling, Swinging (to be implemented)
- Transitions based on Action enum (None, Left, Right, Jump, ShootRope, ReleaseRope)
- Each state handles its own physics updates and animations

**Input Handling**:

- Movement: `keyIsDown()` for continuous input (arrow keys)
- Actions: `keyWasPressed()` for discrete input (space for jump)

**Rendering Pipeline**: Pixelated rendering with camera scaling. Textures loaded from LDTK tilesets. HSL color system for dynamic colors.

### Current State

- Basic platformer movement implemented
- LDTK level loading functional
- Player can move and jump with state machine
- Player sprite animation (4 frames)
- **Missing**: Tail collection system, swinging mechanics (Rope class started), audio integration, multiple levels, UI

### Size Optimization

Currently ~17.48KB gzipped (exceeds limit). Size reduction strategies:

- Tree-shaking unused LittleJS features
- Minification via Terser
- Procedural generation where possible
- Code golf techniques for final optimization

### Critical Constraints

- **13KB limit**: Every byte counts
- **Browser target**: Modern browsers only (ES6+)
- **Performance**: Must maintain 60 FPS
- **Audio**: Use SoundBox for music, zzfx for effects (not yet integrated)

### Testing

Testing setup uses Vitest with Playwright browser testing:

- Test files: `*.test.ts` pattern
- Browser environment: Chromium headless
- Visual testing: Screenshots saved to `__screenshots__/` directories
- Current test files: `src/state-machine.test.ts`, `src/utils/color.test.ts`

## Project Structure

```
src/
├── main.ts              # Game entry (gameInit, gameUpdate, gameRender)
├── music.ts             # Audio system integration
├── state-machine.ts     # Generic state machine implementation
├── player-small.js      # Player sprite data
├── swingmusic.js        # Music data
└── utils/
    ├── color.ts         # HSL color utilities
    ├── dommatrix.ts     # Matrix transformations
    ├── helpers.ts       # General utilities (dictMap, etc.)
    ├── ldtk.ts          # LDTK level data handling
    └── types.ts         # TypeScript type definitions (Maybe<T>, etc.)

ldtk/
├── plugin.ts            # Vite plugin for LDTK file processing
└── ldtk.d.ts           # LDTK type definitions
```

## Useful Search Patterns

```bash
# Find game entities
rg "class.*extends.*EngineObject"

# Find state definitions
rg "state.*=>"

# Find input handling
rg "keyIsDown|keyWasPressed"

# Find LDTK levels
rg --files -g "*.ldtk"

# Find specific game systems
rg "rope|swing|tail"  # For swinging mechanics
rg "texture|sprite"   # For rendering code
rg "collision|tile"   # For physics/collision
```
