# WebAssembly Development Instructions  

## Apply to: `client/wasm/**/*` (WebAssembly Components)

### Context
WebAssembly (WASM) components in The Drazzan Invasion provide high-performance game server functionality that runs in the browser. These components are compiled from Rust or C++ and serve as peer-to-peer game servers with JavaScript bridges for integration.

### Architecture Overview
1. **Browser-Based Servers**: WASM modules act as game servers within the browser
2. **P2P Authority**: Each peer can host authoritative game sessions
3. **JavaScript Bridge**: JS files provide WASM integration and fallbacks
4. **Pre-Compiled**: WASM files are built separately, not compiled during development
5. **Optional Enhancement**: Game works without WASM, degrades gracefully

### File Structure
```
client/wasm/
├── build/                    # Compiled WASM binaries
│   ├── game-server.wasm     # Main game server
│   ├── physics-engine.wasm  # Physics calculations
│   └── network-codec.wasm   # Message encoding/decoding
├── js/                      # JavaScript bridge files
│   ├── wasm-loader.js       # WASM loading and initialization
│   ├── game-server-bridge.js # Game server integration
│   └── physics-bridge.js    # Physics engine integration
└── src/                     # Source code (Rust/C++)
    ├── game-server/         # Game server implementation
    ├── physics/             # Physics engine
    └── network/             # Network utilities
```

### JavaScript Bridge Patterns

#### WASM Loading Pattern
```javascript
// wasm-loader.js structure
class WasmLoader {
    constructor() {
        this.modules = new Map();
        this.isSupported = this.checkWasmSupport();
    }
    
    async loadModule(name, wasmPath) {
        if (!this.isSupported) {
            console.warn(`[WASM] WebAssembly not supported, using fallback for ${name}`);
            return null;
        }
        
        try {
            const wasmModule = await WebAssembly.instantiateStreaming(fetch(wasmPath));
            this.modules.set(name, wasmModule);
            return wasmModule;
        } catch (error) {
            console.error(`[WASM] Failed to load ${name}:`, error);
            return null;
        }
    }
    
    checkWasmSupport() {
        return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
    }
}
```

#### Bridge Integration Pattern
```javascript
// game-server-bridge.js structure
class GameServerBridge {
    constructor() {
        this.wasmModule = null;
        this.fallbackMode = false;
    }
    
    async initialize() {
        const loader = new WasmLoader();
        this.wasmModule = await loader.loadModule('game-server', 'wasm/build/game-server.wasm');
        
        if (!this.wasmModule) {
            console.log('[WASM] Using JavaScript fallback for game server');
            this.fallbackMode = true;
            this.initializeFallback();
        } else {
            this.initializeWasm();
        }
    }
    
    // WASM method calls
    processGameState(gameState) {
        if (this.fallbackMode) {
            return this.processGameStateJS(gameState);
        } else {
            return this.wasmModule.instance.exports.process_game_state(gameState);
        }
    }
    
    // JavaScript fallback implementation
    processGameStateJS(gameState) {
        // Pure JavaScript implementation
        // Must provide same functionality as WASM version
    }
}
```

### Memory Management

#### WASM Memory Access
```javascript
// Safe memory operations
class WasmMemoryManager {
    constructor(wasmInstance) {
        this.memory = wasmInstance.exports.memory;
        this.buffer = this.memory.buffer;
    }
    
    // Write data to WASM memory
    writeBytes(ptr, data) {
        const view = new Uint8Array(this.buffer, ptr, data.length);
        view.set(data);
    }
    
    // Read data from WASM memory
    readBytes(ptr, length) {
        return new Uint8Array(this.buffer, ptr, length);
    }
    
    // Allocate memory (must match WASM allocator)
    allocate(size) {
        return this.wasmInstance.exports.allocate(size);
    }
    
    // Free memory (prevent leaks)
    deallocate(ptr) {
        this.wasmInstance.exports.deallocate(ptr);
    }
}
```

### Game Server Integration

#### Server State Management
```javascript
// Integration with GameModeManager
class WasmGameServer {
    constructor(gameModeManager) {
        this.manager = gameModeManager;
        this.bridge = new GameServerBridge();
        this.isAuthoritative = false;
    }
    
    async startServer(gameMode, players) {
        await this.bridge.initialize();
        
        const serverConfig = {
            mode: gameMode,
            maxPlayers: players.length,
            tickRate: 60,
            enablePhysics: true
        };
        
        if (this.bridge.fallbackMode) {
            return this.startJavaScriptServer(serverConfig);
        } else {
            return this.startWasmServer(serverConfig);
        }
    }
    
    // Process game tick
    processTick(gameState, inputState) {
        const processedState = this.bridge.processGameState({
            gameState: gameState,
            inputs: inputState,
            deltaTime: 16.67 // 60 FPS
        });
        
        return processedState;
    }
}
```

### Performance Optimization

#### Efficient Data Transfer
```javascript
// Minimize JavaScript <-> WASM boundary crossings
class OptimizedWasmBridge {
    constructor() {
        this.batchedOperations = [];
        this.batchTimer = null;
    }
    
    // Batch operations to reduce overhead
    batchOperation(operation) {
        this.batchedOperations.push(operation);
        
        if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.processBatch();
                this.batchTimer = null;
            }, 0);
        }
    }
    
    processBatch() {
        if (this.wasmModule && this.batchedOperations.length > 0) {
            const results = this.wasmModule.instance.exports.process_batch(
                this.serializeBatch(this.batchedOperations)
            );
            this.handleBatchResults(results);
        }
        this.batchedOperations = [];
    }
}
```

### Error Handling & Fallbacks

#### Graceful Degradation
```javascript
// Always provide JavaScript fallbacks
class RobustWasmService {
    constructor() {
        this.wasmAvailable = false;
        this.capabilities = {
            highPerformancePhysics: false,
            advancedNetworking: false,
            complexAI: false
        };
    }
    
    async initialize() {
        try {
            await this.loadWasmModules();
            this.wasmAvailable = true;
            this.capabilities = {
                highPerformancePhysics: true,
                advancedNetworking: true,
                complexAI: true
            };
        } catch (error) {
            console.warn('[WASM] Falling back to JavaScript implementation');
            this.initializeFallbacks();
        }
    }
    
    // Feature detection based on capabilities
    getOptimalStrategy(feature) {
        if (this.wasmAvailable && this.capabilities[feature]) {
            return this.getWasmStrategy(feature);
        } else {
            return this.getJavaScriptStrategy(feature);
        }
    }
}
```

### Network Integration

#### P2P Server Coordination
```javascript
// WASM servers coordinate over WebRTC
class P2PServerNetwork {
    constructor() {
        this.localServer = null;
        this.peerServers = new Map();
        this.isHost = false;
    }
    
    async createServerCluster(peers) {
        // Each peer starts a WASM server
        this.localServer = new WasmGameServer();
        await this.localServer.initialize();
        
        // Coordinate with peer servers
        for (const peer of peers) {
            this.coordinateWithPeer(peer);
        }
    }
    
    // Synchronize server states
    synchronizeServers(gameState) {
        const serverStates = new Map();
        
        // Process locally
        const localResult = this.localServer.processTick(gameState);
        serverStates.set('local', localResult);
        
        // Collect peer results
        for (const [peerId, peerServer] of this.peerServers) {
            const peerResult = peerServer.getLastResult();
            serverStates.set(peerId, peerResult);
        }
        
        // Consensus resolution (host authoritative with peer validation)
        return this.resolveConsensus(serverStates);
    }
}
```

### Development & Testing

#### WASM Module Testing
```javascript
// Test WASM module functionality
class WasmTester {
    constructor() {
        this.testResults = new Map();
    }
    
    async runTests() {
        console.log('[WASM] Running WebAssembly tests...');
        
        const tests = [
            () => this.testModuleLoading(),
            () => this.testMemoryOperations(),
            () => this.testGameServerFunctions(),
            () => this.testPhysicsEngine(),
            () => this.testNetworkCodec()
        ];
        
        for (const test of tests) {
            try {
                await test();
                console.log(`[WASM] Test passed: ${test.name}`);
            } catch (error) {
                console.error(`[WASM] Test failed: ${test.name}`, error);
            }
        }
    }
    
    // Individual test methods
    async testModuleLoading() {
        const loader = new WasmLoader();
        const module = await loader.loadModule('test', 'wasm/build/game-server.wasm');
        if (!module) throw new Error('Module loading failed');
    }
}

// Global testing interface
window.wasmTester = new WasmTester();
```

### Anti-Patterns to Avoid

❌ **Don't:**
```javascript
// Synchronous WASM loading
const wasmModule = WebAssembly.instantiateSync(wasmBytes); // Blocks main thread

// Memory leaks
function processData(data) {
    const ptr = wasmModule.exports.allocate(data.length);
    // Missing: wasmModule.exports.deallocate(ptr);
}

// No fallback error handling
const result = wasmModule.instance.exports.process(data); // Will throw if WASM fails
```

✅ **Do:**
```javascript
// Asynchronous WASM loading
const wasmModule = await WebAssembly.instantiateStreaming(fetch(wasmPath));

// Proper memory management
function processData(data) {
    const ptr = wasmModule.exports.allocate(data.length);
    try {
        // Use ptr
        return wasmModule.exports.process(ptr, data.length);
    } finally {
        wasmModule.exports.deallocate(ptr);
    }
}

// Robust error handling with fallbacks
function processWithFallback(data) {
    if (this.wasmAvailable) {
        try {
            return this.wasmModule.instance.exports.process(data);
        } catch (error) {
            console.warn('[WASM] Error, using fallback:', error);
        }
    }
    return this.processJavaScript(data);
}
```

This ensures WebAssembly components integrate seamlessly with the JavaScript game while providing performance benefits and maintaining the project's principle of graceful degradation.

## AI-Assisted WASM Development

### AI Limitations with WebAssembly
AI tools have varying effectiveness with WASM development:

**High AI Value:**
- JavaScript bridge code generation
- Error handling and fallback patterns
- Memory management wrapper functions
- Integration with existing JavaScript systems

**Limited AI Value:**
- Raw WebAssembly optimization
- Low-level memory management
- Performance-critical algorithm implementation
- Binary format debugging

### Feature Branch WASM Work
```bash
# WASM development typically involves:
client/wasm/js/wasm-loader.js          # AI can help with loading logic
client/wasm/js/game-server-bridge.js   # AI excellent for bridge patterns
client/wasm/build/game-server.wasm     # Pre-compiled, no AI assistance
docs/wasm-architecture.md              # AI helps with documentation
```

### Development Session Approach
1. **Analysis Phase**: AI helps analyze integration requirements
2. **Bridge Development**: AI generates JavaScript bridge boilerplate
3. **Fallback Implementation**: AI assists with pure JS alternatives
4. **Testing**: AI helps create test scenarios and validation

### Git Staging for WASM Work
```bash
# Good: Stage WASM bridge and related files
git add client/wasm/js/                # JavaScript bridge files
git add docs/wasm-integration.md       # Integration documentation

# Usually avoid staging WASM binaries (pre-compiled)
# client/wasm/build/*.wasm should be in .gitignore or committed separately
```

### AI Development Pattern for WASM
```javascript
// AI-Generated Bridge Pattern
class AIAssistedWasmBridge {
    constructor() {
        // AI excels at generating this boilerplate
    }
    
    async initialize() {
        // AI can suggest error handling patterns
        try {
            await this.loadWasm();
        } catch (error) {
            // AI-suggested fallback patterns
            this.initializeFallback();
        }
    }
    
    // Performance-critical logic: Human-written
    processGameTick(gameState) {
        // This logic requires domain expertise
    }
}
```