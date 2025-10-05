# GitHub Copilot Instructions for The Drazzan Invasion

## Project Overview

**The Drazzan Invasion** is a decentralized multiplayer space shooter game built with modern web technologies. This is a **pure client-side JavaScript project** with no server dependencies for basic functionality.

### Technology Stack
- **Frontend**: HTML5 Canvas, Vanilla JavaScript (ES6+ modules)
- **Networking**: WebRTC peer-to-peer multiplayer (no central servers)
- **Game Servers**: WebAssembly-based peer servers (compiled from Rust/C++)
- **Architecture**: Progressive Web App (PWA) with Electron desktop wrapper
- **Build Tools**: No build process required for basic development
- **Testing**: Browser-based, no external dependencies

### Key Architecture Principles
1. **Decentralized**: No central game servers, everything runs in browser
2. **P2P First**: WebRTC for all multiplayer communication
3. **Browser Native**: Designed to run directly from `index.html`
4. **Progressive**: Works offline, installable as PWA
5. **Cross-Platform**: Web + Electron desktop support

## Development Environment

### Platform
- **OS**: Windows (PowerShell as primary shell)
- **Shell Syntax**: Use PowerShell commands, not bash/Linux
  - Command chaining: `;` not `&&`
  - Path separators: `\` or `/` (both work)
  - Case insensitive file system

### Testing & Development Server
**NEVER use Python `http.server`** - this is a JavaScript project!

**Preferred methods** (in order):
1. **Direct browser testing**: Double-click `client/index.html`
2. **VS Code Live Server**: Right-click → "Open with Live Server"
3. **Node.js server**: `npx http-server -p 8080` (if Node.js available)
4. **PowerShell**: `Start-Process "index.html"` to open in default browser

### File Structure
```
The_Drazzan_Invasion/
├── client/                 # Main game client
│   ├── index.html         # Entry point
│   ├── js/                # Game logic
│   │   ├── pwa/          # Multiplayer & PWA systems
│   │   └── *.js          # Core game components
│   ├── css/              # Styles
│   ├── assets/           # Game assets
│   └── wasm/             # WebAssembly game servers
├── desktop/              # Electron wrapper
├── docs/                 # Documentation
└── .github/              # GitHub configuration
```

## Code Style & Patterns

### JavaScript Conventions
- **Modules**: Use ES6 modules (`import`/`export`)
- **Classes**: Use modern class syntax
- **Async**: Prefer `async`/`await` over promises
- **Naming**: 
  - Classes: `PascalCase`
  - Functions/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.js`

### Game Architecture Patterns
- **Component System**: Separate concerns (Canvas, Input, Physics, etc.)
- **State Management**: Centralized game state with clear ownership
- **Event-Driven**: Use callbacks and event listeners
- **Multiplayer**: Host-authoritative with peer validation

## Specific Instructions by File Type

### Apply to: `**/*.js` (Core Game Files)
- Follow existing single-player patterns when extending
- Always check for global object existence before use
- Use existing collision detection, canvas, and input systems
- Maintain 60 FPS performance targets

### Apply to: `**/pwa/*.js` (Multiplayer System)
- Use modern ES6+ features and modules
- Implement proper error handling and fallbacks
- Design for offline-first, network-optional operation
- Follow established GameModeManager patterns

### Apply to: `**/*.html`
- Maintain PWA manifest and service worker integration
- Use semantic HTML5 elements
- Ensure mobile responsiveness
- Load JavaScript modules in correct dependency order

### Apply to: `**/*.css`
- Use CSS custom properties (variables)
- Implement mobile-first responsive design
- Maintain retro sci-fi aesthetic
- Optimize for Canvas overlay UI elements

### Apply to: `**/wasm/*`
- WebAssembly files are pre-compiled
- JavaScript bridge files handle WASM integration
- Fallback to pure JS if WASM unavailable
- Memory management is critical

## Common Tasks & Patterns

### Adding New Game Features
1. Check existing single-player implementation
2. Create component following established patterns
3. Add multiplayer support if needed
4. Test in browser console first
5. Update integration bridge if required

### Debugging Workflow
1. Open `client/index.html` in browser
2. Use Developer Console (F12)
3. Test with `gameIntegration.test()`
4. Check Network tab for loading issues
5. Use `console.log` liberally during development

### Network Integration
- Always provide offline fallbacks
- Use WebRTC DataChannels for game state
- Implement connection failure recovery
- Design for variable latency (50-500ms)

## Anti-Patterns to Avoid

### Technology Mismatches
- ❌ Don't suggest Python solutions for JavaScript problems
- ❌ Don't use Node.js build tools unnecessarily
- ❌ Don't require server-side components for basic features
- ❌ Don't break the "works from file://" principle

### Architecture Violations
- ❌ Don't create central server dependencies
- ❌ Don't break offline functionality
- ❌ Don't require external service accounts
- ❌ Don't violate decentralized principles

### Code Quality Issues
- ❌ Don't modify existing working single-player code unnecessarily
- ❌ Don't create circular dependencies between modules
- ❌ Don't block the main thread with heavy computations
- ❌ Don't create memory leaks in long-running games

## Current Implementation Status

### ✅ Completed Systems
- **PWA Architecture**: Complete with service worker, manifest, offline support
- **WebRTC Networking**: P2P infrastructure with WebAssembly server fallback
- **Electron Desktop**: Cross-platform desktop app wrapper
- **Game Mode System**: Single/Cooperative/Versus mode selection and lobby
- **Multiplayer Foundation**: Game state synchronization and player management
- **Single Player Integration**: Maintains compatibility with existing gameplay

### 🔄 Active Development Areas
- **Network State Synchronization**: Latency compensation and rollback
- **Game Mode Features**: Cooperative and versus mode specific mechanics
- **UI Polish**: Enhanced multiplayer lobby and game interface

### 📋 Architecture Decisions
- **Host-Authoritative**: Host maintains canonical game state
- **Peer Validation**: Non-host peers validate and predict
- **Ad-hoc Networking**: Players can join/leave dynamically
- **Graceful Degradation**: Always fall back to single-player

## AI-Assisted Development Workflow

### Feature Branch Context
Always consider the current feature branch context when making suggestions:
- **Current Branch**: Check git branch name for feature context
- **Session Scope**: Focus on files and components related to current work session
- **Documentation**: Update relevant documentation files alongside code changes
- **Git Staging**: Only suggest staging files actually modified in current session

### Work Session Guidelines
1. **Session Scope**: Understand the specific feature or bug being addressed
2. **Component Focus**: Concentrate on files and systems directly related to current work
3. **Integration Points**: Identify where new code connects to existing systems
4. **Documentation Updates**: Include architecture docs, README updates, session logs
5. **Testing Strategy**: Suggest appropriate testing for the current feature

### Git Best Practices for AI Work
```bash
# Good: Stage only files modified in current session
git add client/js/pwa/game-mode-manager.js    # New file created this session
git add docs/multiplayer-architecture.md       # Documentation for this feature
git add .github/copilot-instructions.md        # Updated AI context

# Avoid: Broad staging that includes unrelated changes
# git add . (too broad)
# git add client/ (includes unmodified files)
```

### Decision Logging
Document architectural decisions made during AI-assisted development:
- **Why**: Reasoning behind implementation choices
- **AI Input**: What AI tools suggested vs. human decisions
- **Alternatives**: Other approaches considered and why they were rejected
- **Impact**: How changes affect existing systems and future development

## Key Patterns & Lessons Learned

### Debug Tools & Development Experience
**Pattern**: Debug tools should be contextually appropriate and non-intrusive
- **Single Player Context**: Debug console only available in single player mode for game balance
- **User Intent Respect**: Case-sensitive command matching respects developer typing conventions
- **Progressive Enhancement**: Add autocomplete/intellisense for discoverability without breaking existing workflows
- **Integration Testing**: Debug tools should provide easy access to test complex game states (e.g., skip to boss fight)

### Feature Flag Architecture
**Pattern**: Feature flags should control both UI state and functional availability
- **UI Integration**: Disabled features show "Coming Soon" states rather than hidden UI
- **Progressive Rollout**: Enable single-player first, then cooperative, then versus modes
- **Environment Awareness**: Different flag behaviors for development vs production
- **URL Overrides**: Allow feature enabling via URL parameters for testing

### Global State Management in Vanilla JS
**Pattern**: Explicit window object synchronization for cross-component access
- **Variable Exports**: Game state variables must be explicitly exported to `window` object
- **Synchronization Points**: Update window globals whenever local variables change
- **Debug Access**: Global variables enable debug console to inspect and modify game state
- **Component Communication**: PWA components can access game state through window globals

### User Interface Consistency
**Pattern**: Restart flows should maintain user context and expectations
- **Context Preservation**: "Play Again" should restart game, not return to menu selection
- **State Reset**: Proper game state reset without full page reload
- **User Flow**: Minimize steps between game sessions for better experience

### Command Line Interface Design
**Pattern**: Modern CLI expectations apply to in-game consoles
- **Autocomplete**: Ctrl+Space pattern familiar from IDEs and terminals
- **Smart Matching**: Prefix, exact, and contains matching with priority ordering
- **Visual Feedback**: Syntax highlighting and selection indication
- **Keyboard Navigation**: Arrow keys, Tab, Enter, Escape follow standard conventions

### Development Tool Integration
**Pattern**: Debug tools should integrate with existing development workflows
- **Browser Console Integration**: Debug commands log to both custom UI and browser console
- **Feature Discovery**: Help systems should show exact command syntax and examples
- **Error Reporting**: Clear error messages with actionable suggestions
- **State Inspection**: Comprehensive game state debugging with variable types and availability

### Command Line Interface Patterns
**Pattern**: In-game consoles should follow modern terminal UX expectations
- **Autocomplete System**: Ctrl+Space triggers suggestions with smart matching (prefix > exact > contains)
- **Navigation Conventions**: Arrow keys for history/selection, Tab/Enter for completion, Escape to close
- **Visual Feedback**: Syntax highlighting, selection indication, scrollable suggestions
- **Error Handling**: Graceful null handling, clear error messages, command validation
- **Context Awareness**: Commands should validate preconditions and provide helpful guidance

### Security & Game Balance Considerations
**Pattern**: Debug features must not compromise multiplayer integrity
- **Mode Restrictions**: Debug console only available in single-player mode
- **Validation Gates**: Always check game mode before enabling debug features
- **State Isolation**: Debug commands should not affect multiplayer game state
- **Feature Flags**: Use feature flag system to control debug tool availability

This document should be referenced for all development decisions to maintain consistency with the established architecture and technology choices.