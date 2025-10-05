// Import required classes
import { GameModeUI } from './game-mode-ui.js';
import { MultiplayerGame } from './multiplayer-game.js';
import { SinglePlayerGame } from './single-player-game.js';

// Game Mode Manager - handles different multiplayer game modes and lobby functionality
class GameModeManager {
    constructor() {
        this.currentMode = 'single'; // single, coop, versus, lobby
        this.gameState = 'menu'; // menu, lobby, starting, playing, ended
        this.lobbyOptions = {
            mode: 'coop',
            maxPlayers: 4,
            allowLateJoin: true,
            autoStart: false,
            startDelay: 5000
        };
        this.activePlayers = new Map(); // playerId -> PlayerState
        this.gameSession = null;
        this.ui = new GameModeUI(this);
        this.multiplayerGame = new MultiplayerGame(this);
        this.singlePlayerGame = new SinglePlayerGame(this);
        this.networkManager = null; // Will be set by main game
    }

    // Initialize game mode system
    async initialize() {
        console.log('[GameMode] Initializing game mode manager');
        this.ui.initialize();
        this.setupEventListeners();
        
        // Check for URL parameters (join via link)
        const urlParams = new URLSearchParams(window.location.search);
        const gameCode = urlParams.get('game') || urlParams.get('join');
        const mode = urlParams.get('mode');
        
        if (gameCode) {
            this.handleDeepLink(gameCode, mode);
        } else {
            this.showModeSelection();
        }
    }

    // Handle deep linking (join via URL)
    async handleDeepLink(gameCode, mode) {
        try {
            this.ui.showJoiningMessage(gameCode);
            if (this.networkManager) {
                await this.networkManager.joinGame(gameCode);
                this.setMode('coop'); // Default to coop for joined games
                this.gameState = 'lobby';
                this.ui.showLobby();
            }
        } catch (error) {
            console.error('[GameMode] Failed to join via deep link:', error);
            this.ui.showError('Failed to join game. Starting in single player mode.');
            this.setMode('single');
        }
    }

    // Show initial mode selection
    showModeSelection() {
        this.gameState = 'menu';
        this.ui.showModeSelection();
    }

    // Set game mode
    setMode(mode, options = {}) {
        const previousMode = this.currentMode;
        this.currentMode = mode;
        
        // Merge options with defaults
        this.lobbyOptions = { ...this.lobbyOptions, ...options };
        
        console.log(`[GameMode] Changed from ${previousMode} to ${mode}`);
        
        switch (mode) {
            case 'single':
                this.startSinglePlayer();
                break;
            case 'coop':
                this.setupCooperativeMode();
                break;
            case 'versus':
                this.setupVersusMode();
                break;
            case 'lobby':
                this.showLobby();
                break;
        }
        
        // Notify listeners
        this.dispatchEvent('modeChanged', { 
            mode, 
            previousMode, 
            options: this.lobbyOptions 
        });
    }

    // Single player mode (existing gameplay)
    startSinglePlayer() {
        console.log('[GameMode] Starting single player game');
        this.gameState = 'playing';
        this.ui.hide();
        
        // Initialize single player game using our new architecture
        try {
            this.singlePlayerGame.initialize();
            this.gameSession = this.singlePlayerGame;
            console.log('[GameMode] Single player game started successfully');
        } catch (error) {
            console.error('[GameMode] Failed to start single player game:', error);
            
            // Fallback to original start game function
            if (typeof startGame === 'function') {
                console.log('[GameMode] Falling back to original startGame function');
                startGame();
            } else {
                this.ui.showError('Failed to start single player game');
                this.gameState = 'menu';
                this.ui.showModeSelection();
            }
        }
    }

    // Setup cooperative multiplayer
    setupCooperativeMode() {
        this.gameState = 'lobby';
        this.lobbyOptions.mode = 'coop';
        
        if (this.networkManager) {
            // Host a game if not already connected
            if (!this.networkManager.isConnected()) {
                this.hostGame();
            } else {
                this.showLobby();
            }
        } else {
            this.ui.showError('Network not available. Starting single player.');
            this.setMode('single');
        }
    }

    // Setup versus multiplayer
    setupVersusMode() {
        this.gameState = 'lobby';
        this.lobbyOptions.mode = 'versus';
        this.lobbyOptions.maxPlayers = 4; // Force 4 players for versus
        
        if (this.networkManager) {
            if (!this.networkManager.isConnected()) {
                this.hostGame();
            } else {
                this.showLobby();
            }
        } else {
            this.ui.showError('Network not available. Starting single player.');
            this.setMode('single');
        }
    }

    // Host a new game
    async hostGame() {
        try {
            this.ui.showHostingMessage();
            
            if (this.networkManager) {
                const gameCode = await this.networkManager.hostGame(this.lobbyOptions);
                this.gameSession = {
                    gameCode,
                    isHost: true,
                    startTime: null,
                    players: new Map()
                };
                
                this.showLobby();
            }
        } catch (error) {
            console.error('[GameMode] Failed to host game:', error);
            this.ui.showError('Failed to host game. Try again or start single player.');
        }
    }

    // Show lobby interface
    showLobby() {
        this.gameState = 'lobby';
        this.ui.showLobby();
        
        // Auto-start logic for cooperative games
        if (this.lobbyOptions.mode === 'coop' && this.lobbyOptions.autoStart) {
            this.setupAutoStart();
        }
    }

    // Setup auto-start timer
    setupAutoStart() {
        if (this.activePlayers.size >= 2) {
            this.ui.showCountdown(this.lobbyOptions.startDelay / 1000);
            
            setTimeout(() => {
                if (this.gameState === 'lobby' && this.activePlayers.size >= 1) {
                    this.startMultiplayerGame();
                }
            }, this.lobbyOptions.startDelay);
        }
    }

    // Manual game start (host triggered)
    startGame() {
        if (this.gameState !== 'lobby') return;
        
        if (this.currentMode === 'single') {
            this.startSinglePlayer();
        } else {
            this.startMultiplayerGame();
        }
    }

    // Start multiplayer game
    startMultiplayerGame() {
        if (this.activePlayers.size === 0) {
            this.ui.showError('No players in lobby');
            return;
        }
        
        this.gameState = 'starting';
        this.ui.showGameStarting();
        
        // Initialize multiplayer game session
        this.gameSession = {
            ...this.gameSession,
            mode: this.currentMode,
            startTime: Date.now(),
            players: new Map(this.activePlayers)
        };
        
        // Broadcast game start to all players
        if (this.networkManager) {
            this.networkManager.broadcast({
                type: 'game_starting',
                mode: this.currentMode,
                players: Array.from(this.activePlayers.keys()),
                options: this.lobbyOptions
            });
        }
        
        // Delay before actual game start
        setTimeout(() => {
            this.gameState = 'playing';
            this.ui.hide();
            this.initializeMultiplayerGame();
        }, 3000);
    }

    // Initialize the actual multiplayer game
    initializeMultiplayerGame() {
        console.log(`[GameMode] Starting ${this.currentMode} game with ${this.activePlayers.size} players`);
        
        // Initialize our multiplayer game instance
        this.multiplayerGame.initialize(this.currentMode, this.isHost);
        
        // Add all players to the game
        for (const [playerId, playerData] of this.activePlayers) {
            this.multiplayerGame.addPlayer(playerId, playerData);
        }
        
        // Start the actual game
        this.multiplayerGame.startGame();
        this.gameSession = this.multiplayerGame;
        
        console.log(`[GameMode] ${this.currentMode} game initialized with ${this.activePlayers.size} players`);
    }

    // Player management
    addPlayer(playerId, playerInfo) {
        const playerState = {
            id: playerId,
            name: playerInfo.name || `Player ${this.activePlayers.size + 1}`,
            isReady: false,
            isHost: playerId === (this.gameSession?.gameCode || this.networkManager?.peerId),
            joinedAt: Date.now(),
            ...playerInfo
        };
        
        this.activePlayers.set(playerId, playerState);
        this.ui.updatePlayerList(Array.from(this.activePlayers.values()));
        
        console.log(`[GameMode] Player added: ${playerId}`);
        
        // Check auto-start conditions
        if (this.gameState === 'lobby') {
            this.checkAutoStart();
        }
        
        this.dispatchEvent('playerAdded', { playerId, playerState });
    }

    removePlayer(playerId) {
        const removed = this.activePlayers.delete(playerId);
        if (removed) {
            this.ui.updatePlayerList(Array.from(this.activePlayers.values()));
            console.log(`[GameMode] Player removed: ${playerId}`);
            
            // Handle host migration if needed
            if (this.gameSession?.isHost && playerId === this.gameSession.gameCode) {
                this.handleHostMigration();
            }
            
            this.dispatchEvent('playerRemoved', { playerId });
        }
        return removed;
    }

    setPlayerReady(playerId, ready = true) {
        const player = this.activePlayers.get(playerId);
        if (player) {
            player.isReady = ready;
            this.ui.updatePlayerList(Array.from(this.activePlayers.values()));
            
            // Check if all players are ready
            this.checkReadyState();
        }
    }

    // Check if all players are ready and handle auto-start
    checkReadyState() {
        const allReady = Array.from(this.activePlayers.values()).every(p => p.isReady);
        const minPlayers = this.currentMode === 'versus' ? 2 : 1;
        
        if (allReady && this.activePlayers.size >= minPlayers) {
            this.ui.showAllReady();
            
            if (this.lobbyOptions.autoStart) {
                setTimeout(() => this.startMultiplayerGame(), 2000);
            }
        }
    }

    checkAutoStart() {
        if (this.lobbyOptions.autoStart && this.activePlayers.size >= 2) {
            this.setupAutoStart();
        }
    }

    // Handle host leaving
    handleHostMigration() {
        const remainingPlayers = Array.from(this.activePlayers.values());
        if (remainingPlayers.length > 0) {
            const newHost = remainingPlayers[0];
            newHost.isHost = true;
            
            if (this.gameSession) {
                this.gameSession.gameCode = newHost.id;
            }
            
            this.ui.showHostMigration(newHost.name);
            console.log(`[GameMode] Host migrated to: ${newHost.id}`);
        } else {
            // No players left, return to menu
            this.endGame('No players remaining');
        }
    }

    // End current game
    endGame(reason = 'Game ended') {
        this.gameState = 'ended';
        
        if (this.networkManager) {
            this.networkManager.broadcast({
                type: 'game_ended',
                reason
            });
        }
        
        this.ui.showGameEnded(reason);
        
        // Return to mode selection after delay
        setTimeout(() => {
            this.reset();
            this.showModeSelection();
        }, 5000);
    }

    // Handle game end (called by single or multiplayer games)
    handleGameEnd(results) {
        console.log('[GameMode] Game ended:', results);
        this.gameState = 'menu';
        
        // Stop any active games
        if (this.singlePlayerGame && this.singlePlayerGame.isActive) {
            this.singlePlayerGame.stop();
        }
        if (this.multiplayerGame && this.multiplayerGame.gameState.isActive) {
            this.multiplayerGame.endGame('completed');
        }
        
        // Show results or return to menu
        if (results.mode === 'single') {
            // Could show a score screen here
            console.log(`[GameMode] Single player final score: ${results.score}`);
        }
        
        // Clear game session
        this.gameSession = null;
    }

    // Reset to initial state
    reset() {
        this.gameState = 'menu';
        this.activePlayers.clear();
        this.gameSession = null;
        
        // Stop any active games
        if (this.singlePlayerGame) {
            this.singlePlayerGame.stop();
        }
        if (this.multiplayerGame) {
            this.multiplayerGame.endGame('reset');
        }
        
        this.ui.reset();
    }

    // Get current game info
    getGameInfo() {
        return {
            mode: this.currentMode,
            state: this.gameState,
            playerCount: this.activePlayers.size,
            maxPlayers: this.lobbyOptions.maxPlayers,
            gameCode: this.gameSession?.gameCode,
            isHost: this.gameSession?.isHost || false,
            allowLateJoin: this.lobbyOptions.allowLateJoin
        };
    }

    // Network event handlers
    handleNetworkMessage(message, fromPeerId) {
        switch (message.type) {
            case 'player_joined':
                this.addPlayer(fromPeerId, message.playerInfo);
                break;
            case 'player_left':
                this.removePlayer(fromPeerId);
                break;
            case 'player_ready':
                this.setPlayerReady(fromPeerId, message.ready);
                break;
            case 'game_starting':
                if (!this.gameSession?.isHost) {
                    this.gameState = 'starting';
                    this.ui.showGameStarting();
                }
                break;
            case 'game_ended':
                this.endGame(message.reason);
                break;
        }
    }

    // Event system
    setupEventListeners() {
        // Listen for network events
        document.addEventListener('networkMessage', (event) => {
            this.handleNetworkMessage(event.detail.message, event.detail.fromPeerId);
        });
        
        // Listen for network connection changes
        document.addEventListener('networkStateChanged', (event) => {
            if (event.detail.state === 'disconnected' && this.gameState === 'playing') {
                this.endGame('Network disconnected');
            }
        });
    }

    dispatchEvent(eventName, detail) {
        document.dispatchEvent(new CustomEvent(`gameMode${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`, {
            detail: { ...detail, gameMode: this }
        }));
    }

    // Public API
    getCurrentMode() { return this.currentMode; }
    getGameState() { return this.gameState; }
    getActivePlayers() { return Array.from(this.activePlayers.values()); }
    isInLobby() { return this.gameState === 'lobby'; }
    isPlaying() { return this.gameState === 'playing'; }
    canJoinLate() { return this.lobbyOptions.allowLateJoin && this.gameState === 'playing'; }
    
    // Get game info for UI
    getGameInfo() {
        return {
            mode: this.currentMode,
            gameCode: this.gameSession?.gameCode || null,
            maxPlayers: this.lobbyOptions.maxPlayers,
            allowLateJoin: this.lobbyOptions.allowLateJoin,
            isHost: this.isHost,
            playerCount: this.activePlayers.size
        };
    }
    
    // Set network manager reference
    setNetworkManager(networkManager) {
        this.networkManager = networkManager;
        this.multiplayerGame.manager.networkManager = networkManager;
    }
    
    // Reset to initial state
    reset() {
        this.currentMode = 'single';
        this.gameState = 'menu';
        this.activePlayers.clear();
        this.gameSession = null;
        this.isHost = false;
        this.ui.reset();
        if (this.multiplayerGame) {
            this.multiplayerGame.endGame('reset');
        }
    }
    
    // Show mode selection
    showModeSelection() {
        this.reset();
        this.ui.showModeSelection();
    }
}

// Make GameModeManager available globally for easy integration with existing code
if (typeof window !== 'undefined') {
    window.GameModeManager = GameModeManager;
    
    // Create a global instance for immediate use
    window.gameModeManager = new GameModeManager();
}

export { GameModeManager };