// =============================================================================
// THE DRAZZAN INVASION - MAIN GAME LOOP
// =============================================================================
// This file contains the core game loop, state management, and game logic.
// Organized into logical sections for better maintainability:
// - Configuration & Settings
// - Game State Variables  
// - Timer & Pause System
// - Game Lifecycle Management
// - Main Game Loop (Update/Draw)
// - Boss Fight Management
// - Scoring System
// - UI Rendering
// =============================================================================

// =============================================================================
// GAME CONFIGURATION & SETTINGS
// =============================================================================
const GameSettings = {
    // Level progression
    STARTING_LEVEL: 1,
    STARTING_ENEMIES_NEEDED: 5,
    MAX_ENEMIES_ON_SCREEN: 4,
    BOSS_FIGHT_LEVEL: 4,

    // Boss settings
    BOSS_WARNING_DURATION: 120, // frames
    BOSS_SHOOT_INTERVAL: 60,     // frames
    BOSS_WIDTH: 400,
    BOSS_HEIGHT: 300,
    BOSS_MAX_HEALTH: 300,

    // Scoring
    BOSS_BASE_SCORE: 5000,
    TIME_BONUS_THRESHOLDS: {
        UNDER_1_MIN: { time: 60, bonus: 10000 },
        UNDER_2_MIN: { time: 120, bonus: 7500 },
        UNDER_3_MIN: { time: 180, bonus: 5000 },
        UNDER_5_MIN: { time: 300, bonus: 2500 },
        OVER_5_MIN: { time: Infinity, bonus: 1000 }
    },

    // UI positioning
    UI_PADDING_X: 20,
    UI_PADDING_Y: 40,
    UI_LINE_SPACING: 30,

    // Audio
    EXPLOSION_VOLUME: 0.6,

    // Visual effects
    BOSS_EXPLOSION_BURSTS: 3,
    BOSS_EXPLOSION_COUNT: 20,
    BOSS_EXPLOSION_SIZE: 100,
    BOSS_FINAL_EXPLOSION_SIZE: 160,

    // Cinematic timing
    EXPLOSION_DELAY: 500,
    VICTORY_CINEMATIC_DELAY: 1500,
    SCOREBOARD_DELAY: 1000
};

// =============================================================================
// GAME STATE VARIABLES
// =============================================================================
let gameOver = false; // ✅ Fix: Ensure this variable exists globally
let score = 0; // ✅ Global variable to track score
let bossFightStarted = false;  // Boss cinematic started
let bossActive = false;        // Boss is in combat mode
let drazzanBoss = null;        // Will hold the boss object
let asteroidIncreaseTimer = 0; // ✅ Fix: Declare variable
const enemies = [];
const enemyLasers = [];
let level = GameSettings.STARTING_LEVEL; // ✅ Start at Level 1
let enemiesDestroyed = 0; // ✅ Track how many enemies are destroyed
let enemiesNeeded = GameSettings.STARTING_ENEMIES_NEEDED; // ✅ Enemies required to complete level
let maxEnemies = GameSettings.MAX_ENEMIES_ON_SCREEN; // ✅ Number of enemies that can appear at once
let enemySpeedIncrease = 0; // ✅ Enemy speed boost per level
let levelTransition = false; // ✅ Controls the level complete message
let powerUp = null; // ✅ Tracks if a power-up is active
let doubleFire = false; // ✅ Controls if player shoots double lasers
const bossLasers = [];
let bossShootTimer = 0;
const bossExplosionSound = new Audio("assets/explosion_noise.mp3");
bossExplosionSound.volume = GameSettings.EXPLOSION_VOLUME; // Adjust volume if needed
let bossWarningActive = false;
let bossWarningTimer = 0;
let endCinematicActive = false;
let endShipY = canvas.height - 100;
let finalCinematicStarted = false;

// =============================================================================
// TIMER AND PAUSE SYSTEM
// =============================================================================
let gameStartTime = 0;
let gameTime = 0;
let gamePaused = false;
let pauseStartTime = 0;
let totalPauseTime = 0;

// Pause/Resume functions
function pauseGame() {
    if (!gamePaused) {
        gamePaused = true;
        pauseStartTime = Date.now();
        window.gamePaused = gamePaused;
        console.log('[GameLoop] Game paused');
    }
}

function resumeGame() {
    if (gamePaused) {
        gamePaused = false;
        totalPauseTime += Date.now() - pauseStartTime;
        pauseStartTime = 0;
        window.gamePaused = gamePaused;
        console.log('[GameLoop] Game resumed');
    }
}

// Make game state variables available globally for PWA integration
window.gameOver = gameOver;
window.score = score;
window.doubleFire = doubleFire;
window.level = level;
window.enemiesDestroyed = enemiesDestroyed;
window.enemiesNeeded = enemiesNeeded;
window.bossFightStarted = bossFightStarted;
window.bossActive = bossActive;
window.enemies = enemies;
window.gameTime = gameTime;
window.gamePaused = gamePaused;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;

// =============================================================================
// GAME LIFECYCLE MANAGEMENT
// =============================================================================
function restartGame() {
    console.log('[GameLoop] Restarting game...');

    // Clear any existing UI elements
    const existingButtons = document.querySelectorAll('button:not(#startButton):not(#shootButton)');
    existingButtons.forEach(btn => btn.remove());

    const existingDivs = document.querySelectorAll('div:not(#gameThumbnailContainer):not(#debugConsole)');
    existingDivs.forEach(div => div.remove());

    // Reset all game state variables
    gameOver = false;
    score = 0;
    bossFightStarted = false;
    bossActive = false;
    drazzanBoss = null;
    level = 1;
    enemiesDestroyed = 0;
    enemiesNeeded = 5;
    maxEnemies = 4;
    enemySpeedIncrease = 0;
    levelTransition = false;
    powerUp = null;
    doubleFire = false;
    bossWarningActive = false;
    bossWarningTimer = 0;
    endCinematicActive = false;
    finalCinematicStarted = false;

    // Reset timer and pause system
    gameStartTime = 0; // Will be set when game actually starts
    gameTime = 0;
    gamePaused = false;
    pauseStartTime = 0;
    totalPauseTime = 0;

    // Clear arrays
    enemies.length = 0;
    enemyLasers.length = 0;
    bossLasers.length = 0;

    if (window.lasers) window.lasers.length = 0;
    if (window.asteroids) window.asteroids.length = 0;
    if (window.explosions) window.explosions.length = 0;

    // Reset player if available
    if (window.player) {
        window.player.x = canvas.width / 2;
        window.player.y = canvas.height - 100;
        window.player.lives = 3;
        window.player.invincible = false;
    }

    // Update global window references
    window.gameOver = gameOver;
    window.score = score;
    window.doubleFire = doubleFire;
    window.level = level;
    window.enemiesDestroyed = enemiesDestroyed;
    window.enemiesNeeded = enemiesNeeded;
    window.bossFightStarted = bossFightStarted;
    window.bossActive = bossActive;
    window.gameTime = gameTime;
    window.gamePaused = gamePaused;

    // Ensure debug console state consistency
    if (window.debugConsole) {
        // Force sync debug console variables with reset game state
        if (typeof window.debugConsole.syncGlobalVariables === 'function') {
            window.debugConsole.syncGlobalVariables();
        }
    }

    // Start the game again (intro sequence)
    if (typeof startGame === 'function') {
        startGame();
    } else if (typeof playIntro === 'function') {
        playIntro();
    } else {
        console.error('[GameLoop] No start game function available');
        // Fallback to just starting game loop
        if (typeof gameLoop === 'function') {
            gameLoop();
        }
    }

    console.log('[GameLoop] Game restarted successfully');
};

// Make restart function globally available
window.restartGame = restartGame;

const redfordAudio = new Audio("assets/wyatt001.mp3");
const wyattAudio = new Audio("assets/days_work.mp3");

// =============================================================================
// MAIN GAME LOOP - UPDATE FUNCTION
// =============================================================================
function update() {
    // Initialize timer on first update (when game actually starts)
    if (gameStartTime === 0 && !gameOver) {
        gameStartTime = Date.now();
        console.log('[GameLoop] Game timer started');
    }

    // Update game timer (only when not paused and game is not over)
    if (!gamePaused && !gameOver && gameStartTime > 0) {
        gameTime = Math.floor((Date.now() - gameStartTime - totalPauseTime) / 1000);
        window.gameTime = gameTime;
    }

    // Don't update game state when paused
    if (gamePaused) return; if (gameOver && !endCinematicActive) return;

    // =============================================================================
    // MULTIPLAYER INTEGRATION
    // =============================================================================
    // Update multiplayer game state if active
    if (window.multiplayerGame && window.multiplayerGame.gameState &&
        window.multiplayerGame.gameState.isActive && !window.multiplayerGame.gameState.isPaused) {
        const deltaTime = 16; // ~60fps frame time in milliseconds
        window.multiplayerGame.update(deltaTime);
    }

    // =============================================================================
    // BOSS FIGHT MANAGEMENT
    // =============================================================================
    if (level === GameSettings.BOSS_FIGHT_LEVEL && enemiesDestroyed >= enemiesNeeded && !bossFightStarted) {
        bossWarningActive = true;
        bossWarningTimer = GameSettings.BOSS_WARNING_DURATION;
        bossFightStarted = true;
        window.bossFightStarted = bossFightStarted; // Update global reference
        startBossFight();
        return;
    }

    // ⚠ Prevent normal update logic during boss fight
    if (bossActive) {
        updateBoss(); // ✅ Update boss logic
        // Let the rest of update() continue — including player, lasers, etc.
    }

    // 🌟 **Move Stars Downward**
    for (let star of stars) {
        star.y += star.speed; // ✅ Moves downward
        if (star.y > canvas.height) {
            star.y = 0; // ✅ Loops back to the top when off-screen
            star.x = Math.random() * canvas.width; // ✅ Randomize horizontal position
        }
    }

    player.move(keys);

    // Move lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].move();
        if (lasers[i].y < 0) lasers.splice(i, 1);
    }

    // Move asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        asteroids[i].move();
        if (asteroids[i].y > canvas.height) asteroids.splice(i, 1);
    }

    // 🌟 **Increase Asteroid Spawn Rate Over Time**
    asteroidIncreaseTimer++;
    if (asteroidIncreaseTimer >= CONFIG.asteroidIncreaseInterval) {
        CONFIG.maxAsteroids += 2; // ✅ Every 10 seconds, allow 2 more asteroids
        CONFIG.asteroidSpawnRate = Math.max(CONFIG.asteroidSpawnRate - 5, 40); // ✅ Increase spawn speed (minimum 40)
        asteroidIncreaseTimer = 0;
    }

    // 🌟 **Check Player-Asteroid Collisions with Buffer**
    for (let i = asteroids.length - 1; i >= 0; i--) {
        if (checkCollision(player, asteroids[i], true)) { // ✅ Uses updated buffer logic
            triggerGameOver(asteroids[i]);
            return;
        }
    }

    // 🌟 **Check for Laser-Asteroid Collisions**
    for (let i = lasers.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (checkCollision(lasers[i], asteroids[j], false)) {
                explosions.push(new Explosion(asteroids[j].x, asteroids[j].y));
                asteroids[j].health -= 1;

                if (asteroids[j].health <= 0) {
                    asteroids.splice(j, 1);
                    score += 10;
                    window.score = score; // Update global reference
                }

                lasers.splice(i, 1);
                break;
            }
        }
    }

    // 🌟 **Power-Up System (Ensures Only One Exists)**
    if (!powerUp && level >= 2 && Math.random() < 0.005 && !doubleFire) { // ✅ Power-up only spawns if NOT already active
        powerUp = new PowerUp();
        //console.log("✅ Power-Up Spawned at:", powerUp.x, powerUp.y); // ✅ Debugging
    }

    // 🌟 **Spawn up to `maxEnemies` at a time**
    if (!bossFightStarted && !bossActive && enemies.length < maxEnemies && Math.random() < 0.02) {
        let newEnemy = new Enemy();
        newEnemy.speedX += enemySpeedIncrease;
        enemies.push(newEnemy);
    }

    // 🌟 **Move enemies and handle shooting**
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].move();
    }

    // 🌟 **Check if Player Collects Power-Up**
    if (powerUp && checkCollision(player, powerUp, false)) {
        doubleFire = true; // ✅ Activate double laser fire mode
        window.doubleFire = doubleFire; // Update global reference
        console.log("✅ Power-up collected! Double fire activated."); // ✅ Debugging
        powerUp = null; // ✅ Remove power-up from the game permanently
    }

    // 🌟 **Move enemy lasers and check for collisions**
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        if (!enemyLasers[i]) continue; // ✅ Skip if laser is already removed

        enemyLasers[i].move();

        // 🌟 **Check if enemy laser hits the player (with shield system)**
        if (enemyLasers[i] && checkCollision(enemyLasers[i], player, true)) {
            player.shield -= 25; // ✅ Reduce shield by 25% when hit

            // 🌟 **If shield reaches 0, trigger game over**
            if (player.shield <= 0) {
                triggerGameOver(); // ✅ Properly calls the game over function
                return;
            }

            enemyLasers.splice(i, 1); // ✅ Remove laser after hitting player
            continue; // ✅ Skip further checks for this laser
        }

        // ✅ Remove enemy lasers if they move off-screen
        if (enemyLasers[i] && enemyLasers[i].y > canvas.height) {
            enemyLasers.splice(i, 1);
        }
    }

    // � **Check for Player Laser - Enemy Collisions**
    for (let i = lasers.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(lasers[i], enemies[j])) {
                enemies[j].health -= 1;
                explosions.push(new Explosion(enemies[j].x, enemies[j].y));

                // ✅ If enemy is destroyed, increase counter
                if (enemies[j].health <= 0) {
                    enemies.splice(j, 1);
                    score += 50;
                    window.score = score; // Update global reference
                    enemiesDestroyed++; // ✅ Count destroyed enemies
                    window.enemiesDestroyed = enemiesDestroyed; // Update global reference

                    // 🌟 **Check if Level is Complete**
                    if (enemiesDestroyed >= enemiesNeeded) {
                        levelUp(); // ✅ Handles everything except Level 4 (see below)
                    }
                }

                lasers.splice(i, 1);
                break;
            }
        }
    }

    // 🌟 **Handle explosions**
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update();
        if (explosions[i].timer <= 0) explosions.splice(i, 1);
    }

    // 🌟 **Spawn Asteroids**
    if (!bossFightStarted && !bossActive && Math.random() < 0.04 && asteroids.length < CONFIG.maxAsteroids) {
        spawnAsteroid();
    }

    // 🌟 **Check for Laser Collisions with the Boss**
    if (bossActive && drazzanBoss) {
        for (let i = lasers.length - 1; i >= 0; i--) {
            const laser = lasers[i];

            if (checkCollision(laser, drazzanBoss)) {
                drazzanBoss.health -= 2; // 💥 Damage the boss
                lasers.splice(i, 1);     // 🗑 Remove the laser

                // 💀 Check if boss is defeated
                if (drazzanBoss.health <= 0) {
                    drazzanBoss.health = 0;
                    bossActive = false;
                    window.bossActive = bossActive; // Update global reference

                    // 🏆 Calculate time-based boss bonus
                    calculateBossScore();

                    triggerBossDefeat(); // 🎊 Custom victory handler
                }

                break; // ✅ Only one collision per laser
            }
        }
    }
    if (bossWarningActive) {
        bossWarningTimer--;

        if (bossWarningTimer <= 0) {
            bossWarningActive = false;
        }
    }

    if (endCinematicActive) {
        endShipY -= 3;
        //console.log("Flying UP:", endShipY);

        if (endShipY + player.height < 0) {
            endCinematicActive = false;
            showEndScreen(); // ✅ trigger message + button AFTER ship leaves
        }
    }
}

function levelUp() {
    level++;
    window.level = level; // Update global reference

    if (level === 4) {
        enemiesNeeded = 4;        // 💪 Set an actual target
        maxEnemies = 2;            // 💪 Allow a few enemies
        enemySpeedIncrease = 0.5;    // (Optional) stop speedup
        powerUp = null;
        levelTransition = true;
        window.enemiesNeeded = enemiesNeeded; // Update global reference

        setTimeout(() => {
            enemies.length = 0;
            levelTransition = false;
        }, 3000);

        return;
    }

    if (level > 4) return; // Prevent Level 5 entirely

    // Normal level progression (Levels 1–3)
    enemiesDestroyed = 0;
    enemiesNeeded += 10;
    maxEnemies++;
    enemySpeedIncrease += 0.6;
    powerUp = null;
    levelTransition = true;

    // Update global references
    window.enemiesDestroyed = enemiesDestroyed;
    window.enemiesNeeded = enemiesNeeded;

    setTimeout(() => {
        enemies.length = 0;
        levelTransition = false;
    }, 3000);
}

// =============================================================================
// MAIN GAME LOOP - DRAW FUNCTION
// =============================================================================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🌟 **Draw Moving Starfield (Light Grey Stars)**
    ctx.fillStyle = "rgb(180, 180, 180)"; // ✅ Light grey color
    for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 🌟 **Draw Player**
    if (!endCinematicActive) {
        player.draw(ctx); // ✅ Draw only during gameplay
    }

    // 🌟 **Draw Lasers**
    lasers.forEach(laser => laser.draw(ctx));

    // 🌟 **Draw Asteroids**
    asteroids.forEach(asteroid => asteroid.draw(ctx));

    // 🌟 **Draw Explosions**
    explosions.forEach(explosion => explosion.draw(ctx));

    // =============================================================================
    // UI RENDERING
    // =============================================================================
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";      // ✅ Keeps HUD left-aligned
    ctx.textBaseline = "top";    // ✅ Prevents vertical shifting

    // ✅ Use configuration for UI positioning
    const textPaddingX = GameSettings.UI_PADDING_X;
    const textPaddingY = GameSettings.UI_PADDING_Y;
    const textSpacing = GameSettings.UI_LINE_SPACING;

    ctx.fillText("Score: " + score, textPaddingX, textPaddingY);
    ctx.fillText("Wyatt's Shield: " + player.shield + "%", textPaddingX, textPaddingY + textSpacing);
    ctx.fillText("Level: " + level, textPaddingX, textPaddingY + textSpacing * 2);

    // Display game timer with formatted time
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    ctx.fillText("Time: " + timeDisplay, textPaddingX, textPaddingY + textSpacing * 3);    // 🌟 **Show "LEVEL COMPLETE!" message when transitioning**
    if (levelTransition && !bossWarningActive) {
        ctx.fillStyle = "yellow";
        ctx.font = "30px Arial";
        ctx.textAlign = "center"; // Optional fix for clean centering
        ctx.fillText("LEVEL " + (level - 1) + " COMPLETE!", canvas.width / 2, canvas.height / 2);
    }

    // 🌟 **Draw Shield Bar Below Shield Text**
    const shieldWidth = 150;
    const shieldHeight = 15;
    const shieldX = textPaddingX;
    const shieldY = textPaddingY + textSpacing * 4; // 💙 Adjusted for timer line

    ctx.fillStyle = "gray"; // Background bar
    ctx.fillRect(shieldX, shieldY, shieldWidth, shieldHeight);

    ctx.fillStyle = "blue"; // Shield color
    ctx.fillRect(shieldX, shieldY, (player.shield / 100) * shieldWidth, shieldHeight); // ✅ Shrinks as shield decreases

    ctx.strokeStyle = "white"; // Border
    ctx.strokeRect(shieldX, shieldY, shieldWidth, shieldHeight);

    // 🌟 **Draw Power-Up with Glow Effect**
    if (powerUp) {
        ctx.save(); // ✅ Save current canvas state

        // 🌟 **Create glow effect**
        ctx.shadowColor = "rgba(0, 255, 255, 0.8)"; // ✅ Blue glow
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 🛸 **Draw the power-up**
        powerUp.draw(ctx);

        ctx.restore(); // ✅ Restore canvas state to prevent unwanted effects
    }

    // 🌟 **Draw Enemies**
    enemies.forEach(enemy => enemy.draw(ctx));

    // 🌟 **Draw Enemy Lasers**
    enemyLasers.forEach(laser => laser.draw(ctx));

    if (drazzanBoss && (bossFightStarted || bossActive)) {
        ctx.drawImage(
            drazzanBoss.image,
            drazzanBoss.x,
            drazzanBoss.y,
            drazzanBoss.width,
            drazzanBoss.height
        );

        // Boss Health Bar
        const barWidth = 300;
        const barHeight = 20;
        const barX = canvas.width / 2 - barWidth / 2;
        const barY = 30;

        // ✅ Calculate health percentage
        const healthPercent = drazzanBoss.health / drazzanBoss.maxHealth;
        const currentBarWidth = barWidth * Math.max(0, healthPercent); // prevent negative width

        // ✅ Draw full black background
        ctx.fillStyle = "black";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // ✅ Draw red health portion
        ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, currentBarWidth, barHeight);

        // ✅ Draw white border
        ctx.strokeStyle = "white";
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        bossLasers.forEach(laser => laser.draw(ctx));
    }

    if (bossWarningActive) {
        ctx.save();

        // Fade out effect
        const alpha = Math.min(1, bossWarningTimer / 30); // quick fade in
        ctx.globalAlpha = alpha;

        ctx.fillStyle = "red";
        ctx.font = "bold 36px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
        ctx.shadowBlur = 20;
        ctx.fillText("DRAZZAN MOTHERSHIP DETECTED", canvas.width / 2, canvas.height / 2);

        ctx.restore();
    }

    if (endCinematicActive) {
        ctx.drawImage(player.image, player.x, endShipY, player.width, player.height);
    }

    // 🌟 **Show PAUSED overlay when game is paused**
    if (gamePaused) {
        // Semi-transparent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // PAUSED text
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);

        // Smaller instruction text
        ctx.font = "20px Arial";
        ctx.fillText("Debug console is open", canvas.width / 2, canvas.height / 2 + 60);
    }
}

// =============================================================================
// NETWORK INTEGRATION SUPPORT
// =============================================================================
// Create a gameInstance object for network manager integration
window.gameInstance = {
    // Network game state update handler
    updateNetworkGameState(networkState) {
        console.log('[GameInstance] Received network game state update:', networkState);

        // Only apply network updates if we're in multiplayer mode
        if (window.multiplayerGame && !window.multiplayerGame.isHost) {
            // Update player positions, scores, and game objects based on network state
            if (networkState.players) {
                // Update other players' positions and states
                for (const [playerId, playerData] of Object.entries(networkState.players)) {
                    if (playerId !== window.multiplayerGame.localPlayerId) {
                        // Apply remote player updates
                        console.log(`[GameInstance] Updating remote player ${playerId}:`, playerData);
                    }
                }
            }

            // Update game time and scores
            if (networkState.gameTime !== undefined) {
                gameTime = networkState.gameTime;
                window.gameTime = gameTime;
            }

            if (networkState.scores) {
                // Update score display for multiplayer
                console.log('[GameInstance] Updated scores:', networkState.scores);
            }
        }
    },

    // Handle player disconnection
    handlePlayerDisconnect(playerId) {
        console.log('[GameInstance] Player disconnected:', playerId);
        // Handle cleanup of disconnected player's objects
    },

    // Handle network connectivity changes
    handleNetworkChange(isOnline) {
        console.log('[GameInstance] Network status changed:', isOnline ? 'online' : 'offline');
        if (!isOnline && window.multiplayerGame) {
            // Switch to single-player mode on disconnect
            console.log('[GameInstance] Switching to offline mode');
        }
    },

    // Game state synchronization for service worker
    syncGameState() {
        if (window.multiplayerGame && window.multiplayerGame.isHost) {
            window.multiplayerGame.syncGameState();
        }
    }
};

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 🌟 **NEW: Handle Game Over**
function triggerGameOver(asteroid = null) {
    gameOver = true;
    window.gameOver = gameOver; // Update global reference

    // 🌟 **Stop Background Music (Ensures it stops properly)**
    if (typeof backgroundMusic !== "undefined" && !backgroundMusic.paused) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // ✅ Resets for the next game
    } else {
        console.error("⚠ Background music not found or already stopped.");
    }

    // 🌟 **Explosion Effect**
    explosions.push(new Explosion(player.x, player.y));
    if (asteroid) explosions.push(new Explosion(asteroid.x, asteroid.y)); // ✅ Only explode asteroid if exists

    // 🌟 **Delay showing the scoreboard so explosion is visible**
    setTimeout(() => {
        saveScore(score);  // ✅ Save the score before restarting
        showScoreBoard(score); // ✅ Ensure this function is correctly defined in scoreboard.js
    }, GameSettings.SCOREBOARD_DELAY);
}

function startBossFight() {
    drazzanBoss = {
        x: canvas.width / 2 - GameSettings.BOSS_WIDTH / 2,
        y: -GameSettings.BOSS_HEIGHT, // Start offscreen
        width: GameSettings.BOSS_WIDTH,
        height: GameSettings.BOSS_HEIGHT,
        health: GameSettings.BOSS_MAX_HEALTH,
        maxHealth: GameSettings.BOSS_MAX_HEALTH,
        image: new Image()
    };
    drazzanBoss.image.src = "assets/drazzan_mothership.png";

    const entryInterval = setInterval(() => {
        drazzanBoss.y += 5;
        if (drazzanBoss.y >= 100) {
            drazzanBoss.y = 100;
            clearInterval(entryInterval);
            bossActive = true;
            window.bossActive = bossActive; // Update global reference
        }
    }, 30);
}

function updateBoss() {
    if (!drazzanBoss) return;

    // 💥 Movement: bounce horizontally, bob vertically
    drazzanBoss.x += Math.sin(Date.now() / 300) * 4;
    drazzanBoss.y += Math.sin(Date.now() / 600) * 1;

    // 🌟 Shooting: fire spread every 60 frames
    bossShootTimer++;
    if (bossShootTimer >= GameSettings.BOSS_SHOOT_INTERVAL) {
        const originX = drazzanBoss.x + drazzanBoss.width / 2;
        const originY = drazzanBoss.y + drazzanBoss.height;

        // Fire in a 120° arc downward
        for (let angleDeg = -60; angleDeg <= 60; angleDeg += 15) {
            const angleRad = (angleDeg * Math.PI) / 180;
            bossLasers.push(new BossLaser(originX, originY, angleRad + Math.PI / 2)); // Downward
        }

        bossShootTimer = 0;
    }

    // Move boss lasers
    for (let i = bossLasers.length - 1; i >= 0; i--) {
        bossLasers[i].move();

        // Check collision with player
        if (checkCollision(bossLasers[i], player, true)) {
            player.shield -= 20;
            bossLasers.splice(i, 1);

            if (player.shield <= 0) {
                triggerGameOver();
                return;
            }

        } else if (
            bossLasers[i].x < 0 || bossLasers[i].x > canvas.width ||
            bossLasers[i].y > canvas.height
        ) {
            bossLasers.splice(i, 1); // Remove offscreen lasers
        }
    }
}

// =============================================================================
// SCORING SYSTEM
// =============================================================================
function calculateBossScore() {
    // Calculate time-based bonus for defeating the boss
    const baseScore = GameSettings.BOSS_BASE_SCORE;
    let timeBonus = 0;

    const thresholds = GameSettings.TIME_BONUS_THRESHOLDS;

    if (gameTime <= thresholds.UNDER_1_MIN.time) {
        timeBonus = thresholds.UNDER_1_MIN.bonus;
    } else if (gameTime <= thresholds.UNDER_2_MIN.time) {
        timeBonus = thresholds.UNDER_2_MIN.bonus;
    } else if (gameTime <= thresholds.UNDER_3_MIN.time) {
        timeBonus = thresholds.UNDER_3_MIN.bonus;
    } else if (gameTime <= thresholds.UNDER_5_MIN.time) {
        timeBonus = thresholds.UNDER_5_MIN.bonus;
    } else {
        timeBonus = thresholds.OVER_5_MIN.bonus;
    }

    const totalBossScore = baseScore + timeBonus;
    score += totalBossScore;
    window.score = score; // Update global reference

    console.log(`[GameLoop] Boss defeated! Time: ${gameTime}s, Base: ${baseScore}, Time Bonus: ${timeBonus}, Total: ${totalBossScore}`);
}

// =============================================================================
// BOSS DEFEAT SEQUENCE
// =============================================================================
function triggerBossDefeat() {
    // 🎵 Stop music
    if (typeof backgroundMusic !== "undefined" && !backgroundMusic.paused) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    // 💥 Repeat explosion bursts 3x
    let bursts = 0;
    const repeatExplosions = () => {
        if (bursts === 0) {
            // 🌟 Play sound on first burst
            bossExplosionSound.currentTime = 0;
            bossExplosionSound.play().catch(err => console.warn("Explosion sound error:", err));
        }

        // 💥 Regular explosion burst
        for (let i = 0; i < GameSettings.BOSS_EXPLOSION_COUNT; i++) {
            const offsetX = getRandomInt(-100, 100);
            const offsetY = getRandomInt(-60, 60);
            const explosion = new Explosion(
                drazzanBoss.x + drazzanBoss.width / 2 + offsetX,
                drazzanBoss.y + drazzanBoss.height / 2 + offsetY
            );
            explosion.width = GameSettings.BOSS_EXPLOSION_SIZE;
            explosion.height = GameSettings.BOSS_EXPLOSION_SIZE;
            explosion.timer = 60;
            explosions.push(explosion);
        }

        bursts++;

        if (bursts < GameSettings.BOSS_EXPLOSION_BURSTS) {
            // 🌟 Schedule next burst
            setTimeout(repeatExplosions, GameSettings.EXPLOSION_DELAY);
        } else {
            // 🎯 Final 4th explosion after boss disappears
            setTimeout(() => {
                // ✅ Save boss center coordinates BEFORE removing
                const drazzanBossLastX = drazzanBoss.x + drazzanBoss.width / 2;
                const drazzanBossLastY = drazzanBoss.y + drazzanBoss.height / 2;

                // ⚠ Remove mothership
                drazzanBoss = null;

                // 💥 Final explosion
                const explosion = new Explosion(
                    drazzanBossLastX,
                    drazzanBossLastY
                );
                explosion.width = GameSettings.BOSS_FINAL_EXPLOSION_SIZE;
                explosion.height = GameSettings.BOSS_FINAL_EXPLOSION_SIZE;
                explosion.timer = 80;
                explosions.push(explosion);

                // 🛸 Then start the victory cinematic
                setTimeout(() => {
                    startVictoryCinematic();
                }, GameSettings.VICTORY_CINEMATIC_DELAY);

            }, GameSettings.EXPLOSION_DELAY); // ⌛ Delay after 3rd burst
        }

    };

    repeatExplosions(); // 🌟 Start first burst    

    // Clear lasers
    bossLasers.length = 0;

    setTimeout(() => {
        startVictoryCinematic(); // 🎯 Wyatt returns to Norinavio!
    }, 2000);
}

function startVictoryCinematic() {
    if (finalCinematicStarted) return; // ✅ Prevent duplicate runs
    finalCinematicStarted = true;

    // Stop gameplay updates
    gameOver = true;
    window.gameOver = gameOver; // Update global reference
    endCinematicActive = true; // 🌟 Start ship fly-up
    endShipY = player.y; // Reset starting Y if needed

    // Load audio
    const redfordAudio = new Audio("assets/wyatt001.mp3");
    const wyattAudio = new Audio("assets/days_work.mp3");

    // Start Redford's voice line
    redfordAudio.play().catch(err => console.warn("🌟 Redford audio failed:", err));

    redfordAudio.onended = () => {
        // Then Wyatt replies
        wyattAudio.play().catch(err => console.warn("🌟 Wyatt audio failed:", err));

        wyattAudio.onended = () => {
            // Wait a bit for ship to fly off, then show end screen
            setTimeout(() => {
                endCinematicActive = false;

                // Fade to black and show message
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "white";
                ctx.font = "36px Orbitron, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("Mission Accomplished!", canvas.width / 2, canvas.height / 2);
                ctx.font = "20px Orbitron, sans-serif";
                ctx.fillText("Wyatt returns safely to Norinavio...", canvas.width / 2, canvas.height / 2 + 40);

                // Restart button
                const restartBtn = document.createElement("button");
                restartBtn.innerText = "Play Again";
                restartBtn.style.position = "fixed"; // fixed = better layout control
                restartBtn.style.top = "60%";
                restartBtn.style.left = "50%";
                restartBtn.style.transform = "translate(-50%, -50%)";
                restartBtn.style.fontSize = "24px";
                restartBtn.style.padding = "15px 30px";
                restartBtn.style.borderRadius = "10px";
                restartBtn.style.cursor = "pointer";
                restartBtn.onclick = () => restartGame();
                document.body.appendChild(restartBtn);

            }, 2000); // Delay after Wyatt finishes speaking
        };
    };
}

function showEndScreen() {
    const endScreen = document.createElement("div");
    endScreen.style.position = "fixed";
    endScreen.style.top = "50%";
    endScreen.style.left = "50%";
    endScreen.style.transform = "translate(-50%, -50%)";
    endScreen.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
    endScreen.style.padding = "30px";
    endScreen.style.border = "2px solid white";
    endScreen.style.color = "white";
    endScreen.style.fontSize = "24px";
    endScreen.style.textAlign = "center";
    endScreen.style.borderRadius = "10px";
    endScreen.style.zIndex = "1000";

    endScreen.innerHTML = `
        <h2>Mission Complete</h2>
        <p><strong>Final Score:</strong> ${score}</p>
        <p style="font-style: italic; color: #00ffff;">Redford: "You did good, kid."</p>
        <p style="font-style: italic; color: #ffcc00;">Wyatt: "All in a day's work."</p>
    `;

    const button = document.createElement("button");
    button.innerText = "Play Again";
    button.style.marginTop = "20px";
    button.style.padding = "10px 20px";
    button.style.fontSize = "18px";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.onclick = () => restartGame();

    endScreen.appendChild(button);
    document.body.appendChild(endScreen);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
