class Asteroid {
    constructor() {
        const isLargeAsteroid = Math.random() < 0.2; // 20% chance of a large asteroid

        if (isLargeAsteroid) {
            this.size = Math.random() * (120 - 80) + 80; // Large asteroids: 80px - 120px
            this.health = 3; // ✅ Large asteroids require 3 hits
        } else {
            this.size = Math.random() * (60 - 30) + 30;  // Small asteroids: 30px - 60px
            this.health = 1; // ✅ Small asteroids break with 1 hit
        }

        this.x = Math.random() * (canvas.width - this.size);
        this.y = -this.size;
        this.width = this.size;
        this.height = this.size;
        this.speed = CONFIG.asteroidSpeed * (isLargeAsteroid ? 0.7 : 1.2); // Large asteroids move slower

        this.image = new Image();
        this.image.src = "assets/asteroid.png";
    }

    move() {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

function spawnAsteroid() {
    if (asteroids.length < CONFIG.maxAsteroids) {
        asteroids.push(new Asteroid());
    }
}


const asteroids = [];
function spawnAsteroid() {
    if (asteroids.length < CONFIG.maxAsteroids) asteroids.push(new Asteroid());
}
