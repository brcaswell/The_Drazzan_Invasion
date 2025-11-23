# Documentation Index

## Architecture & Development

### **🏗️ Core Architecture**
- **[P2P Development Guide](p2p-development-guide.md)** - Complete development workflow for P2P WebAssembly PWA
- **[Architecture Cleanup](architecture-cleanup.md)** - Removal of centralized components, P2P focus
- **[PWA & WASM Architecture](PWA-WASM-Architecture.md)** - Progressive Web App and WebAssembly integration
- **[Multiplayer Architecture](multiplayer-architecture.md)** - P2P networking and WebRTC implementation

### **⚙️ Development Setup**
- **[P2P Development Guide](p2p-development-guide.md)** - VS Code setup, Docker configuration, WASM building
- **[Docker P2P Setup](docker-p2p-setup.md)** - Containerized P2P testing environment
- **[Testing Guide](testing-guide.md)** - Browser console testing and validation

### **🛠️ Developer Tools**
- **[Debug Console Testing](debug-console-testing.md)** - In-game developer console commands
- **[Session Summary: Debug Tools](session-summary-debug-tools.md)** - Debug tooling implementation details

## Project Status

### **📋 Overview & Completion**
- **[Project Overview](project-overview.md)** - High-level goals and architecture principles
- **[Project Completion Summary](PROJECT-COMPLETION-SUMMARY.md)** - Implementation status and roadmap

### **🎮 Game Features**
- **[Boss Fight Analysis](boss-fight-analysis.md)** - Boss encounter design and mechanics

## Deployment

### **🚀 Production Deployment**
- **[Deployment Guide](deployment-guide.md)** - GitHub Pages and production setup
- **[PWA Deployment Guide](PWA-Deployment-Guide.md)** - Progressive Web App deployment

## Quick Reference

### **🎯 For New Developers**
1. **Start Here**: [P2P Development Guide](p2p-development-guide.md)
2. **Architecture**: [Architecture Cleanup](architecture-cleanup.md)
3. **Setup**: VS Code configurations in [P2P Development Guide](p2p-development-guide.md)
4. **Testing**: [Testing Guide](testing-guide.md)

### **🎮 For Players**
- **Play Now**: [Launch Game](https://brcaswell.github.io/The_Drazzan_Invasion/)
- **Install PWA**: Click install button in browser
- **Debug Mode**: Press `~` in single-player for debug console

### **🔧 For Contributors**
- **Architecture**: P2P WebAssembly PWA (no servers)
- **Development**: Windows PowerShell + VS Code + Docker (optional)
- **Testing**: Dual-browser P2P connection testing
- **Deployment**: Static hosting (GitHub Pages)

## Architecture Principles

### ✅ **What We Are**
- **Decentralized**: P2P WebRTC networking, no central servers
- **Browser Native**: Runs from `client/index.html`, works offline
- **WebAssembly**: Compiled game servers for performance
- **Progressive**: PWA with service worker, installable

### ❌ **What We Are NOT**
- ~~Centralized server architecture~~
- ~~Node.js backend with databases~~
- ~~WebSocket servers~~
- ~~Build tool dependencies~~

This documentation reflects the **P2P WebAssembly PWA** architecture established after the centralized component cleanup.