---
ai_context:
  type: tech-specific
  role: technology-guide
  scope: generic
  technology: javascript
  categories: [javascript, browser-native, es6]
  format_version: "2.0"
last_updated: "2025-11-23"
---

<!-- AI-CONTEXT: javascript-patterns -->
<!-- SCOPE: generic -->

# JavaScript Instructions for Browser-Native Applications

## @AI-SECTION: conventions

### ES6+ Module System
- **Modules**: Use ES6 modules (`import`/`export`) exclusively
- **Classes**: Use modern class syntax
- **Async**: Prefer `async`/`await` over promises
- **Naming Conventions**: 
  - Classes: `PascalCase`
  - Functions/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.js`

### File Organization Patterns
```javascript
// ✅ Good: Clear module structure
export class ComponentManager {
    constructor() {
        this.components = new Map();
    }
    
    async loadComponent(name) {
        const module = await import(`./components/${name}.js`);
        return new module.default();
    }
}

// Export to window for global access (browser-native pattern)
window.ComponentManager = ComponentManager;
```

## @AI-SECTION: file-patterns

### Apply to: `**/*.js` (Core Application Files)
- Follow existing single-player patterns when extending
- Always check for global object existence before use
- Use existing canvas and input systems
- Maintain 60 FPS performance targets

### Apply to: `**/pwa/*.js` (Multiplayer System)
- Use modern ES6+ features and modules
- Implement proper error handling and fallbacks
- Design for offline-first, network-optional operation
- Follow established GameModeManager patterns

### Apply to: `**/component/*.js` (Component Files)
- Implement lifecycle methods: `init()`, `update()`, `destroy()`
- Export component class as default export
- Provide fallbacks for missing dependencies
- Use dependency injection patterns

## @AI-SECTION: file-specific-guidelines

### Core Game Files - Established Patterns

#### `gameloop.js`
- **Purpose**: Contains main update loop and game state management
- **Extension Pattern**: Add new update calls at end of existing `update()` function
- **Global Variables**: Maintain `gameOver`, `score`, `gameTimer`
- **Critical Rule**: Don't modify collision detection logic without comprehensive testing
- **Performance**: Target 60 FPS with requestAnimationFrame

#### `player.js` 
- **Purpose**: Defines Player class and global `player` instance
- **Extension Pattern**: Add new methods, don't modify existing movement logic
- **Input Handling**: Respects `keys` object for input handling
- **Physics**: Screen wrapping and physics are established patterns
- **Global Access**: `window.player` available for debug and integration

#### `canvas.js`
- **Purpose**: Manages canvas setup and resize handling
- **Global Objects**: `canvas` and `ctx` objects used throughout application
- **Modification Rule**: Don't modify unless adding new rendering features
- **Responsive Design**: Maintains responsive canvas sizing automatically
- **Integration**: All draw functions expect `ctx` parameter

#### `collisions.js`
- **Purpose**: Defines `checkCollision()` function used everywhere
- **Algorithm**: Established circular collision detection
- **Extension Pattern**: Add new collision types, don't change existing logic
- **Performance**: Optimized for real-time collision detection
- **Global Access**: `checkCollision(obj1, obj2)` available globally

## @AI-SECTION: patterns

### Game Object Structure Pattern
**Pattern**: Standard game entity structure for browser-native applications
```javascript
// Standard game object pattern - maintain consistency across all game entities
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
        // Canvas rendering code - always accept ctx parameter
    },
    
    update(deltaTime) {
        // Game logic updates - use deltaTime for frame independence
    }
};
```

### Component Integration Pattern
**Pattern**: Safe integration with existing browser-native code
```javascript
// Always check for existence before use - browser-native safety
if (typeof player !== 'undefined' && player.move) {
    player.move(keys);
}

// Use existing collision detection
if (typeof checkCollision === 'function') {
    return checkCollision(obj1, obj2);
}

// Global object access pattern
if (window.gameState && window.gameState.isActive) {
    // Safe to proceed with game logic
}
```

### Global State Management in Vanilla JS
**Pattern**: Explicit window object synchronization for cross-component access
```javascript
// Component should export to window for global access
class ApplicationState {
    constructor() {
        this.gameMode = 'single';
        this.isActive = false;
    }
    
    setState(newState) {
        Object.assign(this, newState);
        // Synchronize with window globals
        this.syncGlobalVariables();
    }
    
    syncGlobalVariables() {
        // Export key state to window for debug console access
        window.applicationState = this;
        window.gameMode = this.gameMode;
        window.isActive = this.isActive;
    }
}
```

### Component Communication Pattern
```javascript
// ✅ Good: Event-driven communication
class ComponentA {
    init() {
        this.eventBus = window.eventBus || new EventTarget();
        this.eventBus.addEventListener('data-updated', this.handleDataUpdate.bind(this));
    }
    
    handleDataUpdate(event) {
        console.log('Received update:', event.detail);
    }
}

// ✅ Good: Global access for PWA components
class ComponentB {
    updateData(data) {
        // Notify other components
        const event = new CustomEvent('data-updated', { detail: data });
        window.eventBus.dispatchEvent(event);
    }
}
```

### Performance Patterns
```javascript
// ✅ Good: 60 FPS performance considerations
class GameLoop {
    constructor() {
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
    }
    
    update(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= this.frameTime) {
            // Update game logic
            this.updateComponents(deltaTime);
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame(this.update.bind(this));
    }
}
```

## @AI-SECTION: debug-patterns

### Debug Console Integration
```javascript
// Command implementations should validate state
class DebugCommand {
    execute(commandName, ...args) {
        // Validate required components exist
        const required = ['applicationState', 'canvas', 'inputManager'];
        const missing = required.filter(name => typeof window[name] === 'undefined');
        
        if (missing.length > 0) {
            return `Missing components: ${missing.join(', ')}. Start application first.`;
        }
        
        // Safe to proceed with command
        return this.executeCommand(commandName, args);
    }
}
```

### Case-Sensitive Command Matching
```javascript
// ✅ Correct: Respect exact casing for developer UX
const command = this.input.value; // Keep original casing
const cmd = this.commands.get(command); // Exact match

// ❌ Incorrect: Don't force case conversion
const commandKey = this.input.value.toLowerCase();
const cmd = this.commands.get(commandKey);
```

## @AI-SECTION: best-practices

### Error Handling
```javascript
// ✅ Good: Graceful degradation
async function loadOptionalComponent() {
    try {
        const module = await import('./optional-component.js');
        return new module.default();
    } catch (error) {
        console.warn('Optional component failed to load:', error);
        return new FallbackComponent();
    }
}
```

### Memory Management
```javascript
// ✅ Good: Proper cleanup
class ComponentManager {
    destroy() {
        // Clean up event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        // Clear references
        this.components.clear();
        this.eventListeners = [];
    }
}
```

### Progressive Enhancement for UI Features
```javascript
// ✅ Good: Non-intrusive feature addition
class AutocompleteInput {
    constructor(inputElement) {
        this.input = inputElement;
        this.setupBasicInput();
        this.setupAdvancedFeatures();
    }
    
    setupBasicInput() {
        // Core functionality works without autocomplete
        this.input.addEventListener('keydown', this.handleBasicInput.bind(this));
    }
    
    setupAdvancedFeatures() {
        // Enhanced features don't break basic functionality
        this.input.addEventListener('keydown', this.handleAutocomplete.bind(this));
    }
}
```

## @AI-SECTION: anti-patterns

### Avoid These Patterns
```javascript
// ❌ Bad: Blocking main thread
function heavyComputation() {
    for (let i = 0; i < 1000000; i++) {
        // Synchronous heavy work
    }
}

// ✅ Good: Use Web Workers or chunk work
async function heavyComputationAsync() {
    return new Promise(resolve => {
        const worker = new Worker('./heavy-computation-worker.js');
        worker.onmessage = (e) => resolve(e.data);
        worker.postMessage({ start: true });
    });
}

// ❌ Bad: Memory leaks in long-running applications
class LeakyComponent {
    init() {
        setInterval(() => {
            this.data.push(new Date()); // Never cleaned up
        }, 1000);
    }
}

// ✅ Good: Proper cleanup
class CleanComponent {
    init() {
        this.interval = setInterval(() => {
            this.pruneOldData();
        }, 1000);
    }
    
    destroy() {
        clearInterval(this.interval);
    }
}
```

---

**🔗 Related**: See `pwa.md` for multiplayer patterns, `html.md` for module loading, and project-specific instructions for application-specific implementations.