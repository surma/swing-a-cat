# Active Context: To Swing a Cat

## Current Work Focus
The project has a solid foundation with LittleJS engine integration and basic player mechanics. Current focus should be on implementing the core swinging mechanics and tail collection system. The codebase shows a working player with physics, level loading, and particle effects.

## Recent Changes
- Analyzed current main.ts implementation in detail
- Identified specific technical patterns and configurations in use
- Updated memory bank to reflect actual code state
- Documented current player physics values and rendering setup
- **COMPLETED**: Enhanced LDTK Vite plugin to handle texture imports automatically
- **COMPLETED**: Refactored plugin code for better readability and maintainability

## Current State Analysis

### What's Working
- **Engine Setup**: LittleJS properly initialized with TypeScript and OffscreenCanvas texture generation
- **Basic Player**: Player class with speed=0.03, cyan color (hsl(0.5,1,0.5)), size 1x1 unit
- **Level System**: LDTK integration functional - loads "Level_1", positions camera, redraws layer
- **Rendering**: Pixelated canvas with HSL color system, debug grid (10x10 purple rectangles), debug lines
- **Input**: Arrow key movement (0.03 speed) and space bar jumping (0.3 acceleration)
- **Physics**: Gravity -0.01, tile collision enabled (32x32 tiles), WASD emulation enabled
- **Particles**: Complex particle emitter at spawn point with physics, collision, and trail effects

### What's Missing (Core Features)
1. **Swinging Mechanics**: No tail-based swinging implemented
2. **Tail Collection**: No collectible system exists
3. **Ability Progression**: No progression system tied to tail count
4. **Audio**: Neither SoundBox nor zzfx integrated
5. **Level Design**: Only basic test level exists
6. **Cat Character**: Player is just a colored rectangle

### Current Technical Debt
- Debug rendering code in gameRender() (10x10 grid + diagonal lines) should be removed
- Commented-out code blocks need cleanup (canvas size, physics solver, layer scaling)
- Player instantiated globally (const p) rather than in proper game state
- No proper game state management or scene system
- Missing type definitions for game-specific objects (tail collectibles, abilities)
- No audio system architecture (SoundBox/zzfx not integrated)

## Next Steps (Priority Order)

### Immediate (Next Session)
1. **Clean up main.ts**: Remove debug rendering, organize code structure
2. **Implement Cat Player**: Create proper cat character with visual representation
3. **Basic Swinging**: Implement single-tail swinging mechanics
4. **Tail Collectibles**: Add collectible objects to levels

### Short-term (Next Few Sessions)
1. **Ability System**: Create progression system for multiple tails
2. **Level Design**: Create proper levels with swing points and collectibles
3. **Audio Integration**: Add SoundBox and zzfx for music and effects
4. **Visual Polish**: Improve pixel art representation

### Medium-term (Before Contest)
1. **Game Balance**: Tune physics and difficulty
2. **Size Optimization**: Ensure 13KB limit compliance
3. **Polish Pass**: Final visual and audio improvements
4. **Testing**: Comprehensive gameplay testing

## Active Decisions & Considerations

### Swinging Mechanics Design
- **Anchor System**: Use level geometry or special anchor points in LDTK levels?
- **Physics Model**: Rope physics vs simplified arc movement? (Current physics: gravity -0.01, light feel)
- **Control Scheme**: Mouse for aim or keyboard-only? (Currently arrow keys + space)
- **Integration**: How to connect with existing Player class and physics system?

### Progression System
- **Tail Count**: How many tails total? (Suggest 3-5 for scope)
- **Abilities**: What specific abilities per tail?
  - Tail 1: Basic swinging (starting ability)
  - Tail 2: Longer reach or double swing?
  - Tail 3: Wall climbing or dash ability?
- **Visual Feedback**: How to show tail count and abilities in minimal UI?

### Technical Architecture
- **State Management**: Simple global state vs proper state machine?
- **Entity System**: Extend current EngineObject pattern or create custom?
- **Level Format**: Continue with LDTK or simplify for size constraints?

## Blockers & Questions
- LDTK integration appears functional but needs testing with more complex levels
- Audio library integration strategy needs clarification (SoundBox + zzfx)
- Size budget allocation between code, audio, and level data
- Should debug rendering be removed before implementing core mechanics?
- How to transition from current simple movement to swinging-based movement?

## Development Environment Notes
- Vite dev server working correctly
- TypeScript compilation clean
- All dependencies properly installed
- LDTK level file exists but needs proper integration
