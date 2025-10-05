function checkCollision(obj1, obj2, useBuffer = false) {
    let buffer = 0;

    // 🚀 Apply a larger buffer ONLY for player-asteroid collisions
    if (useBuffer) {
        if (obj2.width >= 80) {
            buffer = Math.min(obj2.width, obj2.height) * 0.25; // ✅ 25% buffer for large asteroids
        } else if (obj2 instanceof EnemyLaser) {
            buffer = Math.min(obj2.width, obj2.height) * 0.4; // ✅ 40% buffer for enemy lasers (closer crossover)
        } else {
            buffer = Math.min(obj2.width, obj2.height) * 0.15; // ✅ 15% buffer for small asteroids & other objects
        }
    }

    return (
        obj1.x + buffer < obj2.x + obj2.width - buffer &&
        obj1.x + obj1.width - buffer > obj2.x + buffer &&
        obj1.y + buffer < obj2.y + obj2.height - buffer &&
        obj1.y + obj1.height - buffer > obj2.y + buffer
    );
}
