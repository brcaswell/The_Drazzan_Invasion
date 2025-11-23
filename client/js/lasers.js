class Laser {
    constructor(x, y, width = 4, height = 15) { // ✅ Default values
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 7;
    }

    move() {
        this.y -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}


const lasers = [];

// Make lasers array available globally
window.lasers = lasers;
