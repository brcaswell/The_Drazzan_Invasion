# JavaScript Development Instructions

## Apply to: `client/js/**/*.js` (Core Game Files)

### Context
These are the original single-player game components that form the foundation of The Drazzan Invasion. When modifying or extending these files, maintain backward compatibility and existing patterns.

### Core Principles
1. **Maintain Single Player**: Never break existing single-player functionality
2. **Global Objects**: Use established global variables (`player`, `canvas`, `lasers`, etc.)
3. **Performance First**: Target 60 FPS, optimize for requestAnimationFrame
4. **Canvas Rendering**: Use efficient 2D canvas operations
5. **Input Handling**: Follow existing keyboard/mouse input patterns

### Established Patterns

#### Game Object Structure
```javascript
// Standard game object pattern
const gameObject = {
    x: 0, y: 0,           // Position
    vx: 0, vy: 0,         // Velocity  
    angle: 0,             // Rotation
    size: 20,             // Collision radius
    health: 100,          // Health points
    
    move() {
        this.x += this.vx;
        this.y += this.vy;
    },
    
    draw(ctx) {
        // Canvas rendering code
    }
};
```

#### Component Integration
```javascript
// Always check for existence before use
if (typeof player !== 'undefined' && player.move) {
    player.move(keys);
}

// Use existing collision detection
if (typeof checkCollision === 'function') {
    return checkCollision(obj1, obj2);
}
```

### File-Specific Guidelines

#### `gameloop.js`
- Contains main update loop and game state management
- When extending: add new update calls at end of existing update()
- Maintain global variables: `gameOver`, `score`, `asteroidIncreaseTimer`
- Don't modify collision detection logic without testing

#### `player.js` 
- Defines Player class and global `player` instance
- When extending: add new methods, don't modify existing movement
- Respects `keys` object for input handling
- Screen wrapping and physics are established patterns

#### `canvas.js`
- Manages canvas setup and resize handling
- Global `canvas` and `ctx` objects used throughout
- Don't modify unless adding new rendering features
- Maintains responsive canvas sizing

#### `collisions.js`
- Defines `checkCollision()` function used everywhere
- Established circular collision detection
- When extending: add new collision types, don't change existing

### Multiplayer Integration Guidelines

When adding multiplayer support to these files:

1. **Preserve Single Player**: Keep original code paths intact
2. **Conditional Logic**: Use flags to detect multiplayer mode
3. **Object Arrays**: Convert single objects to arrays when needed
4. **State Sync**: Mark state changes that need network sync

```javascript
// Good multiplayer integration pattern
function updatePlayers() {
    if (isMultiplayer) {
        players.forEach(player => player.move(player.inputState));
    } else {
        // Original single player code
        player.move(keys);
    }
}
```

### Testing Requirements

- Test changes in browser console first
- Verify single-player mode still works
- Check performance with multiple objects
- Test screen wrapping and collision edge cases

### Common Anti-Patterns

❌ **Don't do:**
```javascript
// Breaking existing references
window.player = new MultiplayerPlayerManager();

// Modifying global collision function
function checkCollision(a, b, newParam) { /* changed signature */ }

// Adding dependencies
import { SomeLibrary } from './external-lib.js';
```

✅ **Do instead:**
```javascript
// Extend existing objects
if (window.player) {
    window.player.multiplayerExtensions = new MultiplayerFeatures();
}

// Create new collision functions
function checkMultiplayerCollision(a, b) {
    return checkCollision(a, b); // use existing
}

// Keep dependencies minimal
// Use only existing global objects and vanilla JavaScript
```

This maintains the established architecture while allowing for multiplayer enhancements.

## AI-Assisted Development Context

### Feature Branch Awareness
When working on core game files, always consider:
- **Current Feature**: What specific functionality is being added/modified
- **Integration Impact**: How changes affect existing single-player functionality
- **Testing Requirements**: Which existing systems need validation after changes
- **Documentation Updates**: Update relevant architecture docs and session logs

### Git Staging for JavaScript Changes
```bash
# Good: Stage specific game component changes
git add client/js/gameloop.js          # Modified for multiplayer support
git add client/js/player.js            # Enhanced player class
git add docs/gameloop-analysis.md      # Updated analysis

# Avoid: Staging unrelated JavaScript files
# git add client/js/                   # Too broad, includes unmodified files
```

### AI Assistance Patterns
- **Code Generation**: AI excels at boilerplate and pattern matching
- **Integration Logic**: Human oversight needed for game-specific logic
- **Performance**: AI can suggest optimizations, humans validate impact
- **Compatibility**: AI helps identify breaking changes, humans make decisions