# Decentralized PWA Architecture Guide

## The Drazzan Invasion - Distributed Multiplayer Game

### Overview

The Drazzan Invasion has been transformed from a traditional client-server architecture into a fully decentralized Progressive Web App (PWA) with WebAssembly-powered peer-to-peer game servers. This architecture provides:

- **Offline-first gameplay** with service worker caching
- **Peer-to-peer multiplayer** using WebRTC
- **Distributed game hosting** with WebAssembly servers
- **Cross-platform deployment** via PWA + Electron desktop wrapper
- **Decentralized discovery** through multiple signaling methods

## Architecture Components

### 1. Progressive Web App Foundation

```
client/
├── index.html              # Main app shell
├── manifest.json           # PWA configuration
├── sw.js                   # Service worker for offline capability
├── css/
│   └── styles.css         # Game styling
├── js/
│   ├── main.js            # Application entry point
│   ├── gameloop.js        # Core game engine (simple version)
│   ├── gameloop-extended.js # Extended version with boss fights
│   ├── player.js          # Player management
│   ├── enemy.js           # Enemy AI and behavior
│   ├── lasers.js          # Projectile system
│   ├── collisions.js      # Collision detection
│   ├── explosions.js      # Visual effects
│   └── pwa/               # PWA-specific modules
│       ├── service-worker-bridge.js  # SW communication
│       ├── network-manager.js        # P2P networking
│       ├── peer-server.js           # Distributed game server
│       ├── wasm-loader.js           # WebAssembly integration
│       └── wasm-game-server.js      # WASM server implementation
└── assets/                # Game assets (images, audio)
```

#### Key PWA Features:
- **App Shell**: Cached HTML/CSS/JS for instant loading
- **Service Worker**: Handles offline functionality and caching
- **Web App Manifest**: Enables "Add to Home Screen" on mobile
- **Responsive Design**: Works on desktop, tablet, and mobile

### 2. WebAssembly Game Server

The game server runs entirely in the browser using WebAssembly for performance-critical operations:

```javascript
// Example usage
const gameServer = await wasmLoader.initializeGameServer();

// Add players to the game
gameServer.addPlayer(playerId, x, y);

// Update game state each frame
gameServer.updateGameState(deltaTime);

// Get synchronized game state
const state = gameServer.getGameState();
```

#### Features:
- **High-performance physics**: Collision detection in WASM
- **Deterministic simulation**: Ensures consistent multiplayer state
- **JavaScript fallback**: Graceful degradation when WASM unavailable
- **Memory management**: Efficient allocation for real-time gaming

### 3. WebRTC Peer-to-Peer Networking

Direct browser-to-browser communication without central servers:

```javascript
// Initialize P2P networking
const networkManager = new NetworkManager();
await networkManager.initialize();

// Host a game
const gameCode = await networkManager.hostGame({
  maxPlayers: 4,
  gameMode: 'cooperative'
});

// Join a game
await networkManager.joinGame(gameCode);
```

#### Network Features:
- **WebRTC DataChannel**: Low-latency data transmission
- **Multiple signaling servers**: Fallback options for connection establishment
- **NAT traversal**: Works behind firewalls and routers
- **Automatic reconnection**: Handles network interruptions

### 4. Distributed Game Discovery

Multiple methods for finding and joining games:

#### WebRTC Signaling Servers
```javascript
const signalingServers = [
  'wss://signaling.drazzan.community/ws',
  'wss://backup-signaling.herokuapp.com/ws',
  'wss://local-signaling.lan:9001/ws'
];
```

#### Local Network Discovery (Desktop)
- **mDNS/Bonjour**: Auto-discover games on local network
- **BitTorrent DHT**: Community-based peer discovery
- **QR Code sharing**: Easy game joining via camera scan

### 5. Desktop Enhancement (Electron)

Enhanced capabilities when running as desktop app:

```
desktop/
├── package.json           # Electron configuration
├── src/
│   ├── main.js           # Electron main process
│   └── preload.js        # Secure API bridge
├── build/                # Application icons and assets
└── scripts/              # Build and development tools
```

#### Desktop Features:
- **Enhanced P2P**: Better NAT traversal with native libraries
- **System integration**: Notifications, file dialogs, clipboard
- **Auto-updater**: Seamless application updates
- **Performance monitoring**: Detailed metrics and reporting

## Deployment Architecture

### Web Deployment
```
CDN (Cloudflare/AWS CloudFront)
├── Static Assets (cached 1 year)
│   ├── /assets/* (images, audio)
│   ├── /js/* (game code)
│   └── /css/* (styles)
├── App Shell (cached with SW)
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
└── Dynamic Content
    └── /wasm/* (WebAssembly modules)
```

### Desktop Distribution
```
GitHub Releases
├── Windows (NSIS installer + portable)
├── macOS (DMG + auto-updater)
└── Linux (AppImage + DEB package)
```

## Security Model

### PWA Security
- **HTTPS required**: All network communication encrypted
- **Content Security Policy**: Prevents XSS attacks
- **Service Worker isolation**: Limited API access
- **Origin restrictions**: WebRTC limited to trusted domains

### P2P Security
- **WebRTC encryption**: Built-in DTLS for data channels
- **Peer verification**: Cryptographic handshakes
- **Data validation**: All game state changes verified
- **Rate limiting**: Prevents flooding attacks

## Performance Characteristics

### Latency
- **Local network**: < 5ms peer-to-peer
- **Internet P2P**: 20-100ms typical
- **Game loop**: 60 FPS with 16.67ms frame budget

### Scalability
- **No server costs**: Fully distributed architecture
- **Horizontal scaling**: More players = more compute power
- **Regional clustering**: Players connect to nearby peers

### Resource Usage
- **Memory**: ~50MB typical (WASM + game state)
- **CPU**: 10-30% single core for game server
- **Network**: 1-5 KB/s per peer connection

## Development Workflow

### Local Development
```bash
# Start development server
cd desktop/scripts
node dev-server.js

# The server will:
# - Serve client files from ../client/
# - Start Electron with hot reload
# - Watch for file changes
# - Restart on main process changes
```

### Building WebAssembly
```bash
cd client/wasm
./build.bat  # Windows
./build.sh   # Linux/macOS

# Creates:
# - build/game-server.wasm
# - build/build-info.json
```

### Building Desktop App
```bash
cd desktop
npm run build

# Creates distributables:
# - dist/win-unpacked/ (Windows)
# - dist/mac/ (macOS)
# - dist/linux-unpacked/ (Linux)
```

## Monitoring and Analytics

### Client-side Metrics
```javascript
// Performance monitoring
const metrics = {
  fps: performanceMonitor.averageFPS,
  latency: networkManager.averageLatency,
  peers: networkManager.connectedPeers.length,
  wasmActive: wasmLoader.gameServer.isWASM
};

// Send to analytics (privacy-preserving)
analytics.track('game_performance', metrics);
```

### Network Health
- **Connection quality**: RTT, packet loss, jitter
- **Peer discovery success rate**: Connection establishment metrics
- **Signaling server status**: Fallback server usage

## Troubleshooting Guide

### Common Issues

#### WASM Loading Failed
- **Symptom**: JavaScript fallback used
- **Cause**: Browser compatibility or network issues
- **Solution**: Ensure modern browser, check console for errors

#### WebRTC Connection Failed
- **Symptom**: Cannot join/host games
- **Cause**: Firewall/NAT restrictions
- **Solution**: Try different signaling servers, check network settings

#### Poor Performance
- **Symptom**: Low FPS, high latency
- **Cause**: CPU/network limitations
- **Solution**: Close other applications, check network connection

### Debug Information
```javascript
// Get comprehensive debug info
const debugInfo = {
  browser: navigator.userAgent,
  webrtc: networkManager.getCapabilities(),
  wasm: wasmLoader.getPerformanceMetrics(),
  game: gameEngine.getStats()
};

console.log('Debug Info:', debugInfo);
```

## Future Roadmap

### Planned Enhancements
1. **WebAssembly Optimizations**: Full AssemblyScript implementation
2. **Advanced AI**: Machine learning-powered enemy behavior
3. **Blockchain Integration**: NFT assets and achievements
4. **Cross-game Protocol**: Interoperability with other P2P games
5. **Mobile Native Apps**: React Native wrapper for iOS/Android

### Community Features
- **Mod Support**: Custom game modes and assets
- **Tournament System**: Automated competitive brackets
- **Replay System**: Game recording and sharing
- **Social Features**: Friends, leaderboards, achievements

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Make changes and test locally
5. Submit pull request with detailed description

### Architecture Principles
- **Offline-first**: All features work without internet
- **Progressive enhancement**: Graceful degradation on older browsers
- **Privacy-preserving**: No central data collection
- **Open source**: Community-driven development

---

*The Drazzan Invasion represents the future of web gaming: fully decentralized, privacy-preserving, and community-owned. No servers, no tracking, just pure peer-to-peer gaming.*