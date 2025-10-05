const keys = {}; // ✅ Declare keys globally
const laserWidth = 4; // ✅ Default laser width
const laserSound = new Audio("assets/laser1.mp3"); // ✅ Ensure correct file path
laserSound.volume = 0.1; // ✅ Lower volume to avoid being too loud


// 🚀 **Touch Controls for Movement**
document.addEventListener("touchstart", handleTouch);
document.addEventListener("touchmove", handleTouch);
document.addEventListener("touchend", handleTouchEnd);

function handleTouch(event) {
    event.preventDefault();
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    // ✅ Move left/right based on touch position
    keys["ArrowLeft"] = touchX < window.innerWidth / 2;
    keys["ArrowRight"] = touchX >= window.innerWidth / 2;

    // ✅ Move up/down based on touch position
    keys["ArrowUp"] = touchY < window.innerHeight / 2;
    keys["ArrowDown"] = touchY >= window.innerHeight / 2;
}

function handleTouchEnd(event) {
    // ✅ Reset movement when no fingers are touching the screen
    if (event.touches.length === 0) {
        keys["ArrowLeft"] = false;
        keys["ArrowRight"] = false;
        keys["ArrowUp"] = false;
        keys["ArrowDown"] = false;
    }
}

// 🚀 **Keyboard Controls (Arrow Keys + Spacebar for Shooting)**
document.addEventListener("keydown", (event) => {
    keys[event.key] = true;

    // ✅ Shoot when pressing Spacebar
    if (event.key === " ") {
        shootLaser();
    }
});

document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

function shootLaser() {
    if (!gameOver) {
        if (doubleFire) {
            console.log("✅ Firing DOUBLE lasers!"); // ✅ Debugging
            lasers.push(new Laser(player.x + player.width * 0.2, player.y, laserWidth));
            lasers.push(new Laser(player.x + player.width * 0.8 - laserWidth, player.y, laserWidth));
        } else {
            console.log("❌ Firing SINGLE laser. Double Fire:", doubleFire); // ✅ Debugging
            lasers.push(new Laser(player.x + player.width / 2 - laserWidth / 2, player.y, laserWidth));
        }

        // 🚀 **Play Laser Sound**
        laserSound.currentTime = 0; // ✅ Rewinds to start for rapid fire
        laserSound.play().catch(error => console.log("❌ Laser sound error:", error));

    } else {
        console.log("❌ Cannot shoot - Game Over");
    }
}


// 🚀 **Shooting Button for Mobile**
document.addEventListener("DOMContentLoaded", () => {
    const shootButton = document.getElementById("shootButton");

    if (shootButton) {
        shootButton.style.display = "none"; // ✅ Hides the button on load
        //shootButton.addEventListener("touchstart", shootLaser); // ✅ Fires laser on touch
    }
});
