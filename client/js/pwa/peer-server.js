// Peer Server - handles distributed game server functionality in the browser
class PeerServer {
    constructor() {
        this.gameRooms = new Map(); // gameId -> GameRoom
        this.playerSessions = new Map(); // playerId -> PlayerSession
        this.serverCapabilities = {
            maxConcurrentGames: 10,
            maxPlayersPerGame: 8,
            supportedGameModes: ['single', 'coop', 'versus', 'boss-rush'],
            hasWasmServer: false
        };
        
        this.init();
    }

    async init() {
        console.log('[PeerServer] Initializing peer server...');
        
        // Check WASM server availability
        await this.checkWasmCapabilities();
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
        
        // Register with network manager
        if (window.networkManager) {
            window.networkManager.peerServer = this;
        }
        
        console.log('[PeerServer] Peer server initialized with capabilities:', this.serverCapabilities);
    }

    async checkWasmCapabilities() {
        try {
            if (window.wasmLoader) {
                // Test WASM loading
                await window.wasmLoader.loadWasm();
                this.serverCapabilities.hasWasmServer = true;
                console.log('[PeerServer] WASM server capability enabled');
            }
        } catch (error) {
            console.warn('[PeerServer] WASM server not available:', error);
            this.serverCapabilities.hasWasmServer = false;
        }
    }

    setupPerformanceMonitoring() {
        // Monitor system performance to adjust capabilities
        setInterval(() => {
            const performance = this.getSystemPerformance();
            this.adjustCapabilities(performance);
        }, 5000);
    }

    getSystemPerformance() {
        const nav = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
            memory: (performance.memory && performance.memory.usedJSHeapSize) || 0,
            connections: window.networkManager ? window.networkManager.getConnectedPeers().length : 0,
            fps: this.estimateFPS(),
            latency: nav ? nav.responseStart - nav.requestStart : 0,
            loadTime: nav ? nav.loadEventEnd - nav.loadEventStart : 0
        };
    }

    estimateFPS() {
        // Simple FPS estimation based on animation frames
        if (!this.fpsCounter) {
            this.fpsCounter = { frames: 0, lastTime: Date.now() };
        }
        
        this.fpsCounter.frames++;
        const currentTime = Date.now();
        
        if (currentTime - this.fpsCounter.lastTime >= 1000) {
            const fps = this.fpsCounter.frames;
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastTime = currentTime;
            return fps;
        }
        
        return this.lastFPS || 60;
    }

    adjustCapabilities(performance) {
        // Adjust server capabilities based on performance
        if (performance.memory > 100 * 1024 * 1024) { // 100MB
            this.serverCapabilities.maxConcurrentGames = Math.max(1, this.serverCapabilities.maxConcurrentGames - 1);
        } else if (performance.memory < 50 * 1024 * 1024 && this.serverCapabilities.maxConcurrentGames < 10) {
            this.serverCapabilities.maxConcurrentGames++;
        }

        if (performance.fps < 30) {
            this.serverCapabilities.maxPlayersPerGame = Math.max(2, this.serverCapabilities.maxPlayersPerGame - 1);
        } else if (performance.fps > 55 && this.serverCapabilities.maxPlayersPerGame < 8) {
            this.serverCapabilities.maxPlayersPerGame++;
        }
    }

    // Game room management
    createGameRoom(hostPlayerId, gameMode = 'versus') {
        if (this.gameRooms.size >= this.serverCapabilities.maxConcurrentGames) {
            throw new Error('Server at capacity');
        }

        const gameId = this.generateGameId();
        const gameRoom = new GameRoom(gameId, hostPlayerId, gameMode, this.serverCapabilities.hasWasmServer);
        
        this.gameRooms.set(gameId, gameRoom);
        
        // Create player session for host
        this.createPlayerSession(hostPlayerId, gameId, true);
        
        console.log('[PeerServer] Created game room:', gameId);
        return gameRoom;
    }

    joinGameRoom(gameId, playerId) {
        const gameRoom = this.gameRooms.get(gameId);
        if (!gameRoom) {
            throw new Error('Game room not found');
        }

        if (gameRoom.players.size >= this.serverCapabilities.maxPlayersPerGame) {
            throw new Error('Game room is full');
        }

        if (gameRoom.state !== 'waiting') {
            throw new Error('Game already in progress');
        }

        gameRoom.addPlayer(playerId);
        this.createPlayerSession(playerId, gameId, false);
        
        console.log('[PeerServer] Player joined game room:', playerId, gameId);
        return gameRoom;
    }

    leaveGameRoom(playerId) {
        const session = this.playerSessions.get(playerId);
        if (!session) return false;

        const gameRoom = this.gameRooms.get(session.gameId);
        if (gameRoom) {
            gameRoom.removePlayer(playerId);
            
            // If host left, migrate or close room
            if (session.isHost) {
                this.handleHostMigration(gameRoom);
            }
            
            // Remove empty rooms
            if (gameRoom.players.size === 0) {
                this.gameRooms.delete(session.gameId);
                console.log('[PeerServer] Removed empty game room:', session.gameId);
            }
        }

        this.playerSessions.delete(playerId);
        return true;
    }

    handleHostMigration(gameRoom) {
        // Migrate host to another player
        const players = Array.from(gameRoom.players.keys());
        if (players.length > 0) {
            const newHostId = players[0];
            gameRoom.hostId = newHostId;
            
            const newHostSession = this.playerSessions.get(newHostId);
            if (newHostSession) {
                newHostSession.isHost = true;
            }
            
            // Notify all players about host change
            this.broadcastToRoom(gameRoom.id, {
                type: 'host_changed',
                newHostId: newHostId
            });
            
            console.log('[PeerServer] Host migrated to:', newHostId);
        }
    }

    createPlayerSession(playerId, gameId, isHost) {
        const session = new PlayerSession(playerId, gameId, isHost);
        this.playerSessions.set(playerId, session);
        return session;
    }

    // Game state management
    updateGameState(gameId, gameState) {
        const gameRoom = this.gameRooms.get(gameId);
        if (gameRoom) {
            gameRoom.updateGameState(gameState);
            
            // Broadcast to all players in room
            this.broadcastToRoom(gameId, {
                type: 'game_state_update',
                gameState: gameState
            });
        }
    }

    handlePlayerAction(playerId, action, data) {
        const session = this.playerSessions.get(playerId);
        if (!session) return;

        const gameRoom = this.gameRooms.get(session.gameId);
        if (!gameRoom) return;

        // Process action in game room
        gameRoom.handlePlayerAction(playerId, action, data);
        
        // Broadcast action to other players
        this.broadcastToRoom(session.gameId, {
            type: 'player_action',
            playerId: playerId,
            action: action,
            data: data
        }, playerId);
    }

    // Communication
    broadcastToRoom(gameId, message, excludePlayerId = null) {
        const gameRoom = this.gameRooms.get(gameId);
        if (!gameRoom) return;

        for (const playerId of gameRoom.players.keys()) {
            if (playerId !== excludePlayerId && window.networkManager) {
                window.networkManager.sendToPlayer(playerId, message);
            }
        }
    }

    sendToPlayer(playerId, message) {
        if (window.networkManager) {
            window.networkManager.sendToPlayer(playerId, message);
        }
    }

    // Server discovery and advertisement
    getServerInfo() {
        return {
            peerId: window.networkManager ? window.networkManager.peerId : 'unknown',
            capabilities: this.serverCapabilities,
            currentLoad: {
                activeGames: this.gameRooms.size,
                totalPlayers: this.playerSessions.size,
                averageLatency: this.getAverageLatency()
            },
            supportedModes: this.serverCapabilities.supportedGameModes
        };
    }

    getAverageLatency() {
        // Calculate average latency to connected peers
        if (!window.networkManager) return 0;
        
        const peers = window.networkManager.getConnectedPeers();
        // This would need to be implemented with ping/pong measurements
        return 50; // Placeholder
    }

    // Utility methods
    generateGameId() {
        return 'game_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    getActiveGames() {
        return Array.from(this.gameRooms.values()).map(room => ({
            id: room.id,
            hostId: room.hostId,
            gameMode: room.gameMode,
            playerCount: room.players.size,
            maxPlayers: this.serverCapabilities.maxPlayersPerGame,
            state: room.state
        }));
    }

    cleanup() {
        // Clean up inactive sessions and rooms
        const now = Date.now();
        const timeout = 5 * 60 * 1000; // 5 minutes

        for (const [playerId, session] of this.playerSessions) {
            if (now - session.lastActivity > timeout) {
                this.leaveGameRoom(playerId);
            }
        }
    }
}

// Game Room class
class GameRoom {
    constructor(id, hostId, gameMode, hasWasmServer) {
        this.id = id;
        this.hostId = hostId;
        this.gameMode = gameMode;
        this.state = 'waiting'; // waiting, starting, active, ended
        this.players = new Map(); // playerId -> PlayerInfo
        this.gameState = null;
        this.hasWasmServer = hasWasmServer;
        this.wasmServer = null;
        this.createdAt = Date.now();
        this.lastActivity = Date.now();
    }

    async initWasmServer() {
        if (this.hasWasmServer && window.wasmLoader && !this.wasmServer) {
            try {
                this.wasmServer = await window.wasmLoader.loadWasm();
                const gameId = this.wasmServer.createGame(this.hostId);
                console.log('[GameRoom] WASM server initialized for room:', this.id);
            } catch (error) {
                console.error('[GameRoom] Failed to initialize WASM server:', error);
                this.hasWasmServer = false;
            }
        }
    }

    addPlayer(playerId) {
        const playerInfo = {
            id: playerId,
            joinedAt: Date.now(),
            isReady: false,
            position: { x: 0, y: 0 },
            health: 100,
            score: 0
        };
        
        this.players.set(playerId, playerInfo);
        this.lastActivity = Date.now();

        // Add to WASM server if available
        if (this.wasmServer) {
            this.wasmServer.joinGame(0, playerId);
        }
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.lastActivity = Date.now();
    }

    updateGameState(gameState) {
        this.gameState = gameState;
        this.lastActivity = Date.now();
    }

    handlePlayerAction(playerId, action, data) {
        this.lastActivity = Date.now();
        
        // Update player info
        const player = this.players.get(playerId);
        if (player) {
            if (action === 'move') {
                player.position = data.position;
            } else if (action === 'health_update') {
                player.health = data.health;
            } else if (action === 'score_update') {
                player.score = data.score;
            }
        }

        // Process in WASM server
        if (this.wasmServer) {
            this.wasmServer.handlePlayerAction(playerId, action, data);
        }
    }

    startGame() {
        if (this.state !== 'waiting') {
            throw new Error('Game cannot be started');
        }

        this.state = 'starting';
        
        // Initialize WASM server if needed
        if (this.hasWasmServer && !this.wasmServer) {
            this.initWasmServer();
        }
        
        setTimeout(() => {
            this.state = 'active';
        }, 3000); // 3 second countdown
    }

    endGame() {
        this.state = 'ended';
        
        if (this.wasmServer) {
            this.wasmServer.destroy();
            this.wasmServer = null;
        }
    }
}

// Player Session class
class PlayerSession {
    constructor(playerId, gameId, isHost) {
        this.playerId = playerId;
        this.gameId = gameId;
        this.isHost = isHost;
        this.joinedAt = Date.now();
        this.lastActivity = Date.now();
        this.isReady = false;
    }

    updateActivity() {
        this.lastActivity = Date.now();
    }
}

// Global peer server instance
window.peerServer = new PeerServer();