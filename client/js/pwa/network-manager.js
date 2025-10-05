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
        
        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                // Add TURN servers for NAT traversal in production
                // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
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
        // Try multiple signaling methods in order of preference
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
        // Simple P2P signaling server (can be run by community)
        const signalingUrls = [
            'wss://signaling1.drazzan.game',
            'wss://signaling2.drazzan.game',
            'wss://community-signaling.herokuapp.com'
        ];

        for (const url of signalingUrls) {
            try {
                this.signalingServer = new WebSocketSignaling(url, this.peerId);
                await this.signalingServer.connect();
                return;
            } catch (error) {
                console.warn('[P2P] Signaling server failed:', url, error);
            }
        }
        
        throw new Error('No signaling servers available');
    }

    initBroadcastChannelSignaling() {
        // BroadcastChannel for same-origin communication
        this.signalingServer = new BroadcastChannelSignaling(this.peerId);
    }

    initLocalOnlyMode() {
        // Fallback to local-only mode with no multiplayer
        console.warn('[P2P] Running in local-only mode');
        this.signalingServer = new LocalOnlySignaling();
    }

    setupEventListeners() {
        // Handle signaling messages
        if (this.signalingServer) {
            this.signalingServer.on('offer', (offer, fromPeerId) => {
                this.handleOffer(offer, fromPeerId);
            });

            this.signalingServer.on('answer', (answer, fromPeerId) => {
                this.handleAnswer(answer, fromPeerId);
            });

            this.signalingServer.on('ice-candidate', (candidate, fromPeerId) => {
                this.handleIceCandidate(candidate, fromPeerId);
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

    // Game hosting
    async hostGame() {
        console.log('[P2P] Starting to host game...');
        this.isHost = true;

        // Initialize local WASM game server
        if (window.wasmLoader && !this.localGameServer) {
            try {
                this.localGameServer = await window.wasmLoader.loadWasm();
                console.log('[P2P] Local game server initialized');
            } catch (error) {
                console.error('[P2P] Failed to initialize game server:', error);
                throw error;
            }
        }

        // Create game in WASM server
        if (this.localGameServer) {
            const gameId = this.localGameServer.createGame(this.peerId);
            console.log('[P2P] Game created with ID:', gameId);
        }

        // Advertise game availability
        if (this.signalingServer) {
            await this.signalingServer.advertiseGame({
                hostId: this.peerId,
                gameType: 'drazzan-invasion',
                maxPlayers: 4,
                currentPlayers: 1
            });
        }

        return this.peerId; // Return game ID (host peer ID)
    }

    // Join existing game
    async joinGame(hostPeerId) {
        console.log('[P2P] Joining game hosted by:', hostPeerId);
        
        if (hostPeerId === this.peerId) {
            throw new Error('Cannot join own game');
        }

        // Create peer connection to host
        await this.connectToPeer(hostPeerId);
        
        // Wait for connection to be established
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);

            const checkConnection = () => {
                const connection = this.connections.get(hostPeerId);
                if (connection && connection.connectionState === 'connected') {
                    clearTimeout(timeout);
                    
                    // Send join request
                    this.sendToPlayer(hostPeerId, {
                        type: 'join_request',
                        playerId: this.peerId
                    });
                    
                    resolve(hostPeerId);
                } else {
                    setTimeout(checkConnection, 100);
                }
            };
            
            checkConnection();
        });
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

        let pc = this.connections.get(fromPeerId);
        if (!pc) {
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
            await pc.setRemoteDescription(answer);
        }
    }

    async handleIceCandidate(candidate, fromPeerId) {
        const pc = this.connections.get(fromPeerId);
        if (pc) {
            await pc.addIceCandidate(candidate);
        }
    }

    // Game message handling
    handlePeerMessage(message, fromPeerId) {
        console.log('[P2P] Message from', fromPeerId, ':', message.type);

        switch (message.type) {
            case 'join_request':
                this.handleJoinRequest(message, fromPeerId);
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
                
            case 'ping':
                this.sendToPlayer(fromPeerId, { type: 'pong', timestamp: message.timestamp });
                break;
        }
    }

    handleJoinRequest(message, fromPeerId) {
        if (this.isHost && this.localGameServer) {
            const success = this.localGameServer.joinGame(0, fromPeerId); // Assuming single game
            
            this.sendToPlayer(fromPeerId, {
                type: 'join_response',
                success: success,
                gameState: success ? this.localGameServer.getGameState() : null
            });
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