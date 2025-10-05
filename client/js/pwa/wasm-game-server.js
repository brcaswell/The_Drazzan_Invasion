// WebAssembly Game Server Loader
// Integrates AssemblyScript-compiled WASM with the game client

class GameServerWASM {
  constructor() {
    this.module = null;
    this.exports = null;
    this.memory = null;
    this.isLoaded = false;
    this.gameState = {
      players: new Map(),
      projectiles: new Map(),
      enemies: new Map(),
      frame: 0
    };
  }

  async initialize() {
    try {
      // Load the WebAssembly module
      const wasmPath = '/wasm/build/game-server.wasm';
      const wasmModule = await WebAssembly.instantiateStreaming(fetch(wasmPath), {
        env: {
          // Import functions that WASM can call
          consoleLog: (ptr, len) => {
            const str = this.getString(ptr, len);
            console.log('[WASM]', str);
          },
          
          mathSin: Math.sin,
          mathCos: Math.cos,
          mathSqrt: Math.sqrt,
          
          dateNow: () => Date.now(),
          
          // Memory allocation helpers
          memoryGrow: (pages) => this.memory.grow(pages)
        }
      });

      this.module = wasmModule.module;
      this.exports = wasmModule.instance.exports;
      this.memory = this.exports.memory;
      
      // Initialize the game server
      const success = this.exports.initializeServer(1); // 1 = cooperative mode
      if (success) {
        this.isLoaded = true;
        console.log('[GameServer] WebAssembly server initialized successfully');
        return true;
      } else {
        throw new Error('Failed to initialize WASM game server');
      }
    } catch (error) {
      console.error('[GameServer] Failed to load WebAssembly:', error);
      // Fall back to JavaScript implementation
      await this.initializeJSFallback();
      return false;
    }
  }

  async initializeJSFallback() {
    console.log('[GameServer] Using JavaScript fallback implementation');
    
    // JavaScript implementation of game server logic
    this.jsServer = new JavaScriptGameServer();
    this.isLoaded = true;
  }

  // Add player to the game
  addPlayer(playerId, x = 400, y = 300) {
    if (this.exports && this.exports.addPlayer) {
      return this.exports.addPlayer(playerId, x, y);
    } else if (this.jsServer) {
      return this.jsServer.addPlayer(playerId, x, y);
    }
    return false;
  }

  // Remove player from the game
  removePlayer(playerId) {
    if (this.exports && this.exports.removePlayer) {
      return this.exports.removePlayer(playerId);
    } else if (this.jsServer) {
      return this.jsServer.removePlayer(playerId);
    }
    return false;
  }

  // Update player position
  updatePlayerPosition(playerId, x, y, vx = 0, vy = 0) {
    if (this.exports && this.exports.updatePlayerPosition) {
      return this.exports.updatePlayerPosition(playerId, x, y, vx, vy);
    } else if (this.jsServer) {
      return this.jsServer.updatePlayerPosition(playerId, x, y, vx, vy);
    }
    return false;
  }

  // Fire projectile
  fireProjectile(playerId, x, y, vx, vy, damage = 25) {
    if (this.exports && this.exports.fireProjectile) {
      return this.exports.fireProjectile(playerId, x, y, vx, vy, damage);
    } else if (this.jsServer) {
      return this.jsServer.fireProjectile(playerId, x, y, vx, vy, damage);
    }
    return -1;
  }

  // Spawn enemy
  spawnEnemy(x, y, type = 0) {
    if (this.exports && this.exports.spawnEnemy) {
      return this.exports.spawnEnemy(x, y, type);
    } else if (this.jsServer) {
      return this.jsServer.spawnEnemy(x, y, type);
    }
    return -1;
  }

  // Update game state
  updateGameState(deltaTime) {
    if (this.exports && this.exports.updateGameState) {
      this.exports.updateGameState(deltaTime);
    } else if (this.jsServer) {
      this.jsServer.updateGameState(deltaTime);
    }
  }

  // Get game state
  getGameState() {
    if (this.exports && this.exports.getGameState) {
      return this.exports.getGameState();
    } else if (this.jsServer) {
      return this.jsServer.getGameState();
    }
    return 0;
  }

  // Get player data
  getPlayerData(playerId) {
    if (this.exports && this.exports.getPlayerData) {
      const data = this.exports.getPlayerData(playerId);
      if (data !== -1) {
        // Unpack the i64 data: x(16) | y(16) | health(16) | score(16)
        return {
          x: (data >> 48) & 0xFFFF,
          y: (data >> 32) & 0xFFFF,
          health: (data >> 16) & 0xFFFF,
          score: data & 0xFFFF
        };
      }
    } else if (this.jsServer) {
      return this.jsServer.getPlayerData(playerId);
    }
    return null;
  }

  // Check if boss is active
  isBossActive() {
    if (this.exports && this.exports.isBossActive) {
      return this.exports.isBossActive();
    } else if (this.jsServer) {
      return this.jsServer.isBossActive();
    }
    return false;
  }

  // Get active player count
  getActivePlayerCount() {
    if (this.exports && this.exports.getActivePlayerCount) {
      return this.exports.getActivePlayerCount();
    } else if (this.jsServer) {
      return this.jsServer.getActivePlayerCount();
    }
    return 0;
  }

  // Helper method to read strings from WASM memory
  getString(ptr, len) {
    if (!this.memory) return '';
    const bytes = new Uint8Array(this.memory.buffer, ptr, len);
    return new TextDecoder().decode(bytes);
  }

  // Helper method to write strings to WASM memory
  setString(str, ptr) {
    if (!this.memory) return 0;
    const bytes = new TextEncoder().encode(str);
    const memory = new Uint8Array(this.memory.buffer);
    memory.set(bytes, ptr);
    return bytes.length;
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      isWASM: !!this.exports,
      memoryUsage: this.memory ? this.memory.buffer.byteLength : 0,
      gameFrame: this.gameState.frame
    };
  }
}

// JavaScript fallback implementation
class JavaScriptGameServer {
  constructor() {
    this.players = new Map();
    this.projectiles = new Map();
    this.enemies = new Map();
    this.nextProjectileId = 0;
    this.nextEnemyId = 0;
    this.gameFrame = 0;
    this.bossActive = false;
    
    this.CANVAS_WIDTH = 800;
    this.CANVAS_HEIGHT = 600;
    this.MAX_PLAYERS = 4;
  }

  addPlayer(playerId, x, y) {
    if (this.players.size >= this.MAX_PLAYERS) return false;
    
    this.players.set(playerId, {
      id: playerId,
      x, y,
      vx: 0, vy: 0,
      health: 100,
      score: 0,
      active: true,
      lastUpdate: Date.now()
    });
    return true;
  }

  removePlayer(playerId) {
    return this.players.delete(playerId);
  }

  updatePlayerPosition(playerId, x, y, vx, vy) {
    const player = this.players.get(playerId);
    if (!player) return false;
    
    if (x >= 0 && x <= this.CANVAS_WIDTH && y >= 0 && y <= this.CANVAS_HEIGHT) {
      player.x = x;
      player.y = y;
      player.vx = vx;
      player.vy = vy;
      player.lastUpdate = Date.now();
      return true;
    }
    return false;
  }

  fireProjectile(playerId, x, y, vx, vy, damage) {
    const projectileId = this.nextProjectileId++;
    this.projectiles.set(projectileId, {
      id: projectileId,
      playerId,
      x, y, vx, vy,
      damage,
      active: true
    });
    return projectileId;
  }

  spawnEnemy(x, y, type) {
    const enemyId = this.nextEnemyId++;
    this.enemies.set(enemyId, {
      id: enemyId,
      x, y,
      vx: 0, vy: 0,
      health: type === 1 ? 1000 : 50,
      type,
      active: true
    });
    
    if (type === 1) this.bossActive = true;
    return enemyId;
  }

  updateGameState(deltaTime) {
    this.gameFrame++;
    
    // Update projectiles
    for (const [id, projectile] of this.projectiles) {
      if (!projectile.active) continue;
      
      projectile.x += projectile.vx * deltaTime;
      projectile.y += projectile.vy * deltaTime;
      
      // Remove off-screen projectiles
      if (projectile.x < 0 || projectile.x > this.CANVAS_WIDTH ||
          projectile.y < 0 || projectile.y > this.CANVAS_HEIGHT) {
        this.projectiles.delete(id);
      }
    }
    
    // Update enemies
    for (const [id, enemy] of this.enemies) {
      if (!enemy.active) continue;
      
      if (enemy.type === 0) {
        enemy.y += 2.0 * deltaTime;
        if (enemy.y > this.CANVAS_HEIGHT) {
          this.enemies.delete(id);
        }
      } else {
        // Boss AI
        enemy.x += Math.sin(this.gameFrame * 0.02) * 3.0 * deltaTime;
        enemy.y += 1.0 * deltaTime;
      }
    }
    
    // Collision detection
    this.checkCollisions();
  }

  checkCollisions() {
    // Check projectile-enemy collisions
    for (const [pId, projectile] of this.projectiles) {
      if (!projectile.active) continue;
      
      for (const [eId, enemy] of this.enemies) {
        if (!enemy.active) continue;
        
        const radius = enemy.type === 1 ? 40 : 20;
        if (this.checkCollision(projectile.x, projectile.y, 5, enemy.x, enemy.y, radius)) {
          enemy.health -= projectile.damage;
          this.projectiles.delete(pId);
          
          if (enemy.health <= 0) {
            this.enemies.delete(eId);
            if (enemy.type === 1) this.bossActive = false;
            
            // Award points
            const player = this.players.get(projectile.playerId);
            if (player) {
              player.score += enemy.type === 1 ? 1000 : 100;
            }
          }
        }
      }
    }
    
    // Check enemy-player collisions
    for (const [eId, enemy] of this.enemies) {
      if (!enemy.active) continue;
      
      for (const [pId, player] of this.players) {
        if (!player.active) continue;
        
        const enemyRadius = enemy.type === 1 ? 40 : 20;
        if (this.checkCollision(enemy.x, enemy.y, enemyRadius, player.x, player.y, 15)) {
          player.health -= enemy.type === 1 ? 50 : 25;
          if (player.health <= 0) {
            player.active = false;
          }
        }
      }
    }
  }

  checkCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (r1 + r2);
  }

  getGameState() {
    const activePlayersCount = Array.from(this.players.values()).filter(p => p.active).length;
    const activeEnemiesCount = Array.from(this.enemies.values()).filter(e => e.active).length;
    const activeProjectilesCount = Array.from(this.projectiles.values()).filter(p => p.active).length;
    
    return (activePlayersCount << 16) | (activeEnemiesCount << 8) | activeProjectilesCount;
  }

  getPlayerData(playerId) {
    const player = this.players.get(playerId);
    if (!player || !player.active) return null;
    
    return {
      x: player.x,
      y: player.y,
      health: player.health,
      score: player.score
    };
  }

  isBossActive() {
    return this.bossActive;
  }

  getActivePlayerCount() {
    return Array.from(this.players.values()).filter(p => p.active).length;
  }
}

// Export for use in the main game
export { GameServerWASM };