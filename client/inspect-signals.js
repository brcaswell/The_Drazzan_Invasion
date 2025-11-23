// Simple localStorage Signal Inspector
// Run this in browser console to see what signals are stored

console.log('=== localStorage Signal Inspector ===');

const STORAGE_KEY = 'drazzan-p2p-signals';
const signals = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

console.log(`Total signals: ${signals.length}`);

if (signals.length > 0) {
    console.log('\n📡 All Signals:');
    signals.forEach((signal, i) => {
        const age = Math.round((Date.now() - signal.timestamp) / 1000);
        console.log(`[${i}] Type: ${signal.type}, From: ${signal.sourcePeer || signal.from}, Age: ${age}s`);

        if (signal.type === 'game-advertisement' && signal.gameInfo) {
            console.log(`    🎮 Game Code: ${signal.gameInfo.gameCode}, Host: ${signal.gameInfo.hostId}`);
        }
    });

    const gameAds = signals.filter(s => s.type === 'game-advertisement');
    console.log(`\n🎮 Game Advertisements: ${gameAds.length}`);

    if (gameAds.length > 0) {
        console.log('Available games:');
        gameAds.forEach(ad => {
            const age = Math.round((Date.now() - ad.timestamp) / 1000);
            const isRecent = age < 300; // 5 minutes
            const status = isRecent ? '🟢' : '🔴';
            console.log(`  ${status} ${ad.gameInfo?.gameCode} - Host: ${ad.gameInfo?.hostId} (${age}s ago)`);
        });
    }

    const recent = signals.filter(s => Date.now() - s.timestamp < 5 * 60 * 1000);
    console.log(`\n⏰ Recent signals (last 5 min): ${recent.length}`);

} else {
    console.log('❌ No signals found in localStorage');
    console.log('This means:');
    console.log('  - No host is advertising games');
    console.log('  - Or localStorage is being cleared');
    console.log('  - Or host is on different origin/port');
}

// Test if we can find the specific game code being searched for
const searchCode = 'ATB9OT'; // From the error logs
const foundGame = signals.find(s => s.type === 'game-advertisement' && s.gameInfo?.gameCode === searchCode);

if (foundGame) {
    console.log(`\n✅ Found game ${searchCode}:`, foundGame);
} else {
    console.log(`\n❌ Game ${searchCode} not found in signals`);
    console.log('Available game codes:', signals
        .filter(s => s.type === 'game-advertisement')
        .map(s => s.gameInfo?.gameCode)
        .filter(Boolean)
    );
}