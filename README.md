# The Drazzan Invasion

🚀 **A decentralized multiplayer space shooter game built with modern web technologies**

[![Play Now](https://img.shields.io/badge/Play%20Now-GitHub%20Pages-blue?style=for-the-badge)](https://scifistories1977.github.io/The_Drazzan_Invasion/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge)](#progressive-web-app)
[![Multiplayer](https://img.shields.io/badge/Multiplayer-P2P%20WebRTC-orange?style=for-the-badge)](#multiplayer-architecture)

## � **Recent Updates (November 2025)**

### **Enhanced AI Instruction System** 🤖
- **Complete migration** to structured AI instruction system with YAML frontmatter validation
- **Automatic discovery** - AI systems intelligently find and load relevant instruction files
- **Technology separation** - Reusable patterns for JavaScript, PWA, WebRTC, Canvas, Testing
- **Project portability** - Instruction system can be copied to other projects with validation
- **Quality enforcement** - Automated frontmatter consistency and content separation rules

### **Improved Development Experience** 🛠️
- **Enhanced debug console** with intelligent autocomplete (Ctrl+Space) and case-sensitive commands
- **Comprehensive P2P diagnostic tools** - standalone debug interface, signal inspection, connection testing
- **Cross-platform development scripts** - PowerShell and shell scripts for streamlined P2P testing
- **Advanced game state inspection** and variable synchronization tools
- **Feature flag system** for runtime configuration management
- **Cross-origin bridge** for local P2P testing without HTTPS requirements
- **Comprehensive troubleshooting documentation** with common solutions and AI-assisted session templates

### **System Architecture Cleanup** 🏗️
- **Content separation** between AI instructions vs. human guides
- **Naming consistency** - Clear distinction between instruction files and guide documentation
- **Validation framework** - Portability testing ensures system integrity across projects

## �🎮 **Quick Start**

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
4. **Testing**: Browser console → `gameIntegration.test()` or standalone P2P debug tools
5. **Debug Console**: Press `Ctrl+~` for enhanced debugging with autocomplete (Ctrl+Space)
6. **P2P Testing**: Open `client/debug-p2p.html` for comprehensive multiplayer diagnostics
7. **VS Code Setup**: Use provided tasks and launch configurations for streamlined development

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

### **🔧 Developer Tools & Debugging** (Enhanced)
Comprehensive development workflow with extensive debugging and P2P testing capabilities:

#### **Debug Console** (`Ctrl+~`)
- **Intelligent Autocomplete**: Ctrl+Space with smart matching (prefix > exact > contains)
- **Modern Terminal UX**: Arrow navigation, syntax highlighting, scrollable suggestions
- **Game Progression Commands**: Skip to boss, adjust level/score, toggle invincibility
- **State Inspection**: Game variable synchronization and comprehensive state debugging
- **Integration**: Works with browser console for complete debugging workflow

#### **P2P Development & Diagnostic Tools**
- **Standalone Debug Interface**: `client/debug-p2p.html` - Complete P2P testing environment
- **Signal Inspector**: `client/inspect-signals.js` - localStorage signal analysis and debugging
- **Connection Diagnostics**: `client/p2p-diagnostics.js` - Network manager and peer connection analysis
- **Cross-Platform Testing**: PowerShell (.ps1) and shell (.sh) scripts for connection testing
- **Game Advertisement Tools**: Create and test multiplayer game advertisements
- **Cross-Origin Bridge**: `client/cross-origin-bridge.html` - Local P2P testing without HTTPS

#### **Development Environment**
- **VS Code Integration**: Launch configurations and tasks for streamlined development
- **Feature Flag System**: Runtime configuration for enabling/disabling features  
- **Troubleshooting Guide**: `docs/development-troubleshooting.md` - Common issues and solutions
- **Enhanced Game Timer**: Proper pause/resume functionality with formatted display

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
- **Multiplayer Testing**: 🧪 Comprehensive P2P diagnostic tools and standalone test interfaces
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
#### Enhanced AI Instruction System
- [🤖 AI Entry Point](.github/instructions/copilot-entry-point.md) - Main AI instruction system with automatic discovery
- [📚 System Overview](.github/instructions/README.md) - Complete AI instruction system documentation
- [🛡️ Migration Report](.github/instructions/MIGRATION_AUDIT_REPORT.md) - System migration and validation

#### Technology-Specific AI Instructions
- [⚡ JavaScript Patterns](.github/instructions/tech-specific/javascript.md) - ES6+ browser-native development
- [🌐 HTML & CSS](.github/instructions/tech-specific/html-web.md) - Web technologies and responsive design
- [� PWA & WebRTC](.github/instructions/tech-specific/pwa-webrtc.md) - Multiplayer and progressive web app patterns
- [🎨 Canvas & WASM](.github/instructions/tech-specific/canvas-wasm.md) - Graphics and WebAssembly integration
- [🧪 Browser Testing](.github/instructions/tech-specific/browser-testing.md) - Console-driven testing patterns
- [📝 AI Documentation](.github/instructions/tech-specific/ai-documentation.md) - AI-assisted documentation workflows

#### Project Context & Workflow
- [🎮 Game-Specific Context](.github/instructions/project-specific/drazzan-invasion.md) - Space shooter mechanics and debug commands
- [🔄 Development Templates](.github/instructions/templates/) - AI session and workflow templates

#### Legacy & Guides
- [🤖 Legacy Entry Point](.github/copilot-instructions.md) - Original AI instructions (migration in progress)
- [� Documentation Guide](.github/docs-guide.md) - Guide for organizing AI-assisted development docs
- [🏗️ Instruction Separation Guide](.github/instruction-separation-guide.md) - Pattern separation methodology

## 🛠️ **Development Workflow**

### **Technology Approach**
- **Pure JavaScript**: No build tools or frameworks required
- **Browser-Native**: Designed to run from `file://` or basic HTTP server
- **Progressive Enhancement**: Core functionality works offline
- **WebRTC First**: Multiplayer built on peer-to-peer principles

### **AI-Assisted Development**
This project features an **Enhanced AI Instruction System** for GitHub Copilot and AI-assisted development:

#### **Automatic AI Discovery**
- **Smart Context Loading**: AI automatically discovers project type and loads relevant instructions
- **Technology Detection**: Detects JavaScript, PWA, WebRTC patterns and applies appropriate guidance
- **Project-Specific Context**: Game mechanics, debug commands, and domain-specific patterns
- **Frontmatter Validation**: Structured YAML metadata ensures consistency across instruction files

#### **Reusable Instruction Components**
- **Technology-Specific**: Portable patterns for JavaScript, HTML/CSS, PWA, Canvas, Testing
- **Project Context**: Game-specific mechanics separate from reusable technical patterns  
- **Workflow Templates**: Structured approaches for AI-assisted development sessions
- **Quality Enforcement**: Automated validation prevents instruction system inconsistencies

#### **Key Features**
- [🤖 Main AI Entry Point](.github/instructions/copilot-entry-point.md) - Enhanced discovery and enforcement
- **Portability Testing**: Validates instruction system can be reused across projects
- **Session Documentation**: Templates for tracking AI-assisted development decisions
- **Component Separation**: Clear boundaries between generic patterns and project-specific content

### **Testing & Debugging**
```javascript
// Browser console testing
gameIntegration.test()              // Run full system validation
gameIntegration.validateComponents() // Check component loading
gameIntegration.testMultiplayer()   // Test P2P functionality
```

### **Debug Console** (Single Player Only)
The game includes a developer debug console for testing and cheats:

**Activation**: Press `~` or `F12` during single-player gameplay

**Available Commands**:
- `skipToBoss` - Jump directly to Level 4 boss fight
- `setLevel <1-4>` - Skip to any level
- `invincible` - Toggle player invincibility
- `doubleFire` - Toggle enhanced firing mode
- `killAll` - Clear all enemies from screen
- `addLives <number>` - Add extra lives
- `setScore <number>` - Modify current score
- `gameState` - Display current game variables
- `features` - Show feature flag status
- `help` - Show all available commands

**Note**: Debug console is only available in single-player mode for game balance.

### **Development Environment Setup**

**Quick Setup Options** (from best to basic):
1. **🐳 Docker P2P Environment** - Full multiplayer testing with cross-origin support
   ```powershell
   .\scripts\start-p2p-dev.ps1   # Requires Docker Desktop
   ```
2. **🔴 VS Code Live Server** - Recommended for single-player development
   ```
   Right-click client/index.html → "Open with Live Server"
   ```
3. **📁 Direct File Access** - Basic fallback method
   ```
   Double-click client/index.html
   ```

**Troubleshooting**: See [Development Troubleshooting Guide](docs/development-troubleshooting.md) for detailed setup help, common issues, and solutions.

**Debug Environment Status**: Use debug console command `devEnv` to check your current setup and get recommendations.

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
4. **AI Development**: Follow [Enhanced AI Instruction System](.github/instructions/copilot-entry-point.md)
   - Use structured development sessions with [AI templates](.github/instructions/templates/)
   - Technology-specific patterns auto-discovered based on file types
   - Validate changes with `Test-InstructionPortability.ps1` if modifying instruction system
5. Create pull request with comprehensive description

### **Contribution Guidelines**
- **Browser-Native First**: Maintain operation without build dependencies
- **PWA Compatibility**: Preserve offline functionality and progressive web app capabilities
- **Pattern Consistency**: Follow established JavaScript ES6+ patterns and component structure
- **AI Documentation**: Use [AI-assisted documentation patterns](.github/instructions/tech-specific/ai-documentation.md) for session tracking
- **Separation of Concerns**: Keep generic patterns separate from project-specific implementations
- **Testing**: Use browser console testing and debug tools for validation
- Include documentation updates for architectural changes
- Test across multiple browsers and devices

## 🌟 **What Makes This Project Unique**

### **AI-First Development Approach**
- **Enhanced AI Instruction System**: Structured, validated AI guidance with automatic discovery
- **Frontmatter-Driven**: YAML metadata enables intelligent AI context loading  
- **Reusable Patterns**: Technology-specific instructions portable across projects
- **Quality Enforcement**: Automated validation prevents instruction system inconsistencies
- **Session Documentation**: Comprehensive tracking of AI-assisted development decisions

### **Technical Innovation**
- **Zero Build Dependencies**: Runs directly in browser from `file://` or basic HTTP server
- **Decentralized Multiplayer**: Pure P2P WebRTC networking, no central servers required
- **Progressive Web App**: Full offline functionality with installable experience
- **Browser-Native Performance**: 60fps Canvas rendering with optional WebAssembly acceleration
- **Cross-Platform Reach**: Web browsers + Electron desktop + mobile PWA support

### **Developer Experience** 
- **Integrated Debug Console**: In-game developer tools with autocomplete and game state inspection
- **Feature Flag System**: Runtime configuration for development and testing
- **AI-Assisted Workflows**: Structured templates and patterns for consistent development
- **Comprehensive Documentation**: Architecture guides, deployment instructions, and troubleshooting

## 📜 **License**

This project is open source. See LICENSE file for details.

## 🎖️ **Credits**

- **Original Concept**: Classic asteroid shooter mechanics
- **Modern Implementation**: Browser-native multiplayer architecture
- **Enhanced AI System**: Structured AI instruction system with automatic discovery and validation
- **Technology Stack**: Modern web standards (WebRTC, PWA, WASM)

---

**🎮 Ready to play?** [Launch The Drazzan Invasion](https://scifistories1977.github.io/The_Drazzan_Invasion/)

**🛠️ Ready to contribute?** Check out the [development documentation](docs/) and [Enhanced AI Instruction System](.github/instructions/copilot-entry-point.md)
