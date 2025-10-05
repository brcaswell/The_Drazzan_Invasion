let gameOver = false; // ✅ Fix: Ensure this variable exists globally
let score = 0; // ✅ Global variable to track score
let asteroidIncreaseTimer = 0; // ✅ Fix: Declare variable


function update() {
    if (gameOver) return; // Stop updating if the game is over

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

    // 🚀 **Increase Asteroid Spawn Rate Over Time**
    asteroidIncreaseTimer++;
    if (asteroidIncreaseTimer >= CONFIG.asteroidIncreaseInterval) {
        CONFIG.maxAsteroids += 2; // ✅ Every 10 seconds, allow 2 more asteroids
        CONFIG.asteroidSpawnRate = Math.max(CONFIG.asteroidSpawnRate - 5, 40); // ✅ Increase spawn speed (minimum 40)
        asteroidIncreaseTimer = 0;
    }

// 🚀 **Check Player-Asteroid Collisions with Buffer**
for (let i = asteroids.length - 1; i >= 0; i--) {
    if (checkCollision(player, asteroids[i], true)) { // ✅ Uses updated buffer logic
        triggerGameOver(asteroids[i]);
        return;
    }
}

    // 🚀 **Check for Laser-Asteroid Collisions**
    for (let i = lasers.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (checkCollision(lasers[i], asteroids[j], false)) {
                explosions.push(new Explosion(asteroids[j].x, asteroids[j].y));
                asteroids[j].health -= 1;

                if (asteroids[j].health <= 0) {
                    asteroids.splice(j, 1);
                    score += 10;
                }

                lasers.splice(i, 1);
                break;
            }
        }
    }

    // Handle explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update();
        if (explosions[i].timer <= 0) explosions.splice(i, 1);
    }

    // 🚀 **Spawn Asteroids**
    if (Math.random() < 0.04 && asteroids.length < CONFIG.maxAsteroids) {
        spawnAsteroid();
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Player
    player.draw(ctx);
    
    // Draw Lasers
    lasers.forEach(laser => laser.draw(ctx));

    // Draw Asteroids
    asteroids.forEach(asteroid => asteroid.draw(ctx));

    // Draw Explosions
    explosions.forEach(explosion => explosion.draw(ctx));

    // 🏆 **NEW: Display Score**
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 🚀 **NEW: Handle Game Over**
function triggerGameOver(asteroid) {
    gameOver = true;

    // 🚀 **Explosion Effect**
    explosions.push(new Explosion(player.x, player.y));
    explosions.push(new Explosion(asteroid.x, asteroid.y));

    // Delay showing the scoreboard so explosion is visible
    setTimeout(() => {
        saveScore(score);  // Save the score before restarting
        showScoreBoard(score); // ✅ Ensure this function is correctly defined in scoreboard.js
    }, 1000);
}
