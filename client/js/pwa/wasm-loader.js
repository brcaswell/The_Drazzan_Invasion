// WebAssembly Module Loader for P2P Game Server
// Loads and manages WebAssembly modules for distributed game hosting

import { GameServerWASM } from './wasm-game-server.js';

class WASMLoader {
  constructor() {
    this.modules = new Map();
    this.isSupported = this.checkWASMSupport();
    this.loadedModules = new Set();
    this.gameServer = null;
  }

  checkWASMSupport() {
    try {
      if (typeof WebAssembly === 'object' &&
          typeof WebAssembly.instantiate === 'function' &&
          typeof WebAssembly.Module === 'function' &&
          typeof WebAssembly.Instance === 'function') {
        // Test with a minimal WASM module
        const testModule = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
        return WebAssembly.validate(testModule);
      }
      return false;
    } catch (error) {
      console.warn('[WASM] WebAssembly not supported:', error);
      return false;
    }
  }

  async loadModule(name, wasmPath, imports = {}) {
    if (!this.isSupported) {
      throw new Error('WebAssembly not supported in this browser');
    }

    try {
      console.log(`[WASM] Loading module: ${name} from ${wasmPath}`);
      
      // Load the WASM file
      const wasmResponse = await fetch(wasmPath);
      if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch WASM module: ${wasmResponse.status}`);
      }

      const wasmBytes = await wasmResponse.arrayBuffer();
      
      // Default imports that all modules might need
      const defaultImports = {
        env: {
          memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
          consoleLog: (ptr, len) => {
            // Helper to log from WASM
            const memory = new Uint8Array(defaultImports.env.memory.buffer);
            const message = new TextDecoder().decode(memory.slice(ptr, len));
            console.log(`[WASM:${name}]`, message);
          },
          mathSin: Math.sin,
          mathCos: Math.cos,
          mathSqrt: Math.sqrt,
          dateNow: Date.now,
          ...imports.env
        },
        ...imports
      };

      // Instantiate the module
      const wasmModule = await WebAssembly.instantiate(wasmBytes, defaultImports);
      
      const moduleWrapper = {
        instance: wasmModule.instance,
        module: wasmModule.module,
        exports: wasmModule.instance.exports,
        memory: defaultImports.env.memory,
        name: name,
        loaded: Date.now()
      };

      this.modules.set(name, moduleWrapper);
      this.loadedModules.add(name);
      
      console.log(`[WASM] Successfully loaded module: ${name}`);
      return moduleWrapper;

    } catch (error) {
      console.error(`[WASM] Failed to load module ${name}:`, error);
      throw error;
    }
  }

  getModule(name) {
    return this.modules.get(name);
  }

  isModuleLoaded(name) {
    return this.loadedModules.has(name);
  }

  unloadModule(name) {
    if (this.modules.has(name)) {
      this.modules.delete(name);
      this.loadedModules.delete(name);
      console.log(`[WASM] Unloaded module: ${name}`);
      return true;
    }
    return false;
  }

  // Initialize the integrated game server
  async initializeGameServer() {
    if (!this.gameServer) {
      this.gameServer = new GameServerWASM();
    }
    
    const success = await this.gameServer.initialize();
    console.log(`[WASM] Game server initialized: ${success ? 'WASM' : 'JS fallback'}`);
    return this.gameServer;
  }

  // Get the game server instance
  getGameServer() {
    return this.gameServer;
  }

  // Load physics module for enhanced collision detection
  async loadPhysicsEngine() {
    const imports = {
      env: {
        // Physics-specific imports
        collision_callback: (obj1Id, obj2Id, force) => {
          if (window.gameEngine && window.gameEngine.onCollision) {
            window.gameEngine.onCollision(obj1Id, obj2Id, force);
          }
        }
      }
    };

    try {
      return await this.loadModule('physics', '/wasm/physics.wasm', imports);
    } catch (error) {
      console.warn('[WASM] Physics module failed to load, using JavaScript physics');
      return null;
    }
  }

  // Load AI module for enhanced enemy behavior
  async loadAIEngine() {
    const imports = {
      env: {
        // AI-specific imports
        pathfinding_callback: (entityId, pathPtr, pathLen) => {
          if (window.gameEngine && window.gameEngine.ai) {
            const memory = new Uint8Array(this.modules.get('ai').memory.buffer);
            const pathData = new Float32Array(memory.buffer, pathPtr, pathLen / 4);
            window.gameEngine.ai.setPath(entityId, Array.from(pathData));
          }
        }
      }
    };

    try {
      return await this.loadModule('ai', '/wasm/ai.wasm', imports);
    } catch (error) {
      console.warn('[WASM] AI module failed to load, using JavaScript AI');
      return null;
    }
  }

  // Initialize all game modules
  async initializeGameModules() {
    console.log('[WASM] Initializing game modules...');
    
    const results = {
      gameServer: null,
      physics: null,
      ai: null
    };

    // Initialize the integrated game server first
    results.gameServer = await this.initializeGameServer();

    // Load additional modules if available
    try {
      const loadPromises = [
        this.loadPhysicsEngine().then(module => { results.physics = module; }),
        this.loadAIEngine().then(module => { results.ai = module; })
      ];

      await Promise.allSettled(loadPromises);
      
      // Initialize additional modules
      if (results.physics && results.physics.exports.init_physics_world) {
        results.physics.exports.init_physics_world(800, 600); // Canvas dimensions
      }
      
      if (results.ai && results.ai.exports.init_ai_system) {
        results.ai.exports.init_ai_system();
      }

      console.log('[WASM] Game modules initialized:', {
        gameServer: !!results.gameServer,
        physics: !!results.physics,
        ai: !!results.ai
      });

      return results;

    } catch (error) {
      console.error('[WASM] Failed to initialize game modules:', error);
      return results;
    }
  }

  // Performance monitoring
  getPerformanceMetrics() {
    const metrics = {
      wasmSupported: this.isSupported,
      loadedModules: Array.from(this.loadedModules),
      moduleCount: this.modules.size,
      totalMemoryUsage: 0,
      gameServerMetrics: null
    };

    for (const [name, module] of this.modules) {
      if (module.memory) {
        metrics.totalMemoryUsage += module.memory.buffer.byteLength;
      }
    }

    if (this.gameServer) {
      metrics.gameServerMetrics = this.gameServer.getPerformanceMetrics();
    }

    return metrics;
  }

  // Memory management
  optimizeMemory() {
    for (const [name, module] of this.modules) {
      if (module.exports.optimize_memory) {
        try {
          module.exports.optimize_memory();
        } catch (error) {
          console.warn(`[WASM] Failed to optimize memory for ${name}:`, error);
        }
      }
    }
  }

  // Error handling and fallbacks
  handleModuleError(moduleName, error) {
    console.error(`[WASM] Module ${moduleName} error:`, error);
    
    // Implement fallback strategies
    switch (moduleName) {
      case 'gameserver':
        console.log('[WASM] Game server using JavaScript fallback');
        break;
      case 'physics':
        console.log('[WASM] Falling back to JavaScript physics');
        break;
      case 'ai':
        console.log('[WASM] Falling back to JavaScript AI');
        break;
    }
  }
}

// Create global instance
const wasmLoader = new WASMLoader();

// Export for module use
export { wasmLoader, WASMLoader };
class WasmLoader {
    constructor() {
        this.wasmModule = null;
        this.gameServer = null;
        this.isLoaded = false;
        this.memory = null;
        this.exports = null;
    }

    async loadWasm() {
        try {
            console.log('[WASM] Loading WebAssembly game server...');
            
            // Check if WebAssembly is supported
            if (typeof WebAssembly !== 'object') {
                throw new Error('WebAssembly not supported in this browser');
            }

            // Load the WASM file
            const wasmResponse = await fetch('/wasm/game-server.wasm');
            if (!wasmResponse.ok) {
                throw new Error(`Failed to fetch WASM file: ${wasmResponse.status}`);
            }

            const wasmBytes = await wasmResponse.arrayBuffer();
            
            // Define imports for the WASM module
            const imports = this.createWasmImports();
            
            // Instantiate the WASM module
            const wasmModule = await WebAssembly.instantiate(wasmBytes, imports);
            
            this.wasmModule = wasmModule;
            this.exports = wasmModule.instance.exports;
            this.memory = this.exports.memory;
            
            // Initialize the game server
            if (this.exports.init_game_server) {
                this.exports.init_game_server();
            }

            this.isLoaded = true;
            console.log('[WASM] Game server loaded successfully');
            
            // Create JavaScript wrapper
            this.gameServer = new WasmGameServer(this.exports, this.memory);
            
            return this.gameServer;
            
        } catch (error) {
            console.error('[WASM] Failed to load game server:', error);
            throw error;
        }
    }

    createWasmImports() {
        return {
            env: {
                // Memory management
                memory: new WebAssembly.Memory({ 
                    initial: 256, // 16MB initial
                    maximum: 1024 // 64MB maximum
                }),

                // JavaScript callbacks from WASM
                js_log: (ptr, len) => {
                    const message = this.readStringFromMemory(ptr, len);
                    console.log('[WASM]', message);
                },

                js_error: (ptr, len) => {
                    const message = this.readStringFromMemory(ptr, len);
                    console.error('[WASM]', message);
                },

                js_send_message: (playerIdPtr, playerIdLen, messagePtr, messageLen) => {
                    const playerId = this.readStringFromMemory(playerIdPtr, playerIdLen);
                    const message = this.readStringFromMemory(messagePtr, messageLen);
                    this.sendMessageToPlayer(playerId, message);
                },

                js_broadcast_message: (messagePtr, messageLen) => {
                    const message = this.readStringFromMemory(messagePtr, messageLen);
                    this.broadcastMessage(message);
                },

                js_get_current_time: () => {
                    return Date.now();
                },

                js_random: () => {
                    return Math.random();
                },

                // WebRTC callbacks
                js_create_peer_connection: (configPtr, configLen) => {
                    const config = this.readStringFromMemory(configPtr, configLen);
                    return this.createPeerConnection(JSON.parse(config));
                },

                js_send_webrtc_message: (peerIdPtr, peerIdLen, messagePtr, messageLen) => {
                    const peerId = this.readStringFromMemory(peerIdPtr, peerIdLen);
                    const message = this.readStringFromMemory(messagePtr, messageLen);
                    this.sendWebRTCMessage(peerId, message);
                },

                // File system (for game state persistence)
                js_load_file: (pathPtr, pathLen) => {
                    const path = this.readStringFromMemory(pathPtr, pathLen);
                    return this.loadFile(path);
                },

                js_save_file: (pathPtr, pathLen, dataPtr, dataLen) => {
                    const path = this.readStringFromMemory(pathPtr, pathLen);
                    const data = this.readBytesFromMemory(dataPtr, dataLen);
                    return this.saveFile(path, data);
                },

                // Math functions (if not available in WASM)
                sin: Math.sin,
                cos: Math.cos,
                tan: Math.tan,
                sqrt: Math.sqrt,
                pow: Math.pow,
                floor: Math.floor,
                ceil: Math.ceil
            },

            // WebAssembly System Interface (WASI) - basic support
            wasi_snapshot_preview1: {
                proc_exit: (code) => {
                    console.log('[WASM] Process exit with code:', code);
                },
                fd_write: (fd, iovs_ptr, iovs_len, nwritten_ptr) => {
                    // Basic stdout/stderr support
                    return 0;
                }
            }
        };
    }

    readStringFromMemory(ptr, len) {
        if (!this.memory) return '';
        
        const bytes = new Uint8Array(this.memory.buffer, ptr, len);
        return new TextDecoder('utf-8').decode(bytes);
    }

    readBytesFromMemory(ptr, len) {
        if (!this.memory) return new Uint8Array(0);
        
        return new Uint8Array(this.memory.buffer, ptr, len);
    }

    writeStringToMemory(str) {
        if (!this.memory || !this.exports.malloc) return 0;
        
        const bytes = new TextEncoder().encode(str);
        const ptr = this.exports.malloc(bytes.length);
        const memory = new Uint8Array(this.memory.buffer);
        memory.set(bytes, ptr);
        
        return { ptr, len: bytes.length };
    }

    // JavaScript callback implementations
    sendMessageToPlayer(playerId, message) {
        if (window.networkManager) {
            window.networkManager.sendToPlayer(playerId, message);
        }
    }

    broadcastMessage(message) {
        if (window.networkManager) {
            window.networkManager.broadcast(message);
        }
    }

    createPeerConnection(config) {
        if (window.networkManager) {
            return window.networkManager.createPeerConnection(config);
        }
        return 0;
    }

    sendWebRTCMessage(peerId, message) {
        if (window.networkManager) {
            window.networkManager.sendWebRTCMessage(peerId, message);
        }
    }

    loadFile(path) {
        // Use IndexedDB or localStorage for persistence
        try {
            const data = localStorage.getItem(`drazzan_${path}`);
            if (data) {
                const bytes = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
                const ptr = this.exports.malloc(bytes.length);
                const memory = new Uint8Array(this.memory.buffer);
                memory.set(bytes, ptr);
                return ptr;
            }
        } catch (error) {
            console.error('[WASM] Failed to load file:', path, error);
        }
        return 0;
    }

    saveFile(path, data) {
        try {
            const base64 = btoa(String.fromCharCode(...data));
            localStorage.setItem(`drazzan_${path}`, base64);
            return 1; // Success
        } catch (error) {
            console.error('[WASM] Failed to save file:', path, error);
            return 0; // Failure
        }
    }
}

// JavaScript wrapper for WASM game server
class WasmGameServer {
    constructor(exports, memory) {
        this.exports = exports;
        this.memory = memory;
        this.players = new Map();
        this.gameState = null;
    }

    // Game server API
    createGame(hostPlayerId) {
        if (!this.exports.create_game) {
            console.error('[WASM] create_game function not found');
            return null;
        }

        const playerIdData = this.writeStringToMemory(hostPlayerId);
        const gameId = this.exports.create_game(playerIdData.ptr, playerIdData.len);
        
        if (playerIdData.ptr && this.exports.free) {
            this.exports.free(playerIdData.ptr);
        }

        return gameId;
    }

    joinGame(gameId, playerId) {
        if (!this.exports.join_game) {
            console.error('[WASM] join_game function not found');
            return false;
        }

        const playerIdData = this.writeStringToMemory(playerId);
        const result = this.exports.join_game(gameId, playerIdData.ptr, playerIdData.len);
        
        if (playerIdData.ptr && this.exports.free) {
            this.exports.free(playerIdData.ptr);
        }

        return result === 1;
    }

    updatePlayer(playerId, x, y, health, score) {
        if (!this.exports.update_player) return false;

        const playerIdData = this.writeStringToMemory(playerId);
        const result = this.exports.update_player(
            playerIdData.ptr, playerIdData.len, 
            x, y, health, score
        );
        
        if (playerIdData.ptr && this.exports.free) {
            this.exports.free(playerIdData.ptr);
        }

        return result === 1;
    }

    processGameTick(deltaTime) {
        if (!this.exports.process_game_tick) return;
        
        this.exports.process_game_tick(deltaTime);
    }

    getGameState() {
        if (!this.exports.get_game_state || !this.exports.get_game_state_size) {
            return null;
        }

        const size = this.exports.get_game_state_size();
        if (size === 0) return null;

        const ptr = this.exports.get_game_state();
        const data = this.readBytesFromMemory(ptr, size);
        
        try {
            return JSON.parse(new TextDecoder().decode(data));
        } catch (error) {
            console.error('[WASM] Failed to parse game state:', error);
            return null;
        }
    }

    handlePlayerAction(playerId, action, data) {
        if (!this.exports.handle_player_action) return;

        const playerIdData = this.writeStringToMemory(playerId);
        const actionData = this.writeStringToMemory(action);
        const payloadData = this.writeStringToMemory(JSON.stringify(data));

        this.exports.handle_player_action(
            playerIdData.ptr, playerIdData.len,
            actionData.ptr, actionData.len,
            payloadData.ptr, payloadData.len
        );

        // Clean up memory
        if (this.exports.free) {
            if (playerIdData.ptr) this.exports.free(playerIdData.ptr);
            if (actionData.ptr) this.exports.free(actionData.ptr);
            if (payloadData.ptr) this.exports.free(payloadData.ptr);
        }
    }

    // Utility methods
    writeStringToMemory(str) {
        if (!this.memory || !this.exports.malloc) return { ptr: 0, len: 0 };
        
        const bytes = new TextEncoder().encode(str);
        const ptr = this.exports.malloc(bytes.length);
        const memory = new Uint8Array(this.memory.buffer);
        memory.set(bytes, ptr);
        
        return { ptr, len: bytes.length };
    }

    readBytesFromMemory(ptr, len) {
        if (!this.memory) return new Uint8Array(0);
        return new Uint8Array(this.memory.buffer, ptr, len);
    }

    // Cleanup
    destroy() {
        if (this.exports.cleanup_game_server) {
            this.exports.cleanup_game_server();
        }
    }
}

// Global WASM loader instance
window.wasmLoader = new WasmLoader();