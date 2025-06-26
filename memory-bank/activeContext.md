# Active Context: To Swing a Cat

## Current Work Focus
Building the foundational memory bank for the js13k game "To Swing a Cat". The project has a basic LittleJS setup with a simple player character, but needs the core swinging mechanics and tail collection system implemented.

## Recent Changes
- Created complete memory bank structure with all core files
- Analyzed existing codebase to understand current implementation
- Documented technical architecture and patterns in use

## Current State Analysis

### What's Working
- **Engine Setup**: LittleJS properly initialized with TypeScript
- **Basic Player**: Simple player object with movement and physics
- **Level System**: LDTK integration partially functional
- **Rendering**: Pixelated canvas with HSL color system
- **Input**: Arrow key movement and space bar jumping
- **Physics**: Gravity and collision detection configured

### What's Missing (Core Features)
1. **Swinging Mechanics**: No tail-based swinging implemented
2. **Tail Collection**: No collectible system exists
3. **Ability Progression**: No progression system tied to tail count
4. **Audio**: Neither SoundBox nor zzfx integrated
5. **Level Design**: Only basic test level exists
6. **Cat Character**: Player is just a colored rectangle

### Current Technical Debt
- Debug rendering code cluttering main.ts
- No proper game state management
- Missing type definitions for game-specific objects
- No audio system architecture

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
- **Anchor System**: Use level geometry or special anchor points?
- **Physics Model**: Rope physics vs simplified arc movement?
- **Control Scheme**: Mouse for aim or keyboard-only?

### Progression System
- **Tail Count**: How many tails total? (Suggest 3-5 for scope)
- **Abilities**: What specific abilities per tail?
  - Tail 1: Basic swinging
  - Tail 2: Longer reach or double swing?
  - Tail 3: Wall climbing or dash ability?

### Technical Architecture
- **State Management**: Simple global state vs proper state machine?
- **Entity System**: Extend current EngineObject pattern or create custom?
- **Level Format**: Continue with LDTK or simplify for size constraints?

## Blockers & Questions
- Need to understand LDTK integration better (currently partially working)
- Audio library integration strategy needs clarification
- Size budget allocation between code, audio, and level data

## Development Environment Notes
- Vite dev server working correctly
- TypeScript compilation clean
- All dependencies properly installed
- LDTK level file exists but needs proper integration
