// Game Mode UI - handles the user interface for game mode selection and lobby
class GameModeUI {
    constructor(gameModeManager) {
        this.manager = gameModeManager;
        this.currentView = null;
        this.elements = {};
        this.countdownTimer = null;
        this.isReady = false;
    }

    initialize() {
        this.createMainContainer();
        this.setupStyles();
    }

    createMainContainer() {
        // Create main UI container
        this.elements.container = document.createElement('div');
        this.elements.container.id = 'gameModeUI';
        this.elements.container.className = 'game-mode-ui';
        document.body.appendChild(this.elements.container);
    }

    setupStyles() {
        // Add CSS styles if not already present
        if (!document.getElementById('gameModeStyles')) {
            const style = document.createElement('style');
            style.id = 'gameModeStyles';
            style.textContent = `
                .game-mode-ui {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Courier New', monospace;
                    color: #ffffff;
                    z-index: 1000;
                }

                .mode-selection {
                    text-align: center;
                    max-width: 600px;
                    padding: 40px;
                }

                .mode-title {
                    font-size: 3em;
                    margin-bottom: 20px;
                    color: #00ff88;
                    text-shadow: 0 0 20px #00ff88;
                    animation: pulse 2s infinite;
                }

                .mode-subtitle {
                    font-size: 1.2em;
                    margin-bottom: 40px;
                    color: #cccccc;
                }

                .mode-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .mode-button {
                    padding: 20px;
                    border: 2px solid #00ff88;
                    background: rgba(0, 255, 136, 0.1);
                    color: #ffffff;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 10px;
                }

                .mode-button:hover {
                    background: rgba(0, 255, 136, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
                }

                .mode-button.primary {
                    background: rgba(0, 255, 136, 0.2);
                }
                
                .mode-button.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    border-color: #666;
                    background: rgba(100, 100, 100, 0.1);
                }
                
                .mode-button.disabled:hover {
                    background: rgba(100, 100, 100, 0.1);
                    transform: none;
                    box-shadow: none;
                }
                
                .coming-soon {
                    color: #ffaa00;
                    font-size: 0.8em;
                    margin-top: 5px;
                    font-style: italic;
                }

                .lobby-container {
                    max-width: 800px;
                    padding: 40px;
                    text-align: center;
                }

                .lobby-header {
                    margin-bottom: 30px;
                }

                .lobby-title {
                    font-size: 2.5em;
                    color: #00ff88;
                    margin-bottom: 10px;
                }

                .game-code {
                    font-size: 1.5em;
                    color: #ffaa00;
                    background: rgba(255, 170, 0, 0.1);
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin: 10px 0;
                    border: 1px solid #ffaa00;
                }

                .lobby-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }

                .player-list {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 20px;
                }

                .player-list h3 {
                    color: #00ff88;
                    margin-bottom: 15px;
                }

                .player-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    margin: 5px 0;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 5px;
                }

                .player-name {
                    flex: 1;
                    text-align: left;
                }

                .player-status {
                    font-size: 0.9em;
                }

                .player-ready { color: #00ff88; }
                .player-waiting { color: #ffaa00; }
                .player-host { 
                    color: #ff6b6b; 
                    font-weight: bold;
                }

                .game-options {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 20px;
                    text-align: left;
                }

                .game-option {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                }

                .lobby-actions {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 30px;
                }

                .lobby-button {
                    padding: 15px 30px;
                    border: 2px solid #00ff88;
                    background: rgba(0, 255, 136, 0.1);
                    color: #ffffff;
                    font-size: 1em;
                    cursor: pointer;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                }

                .lobby-button:hover {
                    background: rgba(0, 255, 136, 0.3);
                }

                .lobby-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .lobby-button.danger {
                    border-color: #ff6b6b;
                    background: rgba(255, 107, 107, 0.1);
                }

                .lobby-button.danger:hover {
                    background: rgba(255, 107, 107, 0.3);
                }

                .status-message {
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid #00ff88;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    text-align: center;
                }

                .error-message {
                    background: rgba(255, 107, 107, 0.1);
                    border: 1px solid #ff6b6b;
                    color: #ff6b6b;
                }

                .countdown {
                    font-size: 2em;
                    color: #ffaa00;
                    animation: pulse 1s infinite;
                }

                .share-options {
                    margin-top: 20px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }

                .share-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 15px;
                }

                .share-button {
                    padding: 10px 15px;
                    border: 1px solid #666;
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 0.9em;
                    transition: background 0.3s ease;
                }

                .share-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .hidden { display: none !important; }
            `;
            document.head.appendChild(style);
        }
    }

    // Show mode selection screen
    showModeSelection() {
        this.currentView = 'modeSelection';

        // Check feature flags availability
        const featureFlags = window.featureFlags;
        const singlePlayerEnabled = featureFlags ? featureFlags.isEnabled('SINGLE_PLAYER') : true;
        const coopEnabled = featureFlags ? featureFlags.isEnabled('COOPERATIVE_MODE') : false;
        const versusEnabled = featureFlags ? featureFlags.isEnabled('VERSUS_MODE') : false;

        // Get status messages for disabled features
        const coopStatus = featureFlags ? featureFlags.getFeatureStatus('COOPERATIVE_MODE') : { status: 'disabled', message: 'Coming Soon' };
        const versusStatus = featureFlags ? featureFlags.getFeatureStatus('VERSUS_MODE') : { status: 'disabled', message: 'Coming Soon' };

        this.elements.container.innerHTML = `
            <div class="mode-selection">
                <h1 class="mode-title">THE DRAZZAN INVASION</h1>
                <p class="mode-subtitle">Choose your battle mode</p>
                
                <div class="mode-buttons">
                    <button class="mode-button primary" onclick="gameModeManager.setMode('single')" ${!singlePlayerEnabled ? 'disabled' : ''}>
                        <h3>🚀 Single Player</h3>
                        <p>Classic solo experience</p>
                    </button>
                    
                    <button class="mode-button ${!coopEnabled ? 'disabled' : ''}" ${!coopEnabled ? 'onclick="return false;"' : 'onclick="gameModeManager.setMode(\'coop\')"'}>
                        <h3>🤝 Cooperative</h3>
                        <p>Team up against the invasion</p>
                        ${!coopEnabled ? `<div class="coming-soon">${coopStatus.message}</div>` : ''}
                    </button>
                    
                    <button class="mode-button ${!versusEnabled ? 'disabled' : ''}" ${!versusEnabled ? 'onclick="return false;"' : 'onclick="gameModeManager.setMode(\'versus\')"'}>
                        <h3>⚔️ Versus</h3>
                        <p>Compete for the highest score</p>
                        ${!versusEnabled ? `<div class="coming-soon">${versusStatus.message}</div>` : ''}
                    </button>
                    
                    <button class="mode-button ${!(coopEnabled || versusEnabled) ? 'disabled' : ''}" ${!(coopEnabled || versusEnabled) ? 'onclick="return false;"' : 'onclick="window.gameModeManager.ui.showJoinDialog()"'}>
                        <h3>🔗 Join Game</h3>
                        <p>Enter a game code</p>
                        ${!(coopEnabled || versusEnabled) ? '<div class="coming-soon">Available with multiplayer modes</div>' : ''}
                    </button>
                </div>
                
                <p style="color: #888; font-size: 0.9em; margin-top: 20px;">
                    ${(coopEnabled || versusEnabled) ? 'Multiplayer games use peer-to-peer connections - no servers required!' : 'Multiplayer features coming soon!'}
                </p>
            </div>
        `;
        this.show();
    }

    // Show lobby interface
    showLobby() {
        this.currentView = 'lobby';
        const gameInfo = this.manager.getGameInfo();
        const gameCode = gameInfo.gameCode || 'GENERATING...';
        const shareUrl = `${window.location.origin}${window.location.pathname}?game=${gameCode}`;

        this.elements.container.innerHTML = `
            <div class="lobby-container">
                <div class="lobby-header">
                    <h1 class="lobby-title">${this.getModeDisplayName()} Lobby</h1>
                    <div class="game-code">
                        <div style="font-size: 1.5em; margin: 10px 0;">Game Code: <strong style="color: #00ff88;">${gameCode}</strong></div>
                        ${gameInfo.isHost ? `
                            <button class="share-button" onclick="navigator.clipboard.writeText('${shareUrl}'); this.textContent='Copied!'">
                                📋 Copy Join Link
                            </button>
                            <div style="font-size: 0.9em; color: #ccc; margin-top: 5px;">Share this code with friends to join!</div>
                        ` : `
                            <div style="font-size: 0.9em; color: #ccc;">Connected to host's game</div>
                        `}
                    </div>
                </div>
                
                <div class="lobby-info">
                    <div class="player-list">
                        <h3>Players (${this.manager.activePlayers.size}/${gameInfo.maxPlayers})</h3>
                        <div id="playerListContainer">
                            <!-- Players will be populated here -->
                        </div>
                    </div>
                    
                    <div class="game-options">
                        <h3>Game Settings</h3>
                        <div class="game-option">
                            <span>Mode:</span>
                            <span>${this.getModeDisplayName()}</span>
                        </div>
                        <div class="game-option">
                            <span>Max Players:</span>
                            <span>${gameInfo.maxPlayers}</span>
                        </div>
                        <div class="game-option">
                            <span>Late Join:</span>
                            <span>${gameInfo.allowLateJoin ? 'Allowed' : 'Disabled'}</span>
                        </div>
                        ${gameInfo.isHost ? `
                            <div class="game-option">
                                <span>Auto Start:</span>
                                <label>
                                    <input type="checkbox" ${this.manager.lobbyOptions.autoStart ? 'checked' : ''} 
                                           onchange="window.gameModeManager.ui.toggleAutoStart(this.checked)"> Enabled
                                </label>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="lobby-actions">
                    ${!gameInfo.isHost ? `
                        <button id="readyButton" class="lobby-button" onclick="window.gameModeManager.ui.toggleReady()">
                            Ready Up
                        </button>
                    ` : `
                        <button class="lobby-button" onclick="gameModeManager.startGame()">
                            Start Game
                        </button>
                    `}
                    
                    <button class="lobby-button danger" onclick="window.gameModeManager.ui.leaveLobby()">
                        Leave Lobby
                    </button>
                </div>
                
                ${gameInfo.isHost ? `
                    <div class="share-options">
                        <h4>Share Game</h4>
                        <div class="share-buttons">
                            <button class="share-button" onclick="window.gameModeManager.ui.shareViaQR()">📱 QR Code</button>
                            <button class="share-button" onclick="window.gameModeManager.ui.shareViaLink()">🔗 Share Link</button>
                            <button class="share-button" onclick="window.gameModeManager.ui.shareViaClipboard('${gameCode}')">📋 Game Code</button>
                        </div>
                    </div>
                ` : ''}
                
                <div id="lobbyMessages"></div>
            </div>
        `;

        this.updatePlayerList(this.manager.getActivePlayers());
        this.show();
    }

    // Update player list in lobby
    updatePlayerList(players) {
        const container = document.getElementById('playerListContainer');
        if (!container) return;

        container.innerHTML = players.map(player => `
            <div class="player-item">
                <span class="player-name ${player.isHost ? 'player-host' : ''}">
                    ${player.isHost ? '👑 ' : ''}${player.name}
                </span>
                <span class="player-status ${player.isReady ? 'player-ready' : 'player-waiting'}">
                    ${player.isReady ? '✓ Ready' : '⏳ Waiting'}
                </span>
            </div>
        `).join('');
    }

    // Show status messages
    showJoiningMessage(gameCode) {
        this.showStatusMessage(`Joining game ${gameCode}...`, false);
    }

    showHostingMessage() {
        this.showStatusMessage('Creating game room...', false);
    }

    showGameStarting() {
        this.showStatusMessage('Game starting...', false);
    }

    showAllReady() {
        this.showMessage('All players ready! Starting soon...', 'status-message');
    }

    showCountdown(seconds) {
        this.showMessage(`Starting in <span class="countdown">${seconds}</span>`, 'status-message');

        this.countdownTimer = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                this.showMessage(`Starting in <span class="countdown">${seconds}</span>`, 'status-message');
            } else {
                this.clearCountdown();
            }
        }, 1000);
    }

    clearCountdown() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }

    showHostMigration(newHostName) {
        this.showMessage(`${newHostName} is now the host`, 'status-message');
    }

    showGameEnded(reason) {
        this.showStatusMessage(`Game ended: ${reason}`, false);
    }

    showError(message) {
        this.showMessage(message, 'status-message error-message');
    }

    showStatusMessage(message, isError = false) {
        this.currentView = 'status';
        this.elements.container.innerHTML = `
            <div class="status-message ${isError ? 'error-message' : ''}">
                <h2>${message}</h2>
                ${isError ? '<button class="lobby-button" onclick="gameModeManager.showModeSelection()">Back to Menu</button>' : ''}
            </div>
        `;
        this.show();
    }

    showMessage(message, className = 'status-message') {
        const messagesContainer = document.getElementById('lobbyMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `<div class="${className}">${message}</div>`;

            // Auto-clear status messages after 3 seconds
            if (className.includes('status-message')) {
                setTimeout(() => {
                    if (messagesContainer) messagesContainer.innerHTML = '';
                }, 3000);
            }
        }
    }

    // Helper methods
    getModeDisplayName() {
        const modes = {
            'single': 'Single Player',
            'coop': 'Cooperative',
            'versus': 'Versus',
            'lobby': 'Lobby'
        };
        return modes[this.manager.currentMode] || this.manager.currentMode;
    }

    // UI interaction handlers
    showJoinDialog() {
        const gameCode = prompt('Enter game code:');
        if (gameCode) {
            this.manager.networkManager?.joinGame(gameCode.toUpperCase());
        }
    }

    toggleReady() {
        console.log('[UI] Toggle ready state');

        // Toggle ready state
        this.isReady = !this.isReady;

        // Update button text and style
        const readyButton = document.getElementById('readyButton');
        if (readyButton) {
            if (this.isReady) {
                readyButton.textContent = '✓ Ready';
                readyButton.className = 'lobby-button ready';
                readyButton.style.backgroundColor = '#00ff88';
                readyButton.style.color = '#000';
            } else {
                readyButton.textContent = 'Ready Up';
                readyButton.className = 'lobby-button';
                readyButton.style.backgroundColor = '';
                readyButton.style.color = '';
            }
        }

        // Notify game mode manager of ready state change
        if (this.manager.handlePlayerReady) {
            this.manager.handlePlayerReady(this.isReady);
        }
    }

    leaveLobby() {
        this.manager.reset();
        this.manager.showModeSelection();
    }

    toggleAutoStart(enabled) {
        this.manager.lobbyOptions.autoStart = enabled;
    }

    shareViaQR() {
        // Implementation for QR code sharing
        console.log('Show QR code');
    }

    shareViaLink() {
        const gameInfo = this.manager.getGameInfo();
        const shareUrl = `${window.location.origin}${window.location.pathname}?game=${gameInfo.gameCode}`;

        if (navigator.share) {
            navigator.share({
                title: 'Join my Drazzan Invasion game!',
                text: `Join my multiplayer game with code: ${gameInfo.gameCode}`,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            this.showMessage('Share link copied to clipboard!');
        }
    }

    shareViaClipboard(gameCode) {
        navigator.clipboard.writeText(gameCode);
        this.showMessage('Game code copied to clipboard!');
    }

    // Show/hide UI
    show() {
        this.elements.container.classList.remove('hidden');
    }

    hide() {
        this.elements.container.classList.add('hidden');
        this.clearCountdown();
    }

    reset() {
        this.hide();
        this.currentView = null;
        this.clearCountdown();
    }
}

export { GameModeUI };