class Enemy {
    constructor() {
        this.width = 80;
        this.height = 80;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = canvas.height * 0.3; // ✅ Spawns lower
        this.speedX = 2; // Horizontal speed
        this.speedY = 0.5; // Vertical floating speed
        this.health = 3;
        this.image = new Image();
        this.image.src = "assets/enemy.png";
        this.shootInterval = Math.random() * 50 + 50; // ✅ Shoots more frequently
        this.shootTimer = 0;
    }

    move() {
        // ✅ Move left & right (Zigzag pattern)
        this.x += this.speedX;
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.speedX *= -1; // Reverse direction at edges
        }

        // ✅ Move slightly up & down (Hovering effect)
        this.y += Math.sin(Date.now() / 500) * this.speedY;

        // 🚀 **Avoid asteroids dynamically**
        for (let asteroid of asteroids) {
            if (checkCollision(this, asteroid, false)) {
                this.x -= this.speedX * 3; // Move further away
                this.speedX *= -1; // Change direction
            }
        }

        // 🚀 **Dodge player lasers**
        for (let laser of lasers) {
            if (
                laser.y < this.y + this.height && // Laser is near
                Math.abs(laser.x - this.x) < this.width * 0.6 // Laser is in the danger zone
            ) {
                this.x += (Math.random() > 0.5 ? 1 : -1) * this.speedX * 5; // Dodge randomly left or right
            }
        }

        // 🚀 **Chase the player slightly**
        if (Math.abs(player.x - this.x) > 50) { // Only chase if not too close
            this.x += (player.x > this.x ? 0.5 : -0.5); // Move towards the player
        }

        // 🚀 **Shoot at random intervals**
        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            // ✅ Fire 3 lasers in a spread pattern
            enemyLasers.push(new EnemyLaser(this.x + this.width / 2 - 10, this.y + this.height)); // Left
            enemyLasers.push(new EnemyLaser(this.x + this.width / 2, this.y + this.height)); // Center
            enemyLasers.push(new EnemyLaser(this.x + this.width / 2 + 10, this.y + this.height)); // Right

            this.shootTimer = 0;
        }

    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
