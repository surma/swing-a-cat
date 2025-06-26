# System Patterns: To Swing a Cat

## Architecture Overview

### Core Game Loop
```
gameInit() → gameUpdate() → gameUpdatePost() → gameRender() → gameRenderPost()
```

The LittleJS engine provides a clear separation of concerns:
- **gameInit**: One-time setup, level loading, camera configuration
- **gameUpdate**: Core game logic (currently empty)
- **gameUpdatePost**: Input handling and physics updates
- **gameRender**: Custom drawing operations
- **gameRenderPost**: UI and overlay rendering

### Entity System
- **EngineObject**: Base class for all game entities
- **Player**: Extends EngineObject with movement and physics
- **ParticleEmitter**: Built-in particle system for effects

## Key Design Patterns

### Component-Based Architecture
```typescript
class Player extends EngineObject {
  speed: number = 0.03;  // Actual value from implementation
  constructor(pos: Vector2) {
    super(pos);
    this.size = vec2(1, 1);
    this.color = hsl(0.5, 1, 0.5);  // Cyan color
    this.collideTiles = true;
    this.collideRaycast = false;
  }
}
```

### Coordinate System
- **World Space**: LittleJS uses a coordinate system where (0,0) is bottom-left
- **Grid-Based**: Levels use grid coordinates with configurable grid size
- **Camera Scaling**: `setCameraScale(gridSize*2)` for pixel-perfect rendering

### Input Handling Pattern
```typescript
// Continuous input (held keys)
if (keyIsDown("ArrowRight")) { /* action */ }

// Discrete input (key press events)
if (keyWasPressed("Space")) { /* action */ }
```

### Level Loading Pattern
```typescript
const { layer, spawnPos } = ldtkLevel("Level_1");
setCameraPos(layer.size.scale(0.5));
layer.redraw();
```

## Physics System

### Current Configuration
- **Gravity**: -0.01 (light gravity for platformer feel)
- **Collision**: Tile-based collision detection enabled
- **Player Physics**:
  - `collideTiles = true`
  - `collideRaycast = false`
  - Manual acceleration via `applyAcceleration()`

### Movement Mechanics
- **Horizontal**: Direct velocity manipulation `p.velocity.x = p.speed` (0.03 units/frame)
- **Vertical**: Physics-based with gravity (-0.01) and acceleration
- **Jump**: Impulse-based using `applyAcceleration(vec2(0, 0.3))`
- **Input Reset**: Velocity.x reset to 0 each frame, then set based on input

## Rendering System

### Pixel Art Pipeline
- **Canvas Setup**: `setCanvasPixelated(true)` for crisp pixels
- **Color System**: HSL-based colors for easy manipulation
- **Layered Rendering**:
  1. Background elements in `gameRender()`
  2. Entities rendered automatically by engine
  3. UI/effects in `gameRenderPost()`

### Current Rendering Elements
- **Debug Grid**: 10x10 purple rectangles (hsl(5/6, 1, .5)) with size vec2(1/8, 1/8)
- **Debug Lines**: Two diagonal lines (cyan, hsl(.5, 1, .5)) from (0,0)→(1,1) and (0,1)→(1,0)
- **Particles**: Complex emitter at spawnPos + vec2(2.5, 3.5) with:
  - Red to blue color transition (hsl(0,1,0.5) → hsl(2/3,1,0.5))
  - Physics collision with elasticity 0.3
  - Trail scaling factor of 2
  - 500ms emit rate with PI cone spread

## Data Management

### Level Data Flow
```
LDTK File → ldtkLevel() → { layer, spawnPos } → Game World
```

### Asset Management
- **Procedural Textures**: OffscreenCanvas(1,1) generates white pixel texture
- **Minimal Assets**: Single empty texture converted to blob and object URL
- **Color-Based Graphics**: HSL color system throughout (player, particles, debug elements)
- **Texture Pipeline**: `cvs.convertToBlob({type: "image/png"})` → `URL.createObjectURL()`

## Planned Patterns

### Tail Collection System
```typescript
interface TailCollectible {
  position: Vector2;
  collected: boolean;
  abilityUnlock: AbilityType;
}
```

### Ability System
```typescript
interface Ability {
  type: AbilityType;
  requiredTails: number;
  activate(): void;
}
```

### Swinging Mechanics
- **Anchor Points**: Detectable swing points in levels
- **Physics Chain**: Connect player to anchor with constraint
- **Momentum**: Preserve and transfer energy through swings

## Performance Patterns

### Size Optimization
- **Single File Builds**: Minimize HTTP requests
- **Procedural Generation**: Create assets at runtime
- **Code Reuse**: Leverage LittleJS built-ins over custom implementations

### Memory Management
- **Object Pooling**: Reuse particles and temporary objects
- **Efficient Updates**: Only update active/visible entities
- **Minimal State**: Keep game state lean and focused

## Error Handling
- **Graceful Degradation**: Game continues even if optional features fail
- **Development Aids**: Debug rendering in gameRender() (to be removed in production)
- **Asset Fallbacks**: Single white pixel texture as base case
- **Type Safety**: Non-null assertion on canvas context (`getContext("2d")!`)

## Current Implementation Patterns

### Engine Initialization Pattern
```typescript
const imageSources = [emptyTextureUrl];
e.engineInit(
  gameInit,      // Setup function
  gameUpdate,    // Core logic (currently empty)
  gameUpdatePost,// Input and physics
  gameRender,    // Custom drawing
  gameRenderPost,// UI overlay (currently empty)
  imageSources   // Texture array
);
```

### Physics Configuration Pattern
```typescript
e.setCameraScale(gridSize*2);        // Pixel-perfect scaling
e.setCanvasPixelated(true);          // Crisp pixel rendering
e.setGravity(-0.01);                 // Light platformer gravity
e.setInputWASDEmulateDirection(true); // Alternative controls
e.initTileCollision(vec2(32, 32));   // Grid-based collision
```

### Level Loading Pattern
```typescript
const { layer, spawnPos } = ldtkLevel("Level_1");
e.setCameraPos(layer.size.scale(0.5));  // Center camera on level
layer.redraw();                          // Refresh level rendering
```

### LDTK Texture Loading Pattern
```typescript
// Vite plugin automatically processes LDTK files:
// 1. Discovers texture files from tileset definitions
// 2. Generates import statements for each texture
// 3. Replaces file paths with Vite-processed URLs

// Before (raw LDTK):
// "relPath": "tileset-test-2.png"

// After (processed by plugin):
// import texture_0 from "./tileset-test-2.png";
// "relPath": texture_0  // Now contains optimized Vite URL
```

### Texture Rendering Integration
```typescript
// Export textures from LDTK utilities
export const textures: Maybe<string>[] = ldtkFile.defs.tilesets.map(
  (t) => t.relPath,
);

// Use textures in LittleJS initialization
e.engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, textures);

// Auto-layer tile rendering with actual textures
const textureIndex = textures.indexOf(structureTileset.relPath);
const layer = new e.TileLayer(
  vec2(0, 0),
  numTiles,
  new e.TileInfo(vec2(0), vec2(gridSize), textureIndex),
  vec2(1, 1),
  0,
);

// Calculate tile coordinates from LDTK auto-layer data
const tileX = Math.floor(srcX / gridSize);
const tileY = Math.floor(srcY / gridSize);
const tileIndex = tileY * tileset.__cWid + tileX;
data.tile = tileIndex;
```

### LDTK Integration Improvements
- **Texture Pipeline**: Complete integration from LDTK → Vite plugin → LittleJS rendering
- **Auto-layer Support**: Processes LDTK auto-layer tiles with actual texture coordinates
- **Tileset Management**: Improved utility functions for tileset and layer access
- **Error Handling**: Better validation and error messages for missing resources
- **Type Safety**: Enhanced type definitions and null checking
