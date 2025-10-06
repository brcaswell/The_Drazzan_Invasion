# P2P Development Scripts

This directory contains helper scripts for **P2P WebAssembly PWA** development workflow.

## Architecture Overview

**The Drazzan Invasion** is a **decentralized P2P multiplayer game** with:
- ✅ Pure client-side JavaScript (runs from `client/index.html`)
- ✅ WebRTC peer-to-peer networking (no central servers)
- ✅ WebAssembly game servers (compiled peer servers)
- ✅ Progressive Web App (offline-capable)
- ❌ **NO server infrastructure** (Node.js, databases, etc.)

## Available Scripts

### `start-p2p-dev.ps1`
Start P2P development environment:
- Builds WebAssembly modules
- Starts lightweight nginx for static serving
- Provides dual ports for P2P testing (8080 & 8081)
- Enables WebRTC peer connections

### `stop-p2p-dev.ps1`
Stop P2P development environment:
- Stops Docker containers
- Optional WASM build cleanup

## Usage

### Windows (PowerShell) - Primary Platform
```powershell
# Set execution policy (first time only)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Start P2P development
.\scripts\start-p2p-dev.ps1

# Test multiplayer P2P
# Player 1 (Host): http://localhost:8080
# Player 2 (Peer): http://localhost:8081

# Stop development
.\scripts\stop-p2p-dev.ps1
```

### Alternative: Direct Browser Testing (No Docker)
```powershell
# For simple testing without Docker
Start-Process "client\index.html"
# Or use VS Code Live Server extension
```

## Testing P2P Multiplayer

1. **Start Environment**: `.\scripts\start-p2p-dev.ps1`
2. **Open Host**: Navigate to `http://localhost:8080`
3. **Select Multiplayer**: Choose host mode in game
4. **Open Peer**: Navigate to `http://localhost:8081` in different browser window
5. **Join Game**: Select join mode and connect to host
6. **Test WebRTC**: Verify P2P connection and WASM game server functionality

## Notes

- **No server setup required** - game runs entirely client-side
- **WebAssembly modules** are built automatically
- **Docker is optional** - game works directly from file system
- **PowerShell is primary** - Windows development focused