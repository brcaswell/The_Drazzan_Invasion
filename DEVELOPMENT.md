# Quick Reference: P2P WebAssembly PWA Development

## 🚀 **Quick Start**

### **Simplest (Direct Browser)**
```powershell
Start-Process "client\index.html"
```

### **P2P Multiplayer Testing**
```powershell
.\scripts\start-p2p-dev.ps1
# Host: http://localhost:8080
# Peer: http://localhost:8081
```

### **VS Code Development**
- **F5**: Launch with debug configuration
- **Ctrl+Shift+P**: "Tasks: Run Task" → "Start P2P Development"

## 🎮 **Testing Commands**

### **Browser Console**
```javascript
// System validation
gameIntegration.test()              // Full system check
gameIntegration.testMultiplayer()   // P2P networking test
gameIntegration.validateComponents() // Component loading

// Game state inspection
window.multiplayerGame.gameState.players  // Connected players
window.gameModeManager.currentMode         // Current game mode
typeof WebAssembly                         // WASM support check
```

### **Debug Console (Single Player, Press `~`)**
```javascript
skipToBoss          // Jump to boss fight
setLevel 3          // Skip to level 3
invincible          // Toggle god mode
gameState           // View all variables
help                // Show all commands
```

## 🏗️ **Architecture Quick Facts**

### ✅ **What We Have**
- **P2P WebRTC**: Direct browser-to-browser networking
- **WebAssembly**: Compiled game servers (peer-hosted)
- **PWA**: Service worker, offline capability, installable
- **Client-side only**: No servers required

### ❌ **What We Don't Have**
- ~~Node.js server~~ - No backend
- ~~Database~~ - No persistence layer  
- ~~WebSocket server~~ - WebRTC DataChannels instead
- ~~Build tools~~ - Browser-native operation

## 📁 **Key Files**

### **Game Core**
- `client/index.html` - Entry point
- `client/js/gameloop.js` - Main game loop + multiplayer integration
- `client/js/pwa/` - P2P networking & multiplayer systems

### **Development**
- `.vscode/launch.json` - Debug configurations (F5)
- `.vscode/tasks.json` - Build & test tasks
- `scripts/start-p2p-dev.ps1` - P2P development environment

### **WebAssembly**
- `client/wasm/build.bat` - Build WASM modules
- `client/wasm/build/game-server.wasm` - Compiled game server

## 🔧 **VS Code Tasks**

| Task | Purpose |
|------|---------|
| **Start P2P Development** | Launch containerized P2P testing |
| **Stop P2P Development** | Clean shutdown |
| **Build WASM Modules** | Compile WebAssembly |
| **Test P2P Connection** | P2P testing instructions |

## 🌐 **P2P Testing Workflow**

1. **Start**: `.\scripts\start-p2p-dev.ps1`
2. **Host**: Open `http://localhost:8080`, select "Multiplayer Host"
3. **Peer**: Open `http://localhost:8081`, select "Join Game"
4. **Test**: WebRTC P2P connection establishes
5. **Debug**: Browser console → `gameIntegration.testMultiplayer()`
6. **Stop**: `.\scripts\stop-p2p-dev.ps1`

## 🧪 **WebAssembly Development (Containerized)**

### **Build WASM (No Host Node.js Required)**
```powershell
# Containerized build - no host dependencies
docker compose -f docker-compose.dev.yml run --rm wasm-builder

# Or use VS Code task: "Build WASM Modules (Containerized)"
# Or automatically via: .\scripts\start-p2p-dev.ps1
```

### **Test WASM**
```javascript
// Browser console
window.wasmGameServer              // WASM module instance
typeof WebAssembly !== 'undefined' // WASM support

// Check build info
fetch('/wasm/build/build-info.json').then(r => r.json()).then(console.log)
```

## 📚 **Documentation**

- **[P2P Development Guide](docs/p2p-development-guide.md)** - Complete development setup
- **[Architecture Cleanup](docs/architecture-cleanup.md)** - Why we removed servers
- **[Testing Guide](docs/testing-guide.md)** - Browser console testing

## 🎯 **Common Issues**

| Problem | Solution |
|---------|----------|
| **WASM not loading** | Check `client/wasm/build.bat`, browser support |
| **P2P connection fails** | Verify WebRTC permissions, CORS headers |
| **Docker issues** | Ensure Docker Desktop running, check ports |
| **Service Worker errors** | Clear browser cache, check manifest.json |

## 🔗 **Quick Links**

- **Play Game**: [Launch](https://scifistories1977.github.io/The_Drazzan_Invasion/)
- **Documentation**: [docs/README.md](docs/README.md)
- **VS Code Setup**: [.vscode/launch.json](.vscode/launch.json)
- **P2P Scripts**: [scripts/](scripts/)

---

**💡 Remember**: This is a **P2P WebAssembly PWA** - no servers needed!