// P2P Connection Diagnostic Tool
// Run this in the browser console to diagnose connection issues

function diagnosePeerConnection() {
    console.log('=== P2P Connection Diagnostics ===');

    // Check network manager
    if (!window.gameIntegration?.networkManager) {
        console.error('❌ Network manager not available');
        return;
    }

    const nm = window.gameIntegration.networkManager;
    console.log('✅ Network Manager:', {
        peerId: nm.peerId,
        gameCode: nm.gameCode,
        isHost: nm.isHost,
        connections: nm.peers ? nm.peers.size : 0
    });

    // Check signaling server
    if (!nm.signalingServer) {
        console.error('❌ Signaling server not available');
        return;
    }

    console.log('✅ Signaling Server:', {
        type: nm.signalingServer.constructor.name,
        methods: nm.signalingServer.signalingMethods,
        isConnected: nm.signalingServer.isConnected
    });

    // Check localStorage signals
    const signals = JSON.parse(localStorage.getItem('drazzan-p2p-signals') || '[]');
    const gameAds = signals.filter(s => s.type === 'game-advertisement');
    const recent = signals.filter(s => Date.now() - s.timestamp < 5 * 60 * 1000);

    console.log('📊 Signal Storage:', {
        totalSignals: signals.length,
        gameAdvertisements: gameAds.length,
        recentSignals: recent.length
    });

    if (gameAds.length > 0) {
        console.log('🎮 Available Games:');
        gameAds.forEach(ad => {
            const age = Math.round((Date.now() - ad.timestamp) / 1000);
            console.log(`  - Code: ${ad.gameInfo?.gameCode}, Host: ${ad.gameInfo?.hostId}, Age: ${age}s`);
        });
    }

    // Check peer connections
    if (nm.peers && nm.peers.size > 0) {
        console.log('🔗 Active Connections:');
        nm.peers.forEach((peer, peerId) => {
            console.log(`  - ${peerId}: ${peer.connectionState || 'unknown'}`);
        });
    }

    // Check for common issues
    console.log('🔍 Potential Issues:');

    if (signals.length === 0) {
        console.warn('  ⚠️  No signals in localStorage - host may not be advertising');
    }

    if (gameAds.length === 0) {
        console.warn('  ⚠️  No game advertisements found - no hosts available');
    }

    const staleAds = gameAds.filter(ad => Date.now() - ad.timestamp > 5 * 60 * 1000);
    if (staleAds.length > 0) {
        console.warn(`  ⚠️  ${staleAds.length} stale game advertisements (older than 5 minutes)`);
    }

    // WebRTC diagnostics
    if (nm.peers && nm.peers.size > 0) {
        nm.peers.forEach((peer, peerId) => {
            if (peer.iceConnectionState === 'failed') {
                console.error(`  ❌ ICE connection failed for ${peerId}`);
            }
            if (peer.connectionState === 'failed') {
                console.error(`  ❌ Peer connection failed for ${peerId}`);
            }
        });
    }

    return {
        networkManager: !!nm,
        signalingServer: !!nm.signalingServer,
        totalSignals: signals.length,
        gameAds: gameAds.length,
        activeConnections: nm.peers ? nm.peers.size : 0
    };
}

// Test specific game code resolution
function testGameCodeResolution(gameCode) {
    console.log(`=== Testing Game Code Resolution: ${gameCode} ===`);

    const nm = window.gameIntegration?.networkManager;
    if (!nm) {
        console.error('❌ Network manager not available');
        return;
    }

    if (!nm.signalingServer?.findGameHost) {
        console.error('❌ findGameHost method not available');
        return;
    }

    return nm.signalingServer.findGameHost(gameCode).then(hostId => {
        if (hostId) {
            console.log(`✅ Found host for ${gameCode}: ${hostId}`);
        } else {
            console.warn(`⚠️  No host found for ${gameCode}`);
        }
        return hostId;
    }).catch(error => {
        console.error(`❌ Error resolving ${gameCode}:`, error);
    });
}

// Make functions globally available
window.diagnosePeerConnection = diagnosePeerConnection;
window.testGameCodeResolution = testGameCodeResolution;

console.log('🔧 Diagnostic tools loaded:');
console.log('  - diagnosePeerConnection() - Full system diagnostic');
console.log('  - testGameCodeResolution(code) - Test specific game code');