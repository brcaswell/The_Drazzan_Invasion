# The Drazzan Invasion - Documentation

## Project Overview

The Drazzan Invasion is a browser-based space shooter game built with HTML5 Canvas and JavaScript. Players control a spaceship defending against waves of enemies, culminating in a boss fight against the Drazzan Mothership.

## Project Structure

### Current Branch: `client-server-structure`

This branch reorganizes the game files in preparation for client-server architecture:

```
├── client/
│   ├── assets/           # Game media files
│   │   ├── *.png        # Sprites and images
│   │   ├── *.mp3        # Audio files
│   │   └── *.gif        # Animations
│   ├── css/
│   │   └── styles.css   # Game styling
│   ├── js/              # JavaScript game logic
│   │   ├── asteroids.js
│   │   ├── bossLaser.js
│   │   ├── canvas.js
│   │   ├── collisions.js
│   │   ├── config.js
│   │   ├── enemy.js
│   │   ├── enemyLaser.js
│   │   ├── explosions.js
│   │   ├── gameloop.js          # Simple game loop (active)
│   │   ├── gameloop-extended.js # Extended with boss fight
│   │   ├── input.js
│   │   ├── intro.js
│   │   ├── lasers.js
│   │   ├── main.js
│   │   ├── player.js
│   │   ├── powerup.js
│   │   ├── scoreboard.js
│   │   └── utils.js
│   └── index.html       # Main game entry point
├── docs/                # Documentation
│   ├── boss-fight-analysis.md
│   └── project-overview.md (this file)
└── README.md           # Original project readme
```

## Game Versions

### Simple Version (Currently Active)
- **File:** `client/js/gameloop.js`
- **Size:** 111 lines (3,379 bytes)
- **Features:** Basic gameplay without boss fight
- **Levels:** Standard progression

### Extended Version (Available)
- **File:** `client/js/gameloop-extended.js`  
- **Size:** 714 lines (25,222 bytes)
- **Features:** Full gameplay including Level 4 boss fight
- **Boss:** Drazzan Mothership with complex attack patterns

To switch versions, update the script reference in `client/index.html`.

## Key Game Components

### Core Systems
- **Canvas Rendering:** `canvas.js` - Game display setup
- **Input Handling:** `input.js` - Keyboard/touch controls  
- **Collision Detection:** `collisions.js` - Hit detection system
- **Game Configuration:** `config.js` - Game constants and settings

### Game Objects
- **Player:** `player.js` - Player spaceship logic
- **Enemies:** `enemy.js` - Enemy AI and behavior
- **Projectiles:** `lasers.js`, `enemyLaser.js`, `bossLaser.js`
- **Environmental:** `asteroids.js`, `powerup.js`, `explosions.js`

### Game Flow
- **Intro Sequence:** `intro.js` - Game start cinematic
- **Main Loop:** `gameloop.js` or `gameloop-extended.js`
- **Scoring:** `scoreboard.js` - Score tracking and display
- **Entry Point:** `main.js` - Game initialization

## Development Notes

### Case Sensitivity Issue Resolution
The original codebase had two files with different capitalization:
- `gameLoop.js` (capital L - extended version)
- `gameloop.js` (lowercase - simple version)

On Windows file systems, this caused conflicts during the reorganization. The issue was resolved by:
1. Preserving both versions of the game logic
2. Using descriptive naming: `gameloop-extended.js`
3. Ensuring the HTML references the intended version

### File Path Updates
All file references in `client/index.html` were updated to reflect the new directory structure:
- CSS: `css/styles.css`
- JavaScript: `js/*.js`
- Assets: `assets/*` (relative paths maintained)

## Future Development

### Architecture Improvements (Priority)
This project is evolving toward better separation of concerns:
- **Network Manager Decoupling**: Extract game-specific logic from P2P networking layer
- **Plugin Architecture**: Implement `IGameEngine` interface for reusable components  
- **Event-Driven Design**: Decouple network and game layers through event system
- **Generic P2P Framework**: Make networking components reusable for other games

### Multiplayer Enhancements
Current P2P foundation enables:
- **Decentralized Game Logic**: Host-authoritative with peer validation
- **Real-time State Synchronization**: Low-latency game state updates
- **Cross-Platform Compatibility**: WebRTC works across all modern browsers
- **Scalable Architecture**: No central servers required for any game size

## Documentation Files

- **[Boss Fight Analysis](boss-fight-analysis.md)** - Detailed analysis of the boss battle mechanics
- **Project Overview** - This file, general project documentation

---

*Documentation maintained as of October 5, 2025*