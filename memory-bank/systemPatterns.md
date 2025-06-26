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
  speed: number = 3;
  // Physics properties inherited from EngineObject
  // Rendering properties inherited from EngineObject
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
- **Horizontal**: Direct position manipulation with speed * timeDelta
- **Vertical**: Physics-based with gravity and acceleration
- **Jump**: Impulse-based using `applyAcceleration(vec2(0, 0.3))`

## Rendering System

### Pixel Art Pipeline
- **Canvas Setup**: `setCanvasPixelated(true)` for crisp pixels
- **Color System**: HSL-based colors for easy manipulation
- **Layered Rendering**:
  1. Background elements in `gameRender()`
  2. Entities rendered automatically by engine
  3. UI/effects in `gameRenderPost()`

### Current Rendering Elements
- **Debug Grid**: 10x10 purple rectangles for spatial reference
- **Debug Lines**: Diagonal lines for coordinate verification
- **Particles**: Emitter system with physics and collision

## Data Management

### Level Data Flow
```
LDTK File → ldtkLevel() → { layer, spawnPos } → Game World
```

### Asset Management
- **Procedural Textures**: OffscreenCanvas for generating simple textures
- **Minimal Assets**: Single empty texture as base
- **Color-Based Graphics**: Rely on HSL colors rather than sprites

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
- **Development Aids**: Console logging for debugging (to be removed in production)
- **Asset Fallbacks**: Default textures if generation fails
