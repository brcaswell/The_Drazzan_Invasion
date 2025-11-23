// Game Server State Management in AssemblyScript
// Handles multiplayer game state, physics, and collision detection

// Player structure
class Player {
  id: i32;
  x: f32;
  y: f32;
  vx: f32;
  vy: f32;
  health: i32;
  score: i32;
  active: bool;
  lastUpdate: i64;

  constructor(id: i32, x: f32, y: f32) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0.0;
    this.vy = 0.0;
    this.health = 100;
    this.score = 0;
    this.active = true;
    this.lastUpdate = Date.now();
  }
}

// Laser/projectile structure
class Projectile {
  id: i32;
  playerId: i32;
  x: f32;
  y: f32;
  vx: f32;
  vy: f32;
  damage: i32;
  active: bool;

  constructor(id: i32, playerId: i32, x: f32, y: f32, vx: f32, vy: f32, damage: i32) {
    this.id = id;
    this.playerId = playerId;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.active = true;
  }
}

// Enemy structure
class Enemy {
  id: i32;
  x: f32;
  y: f32;
  vx: f32;
  vy: f32;
  health: i32;
  type: i32; // 0=normal, 1=boss
  active: bool;

  constructor(id: i32, x: f32, y: f32, type: i32) {
    this.id = id;
    this.x = x;  
    this.y = y;
    this.vx = 0.0;
    this.vy = 0.0;
    this.health = type === 1 ? 1000 : 50; // Boss has more health
    this.type = type;
    this.active = true;
  }
}

// Game constants
const MAX_PLAYERS: i32 = 4;
const MAX_PROJECTILES: i32 = 100;
const MAX_ENEMIES: i32 = 50;
const CANVAS_WIDTH: f32 = 800.0;
const CANVAS_HEIGHT: f32 = 600.0;
const PLAYER_SPEED: f32 = 5.0;
const PROJECTILE_SPEED: f32 = 10.0;

// Game state arrays
let players = new Array<Player>(MAX_PLAYERS);
let projectiles = new Array<Projectile>(MAX_PROJECTILES);
let enemies = new Array<Enemy>(MAX_ENEMIES);

// Game state variables
let gameFrame: i64 = 0;
let nextProjectileId: i32 = 0;
let nextEnemyId: i32 = 0;
let gameMode: i32 = 0; // 0=single, 1=coop, 2=versus
let bossActive: bool = false;

// Initialize game server
export function initializeServer(mode: i32): bool {
  gameMode = mode;
  gameFrame = 0;
  nextProjectileId = 0;
  nextEnemyId = 0;
  bossActive = false;
  
  // Clear all arrays
  for (let i = 0; i < MAX_PLAYERS; i++) {
    players[i] = new Player(-1, 0, 0);
    players[i].active = false;
  }
  
  for (let i = 0; i < MAX_PROJECTILES; i++) {
    projectiles[i] = new Projectile(-1, -1, 0, 0, 0, 0, 0);
    projectiles[i].active = false;
  }
  
  for (let i = 0; i < MAX_ENEMIES; i++) {
    enemies[i] = new Enemy(-1, 0, 0, 0);
    enemies[i].active = false;
  }
  
  return true;
}

// Add player to game
export function addPlayer(playerId: i32, x: f32, y: f32): bool {
  for (let i = 0; i < MAX_PLAYERS; i++) {
    if (!players[i].active) {
      players[i] = new Player(playerId, x, y);
      return true;
    }
  }
  return false; // No slot available
}

// Remove player from game
export function removePlayer(playerId: i32): bool {
  for (let i = 0; i < MAX_PLAYERS; i++) {
    if (players[i].active && players[i].id === playerId) {
      players[i].active = false;
      return true;
    }
  }
  return false;
}

// Update player position
export function updatePlayerPosition(playerId: i32, x: f32, y: f32, vx: f32, vy: f32): bool {
  for (let i = 0; i < MAX_PLAYERS; i++) {
    if (players[i].active && players[i].id === playerId) {
      // Validate bounds
      if (x >= 0 && x <= CANVAS_WIDTH && y >= 0 && y <= CANVAS_HEIGHT) {
        players[i].x = x;
        players[i].y = y;
        players[i].vx = vx;
        players[i].vy = vy;
        players[i].lastUpdate = Date.now();
        return true;
      }
    }
  }
  return false;
}

// Fire projectile
export function fireProjectile(playerId: i32, x: f32, y: f32, vx: f32, vy: f32, damage: i32): i32 {
  for (let i = 0; i < MAX_PROJECTILES; i++) {
    if (!projectiles[i].active) {
      projectiles[i] = new Projectile(nextProjectileId++, playerId, x, y, vx, vy, damage);
      return projectiles[i].id;
    }
  }
  return -1; // No slot available
}

// Spawn enemy
export function spawnEnemy(x: f32, y: f32, type: i32): i32 {
  for (let i = 0; i < MAX_ENEMIES; i++) {
    if (!enemies[i].active) {
      enemies[i] = new Enemy(nextEnemyId++, x, y, type);
      if (type === 1) bossActive = true; // Boss spawned
      return enemies[i].id;
    }
  }
  return -1; // No slot available  
}

// Physics and collision detection
function checkCollision(x1: f32, y1: f32, r1: f32, x2: f32, y2: f32, r2: f32): bool {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Mathf.sqrt(dx * dx + dy * dy);
  return distance < (r1 + r2);
}

// Update game state (called each frame)
export function updateGameState(deltaTime: f32): void {
  gameFrame++;
  
  // Update projectiles
  for (let i = 0; i < MAX_PROJECTILES; i++) {
    if (projectiles[i].active) {
      projectiles[i].x += projectiles[i].vx * deltaTime;
      projectiles[i].y += projectiles[i].vy * deltaTime;
      
      // Remove projectiles that are off-screen
      if (projectiles[i].x < 0 || projectiles[i].x > CANVAS_WIDTH ||
          projectiles[i].y < 0 || projectiles[i].y > CANVAS_HEIGHT) {
        projectiles[i].active = false;
      }
    }
  }
  
  // Update enemies (simple AI)
  for (let i = 0; i < MAX_ENEMIES; i++) {
    if (enemies[i].active) {
      // Simple downward movement for normal enemies
      if (enemies[i].type === 0) {
        enemies[i].y += 2.0 * deltaTime;
        if (enemies[i].y > CANVAS_HEIGHT) {
          enemies[i].active = false;
        }
      } else { // Boss AI
        // Simple oscillating movement
        enemies[i].x += Mathf.sin(f32(gameFrame) * 0.02) * 3.0 * deltaTime;
        enemies[i].y += 1.0 * deltaTime;
      }
    }
  }
  
  // Check projectile-enemy collisions
  for (let p = 0; p < MAX_PROJECTILES; p++) {
    if (projectiles[p].active) {
      for (let e = 0; e < MAX_ENEMIES; e++) {
        if (enemies[e].active) {
          const radius = enemies[e].type === 1 ? 40.0 : 20.0; // Boss is larger
          if (checkCollision(projectiles[p].x, projectiles[p].y, 5.0,
                           enemies[e].x, enemies[e].y, radius)) {
            // Hit detected
            enemies[e].health -= projectiles[p].damage;
            projectiles[p].active = false;
            
            if (enemies[e].health <= 0) {
              enemies[e].active = false;
              if (enemies[e].type === 1) bossActive = false; // Boss defeated
              
              // Award points to the player who fired the projectile
              for (let pl = 0; pl < MAX_PLAYERS; pl++) {
                if (players[pl].active && players[pl].id === projectiles[p].playerId) {
                  players[pl].score += enemies[e].type === 1 ? 1000 : 100;
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Check enemy-player collisions (damage players)
  for (let e = 0; e < MAX_ENEMIES; e++) {
    if (enemies[e].active) {
      for (let p = 0; p < MAX_PLAYERS; p++) {
        if (players[p].active) {
          const enemyRadius = enemies[e].type === 1 ? 40.0 : 20.0;
          if (checkCollision(enemies[e].x, enemies[e].y, enemyRadius,
                           players[p].x, players[p].y, 15.0)) {
            // Player hit
            players[p].health -= enemies[e].type === 1 ? 50 : 25;
            if (players[p].health <= 0) {
              players[p].active = false; // Player destroyed
            }
          }
        }
      }
    }
  }
}

// Get game state for synchronization
export function getGameState(): i32 {
  // This would serialize the game state into memory
  // For now, return a simple state indicator
  let activePlayersCount: i32 = 0;
  let activeEnemiesCount: i32 = 0;
  let activeProjectilesCount: i32 = 0;
  
  for (let i = 0; i < MAX_PLAYERS; i++) {
    if (players[i].active) activePlayersCount++;
  }
  
  for (let i = 0; i < MAX_ENEMIES; i++) {
    if (enemies[i].active) activeEnemiesCount++;
  }
  
  for (let i = 0; i < MAX_PROJECTILES; i++) {
    if (projectiles[i].active) activeProjectilesCount++;
  }
  
  return (activePlayersCount << 16) | (activeEnemiesCount << 8) | activeProjectilesCount;
}

// Get player data
export function getPlayerData(playerId: i32): i64 {
  for (let i = 0; i < MAX_PLAYERS; i++) {
    if (players[i].active && players[i].id === playerId) {
      // Pack player data into i64: x(16) | y(16) | health(16) | score(16)
      const x = i32(players[i].x) & 0xFFFF;
      const y = i32(players[i].y) & 0xFFFF;
      const health = players[i].health & 0xFFFF;
      const score = players[i].score & 0xFFFF;
      return (i64(x) << 48) | (i64(y) << 32) | (i64(health) << 16) | i64(score);
    }
  }
  return -1;
}

// Check if boss is active
export function isBossActive(): bool {
  return bossActive;
}

// Get active player count
export function getActivePlayerCount(): i32 {
  let count: i32 = 0;
  for (let i = 0; i < MAX_PLAYERS; i++) {
    if (players[i].active) count++;
  }
  return count;
}

// Memory management functions
export function allocate(size: i32): i32 {
  return heap.alloc(size);
}

export function deallocate(ptr: i32): void {
  heap.free(ptr);
}