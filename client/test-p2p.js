// Test P2P Connection Flow
// Run this in browser console on both host (8080) and peer (8081)

async function testP2PFlow() {
    console.log('=== P2P Connection Test ===');

    // Check if game integration is available
    if (!window.gameIntegration) {
        console.error('Game integration not available');
        return;
    }

    const networkManager = window.gameIntegration.networkManager;
    if (!networkManager) {
        console.error('Network manager not available');
        return;
    }

    console.log('Current peer ID:', networkManager.peerId);
    console.log('Current game code:', networkManager.gameCode);

    // Check localStorage signals
    const signals = JSON.parse(localStorage.getItem('drazzan-p2p-signals') || '[]');
    console.log('Total signals in localStorage:', signals.length);

    const gameAds = signals.filter(s => s.type === 'game-advertisement');
    console.log('Game advertisements:', gameAds.length);

    gameAds.forEach((ad, i) => {
        console.log(`  [${i}] Code: ${ad.gameInfo?.gameCode}, Host: ${ad.gameInfo?.hostId}, Age: ${Math.round((Date.now() - ad.timestamp) / 1000)}s`);
    });

    // Test signaling server
    if (networkManager.signalingServer) {
        console.log('Signaling server type:', networkManager.signalingServer.constructor.name);

        if (networkManager.signalingServer.findGameHost) {
            console.log('Testing findGameHost method...');
            try {
                const testResult = await networkManager.signalingServer.findGameHost('TEST01');
                console.log('Test findGameHost result:', testResult);
            } catch (error) {
                console.error('Test findGameHost error:', error);
            }
        }
    }

    return {
        peerId: networkManager.peerId,
        gameCode: networkManager.gameCode,
        signalsCount: signals.length,
        gameAdsCount: gameAds.length,
        gameAds: gameAds.map(ad => ({
            code: ad.gameInfo?.gameCode,
            host: ad.gameInfo?.hostId,
            age: Math.round((Date.now() - ad.timestamp) / 1000)
        }))
    };
}

// Run the test
window.testP2PFlow = testP2PFlow;
console.log('P2P test function loaded. Run testP2PFlow() to test connection.');