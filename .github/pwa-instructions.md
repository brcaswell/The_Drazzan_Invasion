# PWA System Instructions

## Apply to: `client/js/pwa/*.js` (Progressive Web App & Multiplayer)

### Context
These files implement the Progressive Web App features and multiplayer system for The Drazzan Invasion. They use modern JavaScript ES6+ modules and are designed for network-optional, offline-first operation.

### Architecture Principles
1. **Offline First**: All features must work without network connection
2. **Progressive Enhancement**: Multiplayer enhances single-player, doesn't replace it
3. **P2P Networking**: No central servers, WebRTC peer-to-peer only
4. **Module System**: Use ES6 imports/exports exclusively
5. **Browser Native**: No build tools required, runs directly in browser

### Core Components

#### GameModeManager (`game-mode-manager.js`)
- Central coordinator for all multiplayer functionality
- Manages mode selection, lobby state, player sessions
- **Pattern**: Event-driven architecture with callbacks
- **Integration**: Bridges old single-player with new multiplayer

```javascript
// Established patterns
class GameModeManager {
    constructor() {
        this.currentMode = 'single'; // always default to single
        this.callbacks = { onModeChange: [], onPlayerJoin: [] };
    }
    
    // Always provide fallbacks
    startSinglePlayer() {
        try {
            this.singlePlayerGame.initialize();
        } catch (error) {
            // Fallback to original game
            if (typeof startGame === 'function') startGame();
        }
    }
}
```

#### GameModeUI (`game-mode-ui.js`)
- Handles all multiplayer UI elements
- **Style**: Retro sci-fi aesthetic with CSS-in-JS
- **Responsive**: Mobile-first design principles
- **Accessibility**: Keyboard navigation and screen reader support

```javascript
// UI Creation Pattern  
createMainContainer() {
    this.elements.container = document.createElement('div');
    this.elements.container.className = 'game-mode-ui';
    document.body.appendChild(this.elements.container);
}

// Always cleanup on hide
hide() {
    this.elements.container.classList.add('hidden');
    this.clearCountdown();
}
```

#### MultiplayerGame (`multiplayer-game.js`)
- Converts single-player mechanics to multiplayer
- **State Management**: Centralized game state with Map objects
- **Synchronization**: Host-authoritative with client prediction
- **Collision**: Extended collision detection for player interactions

```javascript
// Player management pattern
addPlayer(playerId, playerData) {
    const player = { /* player object */ };
    this.gameState.players.set(playerId, player);
    this.gameObjects.players.set(playerId, player);
    // Always maintain referential integrity
}
```

#### SinglePlayerGame (`single-player-game.js`)
- Wraps existing single-player logic in new architecture
- **Compatibility**: Works with existing global objects
- **Validation**: Checks for component availability
- **Fallback**: Graceful degradation if components missing

### Development Guidelines

#### ES6 Module Usage
```javascript
// File header pattern
import { GameModeUI } from './game-mode-ui.js';
import { MultiplayerGame } from './multiplayer-game.js';

// Class definition
class GameModeManager {
    // Implementation
}

// Global registration for backward compatibility
if (typeof window !== 'undefined') {
    window.GameModeManager = GameModeManager;
    window.gameModeManager = new GameModeManager();
}

// Module export
export { GameModeManager };
```

#### Error Handling Patterns
```javascript
// Always provide fallbacks
async function initializeSystem() {
    try {
        await this.setupMultiplayer();
    } catch (error) {
        console.error('[PWA] Multiplayer failed, using single-player:', error);
        this.fallbackToSinglePlayer();
    }
}

// Network-optional operations
if (this.networkManager && this.networkManager.isConnected()) {
    this.networkManager.broadcast(data);
} else {
    console.log('[PWA] Offline mode, skipping network operation');
}
```

#### State Management
```javascript
// Use Maps for player data
this.activePlayers = new Map(); // playerId -> PlayerState
this.gameObjects = {
    players: new Map(),
    lasers: new Map(), // by player ID
    asteroids: [], // shared objects
};

// Always validate state
getGameState() {
    return {
        mode: this.currentMode,
        playerCount: this.activePlayers.size,
        isActive: this.gameState?.isActive || false
    };
}
```

### Integration with Core Game

#### Backward Compatibility
```javascript
// Check for existing objects before use
validateGameComponents() {
    const required = ['canvas', 'player', 'lasers', 'CONFIG'];
    const missing = required.filter(name => typeof window[name] === 'undefined');
    
    if (missing.length > 0) {
        this.initializeMissingComponents(missing);
    }
}
```

#### Global Object Access
```javascript
// Access existing game objects safely
setupGameState() {
    this.canvas = window.canvas;
    this.player = window.player;
    this.lasers = window.lasers || [];
    this.config = window.CONFIG || this.defaultConfig;
}
```

### WebRTC Integration

#### Network Message Handling
```javascript
// Standard message structure
const message = {
    type: 'gameStateSync',
    timestamp: Date.now(),
    data: { /* game data */ }
};

// Always validate incoming messages
handleNetworkMessage(message) {
    if (!message.type || !message.timestamp) {
        console.warn('[PWA] Invalid network message');
        return;
    }
    
    switch (message.type) {
        case 'gameStateSync':
            this.applyGameState(message.data);
            break;
    }
}
```

### Testing & Debugging

#### Console Integration
```javascript
// Always provide debug functions
window.gameIntegration = {
    test: () => this.runSystemTests(),
    showModes: () => this.ui.showModeSelection(),
    testSinglePlayer: () => this.startSinglePlayer()
};
```

#### Performance Monitoring
```javascript
// Track performance metrics
update(deltaTime) {
    const startTime = performance.now();
    
    // Game logic here
    
    const endTime = performance.now();
    if (endTime - startTime > 16.67) { // > 60fps threshold
        console.warn('[PWA] Frame time exceeded 16.67ms');
    }
}
```

### Anti-Patterns for PWA Files

❌ **Avoid:**
- External dependencies or npm packages
- Build tools or compilation steps
- Server-side requirements
- Breaking single-player functionality
- Blocking network operations

✅ **Use instead:**
- Vanilla JavaScript with ES6 modules
- Browser-native APIs only
- Offline-first design
- Progressive enhancement
- Non-blocking network calls with fallbacks

This ensures the PWA system remains lightweight, performant, and maintains the project's core principle of browser-native operation.

## AI-Assisted PWA Development

### Session-Based Development
PWA components are ideal for AI-assisted development due to:
- **Modern Patterns**: ES6 modules, async/await, class-based architecture
- **Standard APIs**: WebRTC, Service Workers, IndexedDB follow web standards
- **Modular Design**: Clear separation of concerns aids AI understanding

### Feature Branch Context for PWA Work
```bash
# Example: Multiplayer lobby feature branch
feature/ai-multiplayer-lobby

# Files typically modified together:
client/js/pwa/game-mode-manager.js     # Core logic
client/js/pwa/game-mode-ui.js          # UI components
client/js/pwa/network-manager.js       # Network integration
docs/multiplayer-architecture.md       # Updated architecture
```

### AI Effectiveness in PWA Development
**High AI Value:**
- ES6 class structure and method generation
- Event handling patterns and callbacks
- UI component generation and styling
- Network message handling boilerplate

**Human Oversight Required:**
- WebRTC connection negotiation logic
- Game-specific state synchronization
- Performance optimization decisions
- User experience design choices

### Git Staging Strategy for PWA
```bash
# Stage PWA components by feature
git add client/js/pwa/game-mode-*.js   # All game mode related files
git add client/manifest.json           # PWA manifest updates
git add docs/pwa-architecture.md       # Architecture documentation

# Include related configuration
git add client/index.html              # Script loading updates
git add .github/pwa-instructions.md    # Updated AI instructions
```