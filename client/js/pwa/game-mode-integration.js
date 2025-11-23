// Game Mode Integration - Initialize the multiplayer system
(function() {
    'use strict';
    
    console.log('[Integration] Initializing game mode system...');
    
    // Wait for DOM and all modules to load
    let initAttempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    function tryInitialize() {
        initAttempts++;
        
        // Check if all required components are available
        if (typeof window.GameModeManager !== 'undefined' && 
            typeof window.gameModeManager !== 'undefined') {
            
            console.log('[Integration] Game mode system ready, initializing...');
            initializeGameModeSystem();
            return;
        }
        
        if (initAttempts < maxAttempts) {
            setTimeout(tryInitialize, 100);
        } else {
            console.warn('[Integration] Game mode system not available after 5 seconds, using fallback');
            setupFallback();
        }
    }
    
    // Initialize the complete game mode system
    async function initializeGameModeSystem() {
        try {
            // Initialize the game mode manager
            await window.gameModeManager.initialize();
            
            // Override the original start button behavior
            setupModeSelectionIntegration();
            
            console.log('[Integration] Game mode system initialized successfully');
            
        } catch (error) {
            console.error('[Integration] Failed to initialize game mode system:', error);
            setupFallback();
        }
    }
    
    // Setup integration with existing start button
    function setupModeSelectionIntegration() {
        const startButton = document.getElementById('startButton');
        const thumbnail = document.getElementById('gameThumbnailContainer');
        
        if (startButton) {
            // Override the existing click handler
            startButton.onclick = function(e) {
                e.preventDefault();
                
                console.log('[Integration] Start button clicked, showing mode selection');
                
                // Hide the thumbnail and start button
                if (thumbnail) thumbnail.style.display = 'none';
                startButton.style.display = 'none';
                
                // Show game mode selection
                window.gameModeManager.showModeSelection();
            };
            
            console.log('[Integration] Start button integrated with mode selection');
        }
        
        // Also provide direct access methods
        window.showModeSelection = () => window.gameModeManager.showModeSelection();
        window.startSinglePlayer = () => {
            window.gameModeManager.setMode('single');
            window.gameModeManager.startGame();
        };
        
        // Global helper for debugging
        window.gameMode = {
            manager: window.gameModeManager,
            showSelection: () => window.gameModeManager.showModeSelection(),
            startSingle: () => {
                window.gameModeManager.setMode('single');
                window.gameModeManager.startGame();
            },
            getState: () => ({
                mode: window.gameModeManager.getCurrentMode(),
                state: window.gameModeManager.getGameState(),
                players: window.gameModeManager.getActivePlayers()
            })
        };
    }
    
    // Fallback to original behavior if game mode system fails
    function setupFallback() {
        console.log('[Integration] Setting up fallback to original game behavior');
        
        // Keep original functionality
        const startButton = document.getElementById('startButton');
        if (startButton && typeof startGame === 'function') {
            startButton.onclick = startGame;
        }
        
        // Provide basic debugging info
        window.gameMode = {
            error: 'Game mode system not available',
            fallback: true
        };
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInitialize);
    } else {
        tryInitialize();
    }
    
})();