// Game Mode Integration - bridges new multiplayer system with existing game
// This file ensures smooth integration between old and new systems

document.addEventListener('DOMContentLoaded', function() {
    console.log('[Integration] Starting game mode integration');
    
    // Wait for all modules to load
    setTimeout(initializeGameModeSystem, 500);
});

async function initializeGameModeSystem() {
    try {
        // Check if game mode manager is available
        if (typeof window.gameModeManager !== 'undefined') {
            console.log('[Integration] Game mode manager found, initializing...');
            await window.gameModeManager.initialize();
            
            // Replace the original start button with mode selection
            replaceStartButton();
        } else {
            console.log('[Integration] Game mode manager not found, using fallback');
            // Keep original functionality as fallback
        }
    } catch (error) {
        console.error('[Integration] Failed to initialize game mode system:', error);
        // Fallback to original game start
    }
}

function replaceStartButton() {
    const startButton = document.getElementById('startButton');
    const thumbnail = document.getElementById('gameThumbnailContainer');
    
    if (startButton) {
        // Replace start button click handler
        startButton.removeEventListener('click', window.startGame);
        startButton.addEventListener('click', function() {
            // Hide original UI elements
            if (startButton) startButton.style.display = 'none';
            if (thumbnail) thumbnail.style.display = 'none';
            
            // Show game mode selection
            window.gameModeManager.showModeSelection();
        });
        
        startButton.textContent = 'Choose Game Mode';
        console.log('[Integration] Start button replaced with mode selection');
    }
}

// Global integration functions
window.gameIntegration = {
    // Test function to verify integration
    test: function() {
        console.log('[Integration] Testing game mode system...');
        
        const tests = [
            () => typeof window.GameModeManager !== 'undefined',
            () => typeof window.gameModeManager !== 'undefined',
            () => typeof window.gameModeManager.showModeSelection === 'function',
            () => typeof window.SinglePlayerGame !== 'undefined'
        ];
        
        const results = tests.map((test, i) => {
            try {
                const result = test();
                console.log(`[Integration] Test ${i + 1}: ${result ? 'PASS' : 'FAIL'}`);
                return result;
            } catch (error) {
                console.log(`[Integration] Test ${i + 1}: ERROR -`, error.message);
                return false;
            }
        });
        
        const allPassed = results.every(r => r);
        console.log(`[Integration] Overall: ${allPassed ? 'SUCCESS' : 'FAILED'}`);
        return allPassed;
    },
    
    // Force show mode selection for testing
    showModes: function() {
        if (window.gameModeManager) {
            window.gameModeManager.showModeSelection();
        } else {
            console.error('[Integration] Game mode manager not available');
        }
    },
    
    // Start single player for testing
    testSinglePlayer: function() {
        if (window.gameModeManager) {
            window.gameModeManager.setMode('single');
            window.gameModeManager.startSinglePlayer();
        } else {
            console.error('[Integration] Game mode manager not available');
        }
    }
};

console.log('[Integration] Game integration functions available at window.gameIntegration');