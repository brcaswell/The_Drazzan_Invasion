// Local-only signaling for P2P testing without external servers
// Uses BroadcastChannel API for same-origin communication

class LocalOnlySignaling {
    constructor(peerId) {
        this.peerId = peerId;
        this.channel = new BroadcastChannel('drazzan-p2p-signaling');
        this.onSignal = null;
        this.isConnected = false;
        this.eventHandlers = new Map();

        // Add localStorage-based signaling for cross-origin communication
        this.storageKey = 'drazzan-p2p-signals';
        this.lastProcessedTimestamp = Date.now();
        this.storagePollingInterval = null;
        this.processedMessages = new Set(); // Track processed message IDs

        // Cross-origin signaling using shared file approach
        this.crossOriginSignaling = true;
        this.signalFileEndpoint = '/api/signals'; // Will be served by both nginx instances

        this.channel.addEventListener('message', (event) => {
            console.log('[LocalSignaling] BroadcastChannel message received:', event.data.signal?.type || event.data.type);
            // Check for duplicate processing (same message might come via localStorage too)
            if (event.data.id && this.processedMessages.has(event.data.id)) {
                console.log('[LocalSignaling] Ignoring duplicate BroadcastChannel message:', event.data.id?.slice(-8));
                return;
            }
            if (event.data.id) {
                this.processedMessages.add(event.data.id);
            }
            this.handleSignalMessage(event.data);
        });

        // Start localStorage polling for cross-origin communication
        this.startStoragePolling();

        console.log('[LocalSignaling] Initialized for peer:', peerId);
    }

    // EventEmitter-like methods for network manager compatibility
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

    connect() {
        return new Promise((resolve) => {
            this.isConnected = true;
            console.log('[LocalSignaling] Connected');
            resolve();
        });
    }

    send(targetPeer, signal) {
        console.log('[LocalSignaling] Sending signal to', targetPeer, ':', signal);

        const message = {
            id: `${this.peerId}-${Date.now()}-${Math.random()}`, // Unique message ID
            targetPeer,
            sourcePeer: this.peerId,
            signal,
            timestamp: Date.now()
        };

        // Try BroadcastChannel first (same-origin)
        try {
            this.channel.postMessage(message);
        } catch (error) {
            console.warn('[LocalSignaling] BroadcastChannel failed, using localStorage:', error);
        }

        // Also send via localStorage for cross-origin support
        this.sendViaLocalStorage(message);
    }

    disconnect() {
        this.isConnected = false;
        this.channel.close();

        // Stop localStorage polling
        if (this.storagePollingInterval) {
            clearInterval(this.storagePollingInterval);
            this.storagePollingInterval = null;
        }

        console.log('[LocalSignaling] Disconnected');
    }

    // localStorage-based signaling for cross-origin communication
    sendViaLocalStorage(message) {
        try {
            // Get existing signals
            const existingSignals = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            console.log('[LocalSignaling] Before send - existing signals count:', existingSignals.length);

            // Add new message
            existingSignals.push(message);

            // Keep only recent messages (last 5 minutes)
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
            const recentSignals = existingSignals.filter(msg => msg.timestamp > fiveMinutesAgo);

            // Store back to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(recentSignals));
            console.log('[LocalSignaling] Stored', recentSignals.length, 'signals to localStorage');

            // Also try cross-origin HTTP signaling
            this.sendViaCrossOriginHTTP(message);

            console.log('[LocalSignaling] Sent via localStorage:', message);
        } catch (error) {
            console.error('[LocalSignaling] localStorage send failed:', error);
        }
    }

    // Cross-origin HTTP-based signaling
    async sendViaCrossOriginHTTP(message) {
        const ports = [8080, 8081]; // Try both ports
        const currentPort = window.location.port || '80';

        for (const port of ports) {
            if (port.toString() === currentPort) continue; // Skip own port

            try {
                const response = await fetch(`http://localhost:${port}/api/p2p-signals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message),
                    mode: 'cors'
                });

                if (response.ok) {
                    console.log(`[LocalSignaling] Cross-origin signal sent to port ${port}`);
                    return;
                }
            } catch (error) {
                console.log(`[LocalSignaling] Cross-origin signaling to port ${port} failed:`, error.message);
            }
        }

        console.log('[LocalSignaling] All cross-origin signaling attempts failed');
    }

    startStoragePolling() {
        // Poll localStorage every 500ms for new messages
        this.storagePollingInterval = setInterval(() => {
            this.checkLocalStorageForMessages();
        }, 500);
    }

    checkLocalStorageForMessages() {
        try {
            const signals = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            // Only log every 10th check to avoid spam
            if (Math.random() < 0.1) {
                console.log('[LocalSignaling] Polling localStorage - found', signals.length, 'total signals');
            }

            // Process messages newer than our last processed timestamp
            const newMessages = signals.filter(msg =>
                msg.timestamp > this.lastProcessedTimestamp &&
                (msg.targetPeer === this.peerId || msg.type === 'game-advertisement') &&
                msg.sourcePeer !== this.peerId &&
                msg.id && !this.processedMessages.has(msg.id) // Prevent duplicate processing
            );

            if (newMessages.length > 0) {
                console.log('[LocalSignaling] Found', newMessages.length, 'new localStorage messages');

                // Update last processed timestamp
                this.lastProcessedTimestamp = Math.max(...newMessages.map(msg => msg.timestamp));

                // Handle each new message
                newMessages.forEach(message => {
                    this.processedMessages.add(message.id); // Mark as processed
                    this.handleSignalMessage(message);
                });

                // Clean up old processed message IDs (keep last 100)
                if (this.processedMessages.size > 100) {
                    const entries = Array.from(this.processedMessages);
                    this.processedMessages.clear();
                    entries.slice(-50).forEach(id => this.processedMessages.add(id));
                }
            }
        } catch (error) {
            console.error('[LocalSignaling] localStorage polling failed:', error);
        }
    }

    handleSignalMessage(data) {
        // Handle both BroadcastChannel and localStorage messages
        if (data.targetPeer === this.peerId || data.type === 'game-advertisement') {
            console.log('[LocalSignaling] Processing signal:', data.signal?.type || data.type, 'from', data.sourcePeer, 'ID:', data.id?.slice(-8));

            if (data.type === 'game-advertisement') {
                this.emit('game-advertisement', data.gameInfo);
            } else if (data.signal) {
                // Handle WebRTC signaling
                if (data.signal.type === 'offer') {
                    console.log('[LocalSignaling] Emitting offer event from', data.sourcePeer);
                    this.emit('offer', { offer: data.signal.offer, from: data.sourcePeer });
                } else if (data.signal.type === 'answer') {
                    this.emit('answer', { answer: data.signal.answer, from: data.sourcePeer });
                } else if (data.signal.type === 'ice-candidate') {
                    // Reconstruct RTCIceCandidate from serialized data
                    const candidate = new RTCIceCandidate(data.signal.candidate);
                    this.emit('ice-candidate', { candidate, from: data.sourcePeer });
                }
            }
        }
    }

    // Advertise game availability (for local P2P discovery)
    advertiseGame(gameInfo) {
        console.log('[LocalSignaling] Advertising game:', gameInfo);

        const message = {
            id: `${this.peerId}-${Date.now()}-${Math.random()}`, // Unique message ID
            type: 'game-advertisement',
            gameInfo,
            timestamp: Date.now()
        };

        // Send via both BroadcastChannel and localStorage
        try {
            this.channel.postMessage(message);
            console.log('[LocalSignaling] BroadcastChannel advertisement sent');
        } catch (error) {
            console.warn('[LocalSignaling] BroadcastChannel advertisement failed:', error);
        }

        console.log('[LocalSignaling] Sending game advertisement via localStorage...');
        this.sendViaLocalStorage(message);
        console.log('[LocalSignaling] Game advertisement sent via localStorage');
        return Promise.resolve();
    }

    // WebRTC signaling methods
    sendOffer(offer, targetPeer) {
        console.log('[LocalSignaling] Sending offer to', targetPeer);
        this.send(targetPeer, {
            type: 'offer',
            offer: offer
        });
        return Promise.resolve();
    }

    sendAnswer(answer, targetPeer) {
        console.log('[LocalSignaling] Sending answer to', targetPeer);
        this.send(targetPeer, {
            type: 'answer',
            answer: answer
        });
        return Promise.resolve();
    }

    sendIceCandidate(candidate, targetPeer) {
        console.log('[LocalSignaling] Sending ICE candidate to', targetPeer);
        // Serialize RTCIceCandidate for BroadcastChannel
        const serializedCandidate = {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
            usernameFragment: candidate.usernameFragment
        };
        this.send(targetPeer, {
            type: 'ice-candidate',
            candidate: serializedCandidate
        });
        return Promise.resolve();
    }
}

// BroadcastChannelSignaling - alias for LocalOnlySignaling for compatibility
class BroadcastChannelSignaling extends LocalOnlySignaling {
    constructor(peerId) {
        super(peerId);
        console.log('[BroadcastChannelSignaling] Initialized for peer:', peerId);
    }
}

// Debug helper function for browser console
window.inspectP2PSignals = function () {
    const signals = JSON.parse(localStorage.getItem('drazzan-p2p-signals') || '[]');
    console.log('=== P2P Signals in localStorage ===');
    console.log('Total signals:', signals.length);
    signals.forEach((signal, i) => {
        console.log(`Signal ${i}:`, {
            type: signal.type || signal.signal?.type || 'unknown',
            from: signal.sourcePeer,
            to: signal.targetPeer,
            timestamp: new Date(signal.timestamp).toLocaleTimeString(),
            data: signal
        });
    });
    return signals;
};

// Export both classes for use in network-manager
window.LocalOnlySignaling = LocalOnlySignaling;
window.BroadcastChannelSignaling = BroadcastChannelSignaling;