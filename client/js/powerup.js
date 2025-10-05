class PowerUp {
    constructor() {
        this.width = 120; // ✅ 4x Bigger
        this.height = 120;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = Math.random() * (canvas.height / 2);
        this.image = new Image();
        this.image.src = "assets/powerup.png"; // ✅ Make sure this file exists
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
