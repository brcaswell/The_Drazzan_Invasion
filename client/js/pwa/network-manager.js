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
                    this.pendingJoinResolve = null;
                    this.pendingJoinReject = null;
                    if (this.onConnectionResult) {
                        this.onConnectionResult(false, 'Connection timeout - please try again');
                    }
                    reject(new Error('Connection timeout'));
                }, 15000); // Increased timeout for join process

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
                const maxJoinAttempts = 5;

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
                            
                            setTimeout(checkConnection, 1000); // Retry after 1s
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
                        setTimeout(checkConnection, 100);
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
        if (this.isHost && this.localGameServer) {
            const success = this.localGameServer.joinGame(0, fromPeerId); // Assuming single game
            console.log('[P2P] Join request from', fromPeerId, '- Success:', success);

            this.sendToPlayer(fromPeerId, {
                type: 'join_response',
                success: success,
                gameState: success ? this.localGameServer.getGameState() : null
            });
        }
    }

    handleJoinResponse(message, fromPeerId) {
        console.log('[P2P] Join response from host:', message.success);

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
        if (this.isHost && this.localGameServer) {
            this.localGameServer.updatePlayer(
                fromPeerId,
                message.x, message.y,
                message.health, message.score
            );
        }
    }

    handleGameAction(message, fromPeerId) {
        if (this.isHost && this.localGameServer) {
            this.localGameServer.handlePlayerAction(
                fromPeerId,
                message.action,
                message.data
            );
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
            dataChannel.send(JSON.stringify(message));
        } else {
            console.warn('[P2P] Cannot send to player', peerId, '- channel not ready');
        }
    }

    broadcast(message, excludePeerId = null) {
        const messageStr = JSON.stringify(message);

        for (const [peerId, dataChannel] of this.dataChannels) {
            if (peerId !== excludePeerId && dataChannel.readyState === 'open') {
                dataChannel.send(messageStr);
            }
        }
    }

    // Utility methods
    removePeer(peerId) {
        const pc = this.connections.get(peerId);
        if (pc) {
            pc.close();
            this.connections.delete(peerId);
        }

        this.dataChannels.delete(peerId);

        // Notify game of player disconnect
        if (window.gameInstance && window.gameInstance.handlePlayerDisconnect) {
            window.gameInstance.handlePlayerDisconnect(peerId);
        }
    }

    getConnectedPeers() {
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

        // Disconnect from signaling
        if (this.signalingServer && this.signalingServer.disconnect) {
            this.signalingServer.disconnect();
        }
    }

    // Game loop integration
    update(deltaTime) {
        // Update local game server if hosting
        if (this.isHost && this.localGameServer) {
            this.localGameServer.processGameTick(deltaTime);

            // Broadcast game state to all connected peers
            const gameState = this.localGameServer.getGameState();
            if (gameState) {
                this.broadcast({
                    type: 'game_state',
                    gameState: gameState,
                    timestamp: Date.now()
                });
            }
        }
    }
}

// Global network manager instance
window.networkManager = new NetworkManager();