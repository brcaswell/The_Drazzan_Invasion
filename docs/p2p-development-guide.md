# P2P WebAssembly PWA Development Guide

## Overview

**The Drazzan Invasion** is a decentralized multiplayer space shooter that runs entirely in the browser using P2P WebRTC networking and WebAssembly game servers. This guide covers the development workflow for the P2P architecture.

## Architecture Summary

### ✅ **What We Have (P2P WebAssembly PWA)**
- **Client-side only**: Pure JavaScript + HTML5 Canvas
- **WebRTC P2P**: Direct browser-to-browser networking
- **WebAssembly**: Compiled game servers (peer-hosted)
- **PWA**: Offline-capable Progressive Web App
- **Decentralized**: No central servers required

### ❌ **What We Don't Have (Removed)**
- ~~Node.js server~~ - No backend required
- ~~Database~~ - No persistent storage server
- ~~WebSocket server~~ - Replaced by WebRTC DataChannels
- ~~REST API~~ - No server-side endpoints

## Development Setup

### **Prerequisites**
- **Windows 10/11** (Primary development platform)
- **PowerShell** (Scripts optimized for PowerShell)
- **Modern browser** (Chrome, Edge, Firefox with WebRTC support)
- **Docker** (Optional, for containerized development)
- **VS Code** (Recommended with Live Server extension)

### **Quick Start**
```powershell
# Option 1: Direct browser testing (simplest)
Start-Process "client\index.html"

# Option 2: P2P development environment (for multiplayer testing)
.\scripts\start-p2p-dev.ps1

# Option 3: VS Code Live Server (right-click client/index.html → "Open with Live Server")
```

## VS Code Integration

### **Launch Configurations**
- **🎮 Launch Game - Direct Browser**: Basic single-player testing
- **🔧 Debug Game - Console Logging**: Development with DevTools
- **🌐 P2P Host (Port 8080)**: Multiplayer host for P2P testing
- **🤝 P2P Peer (Port 8081)**: Multiplayer peer for P2P testing
- **🧪 Test WebAssembly WASM**: WASM module testing with build step
- **📱 Test PWA Features**: Service worker and offline functionality

### **Tasks Available**
- **Start P2P Development**: Launch containerized P2P testing environment
- **Stop P2P Development**: Clean shutdown of P2P containers
- **Build WASM Modules**: Compile WebAssembly game servers
- **Test P2P Connection**: Instructions for P2P multiplayer testing
- **Test WebAssembly**: WASM functionality validation

## P2P Multiplayer Testing

### **Setup Process**
1. **Start Environment**: `.\scripts\start-p2p-dev.ps1`
2. **Host Player**: Navigate to `http://localhost:8080`
3. **Peer Player**: Navigate to `http://localhost:8081` (different browser window/profile)
4. **Test Connection**: Follow WebRTC P2P handshake

### **Testing Workflow**
```javascript
// Browser console commands for testing
gameIntegration.test()                    // Full system validation
gameIntegration.testMultiplayer()         // P2P networking test
gameIntegration.validateComponents()      // Component loading check

// Debug P2P connection
window.multiplayerGame.gameState.players // View connected players
window.gameModeManager.currentMode        // Check game mode
```

### **Dual Browser Testing**
- **Host Browser**: Chrome/Edge on port 8080
- **Peer Browser**: Firefox/Chrome Incognito on port 8081
- **Different User Profiles**: Prevents localStorage conflicts
- **WebRTC Connection**: Direct peer-to-peer data channels

## WebAssembly Development

### **WASM Module Structure**
```
client/wasm/
├── src/game-server.ts    # AssemblyScript/TypeScript source
├── build.bat            # Windows build script
├── build.sh             # Unix build script (fallback)
├── package.json         # AssemblyScript dependencies
├── asconfig.json        # AssemblyScript configuration
└── build/
    ├── game-server.wasm # Compiled WASM module
    └── build-info.json  # Build metadata
```

### **Building WASM Modules**
```powershell
# Manual build
cd client\wasm
.\build.bat

# VS Code task
Ctrl+Shift+P → "Tasks: Run Task" → "Build WASM Modules"

# Automatic build (with P2P development)
.\scripts\start-p2p-dev.ps1  # Builds WASM as part of startup
```

### **WASM Integration**
- **Host-side**: WASM modules run game logic for authoritative state
- **JavaScript Fallback**: Pure JS implementation available if WASM fails
- **Cross-platform**: WASM runs consistently across browsers/OS
- **Performance**: Critical game calculations in compiled WASM

## File Structure

```
The_Drazzan_Invasion/
├── client/                     # 🎮 Complete P2P PWA Game
│   ├── index.html             # Entry point - works standalone
│   ├── js/                    # Game engine
│   │   ├── pwa/              # P2P networking & PWA systems
│   │   │   ├── multiplayer-game.js      # P2P game state management
│   │   │   ├── network-manager.js       # WebRTC P2P networking
│   │   │   ├── game-mode-manager.js     # Mode selection & coordination
│   │   │   └── integration-bridge.js    # Single/multiplayer integration
│   │   ├── gameloop.js        # Main game loop with multiplayer integration
│   │   ├── debug-console.js   # Developer debugging tools
│   │   └── *.js              # Single-player game components
│   ├── wasm/                  # WebAssembly peer servers
│   ├── sw.js                  # Service worker (PWA)
│   └── manifest.json          # PWA manifest
├── .vscode/                   # VS Code P2P development config
│   ├── launch.json           # P2P debugging configurations
│   └── tasks.json            # WASM build & P2P test tasks
├── scripts/                   # P2P development scripts
│   ├── start-p2p-dev.ps1    # Start P2P testing environment
│   └── stop-p2p-dev.ps1     # Stop P2P environment
├── docs/                      # Architecture documentation
├── docker-compose.dev.yml     # P2P development containers
├── nginx-p2p.conf            # WASM/PWA optimized nginx config
└── desktop/                   # Electron wrapper (separate)
```

## Development Workflow

### **Daily Development**
1. **Open VS Code**: Project loads with P2P configurations
2. **Start P2P Environment**: `Ctrl+Shift+P` → "Start P2P Development"
3. **Launch Debug**: F5 → Select appropriate launch configuration
4. **Code Changes**: Edit client-side JavaScript/HTML/CSS
5. **Test Multiplayer**: Use dual-port setup for P2P testing
6. **WASM Updates**: Rebuild modules when changing game logic

### **Feature Development**
1. **Single Player First**: Implement in main game files (client/js/*.js)
2. **Multiplayer Adaptation**: Integrate with P2P systems (client/js/pwa/*.js)
3. **WASM Optimization**: Move performance-critical code to WASM
4. **P2P Testing**: Validate with dual-browser setup
5. **PWA Integration**: Ensure offline functionality works

### **Debug Console Commands**
Available in single-player mode (press `~` or `Ctrl+~`):
```javascript
// Game progression
skipToBoss          // Jump to boss fight
setLevel 3          // Skip to level 3
invincible          // Toggle god mode
doubleFire          // Enhanced weapons

// State inspection
gameState           // View all game variables
features            // Feature flag status
help                // All available commands
```

## Deployment

### **Local Testing**
- **Direct**: Open `client/index.html` in browser
- **P2P Development**: Use Docker setup for multiplayer testing
- **Live Server**: VS Code extension for rapid iteration

### **Production Deployment**
- **GitHub Pages**: Static hosting for PWA
- **CDN**: Distribute WASM modules efficiently
- **PWA Installation**: Browser install prompts
- **Offline First**: Service worker caching

## Troubleshooting

### **Common Issues**
1. **WASM not loading**: Check build scripts, browser WASM support
2. **P2P connection fails**: Verify CORS headers, WebRTC permissions
3. **Service Worker errors**: Clear browser cache, check manifest.json
4. **Docker issues**: Ensure Docker Desktop running, port conflicts

### **Debug Tools**
```javascript
// Browser console diagnostics
console.log(typeof WebAssembly)          // WASM support check
console.log(navigator.mediaDevices)      // WebRTC capabilities
console.log('serviceWorker' in navigator) // PWA support

// Game-specific debugging
window.multiplayerGame.gameState          // P2P game state
window.gameModeManager.currentMode        // Mode selection
gameIntegration.validateComponents()      // Component loading
```

This development setup ensures the game maintains its **decentralized P2P WebAssembly PWA** architecture while providing comprehensive development and testing tools.