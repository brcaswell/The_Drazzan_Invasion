const backgroundMusic = new Audio("assets/8bit_retro.mp3"); // ✅ Ensure correct path
backgroundMusic.loop = true; // ✅ Loops continuously
backgroundMusic.volume = 0.3; // ✅ Adjust volume if needed

function startGame() {
    let startButton = document.getElementById('startButton');
    let thumbnail = document.getElementById('gameThumbnailContainer'); // ✅ Get the thumbnail container

    // ✅ Remove the start button if it exists
    if (startButton) {
        startButton.remove();
    }

    // ✅ Remove the thumbnail if it exists
    if (thumbnail) {
        thumbnail.remove();
    }

    resizeCanvas(); // ✅ Ensure canvas fills the screen

    // 🚀 **Start Background Music if Not Already Playing**
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(error => {
            console.error("❌ Music playback error:", error);
        });
    }

    // 🚀 **Start the Intro Animation**
    if (typeof playIntro === "function") { 
        playIntro(); 
    } else {
        console.error("❌ playIntro is not defined! Check if intro.js is loaded.");
    }
}


// ✅ Ensure the button exists before adding an event listener
document.addEventListener("DOMContentLoaded", () => {
    let startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener("click", startGame);
    } else {
        console.error("❌ Start button not found in HTML!");
    }
});
