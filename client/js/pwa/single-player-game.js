// Single Player Game - integrates existing single-player logic with new architecture
class SinglePlayerGame {
    constructor(gameModeManager) {
        this.manager = gameModeManager;
        this.isActive = false;
        this.gameState = {
            player: null,
            score: 0,
            gameOver: false,
            asteroidIncreaseTimer: 0
        };
        
        // References to existing game components
        this.canvas = null;
        this.player = null;
        this.lasers = [];
        this.asteroids = [];
        this.explosions = [];
        this.keys = {};
        
        // Game configuration
        this.config = {
            maxAsteroids: 5,
            asteroidSpawnRate: 100,
            asteroidIncreaseInterval: 600, // 10 seconds at 60fps
            asteroidIncreaseInterval: 600
        };
    }

    // Initialize single player game
    initialize() {
        console.log('[SinglePlayer] Initializing single player game');
        
        // Ensure all global game objects are available
        this.validateGameComponents();
        
        // Setup game state
        this.setupGameState();
        
        // Start the game loop
        this.startGameLoop();
        
        this.isActive = true;
        console.log('[SinglePlayer] Single player game initialized');
    }

    // Validate that all required game components are loaded
    validateGameComponents() {
        const requiredGlobals = [
            'canvas', 'player', 'lasers', 'asteroids', 'explosions', 
            'keys', 'score', 'gameOver', 'CONFIG'
        ];
        
        const missing = requiredGlobals.filter(name => 
            typeof window[name] === 'undefined'
        );
        
        if (missing.length > 0) {
            console.warn('[SinglePlayer] Missing game components:', missing);
            console.log('[SinglePlayer] Attempting to initialize missing components...');
            this.initializeMissingComponents(missing);
        }
        
        // Set references to global objects
        this.canvas = window.canvas;
        this.player = window.player;
        this.lasers = window.lasers || [];
        this.asteroids = window.asteroids || [];
        this.explosions = window.explosions || [];
        this.keys = window.keys || {};
        this.config = window.CONFIG || this.config;
    }

    // Initialize any missing game components
    initializeMissingComponents(missing) {
        // Initialize canvas if missing
        if (missing.includes('canvas') && typeof Canvas !== 'undefined') {
            window.canvas = new Canvas();
            console.log('[SinglePlayer] Initialized canvas');
        }
        
        // Initialize player if missing
        if (missing.includes('player') && typeof Player !== 'undefined') {
            window.player = new Player();
            console.log('[SinglePlayer] Initialized player');
        }
        
        // Initialize arrays if missing
        if (missing.includes('lasers')) {
            window.lasers = [];
        }
        if (missing.includes('asteroids')) {
            window.asteroids = [];
        }
        if (missing.includes('explosions')) {
            window.explosions = [];
        }
        if (missing.includes('keys')) {
            window.keys = {};
        }
        
        // Initialize game state if missing
        if (missing.includes('score')) {
            window.score = 0;
        }
        if (missing.includes('gameOver')) {
            window.gameOver = false;
        }
        
        // Initialize config if missing
        if (missing.includes('CONFIG')) {
            window.CONFIG = {
                maxAsteroids: 5,
                asteroidSpawnRate: 100,
                asteroidIncreaseInterval: 600
            };
        }
    }

    // Setup initial game state
    setupGameState() {
        // Reset game state
        window.score = 0;
        window.gameOver = false;
        this.gameState.asteroidIncreaseTimer = 0;
        
        // Clear arrays
        window.lasers.length = 0;
        window.asteroids.length = 0;
        window.explosions.length = 0;
        
        // Reset player position if player exists
        if (window.player && window.player.reset) {
            window.player.reset();
        }
        
        // Spawn initial asteroids
        this.spawnInitialAsteroids();
        
        console.log('[SinglePlayer] Game state initialized');
    }

    // Spawn initial asteroids for single player
    spawnInitialAsteroids() {
        const initialCount = 3;
        for (let i = 0; i < initialCount; i++) {
            if (typeof spawnAsteroid === 'function') {
                spawnAsteroid();
            } else if (typeof Asteroid !== 'undefined') {
                window.asteroids.push(new Asteroid());
            }
        }
        console.log(`[SinglePlayer] Spawned ${initialCount} initial asteroids`);
    }

    // Start the single player game loop
    startGameLoop() {
        // If there's already a game loop running, use it
        if (typeof gameLoop === 'function') {
            console.log('[SinglePlayer] Using existing game loop');
            return;
        }
        
        // If there's an update function, wrap it in our own loop
        if (typeof update === 'function') {
            console.log('[SinglePlayer] Starting game loop with existing update function');
            this.runGameLoop();
        } else {
            console.log('[SinglePlayer] Creating custom game loop');
            this.createCustomGameLoop();
        }
    }

    // Run game loop using existing update function
    runGameLoop() {
        const gameLoop = () => {
            if (!this.isActive || window.gameOver) {
                if (window.gameOver) {
                    this.handleGameOver();
                }
                return;
            }
            
            // Use existing update function
            if (typeof update === 'function') {
                update();
            }
            
            // Use existing draw function or create our own
            if (typeof draw === 'function') {
                draw();
            } else {
                this.draw();
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }

    // Create custom game loop if existing functions are not available
    createCustomGameLoop() {
        const gameLoop = () => {
            if (!this.isActive || window.gameOver) {
                if (window.gameOver) {
                    this.handleGameOver();
                }
                return;
            }
            
            this.updateGame();
            this.drawGame();
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }

    // Custom update logic (fallback)
    updateGame() {
        if (!this.player) return;
        
        // Update player
        if (this.player.move) {
            this.player.move(this.keys);
        }
        
        // Update lasers
        this.updateLasers();
        
        // Update asteroids
        this.updateAsteroids();
        
        // Update explosions
        this.updateExplosions();
        
        // Check collisions
        this.checkCollisions();
        
        // Spawn new asteroids
        this.manageAsteroidSpawning();
    }

    // Update lasers
    updateLasers() {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            if (laser.move) {
                laser.move();
            } else {
                // Basic laser movement
                laser.y -= laser.speed || 5;
            }
            
            // Remove lasers that are off screen
            if (laser.y < 0) {
                this.lasers.splice(i, 1);
            }
        }
    }

    // Update asteroids
    updateAsteroids() {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            if (asteroid.move) {
                asteroid.move();
            } else {
                // Basic asteroid movement
                asteroid.y += asteroid.speed || 2;
            }
            
            // Remove asteroids that are off screen
            if (asteroid.y > (this.canvas?.height || 600)) {
                this.asteroids.splice(i, 1);
            }
        }
    }

    // Update explosions
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            if (explosion.update) {
                explosion.update();
                if (explosion.finished) {
                    this.explosions.splice(i, 1);
                }
            } else {
                // Simple explosion logic
                explosion.frame = (explosion.frame || 0) + 1;
                if (explosion.frame > 10) {
                    this.explosions.splice(i, 1);
                }
            }
        }
    }

    // Check collisions
    checkCollisions() {
        // Player-asteroid collisions
        if (this.player && !window.gameOver) {
            for (const asteroid of this.asteroids) {
                if (this.checkCollision(this.player, asteroid)) {
                    this.triggerGameOver();
                    return;
                }
            }
        }
        
        // Laser-asteroid collisions
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.checkCollision(this.lasers[i], this.asteroids[j])) {
                    // Create explosion
                    this.createExplosion(this.asteroids[j].x, this.asteroids[j].y);
                    
                    // Remove laser and asteroid
                    this.lasers.splice(i, 1);
                    this.asteroids.splice(j, 1);
                    
                    // Increase score
                    window.score += 10;
                    
                    break;
                }
            }
        }
    }

    // Simple collision detection
    checkCollision(obj1, obj2) {
        if (typeof checkCollision === 'function') {
            return checkCollision(obj1, obj2);
        }
        
        // Basic circular collision detection
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (obj1.size || 20) + (obj2.size || 20);
        
        return distance < minDistance;
    }

    // Create explosion
    createExplosion(x, y) {
        if (typeof Explosion !== 'undefined') {
            this.explosions.push(new Explosion(x, y));
        } else {
            // Simple explosion object
            this.explosions.push({
                x: x,
                y: y,
                frame: 0,
                size: 30
            });
        }
    }

    // Manage asteroid spawning
    manageAsteroidSpawning() {
        // Increase difficulty over time
        this.gameState.asteroidIncreaseTimer++;
        if (this.gameState.asteroidIncreaseTimer >= this.config.asteroidIncreaseInterval) {
            this.config.maxAsteroids += 2;
            this.config.asteroidSpawnRate = Math.max(this.config.asteroidSpawnRate - 5, 40);
            this.gameState.asteroidIncreaseTimer = 0;
        }
        
        // Spawn new asteroids
        if (this.asteroids.length < this.config.maxAsteroids) {
            if (Math.random() * this.config.asteroidSpawnRate < 1) {
                this.spawnAsteroid();
            }
        }
    }

    // Spawn a single asteroid
    spawnAsteroid() {
        if (typeof spawnAsteroid === 'function') {
            spawnAsteroid();
        } else if (typeof Asteroid !== 'undefined') {
            this.asteroids.push(new Asteroid());
        } else {
            // Create simple asteroid object
            this.asteroids.push({
                x: Math.random() * (this.canvas?.width || 800),
                y: -50,
                speed: 1 + Math.random() * 3,
                size: 20 + Math.random() * 20,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    // Custom draw logic (fallback)
    drawGame() {
        if (!this.canvas) return;
        
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        if (this.player && this.player.draw) {
            this.player.draw(ctx);
        }
        
        // Draw lasers
        this.lasers.forEach(laser => {
            if (laser.draw) {
                laser.draw(ctx);
            } else {
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(laser.x - 2, laser.y - 5, 4, 10);
            }
        });
        
        // Draw asteroids
        this.asteroids.forEach(asteroid => {
            if (asteroid.draw) {
                asteroid.draw(ctx);
            } else {
                ctx.fillStyle = '#888888';
                ctx.beginPath();
                ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw explosions
        this.explosions.forEach(explosion => {
            if (explosion.draw) {
                explosion.draw(ctx);
            } else {
                ctx.fillStyle = '#ff4400';
                ctx.beginPath();
                ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw score
        this.drawScore(ctx);
    }

    // Draw score
    drawScore(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${window.score}`, 20, 40);
    }

    // Handle game over
    triggerGameOver() {
        console.log('[SinglePlayer] Game Over triggered');
        window.gameOver = true;
        this.handleGameOver();
    }

    // Handle game over state
    handleGameOver() {
        this.isActive = false;
        
        // Show game over screen
        console.log(`[SinglePlayer] Game Over! Final Score: ${window.score}`);
        
        // Call existing game over function if available
        if (typeof triggerGameOver === 'function') {
            triggerGameOver();
        }
        
        // Notify the game mode manager
        if (this.manager) {
            this.manager.handleGameEnd({
                mode: 'single',
                score: window.score,
                reason: 'player_died'
            });
        }
        
        // Show option to restart
        setTimeout(() => {
            if (confirm('Game Over! Play again?')) {
                this.restart();
            } else {
                this.manager?.showModeSelection();
            }
        }, 1000);
    }

    // Restart the game
    restart() {
        console.log('[SinglePlayer] Restarting game');
        this.setupGameState();
        this.isActive = true;
        this.startGameLoop();
    }

    // Stop the game
    stop() {
        console.log('[SinglePlayer] Stopping single player game');
        this.isActive = false;
    }

    // Pause the game
    pause() {
        this.isActive = false;
    }

    // Resume the game
    resume() {
        this.isActive = true;
        this.startGameLoop();
    }

    // Get current game state
    getGameState() {
        return {
            score: window.score,
            gameOver: window.gameOver,
            playerPosition: this.player ? { x: this.player.x, y: this.player.y } : null,
            asteroidCount: this.asteroids.length,
            laserCount: this.lasers.length
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.SinglePlayerGame = SinglePlayerGame;
}

export { SinglePlayerGame };