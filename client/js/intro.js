let gameStarted = false; // ✅ Ensures game starts only once
let introActive = true; // ✅ Track if intro is playing
let norinavio = { x: canvas.width / 2 - 300, y: -400, width: 600, height: 300 };
let wyattShip = { 
    x: norinavio.x + 120, 
    y: norinavio.y + 100, 
    width: 60, 
    height: 60, 
    launching: false, 
    visible: false // ✅ New property to hide the ship initially
};

// 🚀 **Load images**
const norinavioImage = new Image();
norinavioImage.src = "assets/norinavio.png"; // ✅ Ensure this file exists
const wyattImage = new Image();
wyattImage.src = "assets/spaceship.png"; // ✅ Ensure this file exists
const asteroidImage = new Image();
asteroidImage.src = "assets/asteroid.png"; // ✅ Ensure this exists

const enemyImage = new Image();
enemyImage.src = "assets/enemy.png"; // ✅ Ensure this exists

const powerUpImage = new Image();
powerUpImage.src = "assets/powerup.png"; // ✅ Ensure this exists

let introText = [ 
    "The Drazzan Armada has invaded our system...", 
    "Wyatt... You are our last hope!" 
]; // ✅ Two epic lines of text

let textIndex = 0; // ✅ Track which line of text is showing
let textOpacity = 0; // ✅ Start text fully invisible
let fadeIn = true; // ✅ Controls text fading effect
let textTimer = 0; // ✅ Keeps text on screen for a while

let guideBoxVisible = true; // ✅ Controls visibility of the guide box (only during intro)
let guideBox = { x: canvas.width - 220, y: 20, width: 200, height: 140 }; // ✅ Box position & size

function playIntro() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✅ Ensure the intro animation continues
    if (!introActive) return;

    // 🚀 **Move mothership (Norinavio) down onto the screen**
    if (norinavio.y < (canvas.height * 2) / 3) { 
        norinavio.y += 5; // ✅ Moves smoothly downward
    } else {
        // ✅ Ensure music starts once when Norinavio arrives
        if (backgroundMusic.paused) {
            backgroundMusic.play().catch(error => {
                console.error("❌ Music playback error:", error);
            });
        }

        // ✅ Show Wyatt's ship once Norinavio stops moving
        if (!wyattShip.visible) {
            setTimeout(() => {
                wyattShip.visible = true;
                wyattShip.launching = true;
            }, 1000); // ✅ 1-second delay before Wyatt launches
        }
    }


    // 🚀 **Move Wyatt's ship out of the mothership**
    if (wyattShip.launching) {
        wyattShip.y -= 5;

        if (wyattShip.y < -100) {
            introActive = false; // ✅ Stop the intro once Wyatt leaves
            guideBoxVisible = false; // ✅ Hide guide box after intro

            // ✅ Ensure the game starts only once
            if (!gameStarted) {
                gameStarted = true;
                gameLoop();
            }
        }
    } else {
        wyattShip.x = norinavio.x + 120;
        wyattShip.y = norinavio.y + 100;
    }

    // 🚀 **Draw Mothership and Player**
    ctx.drawImage(norinavioImage, norinavio.x, norinavio.y, norinavio.width, norinavio.height);
    if (wyattShip.visible) {
        ctx.drawImage(wyattImage, wyattShip.x, wyattShip.y, wyattShip.width, wyattShip.height);
    }

    // 🚀 **Draw Player Guide Box (Only During Intro)**
    if (guideBoxVisible) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // ✅ Semi-transparent black background
        ctx.fillRect(canvas.width - 230, 20, 220, 220); // ✅ Increased height for larger icons
        ctx.strokeStyle = "white"; // ✅ White border
        ctx.strokeRect(canvas.width - 230, 20, 220, 220);
    
        ctx.fillStyle = "white";
        ctx.font = "16px Arial"; // ✅ Slightly larger text for readability
        ctx.textAlign = "left";
    
        const iconSize = 60; // ✅ Increased icon size
        const textOffset = canvas.width - 150; // ✅ Adjusted text position
    
        // 🚀 **Draw Asteroid Section**
        if (asteroidImage.complete) ctx.drawImage(asteroidImage, canvas.width - 220, 30, iconSize, iconSize);
        ctx.fillText("Evade or Destroy", textOffset, 65);
    
        // 🚀 **Draw Drazzan Raider Section**
        if (enemyImage.complete) ctx.drawImage(enemyImage, canvas.width - 220, 100, iconSize, iconSize);
        ctx.fillText("Destroy All Drazzan", textOffset, 135);
    
        // 🚀 **Draw Power-Up Section**
        if (powerUpImage.complete) ctx.drawImage(powerUpImage, canvas.width - 220, 170, iconSize, iconSize);
        ctx.fillText("Collect Powerups", textOffset, 205);
    }
    

    // 🚀 **Epic Cinematic Text Effect**
    if (textIndex < introText.length) {
        let gradient = ctx.createLinearGradient(0, canvas.height * 0.8 - 30, 0, canvas.height * 0.8 + 30);
        gradient.addColorStop(0, `rgba(255, 200, 50, ${textOpacity})`); // Bright yellow-orange
        gradient.addColorStop(1, `rgba(255, 50, 50, ${textOpacity})`); // Deep red

        ctx.fillStyle = gradient;
        ctx.font = "bold 36px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(introText[textIndex], canvas.width / 2, canvas.height * 0.8);

        if (fadeIn) {
            textOpacity += 0.02;
            if (textOpacity >= 1) {
                fadeIn = false;
                textTimer = 60;
            }
        } else if (textTimer > 0) {
            textTimer--;
        } else {
            textOpacity -= 0.02;
            if (textOpacity <= 0) {
                textIndex++;
                fadeIn = true;
            }
        }
    }

    requestAnimationFrame(playIntro); // ✅ Keep running animation
}
