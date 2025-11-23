// Create Test Game Advertisement
// Run this in browser console to create a test game advertisement

function createTestGameAd(gameCode = 'TEST01', hostPeerId = 'peer_test_host') {
    const STORAGE_KEY = 'drazzan-p2p-signals';

    console.log(`Creating test game advertisement: ${gameCode} -> ${hostPeerId}`);

    // Get existing signals
    const signals = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Create test advertisement
    const testAd = {
        id: 'test_ad_' + Date.now(),
        type: 'game-advertisement',
        sourcePeer: hostPeerId,
        targetPeer: null, // Broadcast
        timestamp: Date.now(),
        gameInfo: {
            hostId: hostPeerId,
            gameCode: gameCode,
            gameType: 'drazzan-invasion',
            maxPlayers: 4,
            currentPlayers: 1
        }
    };

    // Add to signals array
    signals.push(testAd);

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));

    console.log('Test advertisement created:', testAd);
    console.log(`Total signals in localStorage: ${signals.length}`);

    return testAd;
}

// Make function available globally
window.createTestGameAd = createTestGameAd;

console.log('Test function loaded. Run createTestGameAd() to create a test advertisement.');
console.log('Then try joining with game code "TEST01"');