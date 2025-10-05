# Multiplayer Architecture Documentation

## Overview

The Drazzan Invasion multiplayer system provides a comprehensive game mode selection and lobby management system that supports both single-player and multiplayer gameplay. The architecture is designed to bridge the gap between the existing P2P networking infrastructure and actual game mechanics.

## Key Components

### 1. GameModeManager (`client/js/pwa/game-mode-manager.js`)

The central orchestrator for all multiplayer functionality.

**Responsibilities:**
- Mode selection and validation
- Player session management
- Lobby state coordination
- Network integration
- Game lifecycle management

**Key Features:**
- **Mode Support**: Single Player, Cooperative, Versus, and Join via Code
- **Deep Linking**: URL-based game joining (`?game=ABCD1234`)
- **Host Migration**: Automatic host transfer when host disconnects
- **Ad-hoc Join/Leave**: Players can join/leave during lobby and gameplay
- **State Persistence**: Maintains game state across mode switches

```javascript
// Usage Example
const manager = new GameModeManager();
await manager.initialize();
manager.setMode('coop'); // Switch to cooperative mode
manager.createLobby(); // Create multiplayer lobby
```

### 2. GameModeUI (`client/js/pwa/game-mode-ui.js`)

Handles all user interface aspects of multiplayer functionality.

**UI Screens:**
- **Mode Selection**: Choose between Single, Cooperative, Versus, or Join Game
- **Lobby Interface**: Player management, game settings, ready states
- **Status Messages**: Connection states, errors, game starting notifications
- **Share Options**: QR codes, game links, clipboard copying

**Design Features:**
- Retro sci-fi aesthetic matching game theme
- Responsive grid layouts
- Real-time player status updates
- Animated transitions and hover effects
- Mobile-friendly touch interactions

**Key UI Elements:**
```javascript
// Player list with status indicators
<div class="player-item">
    <span class="player-name player-host">👑 Player Name</span>
    <span class="player-status player-ready">✓ Ready</span>
</div>

// Game code sharing
<div class="game-code">Game Code: <strong>ABCD1234</strong></div>
```

### 3. MultiplayerGame (`client/js/pwa/multiplayer-game.js`)

Converts single-player game mechanics to support multiple players.

**Core Adaptations:**
- **Player Management**: Converts single `player` object to `Map<playerId, playerData>`
- **Game Objects**: Tracks lasers, explosions by player ID
- **Collision Detection**: Handles player-player, player-environment interactions
- **State Synchronization**: Network-aware game state management
- **Mode-Specific Logic**: Different behavior for cooperative vs. versus modes

**Game Modes:**

#### Cooperative Mode
- **Shared Lives**: Team pool of lives (default 9 total)
- **Shared Score**: Combined team scoring
- **Revive System**: Players can revive fallen teammates
- **No Friendly Fire**: Player attacks don't damage teammates
- **Win Condition**: Complete all waves together
- **Lose Condition**: All lives depleted or all players eliminated

#### Versus Mode
- **Individual Scoring**: Separate scores per player
- **Friendly Fire**: Players can damage each other
- **Power-Up Competition**: Limited power-ups create competition
- **Time Limit**: Games end after set duration (default 5 minutes)
- **Win Condition**: Highest score or last player standing
- **Lose Condition**: Time expires or eliminated

```javascript
// Game state structure
gameState = {
    mode: 'coop' | 'versus' | 'single',
    players: Map<playerId, PlayerState>,
    isActive: boolean,
    gameTime: number,
    scores: Map<playerId, number>
}

// Player state structure
PlayerState = {
    id: string,
    name: string,
    x, y: number, // Position
    vx, vy: number, // Velocity
    angle: number, // Rotation
    health: number, // 0-100
    score: number,
    lives: number,
    isActive: boolean,
    inputState: InputState
}
```

## Architecture Integration

### Network Layer Integration

The multiplayer system integrates with the existing WebRTC P2P networking:

```javascript
// Network manager integration
gameManager.setNetworkManager(networkManager);

// Message handling
networkManager.on('message', (data) => {
    switch(data.type) {
        case 'gameStateSync':
            multiplayerGame.applyGameState(data);
            break;
        case 'playerJoin':
            gameManager.handlePlayerJoin(data.player);
            break;
    }
});
```

### WebAssembly Server Integration

The system works with the existing WASM server architecture:

- **Game Servers**: Host authoritative game state
- **Peer Validation**: Cross-validate game state between peers
- **Fallback Mode**: JavaScript-only mode when WASM unavailable

### Progressive Web App Integration

Full PWA compatibility maintained:

- **Offline Mode**: Single-player works without network
- **Service Worker**: Caches multiplayer UI assets
- **Manifest**: Supports multiplayer deep linking
- **Desktop App**: Electron wrapper includes multiplayer features

## Implementation Details

### State Synchronization

The multiplayer system uses a hybrid synchronization approach:

1. **Authoritative Host**: Host maintains canonical game state
2. **Peer Validation**: Non-host peers validate and predict
3. **Rollback Support**: Corrects prediction errors
4. **Tick Rate**: 60 FPS game logic, 1-second sync intervals

```javascript
// Sync data structure
const syncData = {
    type: 'gameStateSync',
    timestamp: Date.now(),
    gameTime: this.gameState.gameTime,
    players: this.serializePlayers(),
    gameObjects: this.serializeGameObjects(),
    scores: Object.fromEntries(this.gameState.scores)
};
```

### Player Management

Dynamic player management supports real-time join/leave:

```javascript
// Add player to active game
addPlayer(playerId, playerData) {
    const player = {
        id: playerId,
        name: playerData.name,
        x: this.getSpawnPosition(playerId).x,
        y: this.getSpawnPosition(playerId).y,
        health: 100,
        score: 0,
        lives: 3,
        // ... other properties
    };
    
    this.gameState.players.set(playerId, player);
    this.gameObjects.players.set(playerId, player);
}
```

### Collision Detection

Extended collision system for multiplayer:

- **Player-Asteroid**: Damage and knockback
- **Player-Enemy**: Health reduction
- **Player-Player**: Versus mode damage, cooperative bouncing
- **Laser-Player**: Friendly fire in versus mode
- **Player-PowerUp**: Individual collection

## File Structure

```
client/js/pwa/
├── game-mode-manager.js     # Central multiplayer coordinator
├── game-mode-ui.js          # UI components and screens
└── multiplayer-game.js      # Game logic adaptation

docs/
├── multiplayer-architecture.md  # This documentation
└── api-reference.md            # API documentation (future)
```

## Global API

The system provides a global API for easy integration:

```javascript
// Global instance available immediately
window.gameModeManager

// Key methods
gameModeManager.initialize()         // Setup multiplayer system
gameModeManager.setMode(mode)        // Change game mode
gameModeManager.createLobby()        # Create multiplayer lobby
gameModeManager.joinLobby(code)      // Join existing lobby
gameModeManager.startGame()          // Begin gameplay
gameModeManager.showModeSelection()  // Return to mode selection
```

## Integration Points

### Existing Game Components

The multiplayer system integrates with existing components:

- **Canvas**: Shared rendering surface
- **Input**: Per-player input handling
- **Collisions**: Extended for player interactions
- **Explosions**: Multi-source explosion management
- **Scoreboard**: Multi-player score tracking

### Network Integration

```javascript
// Required network manager interface
interface NetworkManager {
    broadcast(data: any): void;
    on(event: string, handler: Function): void;
    joinGame(gameCode: string): void;
    createGame(): Promise<string>;
}
```

## Development Workflow

### Single Player Development

For local development and debugging:

1. **Mode Selection**: Choose "Single Player" 
2. **Direct Start**: Bypasses networking setup
3. **Local State**: No network synchronization
4. **Debug Access**: Full game state inspection

### Multiplayer Development

For multiplayer testing:

1. **Local Host**: Test host functionality locally
2. **Multiple Tabs**: Simulate multiple players
3. **Network Simulation**: Test with artificial latency
4. **State Inspection**: Monitor synchronization

## Performance Considerations

### Memory Management

- **Player Cleanup**: Automatic cleanup on disconnect
- **State History**: Limited rollback buffer (10 frames)
- **Object Pooling**: Reuse game objects where possible

### Network Efficiency

- **Delta Compression**: Only sync changed data
- **Prioritization**: Critical updates sent immediately
- **Batching**: Non-critical updates batched

### UI Performance

- **Lazy Rendering**: Only update visible elements
- **CSS Transforms**: Hardware-accelerated animations
- **Event Debouncing**: Prevent excessive updates

## Error Handling

### Network Errors

- **Connection Loss**: Graceful degradation to single-player
- **Host Migration**: Automatic host transfer
- **Sync Conflicts**: Rollback and re-sync

### Game Errors

- **Player State Corruption**: Reset to last valid state
- **Collision Edge Cases**: Fallback collision resolution
- **Memory Issues**: Automatic garbage collection

## Future Extensions

### Planned Features

- **Spectator Mode**: Watch ongoing games
- **Replay System**: Record and playback games
- **Tournament Mode**: Bracket-style competitions
- **Custom Maps**: User-generated content support

### API Extensions

```javascript
// Future API additions
gameModeManager.enableSpectatorMode();
gameModeManager.startReplay(replayData);
gameModeManager.createTournament(settings);
```

## Testing Strategy

### Unit Tests

- Component isolation testing
- State management validation
- UI interaction testing

### Integration Tests

- End-to-end multiplayer flow
- Network failure scenarios
- Cross-browser compatibility

### Performance Tests

- Synchronization latency
- Memory usage patterns
- UI responsiveness metrics

This architecture provides a solid foundation for both current multiplayer needs and future enhancements while maintaining compatibility with the existing single-player codebase.