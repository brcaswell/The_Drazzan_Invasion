---
ai_context:
  type: tech-specific
  role: technology-guide
  scope: generic
  technology: pwa-webrtc
  categories: [pwa, webrtc, multiplayer, p2p, offline-first]
  format_version: "2.0"
last_updated: "2025-11-23"
---

<!-- AI-CONTEXT: pwa-webrtc-patterns -->
<!-- SCOPE: generic -->

# PWA & WebRTC Instructions for Browser-Native Multiplayer Applications

## @AI-SECTION: pwa-architecture

### Progressive Web App Foundation
```javascript
// Service Worker Registration
class PWAManager {
    async init() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('SW registered:', registration);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration);
                });
            } catch (error) {
                console.warn('SW registration failed:', error);
            }
        }
    }
    
    handleServiceWorkerUpdate(registration) {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailableNotification();
            }
        });
    }
}
```

## @AI-SECTION: component-patterns

### GameModeManager Pattern
**Pattern**: Central coordinator for multiplayer functionality with single-player fallbacks
```javascript
// Established GameModeManager pattern - maintain consistency
class GameModeManager {
    constructor() {
        this.currentMode = 'single'; // always default to single
        this.callbacks = { onModeChange: [], onPlayerJoin: [] };
        this.singlePlayerGame = null;
        this.multiplayerSession = null;
    }
    
    // Always provide fallbacks for integration safety
    startSinglePlayer() {
        try {
            if (this.singlePlayerGame) {
                this.singlePlayerGame.initialize();
            } else {
                // Fallback to original game functions
                if (typeof startGame === 'function') startGame();
            }
        } catch (error) {
            console.error('[GameModeManager] Single player start failed:', error);
            // Ultimate fallback - try direct game initialization
            if (typeof window.initializeGame === 'function') {
                window.initializeGame();
            }
        }
    }
    
    // Global export pattern for browser-native compatibility
    exportToGlobal() {
        window.GameModeManager = GameModeManager;
        window.gameModeManager = this;
    }
}

// Always export both ways for maximum compatibility
export { GameModeManager };
```

### Backward Compatibility Pattern
**Pattern**: Safe integration with existing browser-native code
```javascript
// Check for existing objects before use
validateGameComponents() {
    const required = ['canvas', 'player', 'gameState', 'CONFIG'];
    const missing = required.filter(name => typeof window[name] === 'undefined');
    
    if (missing.length > 0) {
        console.warn('[PWA] Missing game components:', missing);
        this.initializeMissingComponents(missing);
    }
}

// Global object access pattern
setupGameState() {
    this.canvas = window.canvas;
    this.player = window.player;
    this.gameState = window.gameState || {};
    this.config = window.CONFIG || this.defaultConfig;
}
```

### Offline-First Application State
```javascript
// Application state that works offline
class OfflineApplicationManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.setupNetworkListeners();
        this.applicationState = this.loadFromStorage();
    }
    
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncWhenOnline();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.saveToStorage();
        });
    }
    
    saveToStorage() {
        localStorage.setItem('applicationState', JSON.stringify(this.applicationState));
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('applicationState');
        return saved ? JSON.parse(saved) : this.getDefaultState();
    }
}
```

## @AI-SECTION: webrtc-patterns

### WebRTC Connection Management
```javascript
class WebRTCManager {
    constructor() {
        this.connections = new Map();
        this.dataChannels = new Map();
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }
    
    async createConnection(peerId) {
        const connection = new RTCPeerConnection(this.configuration);
        
        // Handle ICE candidates
        connection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignalingMessage(peerId, {
                    type: 'ice-candidate',
                    candidate: event.candidate
                });
            }
        };
        
        // Handle connection state changes
        connection.onconnectionstatechange = () => {
            this.handleConnectionStateChange(peerId, connection.connectionState);
        };
        
        this.connections.set(peerId, connection);
        return connection;
    }
    
    setupDataChannel(peerId, connection) {
        const channel = connection.createDataChannel('applicationData', {
            ordered: true
        });
        
        channel.onopen = () => {
            console.log(`Data channel opened with ${peerId}`);
            this.dataChannels.set(peerId, channel);
        };
        
        channel.onmessage = (event) => {
            this.handleApplicationMessage(peerId, JSON.parse(event.data));
        };
        
        channel.onclose = () => {
            console.log(`Data channel closed with ${peerId}`);
            this.dataChannels.delete(peerId);
        };
        
        return channel;
    }
}
```

### P2P Application State Synchronization
```javascript
class ApplicationStateSynchronizer {
    constructor(webrtcManager) {
        this.webrtc = webrtcManager;
        this.applicationState = {};
        this.isHost = false;
        this.syncInterval = null;
    }
    
    // Host-authoritative pattern
    becomeHost() {
        this.isHost = true;
        this.startStateBroadcast();
    }
    
    startStateBroadcast() {
        if (!this.isHost) return;
        
        this.syncInterval = setInterval(() => {
            const stateUpdate = {
                type: 'state-update',
                state: this.applicationState,
                timestamp: Date.now()
            };
            
            this.broadcastToAllPeers(stateUpdate);
        }, 1000 / 20); // 20 FPS sync rate
    }
    
    handleApplicationMessage(peerId, message) {
        switch (message.type) {
            case 'state-update':
                if (!this.isHost) {
                    this.applyStateUpdate(message.state, message.timestamp);
                }
                break;
                
            case 'player-action':
                if (this.isHost) {
                    this.processPlayerAction(peerId, message.action);
                } else {
                    // Forward to host if not host
                    this.forwardToHost(message);
                }
                break;
        }
    }
    
    broadcastToAllPeers(message) {
        for (const [peerId, channel] of this.webrtc.dataChannels) {
            if (channel.readyState === 'open') {
                channel.send(JSON.stringify(message));
            }
        }
    }
}
```

## @AI-SECTION: signaling-patterns

### WebAssembly-Based Signaling Server
```javascript
// Fallback signaling through WebAssembly peer
class WebAssemblySignaling {
    constructor() {
        this.wasmModule = null;
        this.isConnected = false;
    }
    
    async initialize() {
        try {
            // Load WebAssembly signaling module
            const wasmResponse = await fetch('./wasm/signaling-peer.wasm');
            const wasmBytes = await wasmResponse.arrayBuffer();
            this.wasmModule = await WebAssembly.instantiate(wasmBytes);
            
            this.isConnected = true;
            return true;
        } catch (error) {
            console.warn('WebAssembly signaling unavailable:', error);
            return false;
        }
    }
    
    async sendSignalingMessage(targetPeer, message) {
        if (!this.isConnected) {
            throw new Error('Signaling server not available');
        }
        
        // Use WebAssembly peer as relay
        return this.wasmModule.instance.exports.relay_message(
            targetPeer,
            JSON.stringify(message)
        );
    }
}

// Ad-hoc signaling patterns
class AdHocSignaling {
    constructor() {
        this.discoveryMethods = [
            new QRCodeDiscovery(),
            new LocalNetworkDiscovery(),
            new WebAssemblySignaling()
        ];
    }
    
    async findPeers() {
        const results = await Promise.allSettled(
            this.discoveryMethods.map(method => method.discover())
        );
        
        return results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value)
            .flat();
    }
}
```

## @AI-SECTION: multiplayer-patterns

### Host-Authoritative Architecture
```javascript
class MultiplayerApplicationManager {
    constructor() {
        this.players = new Map();
        this.isHost = false;
        this.hostId = null;
        this.applicationState = this.initializeApplicationState();
    }
    
    // Host manages canonical application state
    processPlayerAction(playerId, action) {
        if (!this.isHost) {
            console.warn('Non-host received player action');
            return;
        }
        
        // Validate action
        if (!this.isValidAction(playerId, action)) {
            console.warn(`Invalid action from ${playerId}:`, action);
            return;
        }
        
        // Apply to canonical state
        this.applyActionToState(action);
        
        // Broadcast updated state
        this.synchronizer.broadcastStateUpdate();
    }
    
    // Peer validation and prediction
    predictAction(action) {
        if (this.isHost) return; // Host doesn't predict
        
        // Apply optimistically for responsiveness
        const rollbackState = this.cloneApplicationState();
        this.applyActionToState(action);
        
        // Store rollback point
        this.pendingActions.set(action.id, {
            action,
            rollbackState,
            timestamp: Date.now()
        });
    }
    
    handleHostStateUpdate(newState, timestamp) {
        // Rollback and replay if needed
        this.reconcileWithAuthoritativeState(newState, timestamp);
    }
}
```

### Graceful Degradation to Single Player
```javascript
class ApplicationModeManager {
    constructor() {
        this.currentMode = 'single';
        this.availableModes = ['single', 'cooperative', 'versus'];
        this.networkCapabilities = this.detectNetworkCapabilities();
    }
    
    async detectNetworkCapabilities() {
        const capabilities = {
            webrtc: this.isWebRTCSupported(),
            wasm: await this.isWasmSupported(),
            p2p: false
        };
        
        // Test actual P2P connectivity
        try {
            const testConnection = new RTCPeerConnection();
            capabilities.p2p = true;
            testConnection.close();
        } catch (error) {
            capabilities.p2p = false;
        }
        
        return capabilities;
    }
    
    getAvailableModes() {
        if (!this.networkCapabilities.webrtc || !this.networkCapabilities.p2p) {
            return ['single']; // Only single-player if no networking
        }
        
        return this.availableModes;
    }
    
    async switchMode(newMode) {
        if (!this.getAvailableModes().includes(newMode)) {
            console.warn(`Mode ${newMode} not available, falling back to single`);
            newMode = 'single';
        }
        
        await this.tearDownCurrentMode();
        await this.initializeMode(newMode);
        this.currentMode = newMode;
    }
}
```

## @AI-SECTION: performance-patterns

### Latency Compensation
```javascript
class LatencyCompensator {
    constructor() {
        this.latencyHistory = [];
        this.averageLatency = 0;
        this.maxHistorySize = 50;
    }
    
    recordLatency(latency) {
        this.latencyHistory.push(latency);
        
        if (this.latencyHistory.length > this.maxHistorySize) {
            this.latencyHistory.shift();
        }
        
        this.averageLatency = this.latencyHistory.reduce((a, b) => a + b, 0) 
                            / this.latencyHistory.length;
    }
    
    compensateForLatency(action) {
        // Predict where objects should be based on latency
        const compensation = this.averageLatency / 1000; // Convert to seconds
        
        if (action.type === 'move') {
            action.position.x += action.velocity.x * compensation;
            action.position.y += action.velocity.y * compensation;
        }
        
        return action;
    }
}
```

### Efficient State Delta Synchronization
```javascript
class DeltaSynchronizer {
    constructor() {
        this.lastSentState = null;
        this.compressionEnabled = true;
    }
    
    generateDelta(currentState) {
        if (!this.lastSentState) {
            // First sync - send full state
            this.lastSentState = this.deepClone(currentState);
            return { type: 'full-state', state: currentState };
        }
        
        const delta = this.computeStateDelta(this.lastSentState, currentState);
        
        if (Object.keys(delta).length === 0) {
            return null; // No changes
        }
        
        this.lastSentState = this.deepClone(currentState);
        return { type: 'delta', changes: delta };
    }
    
    computeStateDelta(oldState, newState) {
        const delta = {};
        
        for (const [key, newValue] of Object.entries(newState)) {
            const oldValue = oldState[key];
            
            if (!this.deepEqual(oldValue, newValue)) {
                delta[key] = newValue;
            }
        }
        
        return delta;
    }
    
    applyDelta(baseState, delta) {
        const newState = this.deepClone(baseState);
        
        for (const [key, value] of Object.entries(delta.changes)) {
            newState[key] = value;
        }
        
        return newState;
    }
}
```

## @AI-SECTION: error-handling

### Connection Failure Recovery
```javascript
class ConnectionRecoveryManager {
    constructor(webrtcManager) {
        this.webrtc = webrtcManager;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
    }
    
    async handleConnectionFailure(peerId) {
        console.log(`Connection failed with ${peerId}`);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached, falling back to single player');
            return this.fallbackToSinglePlayer();
        }
        
        // Exponential backoff
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        
        setTimeout(async () => {
            try {
                await this.attemptReconnection(peerId);
                this.reconnectAttempts = 0; // Reset on success
            } catch (error) {
                this.reconnectAttempts++;
                console.log(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
            }
        }, delay);
    }
    
    async fallbackToSinglePlayer() {
        // Clean up multiplayer state
        this.webrtc.closeAllConnections();
        
        // Notify application to switch modes
        window.applicationModeManager?.switchMode('single');
        
        // Preserve application state for single player
        return this.preserveApplicationStateForSinglePlayer();
    }
}
```

## @AI-SECTION: anti-patterns

### Avoid These Patterns
```javascript
// ❌ Bad: Blocking main thread with crypto operations
function generateSessionKey() {
    // Synchronous crypto operation blocks UI
    return crypto.getRandomValues(new Uint8Array(32));
}

// ✅ Good: Use Web Crypto API asynchronously
async function generateSessionKey() {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// ❌ Bad: No fallback for connection failures
class BadMultiplayerManager {
    constructor() {
        this.requiresConnection = true; // App breaks without connection
    }
}

// ✅ Good: Graceful degradation
class GoodMultiplayerManager {
    constructor() {
        this.preferredMode = 'multiplayer';
        this.fallbackMode = 'single';
        this.currentMode = this.fallbackMode; // Safe default
    }
}

// ❌ Bad: Sending full state every frame
setInterval(() => {
    sendToAllPeers({ type: 'state', data: fullApplicationState });
}, 16); // 60 FPS

// ✅ Good: Delta compression and smart sync
class SmartSynchronizer {
    update() {
        const delta = this.generateDelta();
        if (delta && this.shouldSync()) {
            this.sendToAllPeers(delta);
        }
    }
    
    shouldSync() {
        // Only sync when meaningful changes occur
        return this.framesSinceLastSync > this.minFramesBetweenSync;
    }
}
```

---

**🔗 Related**: See `javascript.md` for component patterns, `html-web.md` for PWA manifest configuration, and project-specific instructions for application-specific multiplayer implementations.