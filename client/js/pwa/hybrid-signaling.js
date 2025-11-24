// Hybrid P2P Signaling - Multiple fallback methods for maximum compatibility
// Supports: SharedArrayBuffer → HTTP fetch → localStorage → BroadcastChannel → WebSocket

class HybridSignaling {
    constructor(peerId) {
        this.peerId = peerId;
        this.eventHandlers = new Map();
        this.processedMessages = new Set();
        this.lastProcessedTimestamp = Date.now();
        this.isConnected = false;

        // Signaling method states
        this.signalingMethods = [];
        this.activeMethod = null;
        this.pollingInterval = null;

        // Track game advertisements
        this.gameAdvertisements = new Map(); // gameCode -> { hostId, gameInfo, timestamp }

        console.log('[HybridSignaling] Initializing hybrid signaling for peer:', peerId);
        this.initializeSignalingMethods();
    }

    /**
     * Format message ID for logging with meaningful information
     * @param {string} messageId - Full message ID in format: peerId-timestamp-random
     * @returns {string} Formatted string showing peer and relative time
     */
    formatMessageIdForLogging(messageId) {
        if (!messageId) return 'unknown';

        const parts = messageId.split('-');
        if (parts.length >= 2) {
            const peerId = parts[0];
            const timestamp = parseInt(parts[1]);
            const now = Date.now();
            const ageMs = now - timestamp;

            // Format age in human-readable form
            let ageStr;
            if (ageMs < 1000) {
                ageStr = `${ageMs}ms`;
            } else if (ageMs < 60000) {
                ageStr = `${Math.round(ageMs / 1000)}s`;
            } else {
                ageStr = `${Math.round(ageMs / 60000)}m`;
            }

            return `${peerId}/${ageStr}`;
        }

        // Fallback to last 8 chars if format doesn't match expected
        return messageId.slice(-8);
    }

    initializeSignalingMethods() {
        // Try signaling methods in order of preference
        const methods = [
            { name: 'sharedArrayBuffer', init: () => this.initSharedArrayBuffer() },
            { name: 'httpCrossOrigin', init: () => this.initHTTPCrossOrigin() },
            { name: 'localStorage', init: () => this.initLocalStorage() },
            { name: 'broadcastChannel', init: () => this.initBroadcastChannel() },
            { name: 'webSocket', init: () => this.initWebSocket() }
        ];

        for (const method of methods) {
            try {
                if (method.init()) {
                    this.signalingMethods.push(method.name);
                    console.log(`[HybridSignaling] ${method.name} signaling available`);
                }
            } catch (error) {
                console.log(`[HybridSignaling] ${method.name} signaling unavailable:`, error.message);
            }
        }

        this.activeMethod = this.signalingMethods[0] || 'none';
        console.log('[HybridSignaling] Active signaling methods:', this.signalingMethods);
        console.log('[HybridSignaling] Primary method:', this.activeMethod);
    }

    // SharedArrayBuffer-based signaling (fastest, same-origin only)
    initSharedArrayBuffer() {
        if (typeof SharedArrayBuffer === 'undefined' || !crossOriginIsolated) {
            return false;
        }

        // Create or connect to shared buffer
        const bufferSize = 1024 * 1024; // 1MB shared buffer
        try {
            this.sharedBuffer = new SharedArrayBuffer(bufferSize);
            this.sharedView = new Uint8Array(this.sharedBuffer);
            return true;
        } catch (error) {
            return false;
        }
    }

    // HTTP-based cross-origin signaling using iframe bridge
    initHTTPCrossOrigin() {
        try {
            // Cross-origin HTTP signaling only works for localhost development
            // where we can predict the other port running the same app
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            if (!isLocalhost) {
                // For production deployments (GitHub Pages, etc.), cross-origin HTTP doesn't make sense
                // since we can't predict what other origins would be running the same app
                console.log('[HybridSignaling] Cross-origin HTTP signaling skipped (only available for localhost development)');
                return false;
            }

            // Create hidden iframe for cross-origin communication
            this.crossOriginIframe = document.createElement('iframe');
            this.crossOriginIframe.style.display = 'none';
            this.crossOriginIframe.style.width = '1px';
            this.crossOriginIframe.style.height = '1px';

            // Set iframe to the other port for cross-origin communication
            const currentPort = window.location.port || '80';
            const targetPort = currentPort === '8080' ? '8081' : '8080';
            this.crossOriginIframe.src = `http://localhost:${targetPort}/cross-origin-bridge.html`;

            // Wait for document.body to be available
            if (document.body) {
                document.body.appendChild(this.crossOriginIframe);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(this.crossOriginIframe);
                });
            }

            // Listen for messages from the iframe bridge
            window.addEventListener('message', (event) => {
                if (event.data.type === 'bridge-signals') {
                    const signals = event.data.signals;
                    const newMessages = signals.filter(msg =>
                        msg.timestamp > this.lastProcessedTimestamp &&
                        (msg.targetPeer === this.peerId || msg.type === 'game-advertisement') &&
                        msg.sourcePeer !== this.peerId &&
                        msg.id && !this.processedMessages.has(msg.id)
                    );

                    if (newMessages.length > 0) {
                        console.log(`[HybridSignaling] Found ${newMessages.length} new cross-origin signals`);
                        this.processNewMessages(newMessages, 'crossOriginBridge');
                    }
                }
            });

            console.log(`[HybridSignaling] Cross-origin iframe bridge to port ${targetPort} created`);
            return true;
        } catch (error) {
            console.log('[HybridSignaling] Cross-origin iframe failed:', error);
            return false;
        }
    }

    // localStorage-based signaling (same-origin only)
    initLocalStorage() {
        if (typeof localStorage === 'undefined') return false;

        this.storageKey = 'drazzan-p2p-signals';
        return true;
    }

    // BroadcastChannel signaling (same-origin, same-tab-group)
    initBroadcastChannel() {
        if (typeof BroadcastChannel === 'undefined') return false;

        this.channel = new BroadcastChannel('drazzan-p2p-signaling');
        this.channel.addEventListener('message', (event) => {
            this.handleSignalMessage(event.data, 'broadcastChannel');
        });
        return true;
    }

    // WebSocket signaling (production, requires server)
    initWebSocket() {
        // Check if WebSocket signaling server is available
        const wsUrl = 'ws://localhost:3001/signaling';
        try {
            // Don't actually connect yet, just mark as available
            this.webSocketUrl = wsUrl;
            return false; // Disabled for now - no server
        } catch (error) {
            return false;
        }
    }

    // EventEmitter-like methods
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => handler(data));
        }
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    async connect() {
        this.isConnected = true;
        this.startPolling();
        console.log('[HybridSignaling] Connected with methods:', this.signalingMethods);
        return Promise.resolve();
    }

    // Manual polling method for immediate signal checking
    async pollForMessages() {
        if (this.signalingMethods.includes('localStorage')) {
            this.pollLocalStorage();
        }
        if (this.signalingMethods.includes('broadcastChannel')) {
            // BroadcastChannel is event-driven, no need to poll
        }
        if (this.signalingMethods.includes('httpCrossOrigin')) {
            // HTTP cross-origin is handled by iframe postMessage, no need to poll
        }
    }

    disconnect() {
        this.isConnected = false;
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        if (this.channel) {
            this.channel.close();
        }
        console.log('[HybridSignaling] Disconnected');
    }

    // Send signal using all available methods for maximum delivery
    async send(targetPeer, signal) {
        const message = {
            id: `${this.peerId}-${Date.now()}-${Math.random()}`,
            targetPeer,
            sourcePeer: this.peerId,
            signal,
            timestamp: Date.now()
        };

        console.log('[HybridSignaling] Sending signal via all methods:', signal.type);

        // Try each signaling method
        const results = await Promise.allSettled([
            this.sendViaHTTP(message),
            this.sendViaLocalStorage(message),
            this.sendViaBroadcastChannel(message)
        ]);

        const successful = results.filter(r => r.status === 'fulfilled').length;
        console.log(`[HybridSignaling] Signal sent via ${successful}/${results.length} methods`);
    }

    // HTTP-based signaling for cross-origin using iframe bridge
    async sendViaHTTP(message) {
        if (!this.signalingMethods.includes('httpCrossOrigin') || !this.crossOriginIframe) return;

        try {
            // Send signal to iframe bridge for cross-origin storage
            this.crossOriginIframe.contentWindow.postMessage({
                type: 'store-signal',
                signal: message
            }, '*');

            console.log('[HybridSignaling] Signal sent to cross-origin iframe bridge');
        } catch (error) {
            console.error('[HybridSignaling] Cross-origin iframe signaling failed:', error);
        }
    }

    // localStorage signaling with cross-origin attempt
    sendViaLocalStorage(message) {
        if (!this.signalingMethods.includes('localStorage')) return;

        try {
            const existingSignals = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            existingSignals.push(message);

            // Keep recent messages only
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
            const recentSignals = existingSignals.filter(msg => msg.timestamp > fiveMinutesAgo);

            localStorage.setItem(this.storageKey, JSON.stringify(recentSignals));
            console.log('[HybridSignaling] Signal stored in localStorage');

            // ALSO try to store in a shared key that both origins might access
            // This won't work cross-origin, but let's try multiple storage keys
            const sharedKeys = [
                'drazzan-p2p-signals',
                'drazzan-p2p-cross-origin',
                `drazzan-signals-${message.targetPeer}`,
                `drazzan-global-signals`
            ];

            sharedKeys.forEach(key => {
                try {
                    localStorage.setItem(key, JSON.stringify(recentSignals));
                } catch (e) {
                    // Ignore errors for additional keys
                }
            });

        } catch (error) {
            console.error('[HybridSignaling] localStorage send failed:', error);
        }
    }

    // BroadcastChannel signaling
    sendViaBroadcastChannel(message) {
        if (!this.signalingMethods.includes('broadcastChannel') || !this.channel) return;

        try {
            this.channel.postMessage(message);
            console.log('[HybridSignaling] Signal sent via BroadcastChannel');
        } catch (error) {
            console.error('[HybridSignaling] BroadcastChannel send failed:', error);
        }
    }

    // Start polling for incoming signals
    startPolling() {
        if (this.pollingInterval) return;

        this.pollingInterval = setInterval(() => {
            this.pollForSignals();
        }, 500);
    }

    async pollForSignals() {
        try {
            // Poll localStorage
            if (this.signalingMethods.includes('localStorage')) {
                this.pollLocalStorage();
            }

            // Poll HTTP cache
            if (this.signalingMethods.includes('httpCrossOrigin')) {
                await this.pollHTTPCache();
            }
        } catch (error) {
            console.error('[HybridSignaling] Polling error:', error);
        }
    }

    pollLocalStorage() {
        try {
            const signals = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

            // Debug: Log all signals in localStorage
            if (Math.random() < 0.1) { // Only log occasionally to avoid spam
                console.log(`[HybridSignaling] localStorage contains ${signals.length} total signals:`,
                    signals.map(s => ({
                        type: s.signal?.type || s.type,
                        from: s.sourcePeer,
                        to: s.targetPeer,
                        id: s.id?.slice(-8)
                    }))
                );
            }

            const newMessages = signals.filter(msg =>
                msg.timestamp > this.lastProcessedTimestamp &&
                (msg.targetPeer === this.peerId || msg.type === 'game-advertisement') &&
                msg.sourcePeer !== this.peerId &&
                msg.id && !this.processedMessages.has(msg.id)
            );

            if (newMessages.length > 0) {
                console.log(`[HybridSignaling] Found ${newMessages.length} new localStorage signals`);
                this.processNewMessages(newMessages, 'localStorage');
            }
        } catch (error) {
            console.error('[HybridSignaling] localStorage polling failed:', error);
        }
    }

    async pollHTTPCache() {
        if (!this.crossOriginIframe) return;

        try {
            // Request signals from cross-origin iframe bridge
            this.crossOriginIframe.contentWindow.postMessage({
                type: 'get-signals'
            }, '*');

        } catch (error) {
            console.error('[HybridSignaling] Cross-origin polling failed:', error);
        }
    }

    processNewMessages(messages, source) {
        // Update timestamp
        this.lastProcessedTimestamp = Math.max(...messages.map(msg => msg.timestamp));

        // Process each message
        messages.forEach(message => {
            // Skip already processed messages (deduplication)
            if (message.id && this.processedMessages.has(message.id)) {
                console.log(`[HybridSignaling] Skipping duplicate message from ${source}:`, this.formatMessageIdForLogging(message.id));
                return;
            }

            console.log(`[HybridSignaling] Processing message from ${source}:`, {
                id: this.formatMessageIdForLogging(message.id),
                type: message.signal?.type || message.type,
                from: message.sourcePeer,
                to: message.targetPeer,
                myId: this.peerId
            });

            if (message.id) {
                this.processedMessages.add(message.id);
            }
            this.handleSignalMessage(message, source);
        });

        // Cleanup old processed message IDs
        if (this.processedMessages.size > 100) {
            const entries = Array.from(this.processedMessages);
            this.processedMessages.clear();
            entries.slice(-50).forEach(id => this.processedMessages.add(id));
        }
    }

    handleSignalMessage(data, source) {
        if (data.targetPeer === this.peerId || data.type === 'game-advertisement') {
            console.log(`[HybridSignaling] Processing signal from ${source}:`, data.signal?.type || data.type);

            if (data.type === 'game-advertisement') {
                // Store game advertisement for lookup
                if (data.gameInfo && data.gameInfo.gameCode && data.gameInfo.hostId) {
                    this.gameAdvertisements.set(data.gameInfo.gameCode, {
                        hostId: data.gameInfo.hostId,
                        gameInfo: data.gameInfo,
                        timestamp: data.timestamp || Date.now()
                    });
                    console.log(`[HybridSignaling] Stored game advertisement: ${data.gameInfo.gameCode} -> ${data.gameInfo.hostId}`);
                    console.log(`[HybridSignaling] Current advertisements count: ${this.gameAdvertisements.size}`);
                    console.log(`[HybridSignaling] All game codes:`, Array.from(this.gameAdvertisements.keys()));
                } else {
                    console.warn(`[HybridSignaling] Invalid game advertisement data:`, data);
                }
                this.emit('game-advertisement', data.gameInfo);
            } else if (data.signal) {
                switch (data.signal.type) {
                    case 'offer':
                        this.emit('offer', { offer: data.signal.offer, from: data.sourcePeer });
                        break;
                    case 'answer':
                        this.emit('answer', { answer: data.signal.answer, from: data.sourcePeer });
                        break;
                    case 'ice-candidate':
                        const candidate = new RTCIceCandidate(data.signal.candidate);
                        this.emit('ice-candidate', { candidate, from: data.sourcePeer });
                        break;
                }
            }
        }
    }

    // WebRTC signaling methods
    async advertiseGame(gameInfo) {
        const message = {
            id: `${this.peerId}-${Date.now()}-${Math.random()}`,
            type: 'game-advertisement',
            gameInfo,
            timestamp: Date.now()
        };

        console.log('[HybridSignaling] Advertising game via all methods');
        await this.sendViaBroadcastChannel(message);
        await this.sendViaLocalStorage(message);
        await this.sendViaHTTP(message);

        return Promise.resolve();
    }

    // Find host peer ID for a given game code
    async findGameHost(gameCode) {
        console.log(`[HybridSignaling] Looking for game host with code: ${gameCode}`);
        console.log(`[HybridSignaling] Current advertisements in memory:`, Array.from(this.gameAdvertisements.keys()));

        // Check local cache first
        const advertisement = this.gameAdvertisements.get(gameCode);
        if (advertisement) {
            // Check if advertisement is still fresh (within 5 minutes)
            const age = Date.now() - advertisement.timestamp;
            console.log(`[HybridSignaling] Found cached advertisement, age: ${Math.round(age / 1000)}s`);
            if (age < 5 * 60 * 1000) {
                console.log(`[HybridSignaling] Returning cached host: ${advertisement.hostId}`);
                return advertisement.hostId;
            } else {
                console.log(`[HybridSignaling] Cached advertisement is stale, removing`);
                // Remove stale advertisement
                this.gameAdvertisements.delete(gameCode);
            }
        }

        // Poll for recent game advertisements
        console.log(`[HybridSignaling] Polling for fresh game advertisements...`);
        await this.pollForMessages();

        // Check again after polling
        const freshAdvertisement = this.gameAdvertisements.get(gameCode);
        if (freshAdvertisement) {
            console.log(`[HybridSignaling] Found fresh advertisement after polling: ${freshAdvertisement.hostId}`);
            return freshAdvertisement.hostId;
        }

        console.log(`[HybridSignaling] No advertisement found for game code: ${gameCode}`);
        return null;
    }

    async sendOffer(offer, targetPeer) {
        await this.send(targetPeer, { type: 'offer', offer });
        return Promise.resolve();
    }

    async sendAnswer(answer, targetPeer) {
        await this.send(targetPeer, { type: 'answer', answer });
        return Promise.resolve();
    }

    async sendIceCandidate(candidate, targetPeer) {
        const serializedCandidate = {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
            usernameFragment: candidate.usernameFragment
        };
        await this.send(targetPeer, { type: 'ice-candidate', candidate: serializedCandidate });
        return Promise.resolve();
    }
}

// Debug helper functions
window.inspectHybridSignals = function () {
    const localStorage_signals = JSON.parse(localStorage.getItem('drazzan-p2p-signals') || '[]');
    console.log('=== Hybrid P2P Signals Debug ===');
    console.log('My Peer ID:', window.networkManager?.peerId);
    console.log('localStorage signals:', localStorage_signals.length);
    localStorage_signals.forEach((signal, i) => {
        console.log(`${i + 1}.`, {
            type: signal.signal?.type || signal.type,
            from: signal.sourcePeer,
            to: signal.targetPeer,
            timestamp: new Date(signal.timestamp).toLocaleTimeString(),
            id: signaling?.formatMessageIdForLogging?.(signal.id) || signal.id?.slice(-8)
        });
    });

    // Check processed messages
    const signaling = window.networkManager?.signalingServer;
    if (signaling?.processedMessages) {
        console.log('Processed message IDs:', Array.from(signaling.processedMessages).map(id =>
            signaling.formatMessageIdForLogging?.(id) || id.slice(-8)
        ));
    }

    return localStorage_signals;
};

// Export for use in network manager
window.HybridSignaling = HybridSignaling;

console.log('[HybridSignaling] Hybrid signaling module loaded');