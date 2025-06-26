# Technical Context: To Swing a Cat

## Technology Stack

### Core Engine
- **LittleJS Engine**: Lightweight 2D game engine (already integrated)
- **TypeScript**: Type-safe development with modern JS features
- **Vite**: Fast build tool with hot reload for development

### Development Tools
- **LDTK**: Level editor for creating game levels (swingcat-level-playground.ldtk exists)
- **Vitest**: Testing framework with browser support
- **Playwright**: End-to-end testing capabilities
- **dprint**: Code formatting

### Audio Libraries
- **SoundBox**: Custom music generation (to be integrated)
- **zzfx**: Procedural sound effects (to be integrated)

### Build & Optimization
- **Terser**: JavaScript minification for size optimization
- **Vite Build**: Production bundling with tree-shaking

## Technical Constraints

### js13k Requirements
- **Size Limit**: 13KB zipped final build
- **No External Resources**: All assets must be generated or embedded
- **Browser Compatibility**: Modern browsers only (ES6+)

### Performance Targets
- **60 FPS**: Smooth gameplay on target devices
- **Low Memory**: Efficient resource usage
- **Fast Load**: Minimal startup time

## Current Architecture

### File Structure
```
src/
├── main.ts           # Entry point with LittleJS setup
├── utils/
│   ├── color.ts      # Color utilities
│   ├── dommatrix.ts  # Matrix transformations
│   ├── ldtk.ts       # Level loading from LDTK
│   └── types.ts      # TypeScript type definitions
ldtk/
├── ldtk.schema.json  # LDTK schema
├── ldtk.ts          # LDTK type definitions
└── plugin.ts        # LDTK integration
```

### Current Implementation Status
- **Engine**: LittleJS initialized with basic player object
- **Graphics**: Pixelated rendering enabled, basic shapes working
- **Physics**: Gravity and collision detection configured
- **Input**: WASD movement and space jump implemented
- **Levels**: LDTK integration partially working
- **Camera**: Scaling and positioning configured

## Development Setup

### Commands
- `npm start`: Development server with hot reload
- `npm run build`: Production build with optimization

### Configuration
- **TypeScript**: Strict mode enabled
- **Canvas**: Pixelated rendering for pixel art style
- **Physics**: Gravity set to -0.01, tile collision enabled

## Integration Points

### Audio Integration (Planned)
- SoundBox for background music generation
- zzfx for real-time sound effects
- Audio context management for web audio

### Level System
- LDTK files define level geometry
- Spawn points and collectibles defined in level data
- Dynamic level loading and rendering

### Asset Pipeline
- Procedural texture generation (empty texture example exists)
- Minimal sprite requirements due to size constraints
- Color-based rendering with HSL color system

## Size Optimization Strategy
- Tree-shaking unused code
- Minification with Terser
- Procedural asset generation instead of files
- Efficient data structures
- Code golf techniques where appropriate
