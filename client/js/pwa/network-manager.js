// Network Manager - handles P2P WebRTC connections and game networking
class NetworkManager {
    constructor() {
        this.peerId = this.generatePeerId();
        this.isHost = false;
        this.connections = new Map(); // peerId -> RTCPeerConnection
        this.dataChannels = new Map(); // peerId -> RTCDataChannel
        this.gameState = null;
        this.signalingServer = null;
        this.localGameServer = null;

        // Game code to peer ID mapping
        this.gameCodeMap = new Map(); // gameCode -> hostPeerId

        // Host-side player management (for P2P-only mode)
        this.connectedPlayers = new Map(); // peerId -> playerInfo
        this.maxPlayers = 4;

        // TODO: DECOUPLE GAME LOGIC FROM NETWORK MANAGER
        // This should be moved to a separate GameEngine class that implements
        // a generic IGameEngine interface. The network manager should only
        // handle P2P connections and delegate game logic to the engine.
        // 
        // Future architecture:
        // - NetworkManager: Pure P2P connection handling
        // - IGameEngine: Generic game state management interface  
        // - DrazzanGameEngine: Drazzan-specific game logic
        // - Event system: Decoupled communication between layers

        // P2P-only game state (TEMPORARY - should be moved to GameEngine)
        this.gameSimulation = {
            players: new Map(),
            projectiles: [],
            enemies: [],
            gameTime: 0,
            lastUpdate: Date.now()
        };

        // Game engine abstraction (for future decoupling)
        this.gameEngine = null;

        // Connection result callback for UI feedback
        this.onConnectionResult = null;        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:localhost:3478' }, // Local STUN/TURN server
                { urls: 'turn:localhost:3478', username: 'testuser', credential: 'testpass' }, // Local TURN server
                { urls: 'stun:stun.l.google.com:19302' }, // Fallback Google STUN
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };

        this.init();
    }

    async init() {
        console.log('[P2P] Initializing network manager, peer ID:', this.peerId);

        // Initialize signaling (can be decentralized)
        await this.initializeSignaling();

        // Set up event listeners
        this.setupEventListeners();
    }

    generatePeerId() {
        return 'peer_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    async initializeSignaling() {
        // For a fully decentralized approach, we could use:
        // 1. WebTorrent tracker servers
        // 2. IPFS pubsub
        // 3. Blockchain-based signaling
        // 4. Simple P2P signaling servers

        // For now, we'll use a simple fallback with multiple signaling options
        await this.initDecentralizedSignaling();
    }

    async initDecentralizedSignaling() {
        // Try hybrid signaling first (supports incognito cross-origin)
        try {
            await this.initHybridSignaling();
            console.log('[P2P] Hybrid signaling initialized successfully');
            return;
        } catch (error) {
            console.warn('[P2P] Hybrid signaling failed:', error);
        }

        // Fallback to original signaling methods
        const signalingMethods = [
            () => this.initIPFSSignaling(),
            () => this.initWebTorrentSignaling(),
            () => this.initSimpleP2PSignaling(),
            () => this.initBroadcastChannelSignaling() // Local network only
        ];

        for (const method of signalingMethods) {
            try {
                await method();
                console.log('[P2P] Signaling initialized successfully');
                return;
            } catch (error) {
                console.warn('[P2P] Signaling method failed:', error);
            }
        }

        console.warn('[P2P] All signaling methods failed, using local-only mode');
        this.initLocalOnlyMode();
    }

    async initHybridSignaling() {
        // Hybrid signaling with multiple fallback methods
        this.signalingServer = new HybridSignaling(this.peerId);
        await this.signalingServer.connect();
    }

    async initIPFSSignaling() {
        // IPFS-based signaling for true decentralization
        if (typeof window.IpfsHttpClient !== 'undefined') {
            const ipfs = window.IpfsHttpClient.create({
                host: 'ipfs.infura.io',
                port: 5001,
                protocol: 'https'
            });

            this.signalingServer = new IPFSSignaling(ipfs, this.peerId);
            await this.signalingServer.init();
        } else {
            throw new Error('IPFS not available');
        }
    }

    async initWebTorrentSignaling() {
        // WebTorrent tracker-based signaling
        if (typeof window.WebTorrent !== 'undefined') {
            this.signalingServer = new WebTorrentSignaling(this.peerId);
            await this.signalingServer.init();
        } else {
            throw new Error('WebTorrent not available');
        }
    }

    async initSimpleP2PSignaling() {
        // WebSocket signaling temporarily disabled for local testing
        console.log('[P2P] WebSocket signaling not available in local testing mode');
        throw new Error('WebSocket signaling not available');
    }

    async initBroadcastChannelSignaling() {
        // BroadcastChannel for same-origin communication
        this.signalingServer = new BroadcastChannelSignaling(this.peerId);
        await this.signalingServer.connect();
    }

    async initLocalOnlyMode() {
        // Fallback to local-only mode with no multiplayer
        console.warn('[P2P] Running in local-only mode');
        this.signalingServer = new LocalOnlySignaling(this.peerId);
        await this.signalingServer.connect();
    }

    setupEventListeners() {
        console.log('[P2P] Setting up event listeners for signaling server');
        // Handle signaling messages
        if (this.signalingServer) {
            this.signalingServer.on('offer', (data) => {
                console.log('[P2P] Offer event received from signaling:', data.from);
                this.handleOffer(data.offer, data.from);
            });

            this.signalingServer.on('answer', (data) => {
                this.handleAnswer(data.answer, data.from);
            });

            this.signalingServer.on('ice-candidate', (data) => {
                this.handleIceCandidate(data.candidate, data.from);
            });

            this.signalingServer.on('peer-joined', (peerId) => {
                console.log('[P2P] Peer joined:', peerId);
            });

            this.signalingServer.on('peer-left', (peerId) => {
                console.log('[P2P] Peer left:', peerId);
                this.removePeer(peerId);
            });
        }
    }

    // Check if network manager is connected and ready
    isConnected() {
        // Consider connected if signaling server is available and connected
        return this.signalingServer && this.signalingServer.isConnected;
    }

    // Generate a user-friendly game code
    generateGameCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Game hosting
    async hostGame() {
        console.log('[P2P] Starting to host game...');
        this.isHost = true;

        // Generate user-friendly game code
        this.gameCode = this.generateGameCode();
        console.log('[P2P] Generated game code:', this.gameCode);

        // Skip WASM initialization for now - focusing on P2P networking
        console.log('[P2P] Skipping WASM server initialization (P2P-only mode)');

        // Skip WASM game creation - using P2P networking only
        console.log('[P2P] Using P2P-only mode, no local game server needed');

        // Advertise game availability
        if (this.signalingServer) {
            console.log('[P2P] About to advertise game with signaling server:', this.signalingServer.constructor.name);
            await this.signalingServer.advertiseGame({
                hostId: this.peerId,
                gameCode: this.gameCode,
                gameType: 'drazzan-invasion',
                maxPlayers: 4,
                currentPlayers: 1
            });
            console.log('[P2P] Game advertisement sent successfully');
        } else {
            console.error('[P2P] No signaling server available for game advertisement!');
        }

        console.log('[P2P] hostGame() completed, returning game code:', this.gameCode);
        return this.gameCode; // Return user-friendly game code
    }

    // Resolve game code to peer ID by querying signaling server
    async resolveGameCodeToPeerId(gameCode) {
        if (this.signalingServer && this.signalingServer.findGameHost) {
            try {
                const hostPeerId = await this.signalingServer.findGameHost(gameCode);
                if (hostPeerId) {
                    this.gameCodeMap.set(gameCode, hostPeerId);
                    return hostPeerId;
                }
            } catch (error) {
                console.warn('[P2P] Failed to resolve game code via signaling server:', error);
            }
        }

        // Check local cache
        if (this.gameCodeMap.has(gameCode)) {
            return this.gameCodeMap.get(gameCode);
        }

        return null;
    }

    // Join existing game
    async joinGame(gameCodeOrPeerId) {
        console.log('[P2P] Joining game with code/ID:', gameCodeOrPeerId);

        try {
            // Try to resolve game code to peer ID
            let hostPeerId = gameCodeOrPeerId;

            // If it looks like a game code (6 chars), try to resolve it
            if (gameCodeOrPeerId.length === 6 && /^[A-Z0-9]+$/.test(gameCodeOrPeerId)) {
                console.log('[P2P] Resolving game code to peer ID...');
                hostPeerId = await this.resolveGameCodeToPeerId(gameCodeOrPeerId);
                if (!hostPeerId) {
                    throw new Error('Game not found. Host may have disconnected.');
                }
                console.log('[P2P] Resolved game code', gameCodeOrPeerId, 'to peer ID:', hostPeerId);
            }

            if (hostPeerId === this.peerId) {
                throw new Error('Cannot join own game');
            }

            // Create peer connection to host
            await this.connectToPeer(hostPeerId);

            // Wait for connection to be established and join to be accepted
            const result = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.log('[P2P] Join process timed out after 15 seconds');
                    // Clear pending callbacks to prevent memory leaks
                    if (this.pendingJoinResolve) {
                        this.pendingJoinResolve = null;
                    }
                    if (this.pendingJoinReject) {
                        this.pendingJoinReject = null;
                    }
                    if (this.onConnectionResult) {
                        this.onConnectionResult(false, 'Connection timeout - host may not be responding');
                    }
                    reject(new Error('Join process timed out - host may not be responding'));
                }, 25000); // Increased from 15s to 25s to accommodate 8 retry attempts with longer delays

                // Store resolve/reject for join response handler
                this.pendingJoinResolve = (peerId) => {
                    clearTimeout(timeout);
                    resolve(peerId);
                };
                this.pendingJoinReject = (error) => {
                    clearTimeout(timeout);
                    reject(error);
                };

                let joinRequestAttempts = 0;
                const maxJoinAttempts = 8; // Increased from 5 to 8 attempts

                const checkConnection = () => {
                    const connection = this.connections.get(hostPeerId);
                    const dataChannel = this.dataChannels.get(hostPeerId);

                    console.log('[P2P] Connection check - PC state:', connection?.connectionState, 'DC state:', dataChannel?.readyState, 'ICE state:', connection?.iceConnectionState);

                    // Check if peer connection is viable and we have a data channel
                    if (connection && dataChannel &&
                        (connection.connectionState === 'connected' || connection.connectionState === 'connecting') &&
                        (dataChannel.readyState === 'open' || dataChannel.readyState === 'connecting')) {

                        joinRequestAttempts++;
                        console.log(`[P2P] Connection viable, attempting join request (${joinRequestAttempts}/${maxJoinAttempts})...`);

                        // Update UI with retry status
                        if (this.onConnectionResult && joinRequestAttempts > 1) {
                            this.onConnectionResult(null, `Connecting... (attempt ${joinRequestAttempts}/${maxJoinAttempts})`);
                        }

                        // Check if data channel is actually ready before sending
                        const dataChannel = this.dataChannels.get(hostPeerId);
                        if (!dataChannel || dataChannel.readyState !== 'open') {
                            console.log(`[P2P] Data channel not ready (${dataChannel?.readyState}), retrying in 2s...`);

                            if (joinRequestAttempts >= maxJoinAttempts) {
                                clearTimeout(timeout);
                                this.pendingJoinResolve = null;
                                this.pendingJoinReject = null;
                                if (this.onConnectionResult) {
                                    this.onConnectionResult(false, 'Data channel failed to open after multiple attempts');
                                }
                                reject(new Error('Data channel failed to open after multiple attempts'));
                                return;
                            }

                            // Update UI with retry info
                            if (this.onConnectionResult) {
                                this.onConnectionResult(null, `Waiting for data channel... (${joinRequestAttempts}/${maxJoinAttempts})`);
                            }

                            setTimeout(checkConnection, 2000); // Increased delay from 1s to 2s
                            return;
                        }

                        try {
                            this.sendToPlayer(hostPeerId, {
                                type: 'join_request',
                                playerId: this.peerId
                            });
                            console.log('[P2P] Join request sent successfully');
                        } catch (error) {
                            console.log(`[P2P] Failed to send join request (attempt ${joinRequestAttempts}):`, error.message);

                            if (joinRequestAttempts >= maxJoinAttempts) {
                                clearTimeout(timeout);
                                this.pendingJoinResolve = null;
                                this.pendingJoinReject = null;
                                if (this.onConnectionResult) {
                                    this.onConnectionResult(false, 'Failed to send join request after multiple attempts');
                                }
                                reject(new Error('Failed to send join request after multiple attempts'));
                                return;
                            }

                            // Update UI with retry info
                            if (this.onConnectionResult) {
                                this.onConnectionResult(null, `Retrying connection... (${joinRequestAttempts}/${maxJoinAttempts})`);
                            }

                            setTimeout(checkConnection, 2500); // Increased delay from 1s to 2.5s
                            return;
                        }

                        // Don't resolve yet - wait for join_response
                        return;
                    } else if (connection && (connection.connectionState === 'failed' || connection.connectionState === 'disconnected')) {
                        clearTimeout(timeout);
                        this.pendingJoinResolve = null;
                        this.pendingJoinReject = null;
                        if (this.onConnectionResult) {
                            this.onConnectionResult(false, 'Connection failed');
                        }
                        reject(new Error('Connection failed'));
                    } else {
                        // Connection not yet established, wait longer before retrying
                        setTimeout(checkConnection, 500); // Increased from 100ms to 500ms
                    }
                };

                checkConnection();
            });

            // Notify UI of successful connection
            if (this.onConnectionResult) {
                this.onConnectionResult(true, 'Connected successfully');
            }

            return result;

        } catch (error) {
            console.error('[P2P] Join game failed:', error);

            // Notify UI of connection failure
            if (this.onConnectionResult) {
                this.onConnectionResult(false, error.message);
            }

            throw error;
        }
    }

    // Connect to a specific peer
    async connectToPeer(peerId) {
        if (this.connections.has(peerId)) {
            return this.connections.get(peerId);
        }

        console.log('[P2P] Connecting to peer:', peerId);

        const pc = new RTCPeerConnection(this.rtcConfig);
        this.connections.set(peerId, pc);

        // Set up data channel
        const dataChannel = pc.createDataChannel('game', {
            ordered: false, // Faster for real-time game data
            maxRetransmits: 0
        });

        this.setupDataChannel(dataChannel, peerId);
        this.dataChannels.set(peerId, dataChannel);

        // Handle incoming data channels
        pc.ondatachannel = (event) => {
            this.setupDataChannel(event.channel, peerId);
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && this.signalingServer) {
                this.signalingServer.sendIceCandidate(event.candidate, peerId);
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log('[P2P] Connection state with', peerId, ':', pc.connectionState);

            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                this.removePeer(peerId);
            }
        };

        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer through signaling
        if (this.signalingServer) {
            await this.signalingServer.sendOffer(offer, peerId);
        }

        return pc;
    }

    setupDataChannel(dataChannel, peerId) {
        dataChannel.onopen = () => {
            console.log('[P2P] Data channel opened with', peerId);
        };

        dataChannel.onclose = () => {
            console.log('[P2P] Data channel closed with', peerId);
            // Clean up the peer connection when data channel closes
            this.removePeer(peerId);
        };

        dataChannel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handlePeerMessage(data, peerId);
            } catch (error) {
                console.error('[P2P] Failed to parse message from', peerId, ':', error);
            }
        };

        dataChannel.onerror = (error) => {
            console.error('[P2P] Data channel error with', peerId, ':', error);

            // Handle "Receiving end does not exist" and other critical errors
            if (error.message && (error.message.includes('Receiving end does not exist') ||
                error.message.includes('DataChannel is closed'))) {
                console.log('[P2P] Critical data channel error, cleaning up peer:', peerId);
                this.removePeer(peerId);
            }
        };
    }

    // Handle WebRTC signaling
    async handleOffer(offer, fromPeerId) {
        console.log('[P2P] Received offer from', fromPeerId);
        console.log('[P2P] Current connections count:', this.connections.size);
        console.log('[P2P] Existing connection for', fromPeerId, ':', this.connections.has(fromPeerId));

        let pc = this.connections.get(fromPeerId);
        if (pc && pc.connectionState !== 'closed') {
            console.log('[P2P] Ignoring duplicate offer from', fromPeerId, '- connection exists:', pc.connectionState);
            return;
        }

        if (!pc) {
            console.log('[P2P] Creating NEW RTCPeerConnection for', fromPeerId);
            pc = new RTCPeerConnection(this.rtcConfig);
            this.connections.set(fromPeerId, pc);

            // Set up event handlers
            pc.onicecandidate = (event) => {
                if (event.candidate && this.signalingServer) {
                    this.signalingServer.sendIceCandidate(event.candidate, fromPeerId);
                }
            };

            pc.ondatachannel = (event) => {
                this.setupDataChannel(event.channel, fromPeerId);
                this.dataChannels.set(fromPeerId, event.channel);
            };
        }

        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (this.signalingServer) {
            await this.signalingServer.sendAnswer(answer, fromPeerId);
        }
    }

    async handleAnswer(answer, fromPeerId) {
        console.log('[P2P] Received answer from', fromPeerId);

        const pc = this.connections.get(fromPeerId);
        if (pc) {
            // Only set remote description if we're in the right state
            if (pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(answer);
                console.log('[P2P] Answer processed, connection state:', pc.connectionState);
            } else {
                console.log('[P2P] Ignoring duplicate answer, current state:', pc.signalingState);
            }
        }
    }

    async handleIceCandidate(candidate, fromPeerId) {
        const pc = this.connections.get(fromPeerId);
        if (pc && pc.remoteDescription) {
            try {
                await pc.addIceCandidate(candidate);
                console.log('[P2P] ICE candidate added for', fromPeerId);
            } catch (error) {
                console.log('[P2P] Failed to add ICE candidate:', error.message);
            }
        } else {
            console.log('[P2P] Ignoring ICE candidate, no remote description set yet');
        }
    }

    // Game message handling
    handlePeerMessage(message, fromPeerId) {
        console.log('[P2P] Message from', fromPeerId, ':', message.type);

        switch (message.type) {
            case 'join_request':
                this.handleJoinRequest(message, fromPeerId);
                break;

            case 'join_response':
                this.handleJoinResponse(message, fromPeerId);
                break;

            case 'player_update':
                this.handlePlayerUpdate(message, fromPeerId);
                break;

            case 'game_action':
                this.handleGameAction(message, fromPeerId);
                break;

            case 'game_state':
                this.handleGameState(message, fromPeerId);
                break;

            case 'gameStateSync':
                this.handleGameStateSync(message, fromPeerId);
                break;

            case 'ping':
                this.sendToPlayer(fromPeerId, { type: 'pong', timestamp: message.timestamp });
                break;
        }
    }

    handleJoinRequest(message, fromPeerId) {
        console.log('[P2P] Received join request from', fromPeerId);

        if (!this.isHost) {
            console.log('[P2P] Ignoring join request - not a host');
            return;
        }

        // Check if we have room for more players
        const currentPlayerCount = this.connectedPlayers.size + 1; // +1 for host
        const canJoin = currentPlayerCount < this.maxPlayers;

        console.log('[P2P] Join request from', fromPeerId, '- Can join:', canJoin, '(', currentPlayerCount, '/', this.maxPlayers, 'players)');

        if (canJoin) {
            // Add player to our connected players list
            this.connectedPlayers.set(fromPeerId, {
                peerId: fromPeerId,
                joinedAt: Date.now(),
                status: 'connected'
            });
        }

        // Send response
        try {
            this.sendToPlayer(fromPeerId, {
                type: 'join_response',
                success: canJoin,
                reason: canJoin ? 'Welcome to the game!' : 'Game is full',
                gameState: canJoin ? this.getSimpleGameState() : null
            });

            if (canJoin) {
                console.log('[P2P] Player', fromPeerId, 'successfully joined. Total players:', this.connectedPlayers.size + 1);
            } else {
                console.log('[P2P] Rejected player', fromPeerId, '- game is full');
            }
        } catch (error) {
            console.error('[P2P] Failed to send join response to', fromPeerId, ':', error);
        }
    }

    // Get simple game state for P2P-only mode (no WASM dependency)
    getSimpleGameState() {
        return {
            gameType: 'drazzan-invasion',
            hostId: this.peerId,
            connectedPlayers: Array.from(this.connectedPlayers.keys()),
            maxPlayers: this.maxPlayers,
            gameCode: this.gameCode,
            timestamp: Date.now()
        };
    }

    // Get current P2P game simulation state
    getGameSimulationState() {
        if (!this.isHost) return null;

        return {
            gameTime: this.gameSimulation.gameTime,
            players: Object.fromEntries(this.gameSimulation.players),
            projectiles: this.gameSimulation.projectiles.slice(), // Copy array
            connectedCount: this.connectedPlayers.size + 1 // +1 for host
        };
    }

    handleJoinResponse(message, fromPeerId) {
        console.log('[P2P] Join response from host:', message.success, message.reason || '');

        if (message.success) {
            console.log('[P2P] Successfully joined game!');
            console.log('[P2P] Game state:', message.gameState);

            // Notify connection completion
            if (this.pendingJoinResolve) {
                this.pendingJoinResolve(fromPeerId);
                this.pendingJoinResolve = null;
            }

            // Notify UI of successful join
            if (this.onConnectionResult) {
                this.onConnectionResult(true, 'Joined game successfully');
            }
        } else {
            console.log('[P2P] Join request rejected');

            // Notify connection failure
            if (this.pendingJoinReject) {
                this.pendingJoinReject(new Error('Join request rejected'));
                this.pendingJoinReject = null;
            }

            // Notify UI of failure
            if (this.onConnectionResult) {
                this.onConnectionResult(false, 'Join request rejected');
            }
        }
    }

    handlePlayerUpdate(message, fromPeerId) {
        // TODO: DECOUPLE - This should delegate to this.gameEngine.handlePlayerUpdate()
        // For now, using direct game logic until refactor is complete

        // Always handle player updates in P2P mode (WASM-free)
        if (this.isHost) {
            // Update player in our game simulation
            let player = this.gameSimulation.players.get(fromPeerId);
            if (!player) {
                player = {
                    id: fromPeerId,
                    x: message.x || 400,
                    y: message.y || 300,
                    health: message.health || 100,
                    score: message.score || 0,
                    lastUpdate: Date.now()
                };
                this.gameSimulation.players.set(fromPeerId, player);
            } else {
                // Update existing player
                if (typeof message.x === 'number') player.x = message.x;
                if (typeof message.y === 'number') player.y = message.y;
                if (typeof message.health === 'number') player.health = message.health;
                if (typeof message.score === 'number') player.score = message.score;
                player.lastUpdate = Date.now();
            }

            console.log('[P2P] Updated player', fromPeerId, 'position:', player.x, player.y, 'health:', player.health);

            // Relay update to other players
            this.broadcast({
                type: 'player_update',
                playerId: fromPeerId,
                x: player.x,
                y: player.y,
                health: player.health,
                score: player.score
            }, fromPeerId);
        }

        // Also handle locally for non-host peers
        if (window.gameInstance && window.gameInstance.updateNetworkPlayer) {
            window.gameInstance.updateNetworkPlayer(fromPeerId, message);
        }
    }

    handleGameAction(message, fromPeerId) {
        // TODO: DECOUPLE - This should delegate to this.gameEngine.handleGameAction()
        // Game-specific actions (shoot, damage, score) should not be in network layer

        console.log('[P2P] Game action from', fromPeerId, ':', message.action, message.data);

        // Process game action in P2P mode (TEMPORARY - should be in GameEngine)
        if (this.isHost) {
            const player = this.gameSimulation.players.get(fromPeerId);
            if (!player) {
                console.warn('[P2P] Action from unknown player:', fromPeerId);
                return;
            }

            // Handle different action types
            switch (message.action) {
                case 'move':
                    if (message.data.x !== undefined) player.x = Math.max(0, Math.min(800, message.data.x));
                    if (message.data.y !== undefined) player.y = Math.max(0, Math.min(600, message.data.y));
                    break;

                case 'shoot':
                    // Add projectile to game state
                    this.gameSimulation.projectiles.push({
                        id: `${fromPeerId}_${Date.now()}`,
                        playerId: fromPeerId,
                        x: message.data.x || player.x,
                        y: message.data.y || player.y,
                        vx: message.data.vx || 0,
                        vy: message.data.vy || -300,
                        damage: message.data.damage || 25,
                        createdAt: Date.now()
                    });
                    console.log('[P2P] Added projectile from player', fromPeerId);
                    break;

                case 'damage':
                    player.health = Math.max(0, player.health - (message.data.damage || 10));
                    if (player.health <= 0) {
                        console.log('[P2P] Player', fromPeerId, 'destroyed');
                    }
                    break;

                case 'score':
                    player.score += (message.data.points || 0);
                    console.log('[P2P] Player', fromPeerId, 'scored', message.data.points, 'points. Total:', player.score);
                    break;

                default:
                    console.log('[P2P] Unknown action:', message.action);
            }

            player.lastUpdate = Date.now();
        }

        // Relay to other players if host
        if (this.isHost) {
            this.broadcast({
                type: 'game_action',
                playerId: fromPeerId,
                action: message.action,
                data: message.data
            }, fromPeerId);
        }

        // Also notify local game instance
        if (window.gameInstance && window.gameInstance.handleNetworkAction) {
            window.gameInstance.handleNetworkAction(fromPeerId, message.action, message.data);
        }
    }

    handleGameState(message, fromPeerId) {
        // Update local game state from host
        this.gameState = message.gameState;

        // Notify game instance
        if (window.gameInstance && window.gameInstance.updateNetworkGameState) {
            window.gameInstance.updateNetworkGameState(this.gameState);
        }
    }

    handleGameStateSync(message, fromPeerId) {
        // Only non-hosts should apply external game state
        if (this.isHost) return;

        console.log('[P2P] Received game state sync from host', fromPeerId, 'timestamp:', message.timestamp);

        // Conflict resolution: only apply state if timestamp is newer than our last received state
        if (this.gameState && this.gameState.timestamp && message.timestamp <= this.gameState.timestamp) {
            console.log('[P2P] Ignoring older game state sync (local:', this.gameState.timestamp, 'vs received:', message.timestamp, ')');
            return;
        }

        // Update local game state
        this.gameState = {
            gameTime: message.gameTime,
            players: message.players,
            gameObjects: message.gameObjects,
            scores: message.scores,
            timestamp: message.timestamp
        };

        console.log('[P2P] Applied game state sync with timestamp', message.timestamp);

        // Notify multiplayer game instance to apply the state
        if (window.multiplayerGame && window.multiplayerGame.applyGameState) {
            window.multiplayerGame.applyGameState(message);
        }

        // Also notify the main game instance if it exists
        if (window.gameInstance && window.gameInstance.updateNetworkGameState) {
            window.gameInstance.updateNetworkGameState(this.gameState);
        }
    }

    // Messaging
    sendToPlayer(peerId, message) {
        const dataChannel = this.dataChannels.get(peerId);
        if (dataChannel && dataChannel.readyState === 'open') {
            try {
                dataChannel.send(JSON.stringify(message));
            } catch (error) {
                // Handle "Receiving end does not exist" and other data channel errors
                console.warn(`[P2P] Failed to send message to ${peerId}:`, error.message);

                // If the channel failed, mark it for cleanup
                if (error.message.includes('Receiving end does not exist') ||
                    error.message.includes('DataChannel is closed') ||
                    dataChannel.readyState !== 'open') {
                    console.log(`[P2P] Marking peer ${peerId} for cleanup due to send failure`);
                    // Remove the peer connection
                    this.removePeer(peerId);
                }

                throw new Error(`Message send failed: ${error.message}`);
            }
        } else {
            const error = `Cannot send to player ${peerId} - channel not ready (state: ${dataChannel?.readyState || 'missing'})`;
            console.warn('[P2P]', error);
            throw new Error(error);
        }
    }

    broadcast(message, excludePeerId = null) {
        const messageStr = JSON.stringify(message);
        const peersToRemove = [];

        for (const [peerId, dataChannel] of this.dataChannels) {
            if (peerId !== excludePeerId && dataChannel.readyState === 'open') {
                try {
                    dataChannel.send(messageStr);
                } catch (error) {
                    // Handle "Receiving end does not exist" and other data channel errors
                    console.warn(`[P2P] Failed to broadcast to ${peerId}:`, error.message);

                    // Mark peer for removal if critical error
                    if (error.message.includes('Receiving end does not exist') ||
                        error.message.includes('DataChannel is closed') ||
                        dataChannel.readyState !== 'open') {
                        console.log(`[P2P] Marking peer ${peerId} for cleanup due to broadcast failure`);
                        peersToRemove.push(peerId);
                    }
                }
            }
        }

        // Clean up failed peers after iteration to avoid modifying collection during iteration
        for (const peerId of peersToRemove) {
            this.removePeer(peerId);
        }
    }

    // Utility methods
    removePeer(peerId) {
        console.log('[P2P] Removing peer:', peerId);

        const pc = this.connections.get(peerId);
        if (pc) {
            pc.close();
            this.connections.delete(peerId);
        }

        this.dataChannels.delete(peerId);

        // Remove from connected players list if we're the host
        if (this.isHost && this.connectedPlayers.has(peerId)) {
            this.connectedPlayers.delete(peerId);
            console.log('[P2P] Player', peerId, 'removed from game. Remaining players:', this.connectedPlayers.size + 1);

            // Remove from game simulation
            if (this.gameSimulation.players.has(peerId)) {
                this.gameSimulation.players.delete(peerId);
                console.log('[P2P] Removed player', peerId, 'from game simulation');
            }

            // Remove their projectiles
            this.gameSimulation.projectiles = this.gameSimulation.projectiles.filter(
                proj => proj.playerId !== peerId
            );
        }

        // Notify game of player disconnect
        if (window.gameInstance && window.gameInstance.handlePlayerDisconnect) {
            window.gameInstance.handlePlayerDisconnect(peerId);
        }
    } getConnectedPeers() {
        const peers = [];
        for (const [peerId, pc] of this.connections) {
            if (pc.connectionState === 'connected') {
                peers.push(peerId);
            }
        }
        return peers;
    }

    disconnect() {
        // Close all connections
        for (const pc of this.connections.values()) {
            pc.close();
        }

        this.connections.clear();
        this.dataChannels.clear();

        // Clear game simulation data
        if (this.isHost) {
            this.gameSimulation.players.clear();
            this.gameSimulation.projectiles = [];
            this.connectedPlayers.clear();
        }

        // Disconnect from signaling
        if (this.signalingServer && this.signalingServer.disconnect) {
            this.signalingServer.disconnect();
        }
    }

    // Helper methods for game integration

    // Send player position update to host
    sendPlayerUpdate(x, y, health, score) {
        if (this.isHost) {
            // Update own player data
            const hostPlayer = this.gameSimulation.players.get(this.peerId) || {};
            hostPlayer.x = x;
            hostPlayer.y = y;
            hostPlayer.health = health;
            hostPlayer.score = score;
            hostPlayer.lastUpdate = Date.now();
            this.gameSimulation.players.set(this.peerId, hostPlayer);
        } else {
            // Send to host
            const hostPeerId = this.getHostPeerId();
            if (hostPeerId) {
                try {
                    this.sendToPlayer(hostPeerId, {
                        type: 'player_update',
                        x: x,
                        y: y,
                        health: health,
                        score: score
                    });
                } catch (error) {
                    console.warn('[P2P] Failed to send player update:', error.message);
                }
            }
        }
    }

    // Send game action to host
    sendGameAction(action, data) {
        if (this.isHost) {
            // Process own action
            this.handleGameAction({ action, data }, this.peerId);
        } else {
            const hostPeerId = this.getHostPeerId();
            if (hostPeerId) {
                try {
                    this.sendToPlayer(hostPeerId, {
                        type: 'game_action',
                        action: action,
                        data: data
                    });
                } catch (error) {
                    console.warn('[P2P] Failed to send game action:', error.message);
                }
            }
        }
    }

    // Get host peer ID
    getHostPeerId() {
        // Find the first connected peer (assuming it's the host if we're not)
        for (const [peerId, dataChannel] of this.dataChannels) {
            if (dataChannel.readyState === 'open') {
                return peerId;
            }
        }
        return null;
    }

    // Get all connected player IDs including self
    getAllPlayerIds() {
        const players = [this.peerId]; // Always include self
        for (const [peerId, dataChannel] of this.dataChannels) {
            if (dataChannel.readyState === 'open') {
                players.push(peerId);
            }
        }
        return players;
    }

    // Check if we're in a multiplayer session
    isMultiplayer() {
        return this.connectedPlayers.size > 0 || this.dataChannels.size > 0;
    }

    // Get current player count
    getPlayerCount() {
        if (this.isHost) {
            return this.connectedPlayers.size + 1; // +1 for host
        } else {
            return this.dataChannels.size + 1; // +1 for self
        }
    }

    // Future decoupling helper methods

    // Set game engine for delegated game logic processing
    setGameEngine(gameEngine) {
        this.gameEngine = gameEngine;
        console.log('[P2P] Game engine attached:', gameEngine.constructor.name);
    }

    // Pure network message broadcasting (game-agnostic)
    broadcastNetworkMessage(messageType, payload, excludePeerId = null) {
        this.broadcast({
            type: messageType,
            payload: payload,
            timestamp: Date.now()
        }, excludePeerId);
    }

    // Pure network message sending (game-agnostic)
    sendNetworkMessage(peerId, messageType, payload) {
        try {
            this.sendToPlayer(peerId, {
                type: messageType,
                payload: payload,
                timestamp: Date.now()
            });
            return true;
        } catch (error) {
            console.warn('[P2P] Failed to send network message:', error.message);
            return false;
        }
    }

    // Game loop integration
    update(deltaTime) {
        // TODO: DECOUPLE - This should delegate to this.gameEngine.update()
        // Network manager should only handle connection state and message routing

        // Update P2P game simulation if hosting (TEMPORARY - should be in GameEngine)
        if (this.isHost && this.connectedPlayers.size > 0) {
            const now = Date.now();
            this.gameSimulation.gameTime += deltaTime;

            // Update projectiles
            for (let i = this.gameSimulation.projectiles.length - 1; i >= 0; i--) {
                const proj = this.gameSimulation.projectiles[i];
                proj.x += proj.vx * (deltaTime / 1000);
                proj.y += proj.vy * (deltaTime / 1000);

                // Remove off-screen or old projectiles
                if (proj.x < -50 || proj.x > 850 || proj.y < -50 || proj.y > 650 ||
                    (now - proj.createdAt) > 5000) {
                    this.gameSimulation.projectiles.splice(i, 1);
                }
            }

            // Clean up old player data
            for (const [playerId, player] of this.gameSimulation.players) {
                if (!this.connectedPlayers.has(playerId) || (now - player.lastUpdate) > 30000) {
                    console.log('[P2P] Removing stale player data:', playerId);
                    this.gameSimulation.players.delete(playerId);
                }
            }

            // Broadcast game state every 100ms (10 FPS for network)
            if (!this.lastStateBroadcast || (now - this.lastStateBroadcast) > 100) {
                const gameState = this.getGameSimulationState();
                if (gameState) {
                    this.broadcast({
                        type: 'gameStateSync',
                        gameTime: this.gameSimulation.gameTime,
                        players: gameState.players,
                        projectiles: gameState.projectiles,
                        timestamp: now
                    });
                }
                this.lastStateBroadcast = now;
            }
        }
    }
}

// Global network manager instance
window.networkManager = new NetworkManager();