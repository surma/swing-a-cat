# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "To Swing a Cat" - a js13k 2025 competition entry. It's a pixel art platformer where you play as a cat that collects tails to gain new abilities and swing through levels. The game must fit within 13KB when zipped.

## Development Commands

```bash
npm start    # Start development server with hot reload
npm run build # Create production build and check size
```

## Architecture Overview

### Game Engine

The game uses LittleJS Engine (v1.11.8) with TypeScript. The engine initialization flow:

1. `src/main.ts` - Entry point containing gameInit, gameUpdate, gameRender functions
2. Player entity extends EngineObject for physics and rendering
3. Level data loaded from LDTK files via custom Vite plugin

### Key Systems

**Level Loading**: LDTK integration via `ldtk/plugin.ts` automatically imports textures and generates collision data. Levels are stored as `.ldtk` files and processed at build time.

**Input Handling**:

- Movement: `keyIsDown()` for continuous input (arrow keys)
- Actions: `keyWasPressed()` for discrete input (space for jump)

**Rendering Pipeline**: Pixelated rendering with camera scaling. Textures loaded from LDTK tilesets. HSL color system for dynamic colors.

### Current State

- Basic platformer movement implemented
- LDTK level loading functional
- Player can move and jump
- **Missing**: Tail collection system, swinging mechanics, audio, multiple levels, UI

### Size Optimization

Currently ~15.42KB gzipped (exceeds limit). Size reduction strategies:

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

Run tests with: `npm test` (Vitest with Playwright browser testing)
