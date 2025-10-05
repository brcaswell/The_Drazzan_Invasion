# The Drazzan Invasion

🚀 **A decentralized multiplayer space shooter game built with modern web technologies**

[![Play Now](https://img.shields.io/badge/Play%20Now-GitHub%20Pages-blue?style=for-the-badge)](https://scifistories1977.github.io/The_Drazzan_Invasion/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge)](#progressive-web-app)
[![Multiplayer](https://img.shields.io/badge/Multiplayer-P2P%20WebRTC-orange?style=for-the-badge)](#multiplayer-architecture)

## 🎮 **Quick Start**

**Play Instantly**: [Launch Game](https://scifistories1977.github.io/The_Drazzan_Invasion/) | **Install as App**: Click "Install" in your browser

**Local Development**: 
```bash
# Clone and run locally
git clone https://github.com/brcaswell/The_Drazzan_Invasion.git
cd The_Drazzan_Invasion/client
# Open index.html in browser or use Live Server
```

## ✨ **Key Features**

### 🎯 **Game Modes**
- **Single Player**: ✅ Classic asteroid shooter with power-ups and boss fights
- **Cooperative**: 🚧 *Coming Soon* - Team up with friends, shared lives and revive system
- **Versus**: 📋 *Planned* - Competitive multiplayer with individual scoring
- **Ad-hoc Multiplayer**: 🚧 *Infrastructure Ready* - Join/leave games dynamically, no central servers

### 🌐 **Technology Stack**
- **Frontend**: Pure HTML5 Canvas + Vanilla JavaScript (ES6+ modules)
- **Multiplayer**: WebRTC peer-to-peer networking (no servers required)
- **Performance**: WebAssembly game servers for complex calculations
- **Distribution**: Progressive Web App (PWA) + Electron desktop wrapper
- **Architecture**: Fully decentralized, browser-native operation

### 🏗️ **Architecture Highlights**
- **Zero Server Dependency**: Runs entirely in browser, works offline
- **P2P Networking**: WebRTC DataChannels for real-time multiplayer
- **Graceful Degradation**: Single-player fallback if networking fails
- **Cross-Platform**: Web browsers + native desktop via Electron

## 📁 **Project Structure**

```
The_Drazzan_Invasion/
├── client/                 # 🎮 Game client (main application)
│   ├── index.html         # Entry point - start here
│   ├── js/                # Core game engine
│   │   ├── pwa/          # 🌐 Multiplayer & PWA systems
│   │   └── *.js          # Single-player game components
│   ├── css/              # Game styling
│   ├── assets/           # Game assets (sprites, audio)
│   └── wasm/             # 🚀 WebAssembly game servers
├── desktop/              # 🖥️ Electron desktop wrapper
├── docs/                 # 📚 Architecture & deployment guides
├── .github/              # 🤖 AI-assisted development instructions
└── scripts/              # 🛠️ Build and deployment utilities
```

## 🚀 **Getting Started**

### **For Players**
1. **Web**: Visit [game link](https://scifistories1977.github.io/The_Drazzan_Invasion/)
2. **Install as App**: Click install button in browser address bar
3. **Desktop**: Download from releases (when available)

### **For Developers**
1. **Prerequisites**: Modern web browser (Chrome, Firefox, Safari, Edge)
2. **No Build Required**: Open `client/index.html` directly in browser
3. **Development Server**: Use VS Code Live Server or `npx http-server`
4. **Testing**: Browser console → `gameIntegration.test()`

## 🎯 **Game Modes & Implementation Status**

### **✅ Single Player** (Fully Implemented)
Classic space shooter with asteroids, enemies, power-ups, and boss battles. **Play now!**

### **🏗️ Multiplayer Foundation** (Recently Completed)
Core infrastructure for P2P multiplayer is complete:
- **Game Mode Manager**: Central coordinator for multiplayer functionality
- **P2P Networking**: WebRTC-based peer-to-peer communication infrastructure
- **Lobby System**: UI and backend for join/create games with shareable room codes
- **Host Migration**: Framework for automatic failover if host disconnects
- **State Synchronization**: Architecture for real-time game state across players

*Note: Infrastructure is complete, but actual multiplayer gameplay is still in development.*

### **🚧 Cooperative Mode** (Coming Soon)
Planned features for team-based gameplay:
- Shared lives system with revive mechanics
- Team-based scoring and power-up sharing
- Synchronized enemy spawning and boss fights
- Up to 4 players per game

### **📋 Versus Mode** (Planned for Future Release)
Competitive multiplayer features in design phase:
- Individual player scoring and lives
- Friendly fire mechanics
- Competitive power-up collection
- Player vs. player combat mechanics

### **🎮 Current Playable Experience**
- **Single Player**: ✅ Full game experience available now
- **Multiplayer Testing**: 🧪 P2P connection testing available via browser console
- **Game Mode Selection**: 🎨 UI mockups and wireframes implemented

## 📖 **Documentation**

### **Architecture & Design**
- [📋 Project Overview](docs/project-overview.md) - High-level architecture and goals
- [🏗️ Multiplayer Architecture](docs/multiplayer-architecture.md) - P2P networking and game state
- [📱 PWA & WASM Architecture](docs/PWA-WASM-Architecture.md) - Progressive Web App details
- [📝 Project Completion Summary](docs/PROJECT-COMPLETION-SUMMARY.md) - Implementation status

### **Development & Deployment**
- [🧪 Testing Guide](docs/testing-guide.md) - Testing procedures and browser console tools
- [🚀 Deployment Guide](docs/deployment-guide.md) - GitHub Pages and production deployment
- [📱 PWA Deployment](docs/PWA-Deployment-Guide.md) - Progressive Web App setup

### **AI-Assisted Development**
- [🤖 GitHub Copilot Instructions](.github/copilot-instructions.md) - AI development workflow
- [📝 AI Session Template](.github/ai-session-template.md) - Development session documentation
- [🔧 Component Instructions](.github/) - File-type specific AI guidance

## 🛠️ **Development Workflow**

### **Technology Approach**
- **Pure JavaScript**: No build tools or frameworks required
- **Browser-Native**: Designed to run from `file://` or basic HTTP server
- **Progressive Enhancement**: Core functionality works offline
- **WebRTC First**: Multiplayer built on peer-to-peer principles

### **AI-Assisted Development**
This project uses GitHub Copilot and AI-assisted development patterns:
- [Development Instructions](.github/copilot-instructions.md) for AI context
- [Session Templates](.github/ai-session-template.md) for documentation
- Component-specific AI guidance in `.github/` directory

### **Testing & Debugging**
```javascript
// Browser console testing
gameIntegration.test()              // Run full system validation
gameIntegration.validateComponents() // Check component loading
gameIntegration.testMultiplayer()   // Test P2P functionality
```

## 🎨 **Game Design**

### **Visual Style**
- Retro sci-fi aesthetic with modern HTML5 Canvas rendering
- Particle effects and smooth animations
- Responsive design for desktop and mobile
- Dark theme with neon accents

### **Audio**
- 8-bit retro soundtrack
- Dynamic sound effects for weapons, explosions, and power-ups
- Audio system designed for multiplayer synchronization

### **Gameplay Mechanics**
- Physics-based movement and collision detection
- Progressive difficulty scaling
- Power-up system with temporary abilities
- Boss fight encounters with unique mechanics

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Open `client/index.html` in browser for testing
4. Follow [AI-assisted development patterns](.github/copilot-instructions.md)
5. Create pull request with comprehensive description

### **Contribution Guidelines**
- Maintain browser-native operation (no build dependencies)
- Preserve offline functionality and PWA capabilities
- Follow established JavaScript patterns and ES6 modules
- Include documentation updates for architectural changes
- Test across multiple browsers and devices

## 📜 **License**

This project is open source. See LICENSE file for details.

## 🎖️ **Credits**

- **Original Concept**: Classic asteroid shooter mechanics
- **Modern Implementation**: Browser-native multiplayer architecture
- **AI Development**: GitHub Copilot assisted development patterns
- **Technology Stack**: Modern web standards (WebRTC, PWA, WASM)

---

**🎮 Ready to play?** [Launch The Drazzan Invasion](https://scifistories1977.github.io/The_Drazzan_Invasion/)

**🛠️ Ready to contribute?** Check out the [development documentation](docs/) and [AI-assisted workflow](.github/copilot-instructions.md)
