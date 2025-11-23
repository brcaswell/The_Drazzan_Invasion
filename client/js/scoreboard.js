function showScoreBoard() {
    const scoreBoard = document.createElement('div'); // ✅ Create it FIRST

    scoreBoard.style.position = 'fixed'; // ✅ Prevent layout shift
    scoreBoard.style.top = '50%';
    scoreBoard.style.left = '50%';
    scoreBoard.style.transform = 'translate(-50%, -50%)';
    scoreBoard.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    scoreBoard.style.padding = '20px';
    scoreBoard.style.border = '2px solid white';
    scoreBoard.style.color = 'white';
    scoreBoard.style.fontSize = '18px';
    scoreBoard.style.textAlign = 'center';
    scoreBoard.style.borderRadius = '10px';
    scoreBoard.style.zIndex = '1000';
    scoreBoard.style.maxWidth = '90%'; // ✅ Prevent overflow
    scoreBoard.style.boxSizing = 'border-box';
    

    // 🚀 **Random Ending Messages**
    const endingMessages = [
        `"The Black Ship: The Drazzan Attacks"`,
        `"Clara shakes her head... 'Really? That was your best effort?' 🤦"`,
        `"Redford sighs: 'I knew you weren't ready yet, but I let you fly anyway.' 😔"`,
        `"A Drazzan transmission crackles: 'That was pathetic, human! Try again if you dare!' 💀"`,
        `"Your flight instructor would be embarrassed right now. 🛑"`,
        `"The Drazzan fleet celebrates your destruction. They call you ‘The Easiest Target’! 🎯"`,
        `"Clara radios in: 'Next time, maybe try dodging, Wyatt!' 😏"`,
        `"Redford mutters: 'Guess we better start looking for a new hero...' 🙄"`,
        `"Drazzan commander laughs: 'Is that all you’ve got, Earthling? Hah!' 😆"`,
        `"Mission failed. The Drazzan remain undefeated... for now. 👽"`,
    ];

    // 🚀 **Pick a random message**
    const randomMessage = endingMessages[Math.floor(Math.random() * endingMessages.length)];

    // 🚀 **Display the message on the game over screen**
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    //ctx.fillText(randomMessage, canvas.width / 2, canvas.height / 2 + 50); // ✅ Displayed in the middle
    ctx.textAlign = "left";      // ✅ Reset canvas alignment back to default
    ctx.textBaseline = "top";    // ✅ Helps ensure vertical positioning stays stable
    
    // 🚀 **Display the Final Score & Message**
    scoreBoard.innerHTML = `
        <h2>Game Over</h2>
        <p><strong>Final Score:</strong> ${score}</p>
        <p style="font-style: italic; color: #ffcc00;">${randomMessage}</p> <!-- ✅ Message is now visible! -->
    `;
    // Play Again button
    const restartButton = document.createElement('button');
    restartButton.innerText = 'Play Again';
    restartButton.style.position = 'relative'; // ✅ Prevent layout reflow inside scoreBoard
    restartButton.style.marginTop = '15px';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '18px';
    restartButton.style.borderRadius = '5px';
    restartButton.style.cursor = 'pointer';
    restartButton.style.zIndex = '1001'; // ✅ Keep it above just in case
    restartButton.onclick = resetGame;


    scoreBoard.appendChild(restartButton);
    document.body.appendChild(scoreBoard);
    scoreBoard.style.zIndex = "1000"; // ✅ Ensures it appears over the game without affecting UI
}

function saveScore(finalScore) {
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Save new score
    highScores.push({ name: "Player", score: finalScore });

    // Sort scores from highest to lowest
    highScores.sort((a, b) => b.score - a.score);

    // Keep only the top 10 scores
    highScores = highScores.slice(0, 10);

    // Save to localStorage
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function resetGame() {
    location.reload(); // Reload the page to restart the game
}
