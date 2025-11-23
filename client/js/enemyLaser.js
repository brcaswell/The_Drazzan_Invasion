class EnemyLaser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = 5;
    }

    move() {
        this.y += this.speed; // Move downward toward the player
    }

    draw(ctx) {
        ctx.fillStyle = "purple"; // Different color for enemy lasers
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
