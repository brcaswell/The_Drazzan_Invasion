class BossLaser {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.angle = angle; // Radians
        this.width = 6;
        this.height = 20;
    }

    move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw(ctx) {
        // Always protect canvas state
        ctx.save();

        // Draw rotated laser centered at this.x, this.y
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.fillStyle = "lime";
        ctx.fillRect(-this.width / 2, 0, this.width, this.height);
        ctx.closePath();

        ctx.restore(); // Ensure no transform leaks out
    }
}
