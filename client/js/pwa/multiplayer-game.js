// Multiplayer Game - handles the actual multiplayer game mechanics
class MultiplayerGame {
    constructor(gameModeManager) {
        this.manager = gameModeManager;
        this.gameState = {
            mode: null,
            players: new Map(),
            isActive: false,
            isPaused: false,
            gameTime: 0,
            roundNumber: 1,
            scores: new Map()
        };
        
        this.gameObjects = {
            asteroids: [],
            enemies: [],
            lasers: [],
            explosions: [],
            powerUps: []
        };
        
        this.config = {
            maxPlayers: 4,
            tickRate: 60,
            syncInterval: 1000, // Sync every second
            maxLatency: 200, // Max acceptable latency
            rollbackFrames: 10 // Frames to keep for rollback
        };
        
        this.stateHistory = [];
        this.lastSync = Date.now();
        this.isHost = false;
    }

    // Initialize multiplayer game
    initialize(mode, isHost = false) {
        this.gameState.mode = mode;
        this.isHost = isHost;
        
        // Load original game components with multiplayer adaptations
        this.loadGameComponents();
        
        // Setup multiplayer-specific systems
        this.setupStateSynchronization();
        this.setupPlayerManagement();
        this.setupGameModeLogic();
        
        console.log(`Multiplayer game initialized - Mode: ${mode}, Host: ${isHost}`);
    }

    // Load and adapt existing game components
    loadGameComponents() {
        // Import existing game modules with multiplayer modifications
        this.canvas = new Canvas();
        this.input = new Input();
        this.collisions = new Collisions();
        this.explosions = new Explosions();
        this.scoreboard = new Scoreboard();
        
        // Convert single player to multiplayer arrays
        this.adaptSinglePlayerComponents();
    }

    // Adapt single-player components for multiplayer
    adaptSinglePlayerComponents() {
        // Instead of a single player, maintain player array
        this.gameState.players = new Map();
        
        // Convert global game objects to multiplayer tracking
        this.gameObjects = {
            players: new Map(), // Changed from single player
            asteroids: [],
            enemies: [],
            lasers: new Map(), // Track by player ID
            explosions: [],
            powerUps: []
        };
    }

    // Add player to game
    addPlayer(playerId, playerData) {
        const player = {
            id: playerId,
            name: playerData.name,
            x: this.getSpawnPosition(playerId).x,
            y: this.getSpawnPosition(playerId).y,
            vx: 0,
            vy: 0,
            angle: 0,
            health: 100,
            score: 0,
            lives: 3,
            powerUps: [],
            isActive: true,
            lastUpdate: Date.now(),
            inputState: {
                left: false,
                right: false,
                up: false,
                space: false
            }
        };
        
        this.gameState.players.set(playerId, player);
        this.gameObjects.players.set(playerId, player);
        this.gameObjects.lasers.set(playerId, []);
        this.gameState.scores.set(playerId, 0);
        
        console.log(`Player ${playerId} (${playerData.name}) added to game`);
    }

    // Remove player from game
    removePlayer(playerId) {
        const player = this.gameState.players.get(playerId);
        if (player) {
            console.log(`Player ${playerId} (${player.name}) removed from game`);
            
            // Clean up player data
            this.gameState.players.delete(playerId);
            this.gameObjects.players.delete(playerId);
            this.gameObjects.lasers.delete(playerId);
            this.gameState.scores.delete(playerId);
            
            // Handle host migration if needed
            if (this.isHost && playerId === this.manager.hostId) {
                this.handleHostMigration();
            }
        }
    }

    // Get spawn position for player
    getSpawnPosition(playerId) {
        const positions = [
            { x: 100, y: 100 },   // Player 1
            { x: 700, y: 100 },   // Player 2
            { x: 100, y: 500 },   // Player 3
            { x: 700, y: 500 }    // Player 4
        ];
        
        const playerIndex = Array.from(this.gameState.players.keys()).indexOf(playerId);
        return positions[playerIndex % positions.length];
    }

    // Setup game mode specific logic
    setupGameModeLogic() {
        switch (this.gameState.mode) {
            case 'coop':
                this.setupCooperativeMode();
                break;
            case 'versus':
                this.setupVersusMode();
                break;
            default:
                console.warn(`Unknown game mode: ${this.gameState.mode}`);
        }
    }

    // Setup cooperative mode
    setupCooperativeMode() {
        this.gameMode = {
            type: 'cooperative',
            sharedLives: true,
            totalLives: 9, // 3 lives per player max
            sharedScore: true,
            friendlyFire: false,
            reviveSystem: true,
            
            checkWinCondition: () => {
                // Win when all waves completed
                return this.gameState.roundNumber > 10; // Example: 10 waves
            },
            
            checkLoseCondition: () => {
                // Lose when all lives depleted or all players dead
                return this.getTotalLives() <= 0 || 
                       Array.from(this.gameState.players.values()).every(p => !p.isActive);
            }
        };
    }

    // Setup versus mode
    setupVersusMode() {
        this.gameMode = {
            type: 'versus',
            individualScores: true,
            friendlyFire: true,
            powerUpCompetition: true,
            timeLimit: 300000, // 5 minutes
            
            checkWinCondition: () => {
                // Win by highest score or last player standing
                const activePlayers = Array.from(this.gameState.players.values())
                    .filter(p => p.isActive);
                return activePlayers.length <= 1 || 
                       this.gameState.gameTime >= this.gameMode.timeLimit;
            },
            
            getWinner: () => {
                return Array.from(this.gameState.players.values())
                    .reduce((winner, player) => 
                        player.score > winner.score ? player : winner
                    );
            }
        };
    }

    // Main game loop for multiplayer
    update(deltaTime) {
        if (!this.gameState.isActive) return;
        
        this.gameState.gameTime += deltaTime;
        
        // Update all players
        this.updatePlayers(deltaTime);
        
        // Update game objects
        this.updateGameObjects(deltaTime);
        
        // Handle collisions
        this.handleCollisions();
        
        // Check game conditions
        this.checkGameConditions();
        
        // Sync state if host
        if (this.isHost && this.shouldSync()) {
            this.syncGameState();
        }
        
        // Store state for rollback
        this.storeStateSnapshot();
    }

    // Update all players
    updatePlayers(deltaTime) {
        for (const [playerId, player] of this.gameState.players) {
            if (!player.isActive) continue;
            
            // Apply player physics (adapted from original player.js)
            this.updatePlayerPhysics(player, deltaTime);
            
            // Handle player input
            this.processPlayerInput(player, deltaTime);
            
            // Update player-specific objects (lasers, etc.)
            this.updatePlayerObjects(playerId, deltaTime);
        }
    }

    // Update player physics (adapted from original)
    updatePlayerPhysics(player, deltaTime) {
        // Apply rotation
        if (player.inputState.left) player.angle -= 5 * deltaTime / 16.67;
        if (player.inputState.right) player.angle += 5 * deltaTime / 16.67;
        
        // Apply thrust
        if (player.inputState.up) {
            const thrust = 0.3 * deltaTime / 16.67;
            player.vx += Math.cos(player.angle) * thrust;
            player.vy += Math.sin(player.angle) * thrust;
        }
        
        // Apply drag
        player.vx *= 0.98;
        player.vy *= 0.98;
        
        // Update position
        player.x += player.vx * deltaTime / 16.67;
        player.y += player.vy * deltaTime / 16.67;
        
        // Screen wrapping
        const canvas = this.canvas.getCanvas();
        if (player.x < 0) player.x = canvas.width;
        if (player.x > canvas.width) player.x = 0;
        if (player.y < 0) player.y = canvas.height;
        if (player.y > canvas.height) player.y = 0;
    }

    // Process player input
    processPlayerInput(player, deltaTime) {
        // Handle laser firing
        if (player.inputState.space) {
            this.fireLaser(player.id);
        }
    }

    // Fire laser for player
    fireLaser(playerId) {
        const player = this.gameState.players.get(playerId);
        if (!player || !player.isActive) return;
        
        const playerLasers = this.gameObjects.lasers.get(playerId) || [];
        
        // Limit laser count
        if (playerLasers.length >= 4) return;
        
        const laser = {
            id: `${playerId}_${Date.now()}`,
            playerId: playerId,
            x: player.x,
            y: player.y,
            vx: Math.cos(player.angle) * 10,
            vy: Math.sin(player.angle) * 10,
            angle: player.angle,
            lifetime: 1000, // 1 second
            damage: 25
        };
        
        playerLasers.push(laser);
        this.gameObjects.lasers.set(playerId, playerLasers);
    }

    // Update game objects
    updateGameObjects(deltaTime) {
        // Update asteroids (shared objects)
        this.updateAsteroids(deltaTime);
        
        // Update enemies (shared objects)
        this.updateEnemies(deltaTime);
        
        // Update all player lasers
        this.updateAllLasers(deltaTime);
        
        // Update explosions
        this.updateExplosions(deltaTime);
        
        // Update power-ups
        this.updatePowerUps(deltaTime);
    }

    // Update asteroids (adapted from original)
    updateAsteroids(deltaTime) {
        this.gameObjects.asteroids.forEach((asteroid, index) => {
            asteroid.x += asteroid.vx * deltaTime / 16.67;
            asteroid.y += asteroid.vy * deltaTime / 16.67;
            asteroid.angle += asteroid.rotationSpeed * deltaTime / 16.67;
            
            // Screen wrapping
            const canvas = this.canvas.getCanvas();
            if (asteroid.x < -asteroid.size) asteroid.x = canvas.width + asteroid.size;
            if (asteroid.x > canvas.width + asteroid.size) asteroid.x = -asteroid.size;
            if (asteroid.y < -asteroid.size) asteroid.y = canvas.height + asteroid.size;
            if (asteroid.y > canvas.height + asteroid.size) asteroid.y = -asteroid.size;
        });
    }

    // Update all player lasers
    updateAllLasers(deltaTime) {
        for (const [playerId, lasers] of this.gameObjects.lasers) {
            for (let i = lasers.length - 1; i >= 0; i--) {
                const laser = lasers[i];
                
                // Update position
                laser.x += laser.vx * deltaTime / 16.67;
                laser.y += laser.vy * deltaTime / 16.67;
                laser.lifetime -= deltaTime;
                
                // Remove expired lasers
                if (laser.lifetime <= 0) {
                    lasers.splice(i, 1);
                    continue;
                }
                
                // Screen boundary check
                const canvas = this.canvas.getCanvas();
                if (laser.x < 0 || laser.x > canvas.width || 
                    laser.y < 0 || laser.y > canvas.height) {
                    lasers.splice(i, 1);
                }
            }
        }
    }

    // Handle all collision detection
    handleCollisions() {
        // Player-asteroid collisions
        this.checkPlayerAsteroidCollisions();
        
        // Laser-asteroid collisions
        this.checkLaserAsteroidCollisions();
        
        // Player-enemy collisions
        this.checkPlayerEnemyCollisions();
        
        // Player-powerup collisions
        this.checkPlayerPowerUpCollisions();
        
        // Player-player collisions (for versus mode)
        if (this.gameState.mode === 'versus') {
            this.checkPlayerPlayerCollisions();
        }
    }

    // Check player-asteroid collisions
    checkPlayerAsteroidCollisions() {
        for (const [playerId, player] of this.gameState.players) {
            if (!player.isActive) continue;
            
            this.gameObjects.asteroids.forEach((asteroid, asteroidIndex) => {
                if (this.collisions.checkCollision(player, asteroid)) {
                    this.handlePlayerHit(playerId, 'asteroid', 25);
                    this.createExplosion(player.x, player.y, 'player');
                }
            });
        }
    }

    // Handle player taking damage
    handlePlayerHit(playerId, source, damage) {
        const player = this.gameState.players.get(playerId);
        if (!player || !player.isActive) return;
        
        player.health -= damage;
        
        if (player.health <= 0) {
            this.handlePlayerDeath(playerId);
        }
    }

    // Handle player death
    handlePlayerDeath(playerId) {
        const player = this.gameState.players.get(playerId);
        if (!player) return;
        
        player.lives--;
        player.health = 100;
        
        if (player.lives <= 0) {
            player.isActive = false;
            console.log(`Player ${player.name} eliminated`);
        } else {
            // Respawn player
            const spawnPos = this.getSpawnPosition(playerId);
            player.x = spawnPos.x;
            player.y = spawnPos.y;
            player.vx = 0;
            player.vy = 0;
        }
    }

    // State synchronization
    setupStateSynchronization() {
        this.syncMessages = [];
        this.lastSyncTime = Date.now();
    }

    shouldSync() {
        return Date.now() - this.lastSyncTime > this.config.syncInterval;
    }

    syncGameState() {
        if (!this.isHost) return;
        
        const syncData = {
            type: 'gameStateSync',
            timestamp: Date.now(),
            gameTime: this.gameState.gameTime,
            players: this.serializePlayers(),
            gameObjects: this.serializeGameObjects(),
            scores: Object.fromEntries(this.gameState.scores)
        };
        
        // Send to all connected players
        this.manager.networkManager?.broadcast(syncData);
        this.lastSyncTime = Date.now();
    }

    // Serialize player data for network
    serializePlayers() {
        const serialized = {};
        for (const [id, player] of this.gameState.players) {
            serialized[id] = {
                x: player.x,
                y: player.y,
                vx: player.vx,
                vy: player.vy,
                angle: player.angle,
                health: player.health,
                score: player.score,
                lives: player.lives,
                isActive: player.isActive
            };
        }
        return serialized;
    }

    // Serialize game objects for network
    serializeGameObjects() {
        return {
            asteroids: this.gameObjects.asteroids,
            enemies: this.gameObjects.enemies,
            explosions: this.gameObjects.explosions,
            powerUps: this.gameObjects.powerUps
        };
    }

    // Apply received game state
    applyGameState(syncData) {
        if (this.isHost) return; // Host doesn't apply external state
        
        // Update players
        for (const [id, playerData] of Object.entries(syncData.players)) {
            const player = this.gameState.players.get(id);
            if (player) {
                Object.assign(player, playerData);
            }
        }
        
        // Update game objects
        this.gameObjects.asteroids = syncData.gameObjects.asteroids || [];
        this.gameObjects.enemies = syncData.gameObjects.enemies || [];
        this.gameObjects.explosions = syncData.gameObjects.explosions || [];
        this.gameObjects.powerUps = syncData.gameObjects.powerUps || [];
        
        // Update scores
        this.gameState.scores = new Map(Object.entries(syncData.scores));
    }

    // Game state management
    startGame() {
        this.gameState.isActive = true;
        this.gameState.gameTime = 0;
        this.gameState.roundNumber = 1;
        
        // Initialize game objects
        this.spawnInitialAsteroids();
        
        console.log(`Multiplayer ${this.gameState.mode} game started`);
    }

    pauseGame() {
        this.gameState.isPaused = true;
    }

    resumeGame() {
        this.gameState.isPaused = false;
    }

    endGame(reason = 'completed') {
        this.gameState.isActive = false;
        
        const results = {
            reason: reason,
            duration: this.gameState.gameTime,
            finalScores: Object.fromEntries(this.gameState.scores),
            players: Array.from(this.gameState.players.values()).map(p => ({
                id: p.id,
                name: p.name,
                score: p.score,
                isActive: p.isActive
            }))
        };
        
        console.log('Game ended:', results);
        return results;
    }

    // Utility methods
    getTotalLives() {
        return Array.from(this.gameState.players.values())
            .reduce((total, player) => total + player.lives, 0);
    }

    getActivePlayers() {
        return Array.from(this.gameState.players.values())
            .filter(player => player.isActive);
    }

    spawnInitialAsteroids() {
        // Spawn initial asteroids based on player count
        const playerCount = this.gameState.players.size;
        const asteroidCount = Math.max(3, playerCount * 2);
        
        for (let i = 0; i < asteroidCount; i++) {
            this.spawnAsteroid();
        }
    }

    spawnAsteroid() {
        const canvas = this.canvas.getCanvas();
        const asteroid = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            size: 30 + Math.random() * 20,
            health: 50
        };
        
        this.gameObjects.asteroids.push(asteroid);
    }

    checkGameConditions() {
        if (this.gameMode?.checkWinCondition()) {
            this.endGame('victory');
        } else if (this.gameMode?.checkLoseCondition()) {
            this.endGame('defeat');
        }
    }

    handleHostMigration() {
        // Find next available host
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length > 0) {
            const newHost = activePlayers[0];
            console.log(`Host migrated to ${newHost.name}`);
            
            // Notify all players of host change
            this.manager.networkManager?.broadcast({
                type: 'hostMigration',
                newHostId: newHost.id,
                newHostName: newHost.name
            });
        }
    }

    storeStateSnapshot() {
        // Store state for rollback/prediction
        if (this.stateHistory.length > this.config.rollbackFrames) {
            this.stateHistory.shift();
        }
        
        this.stateHistory.push({
            timestamp: Date.now(),
            players: this.serializePlayers(),
            gameObjects: this.serializeGameObjects()
        });
    }

    createExplosion(x, y, type = 'default') {
        this.gameObjects.explosions.push({
            x: x,
            y: y,
            type: type,
            frame: 0,
            maxFrames: 12,
            size: type === 'player' ? 40 : 30
        });
    }

    updateExplosions(deltaTime) {
        for (let i = this.gameObjects.explosions.length - 1; i >= 0; i--) {
            const explosion = this.gameObjects.explosions[i];
            explosion.frame += deltaTime / 50; // Animation speed
            
            if (explosion.frame >= explosion.maxFrames) {
                this.gameObjects.explosions.splice(i, 1);
            }
        }
    }

    updateEnemies(deltaTime) {
        // Placeholder for enemy AI - will be implemented based on original enemy.js
        this.gameObjects.enemies.forEach(enemy => {
            // Basic enemy movement
            enemy.x += enemy.vx * deltaTime / 16.67;
            enemy.y += enemy.vy * deltaTime / 16.67;
        });
    }

    updatePowerUps(deltaTime) {
        // Placeholder for power-up logic
        this.gameObjects.powerUps.forEach(powerUp => {
            powerUp.y += powerUp.speed * deltaTime / 16.67;
        });
    }

    checkLaserAsteroidCollisions() {
        // Implement laser-asteroid collision detection
        for (const [playerId, lasers] of this.gameObjects.lasers) {
            for (let i = lasers.length - 1; i >= 0; i--) {
                const laser = lasers[i];
                
                for (let j = this.gameObjects.asteroids.length - 1; j >= 0; j--) {
                    const asteroid = this.gameObjects.asteroids[j];
                    
                    if (this.collisions.checkCollision(laser, asteroid)) {
                        // Remove laser
                        lasers.splice(i, 1);
                        
                        // Damage asteroid
                        asteroid.health -= laser.damage;
                        
                        if (asteroid.health <= 0) {
                            // Destroy asteroid, add score
                            this.gameObjects.asteroids.splice(j, 1);
                            const player = this.gameState.players.get(playerId);
                            if (player) {
                                player.score += 100;
                                this.gameState.scores.set(playerId, player.score);
                            }
                            
                            this.createExplosion(asteroid.x, asteroid.y, 'asteroid');
                        }
                        
                        break;
                    }
                }
            }
        }
    }

    checkPlayerEnemyCollisions() {
        // Implement player-enemy collision detection
        for (const [playerId, player] of this.gameState.players) {
            if (!player.isActive) continue;
            
            this.gameObjects.enemies.forEach(enemy => {
                if (this.collisions.checkCollision(player, enemy)) {
                    this.handlePlayerHit(playerId, 'enemy', 30);
                    this.createExplosion(player.x, player.y, 'player');
                }
            });
        }
    }

    checkPlayerPowerUpCollisions() {
        // Implement player-powerup collision detection
        for (const [playerId, player] of this.gameState.players) {
            if (!player.isActive) continue;
            
            for (let i = this.gameObjects.powerUps.length - 1; i >= 0; i--) {
                const powerUp = this.gameObjects.powerUps[i];
                
                if (this.collisions.checkCollision(player, powerUp)) {
                    this.gameObjects.powerUps.splice(i, 1);
                    this.applyPowerUp(playerId, powerUp.type);
                }
            }
        }
    }

    checkPlayerPlayerCollisions() {
        // Implement player-player collision detection for versus mode
        const players = Array.from(this.gameState.players.values()).filter(p => p.isActive);
        
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                if (this.collisions.checkCollision(players[i], players[j])) {
                    // Handle player collision
                    this.handlePlayerHit(players[i].id, 'player', 15);
                    this.handlePlayerHit(players[j].id, 'player', 15);
                }
            }
        }
    }

    applyPowerUp(playerId, powerUpType) {
        const player = this.gameState.players.get(playerId);
        if (!player) return;
        
        switch (powerUpType) {
            case 'health':
                player.health = Math.min(100, player.health + 25);
                break;
            case 'shield':
                player.shield = 50;
                break;
            case 'rapidFire':
                player.rapidFire = 5000; // 5 seconds
                break;
        }
    }
}

export { MultiplayerGame };