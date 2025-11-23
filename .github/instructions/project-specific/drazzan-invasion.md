---
ai_context:
  type: project-specific
  role: project-guide
  scope: drazzan-invasion
  project: the-drazzan-invasion
  categories: [space-shooter, asteroids-like, browser-game]
  format_version: "2.0"
last_updated: "2025-11-23"
---

<!-- AI-CONTEXT: drazzan-invasion-specifics -->
<!-- SCOPE: project-specific -->

# The Drazzan Invasion - Project-Specific Instructions

## @AI-SECTION: project-overview

### Game Description
**The Drazzan Invasion** is a browser-native space shooter game inspired by classic arcade games like Asteroids. Players control a spaceship defending against the Drazzan alien invasion in space.

### Core Game Mechanics
- **Movement**: 360-degree rotation, thrust-based movement with momentum
- **Combat**: Projectile-based laser weapons with limited ammunition
- **Enemies**: Multiple enemy types with different AI behaviors and attack patterns
- **Powerups**: Collectible items that enhance ship capabilities
- **Boss Battles**: Large enemy motherships with complex attack patterns
- **Scoring**: Point-based system with high score tracking

### Current File Structure
```
The_Drazzan_Invasion/
├── index.html                      # Main entry point
├── main.js                         # Application initialization
├── gameloop.js                     # Core game loop and timing
├── canvas.js                       # Canvas management and rendering
├── input.js                        # Keyboard and input handling
├── player.js                       # Player ship mechanics
├── enemy.js                        # Enemy AI and behaviors  
├── asteroids.js                    # Asteroid mechanics
├── lasers.js                       # Player projectile system
├── enemyLaser.js                   # Enemy projectile system
├── bossLaser.js                    # Boss weapon system
├── explosions.js                   # Explosion effects and animations
├── powerup.js                      # Powerup items and effects
├── collisions.js                   # Collision detection system
├── scoreboard.js                   # Scoring and UI display
├── intro.js                        # Game intro/menu system
├── config.js                       # Game configuration and constants
├── utils.js                        # Utility functions
├── styles.css                      # Game styling
├── README.md                       # Project documentation
└── assets/                         # Game assets
    ├── spaceship.png              # Player ship sprite
    ├── enemy.png                  # Enemy ship sprite
    ├── drazzan_mothership.png     # Boss enemy sprite
    ├── asteroid.png               # Asteroid sprite
    ├── powerup.png                # Powerup item sprite
    ├── explosion.gif              # Explosion animation
    ├── game_thumbnail.jpg         # Game preview image
    ├── norinavio.png             # Additional ship variant
    ├── 8bit_retro.mp3            # Background music
    ├── days_work.MP3             # Alternative music track
    ├── laser1.MP3                # Laser sound effect
    ├── explosion_noise.mp3       # Explosion sound effect
    ├── wyatt_01.MP3              # Voice/sound effects
    ├── wyatt_02.MP3              # Voice/sound effects  
    ├── wyatt_10.MP3              # Voice/sound effects
    └── wyatt001.MP3              # Voice/sound effects
```

## @AI-SECTION: debug-commands

### Debug Console Access
- **Availability**: Debug console only available in single-player mode for game balance
- **Activation**: Press `~` (tilde) key or `F12` during single-player gameplay
- **Command Format**: Case-sensitive commands (respect developer typing conventions)
- **Autocomplete**: Ctrl+Space triggers smart suggestions (prefix > exact > contains matching)

### Game Integration Testing
**Browser Console Access**: Available after page load for development testing
```javascript
// Test complete game integration
gameIntegration.test()

// Show game mode selection UI
gameIntegration.showModes()

// Test single player mode functionality
gameIntegration.testSinglePlayer()

// Check all game components are loaded
console.log('Game Components Status:', {
    GameModeManager: typeof window.GameModeManager,
    gameModeManager: typeof window.gameModeManager,
    MultiplayerGame: typeof window.MultiplayerGame,
    debugConsole: typeof window.debugConsole,
    player: typeof window.player,
    gameState: typeof window.gameState
});
```

### Drazzan Invasion-Specific Debug Commands
**In-Game Console**: Available during single-player gameplay only
```javascript
// Game-specific shortcuts
'skipToBoss'          // Jump directly to Level 4 boss fight
'setLevel <1-4>'      // Skip to any specific level
'doubleFire'          // Toggle enhanced firing mode  
'killAll'             // Clear all enemies from screen
'addLives <number>'   // Add extra lives to current count
'setScore <number>'   // Modify current score value
'gameState'           // Display current game variables
'devEnv'              // Check development environment status
'features'            // Show feature flag status
'help'                // Show all available commands
```

### Available Debug Commands

#### Game State Commands
```javascript
// State inspection
'state'          // Show current game state overview
'player'         // Display player ship status and properties
'enemies'        // List all active enemies and their states
'asteroids'      // Show asteroid field status
'powerups'       // List active powerups and effects
'projectiles'    // Display all active projectiles (player + enemy)

// Game control
'pause'          // Toggle game pause state
'restart'        // Restart current game session
'reset'          // Full reset to initial state
'clear'          // Clear all dynamic entities (enemies, asteroids, projectiles)
```

#### Entity Manipulation
```javascript
// Player modifications
'health <amount>'        // Set player health (1-100)
'lives <count>'          // Set player lives remaining
'score <points>'         // Set current score value
'ammo <count>'          // Set player ammunition count
'shield <duration>'     // Activate shield for specified seconds
'invincible [on/off]'   // Toggle invincibility mode

// Entity spawning
'spawn enemy [type]'     // Spawn enemy (types: basic, fast, heavy, boss)
'spawn asteroid [size]'  // Spawn asteroid (sizes: small, medium, large)  
'spawn powerup [type]'   // Spawn powerup (types: health, ammo, shield, weapon)
'spawn wave'             // Trigger next enemy wave
```

#### Visual and Audio
```javascript
// Display options
'fps [on/off]'           // Toggle FPS counter display
'hitboxes [on/off]'     // Show collision boundaries
'grid [on/off]'         // Display coordinate grid overlay
'trails [on/off]'       // Toggle entity movement trails

// Audio control  
'mute [on/off]'         // Toggle all audio
'music [on/off]'        // Toggle background music only
'sfx [on/off]'          // Toggle sound effects only
'volume <0-100>'        // Set master volume level
```

#### Physics and Mechanics
```javascript
// Physics modification
'gravity <value>'        // Set gravitational pull (0 = none, negative = repulsion)
'friction <0-1>'         // Set space friction coefficient
'speed <multiplier>'     // Multiply all movement speeds by factor
'collision [on/off]'     // Toggle collision detection

// Weapon modifications
'rapidfire [on/off]'     // Toggle unlimited firing rate
'spreadshot [on/off]'    // Enable multi-directional shooting
'penetrating [on/off]'   // Lasers pass through multiple targets
'homing [on/off]'        // Player projectiles track nearest enemy
```

### Debug Command Examples

#### Testing Complex Game States
```javascript
// Set up intense battle scenario
'spawn enemy boss'
'spawn asteroid large'
'spawn asteroid medium'  
'spawn asteroid small'
'spawn powerup weapon'
'health 50'
'ammo 10'

// Test end-game scenario  
'lives 1'
'health 1'
'spawn enemy fast'
'spawn enemy fast'
'spawn enemy heavy'
'rapidfire on'

// Performance testing
'spawn wave'
'spawn wave' 
'spawn wave'
'fps on'
'trails on'
```

#### Audio Testing
```javascript
// Test all audio systems
'volume 100'
'music on'
'sfx on'
'spawn enemy basic'  // Triggers enemy sounds
// Fire lasers        // Triggers weapon sounds
// Take damage        // Triggers damage sounds
```

#### Visual Debug Mode
```javascript
// Full debug visualization
'fps on'
'hitboxes on'
'grid on'
'trails on'
// Provides comprehensive visual debugging information
```

## @AI-SECTION: game-systems

### Core Game Loop (gameloop.js)
```javascript
// Main game loop structure
function gameLoop() {
    // Handle input
    handleInput();
    
    // Update game entities
    updatePlayer();
    updateEnemies();
    updateAsteroids();
    updateProjectiles();
    updatePowerups();
    updateExplosions();
    
    // Handle collisions
    checkCollisions();
    
    // Update UI and scoring
    updateScoreboard();
    
    // Render everything
    render();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}
```

### Player Ship System (player.js)
- **Movement**: Rotation with arrow keys/WASD, thrust with spacebar
- **Health System**: 100 HP with damage reduction and regeneration
- **Weapon System**: Limited ammunition with different weapon types
- **Shield System**: Temporary invincibility with visual feedback
- **Lives System**: Multiple lives with respawn mechanics

### Enemy AI System (enemy.js)
- **Basic Enemy**: Simple movement toward player with basic shooting
- **Fast Enemy**: High-speed aggressive pursuit behavior
- **Heavy Enemy**: Slow but heavily armored with powerful weapons
- **Boss Enemy**: Complex multi-phase behavior with special attacks

### Physics and Movement
- **Momentum-Based**: All entities have velocity and momentum
- **Boundary Wrapping**: Screen-edge wrapping for continuous play area
- **Rotation System**: 360-degree rotation with smooth interpolation
- **Collision Detection**: Circle-based collision for performance

## @AI-SECTION: development-patterns

### Game State Management
```javascript
// Global game state (exported to window for debug access)
const gameState = {
    isPlaying: false,
    isPaused: false,
    lives: 3,
    score: 0,
    level: 1,
    enemies: [],
    asteroids: [],
    projectiles: [],
    powerups: [],
    explosions: []
};

// Always export to window for debug console
window.gameState = gameState;
```

### Entity Creation Pattern
```javascript
// Standard entity structure
class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.rotation = 0;
        this.radius = 10;
        this.active = true;
        this.health = 100;
    }
    
    update() {
        // Update position
        this.x += this.velX;
        this.y += this.velY;
        
        // Boundary wrapping
        this.wrapAroundScreen();
        
        // Entity-specific updates
        this.updateBehavior();
    }
    
    render(ctx) {
        // Standard rendering with rotation
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        this.draw(ctx);
        ctx.restore();
    }
}
```

### Asset Loading Pattern
```javascript
// Preload all game assets
const assets = {
    player: null,
    enemy: null,
    asteroid: null,
    powerup: null,
    explosion: null
};

async function loadAssets() {
    const loadPromises = [
        loadImage('assets/spaceship.png').then(img => assets.player = img),
        loadImage('assets/enemy.png').then(img => assets.enemy = img),
        loadImage('assets/asteroid.png').then(img => assets.asteroid = img),
        loadImage('assets/powerup.png').then(img => assets.powerup = img)
        // Add all other assets...
    ];
    
    await Promise.all(loadPromises);
    console.log('All game assets loaded');
}
```

## @AI-SECTION: testing-procedures

### Manual Testing Checklist

#### Core Gameplay
1. **Movement Testing**:
   - Arrow keys rotate ship smoothly
   - Spacebar provides thrust with momentum
   - Ship wraps around screen edges
   - Collision detection works accurately

2. **Combat Testing**:
   - Lasers fire in correct direction
   - Ammunition system limits firing
   - Enemy AI responds appropriately
   - Collision damage applies correctly

3. **Audio Testing**:
   - Background music loops properly
   - Sound effects trigger correctly
   - Volume controls work as expected
   - No audio clicking or distortion

#### Debug Console Testing
1. **Access and Commands**:
   - Tilde key opens console in single-player
   - All documented commands work correctly
   - Autocomplete functions properly
   - Case-sensitive matching works

2. **State Modification**:
   - Health/lives/score changes apply
   - Entity spawning works reliably
   - Visual debug modes display correctly
   - Physics modifications take effect

### Performance Testing
```javascript
// Use debug console for performance testing
'fps on'           // Monitor framerate
'spawn wave'       // Add entity load
'spawn wave'       // Increase load further
'trails on'        // Add rendering load
// Monitor FPS counter for performance drops
```

### Browser Compatibility Testing
- **Chrome**: Primary development target
- **Firefox**: Secondary target with WebRTC testing
- **Safari**: Mobile compatibility testing
- **Edge**: Windows compatibility verification

## @AI-SECTION: common-issues

### Known Issues and Solutions

#### Audio Problems
- **Issue**: Audio files not loading on some browsers
- **Solution**: Check file format compatibility, use multiple formats if needed
- **Debug**: Use debug console `music on/off` and `sfx on/off` commands

#### Performance Issues  
- **Issue**: FPS drops with many entities
- **Solution**: Implement object pooling for projectiles and explosions
- **Debug**: Use `fps on` and monitor entity counts with `state` command

#### Input Lag
- **Issue**: Delayed response to keyboard input
- **Solution**: Check for event listener conflicts, ensure proper preventDefault
- **Debug**: Test with debug console commands for immediate response

#### Collision Detection Problems
- **Issue**: Inconsistent collision detection
- **Solution**: Verify radius calculations, check update order
- **Debug**: Use `hitboxes on` to visualize collision boundaries

### Troubleshooting with Debug Console

#### Performance Diagnosis
```javascript
'fps on'              // Monitor performance
'state'               // Check entity counts
'clear'               // Remove all entities to test baseline
'spawn enemy basic'   // Add entities incrementally to find bottleneck
```

#### Game Balance Testing
```javascript
'spawn enemy boss'    // Test boss encounter
'health 1'           // Test near-death scenarios  
'lives 1'            // Test final life situations
'ammo 5'             // Test low-ammunition gameplay
```

#### Audio/Visual Testing
```javascript
'mute off'           // Ensure audio enabled
'volume 100'         // Full volume testing
'hitboxes on'        // Visual debugging
'grid on'            // Coordinate system reference
```

---

**🔗 Related**: See `copilot-entry-point.md` for general browser-native patterns, and tech-specific instruction files for detailed implementation guidance.