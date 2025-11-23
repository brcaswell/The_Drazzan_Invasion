# Drazzan Invasion - Desktop Distribution

The desktop version of Drazzan Invasion provides enhanced capabilities beyond the web version, including:

## Enhanced Features

### Native P2P Networking
- Advanced NAT traversal using native WebRTC implementations
- BitTorrent DHT-based peer discovery for truly decentralized gameplay
- Local network (mDNS/Bonjour) discovery for LAN parties
- Enhanced TURN/STUN server connectivity

### Desktop Integration
- System tray integration for background operation
- Native file operations for save/load functionality
- Clipboard integration for easy game code sharing
- Desktop notifications for game events
- Auto-updater for seamless version management

### Performance Enhancements
- Native performance monitoring and reporting
- Hardware-accelerated rendering optimizations
- Memory usage optimization for extended play sessions
- Background processing capabilities

## Installation

### From Release (Recommended)
1. Download the latest release for your platform:
   - Windows: `Drazzan-Invasion-Setup-2.0.0.exe` (installer) or `Drazzan-Invasion-2.0.0.exe` (portable)
   - macOS: `Drazzan-Invasion-2.0.0.dmg`
   - Linux: `Drazzan-Invasion-2.0.0.AppImage` or `drazzan-invasion_2.0.0_amd64.deb`

2. Install and run according to your platform's conventions

### Development Build
```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for current platform
npm run build

# Build for all platforms (requires additional setup)
npm run build:all
```

## Platform-Specific Features

### Windows
- NSIS installer with proper registry integration
- Portable executable option
- Windows Defender exclusions for optimal performance

### macOS
- Code-signed DMG for security
- macOS-native menus and shortcuts
- Automatic dark mode support

### Linux
- AppImage for universal compatibility
- Debian package for APT-based distributions
- Desktop integration with proper mime types

## Enhanced Networking

The desktop version includes several networking enhancements:

### Advanced WebRTC
- Native libdatachannel integration for better performance
- Enhanced ICE candidate gathering
- Improved NAT traversal success rates

### BitTorrent Discovery
Using WebTorrent protocol for peer discovery:
```javascript
// Example: Discovering games via BitTorrent DHT
const games = await desktopAPI.discoverGamesViaTorrent();
```

### Local Network Discovery
Automatic LAN game discovery:
```javascript
// Example: Advertising local game
await desktopAPI.advertiseLocalGame({
  gameMode: 'versus',
  maxPlayers: 4,
  currentPlayers: 1
});
```

## Desktop API

The desktop version exposes additional APIs through `window.electronAPI`:

### Storage
```javascript
// Persistent storage
await electronAPI.setStoreValue('gameSettings', settings);
const settings = await electronAPI.getStoreValue('gameSettings');

// Secure storage for sensitive data
await electronAPI.setSecureData('playerAuth', token);
```

### File Operations
```javascript
// Export game data
const result = await electronAPI.exportGameData(gameState);

// Import game data
const imported = await electronAPI.importGameData();
```

### System Integration
```javascript
// Clipboard operations
await electronAPI.writeToClipboard(gameCode);
const code = await electronAPI.readFromClipboard();

// System notifications
electronAPI.showNotification('Game Found!', {
  body: 'A new multiplayer game is available',
  onclick: () => joinGame()
});
```

### Enhanced P2P
```javascript
// Get enhanced WebRTC configuration
const rtcConfig = await electronAPI.getEnhancedWebRTCConfig();

// Advertise game with enhanced discovery
await electronAPI.advertiseGame({
  gameId: 'game-123',
  gameMode: 'versus',
  maxPlayers: 4
});
```

## Performance Monitoring

Built-in performance monitoring and reporting:

```javascript
// Get system performance metrics
const metrics = electronAPI.getPerformanceMetrics();

// Report performance issues
await performanceMonitor.reportPerformanceIssue({
  issue: 'Low FPS during boss fight',
  fps: 15,
  duration: 30000
});
```

## Auto-Updates

The desktop version includes automatic update capabilities:

- Checks for updates on startup
- Downloads updates in background
- Notifies user when update is ready
- Seamless installation on restart

## Configuration

### Game Settings
Stored in platform-appropriate locations:
- Windows: `%APPDATA%/drazzan-invasion/`
- macOS: `~/Library/Application Support/drazzan-invasion/`
- Linux: `~/.config/drazzan-invasion/`

### Network Settings
Enhanced networking options:
```json
{
  "maxConnections": 8,
  "autoHost": false,
  "preferredSignaling": "enhanced",
  "enableBitTorrentDiscovery": true,
  "enableLocalDiscovery": true,
  "customTurnServers": []
}
```

## Troubleshooting

### Common Issues

#### Connectivity Problems
1. Check firewall settings for UDP traffic
2. Verify TURN server configuration
3. Enable UPnP on router if available

#### Performance Issues
1. Update graphics drivers
2. Close other applications
3. Use performance monitoring to identify bottlenecks

#### Update Problems
1. Run as administrator (Windows) or with sudo (Linux)
2. Check internet connectivity
3. Manually download latest version if auto-update fails

### Debug Mode
Start with debug flags:
```bash
# Windows
.\Drazzan-Invasion.exe --dev --debug-network

# macOS/Linux
./drazzan-invasion --dev --debug-network
```

## Building from Source

### Prerequisites
- Node.js 18+ with npm
- Python 3.8+ (for native modules)
- Platform-specific build tools:
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: build-essential

### Optional Dependencies
For enhanced features:
```bash
# Enhanced WebRTC (requires compilation)
npm install node-datachannel

# BitTorrent discovery
npm install webtorrent-desktop

# Local network discovery
npm install mdns-js
```

### Build Process
```bash
# Clone repository
git clone https://github.com/brcaswell/The_Drazzan_Invasion.git
cd The_Drazzan_Invasion/desktop

# Install dependencies
npm install

# Build for development
npm run build:dev

# Build for production
npm run build:prod

# Package for distribution
npm run dist
```

## Contributing

Desktop-specific contributions welcome:
- Enhanced P2P networking implementations
- Platform-specific optimizations
- Additional system integrations
- Performance improvements

See main project README for general contribution guidelines.