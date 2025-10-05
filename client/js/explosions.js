class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.timer = 30;
        this.image = new Image();
        this.image.src = "assets/explosion.gif";
    }

    update() {
        this.timer--;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

const explosions = [];
