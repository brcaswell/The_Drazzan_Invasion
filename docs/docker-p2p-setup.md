# Docker & Orchestration for P2P WebAssembly Testing

## ⚠️ Important: Architecture Correction

The original `docker-compose.yml` was designed for a **centralized server architecture**, but this project is actually a **decentralized P2P WebRTC game**. The corrected setup is in `docker-compose.dev.yml`.

## Corrected Architecture

### What We Actually Need:
- ✅ **Static HTTP server** for serving client files
- ✅ **WASM build environment** for WebAssembly game servers  
- ✅ **Multiple ports for P2P testing** (simulating different clients)
- ✅ **TURN/STUN server** (optional, for testing WebRTC traversal)

### What We DON'T Need:
- ❌ Node.js Express server (game is client-side only)
- ❌ PostgreSQL database (no centralized data)
- ❌ Redis cache (P2P doesn't need centralized state)
- ❌ WebSocket server (using WebRTC DataChannels instead)

## Usage

### Quick Start (P2P Testing)
```powershell
# Start P2P development environment
.\scripts\start-p2p-dev.ps1

# This will:
# 1. Build WASM modules
# 2. Start static web server on ports 8080 & 8081
# 3. Configure proper headers for WASM/PWA
```

### Manual Docker Control
```powershell
# Start just the web server
docker compose -f docker-compose.dev.yml up -d drazzan-web

# Build WASM modules in container
docker compose -f docker-compose.dev.yml up wasm-builder

# Start with TURN server (for advanced P2P testing)
docker compose -f docker-compose.dev.yml --profile full-p2p up -d
```

### P2P Testing Workflow
1. **Player 1**: Open `http://localhost:8080`
   - Select "Host Game" in multiplayer mode
   - Game creates WebRTC offer

2. **Player 2**: Open `http://localhost:8081` (same files, different port)
   - Select "Join Game" in multiplayer mode  
   - Game establishes P2P connection via WebRTC

3. **Test Features**:
   - Player position synchronization
   - Game state sharing via WebAssembly peer servers
   - Offline functionality (PWA)
   - Network resilience

## File Structure

```
The_Drazzan_Invasion/
├── docker-compose.yml          # ❌ OLD: Centralized server setup
├── docker-compose.dev.yml      # ✅ NEW: P2P testing setup
├── nginx-p2p.conf              # ✅ WASM/PWA optimized nginx config
├── client/
│   ├── index.html              # Entry point (works without server)
│   ├── wasm/                   # WebAssembly peer servers
│   │   ├── build.bat          # Windows WASM build
│   │   ├── build.sh           # Linux WASM build  
│   │   └── build/             # Built WASM modules
│   └── js/pwa/                # P2P networking code
└── scripts/
    ├── start-p2p-dev.ps1      # ✅ NEW: P2P testing startup
    └── stop-p2p-dev.ps1       # ✅ NEW: P2P testing cleanup
```

## WebAssembly Integration

The WASM modules provide:
- **Deterministic game logic** (prevents desync in P2P)
- **High-performance calculations** (physics, collision detection)
- **Sandboxed execution** (security for P2P code)
- **Cross-platform compatibility** (same logic on all clients)

### WASM Build Process:
1. **Development**: Uses minimal WAT (WebAssembly Text) placeholder
2. **Production**: Will use Emscripten/AssemblyScript for optimized modules
3. **Fallback**: JavaScript implementation available if WASM fails

## Network Architecture

```
Browser 1 (Host)                    Browser 2 (Peer)
┌─────────────────┐                ┌─────────────────┐
│  Game Client    │◄──WebRTC P2P──►│  Game Client    │
│  + WASM Server  │   DataChannel   │  + WASM Server  │  
└─────────────────┘                └─────────────────┘
        │                                   │
        └─────────── No Central Server ────┘
```

## Troubleshooting

### Common Issues:
1. **WASM not loading**: Check CORS headers and MIME types in nginx-p2p.conf
2. **P2P connection fails**: May need TURN server for some network setups
3. **PWA not working**: Ensure proper service worker headers

### Debug Commands:
```powershell
# Check container status
docker compose -f docker-compose.dev.yml ps

# View web server logs  
docker compose -f docker-compose.dev.yml logs drazzan-web

# Test WASM module loading
curl -I http://localhost:8080/wasm/build/game-server.wasm
```

## Migration from Old Setup

If you were using the old `docker-compose.yml`:

1. **Stop old containers**: `docker compose down`
2. **Use new setup**: `.\scripts\start-p2p-dev.ps1` 
3. **Remove old dependencies**: The server/, database, and Redis containers are no longer needed

The game is designed to work **completely offline** after the initial download, making it a true PWA with P2P multiplayer capabilities.