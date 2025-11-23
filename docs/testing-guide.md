# Testing The Drazzan Invasion Game Mode System

## Quick Test Methods

### Method 1: Direct Browser Testing (Simplest)
1. Navigate to `d:\github\The_Drazzan_Invasion\client\`
2. Double-click `index.html` to open in browser
3. Open Developer Console (F12)
4. Look for integration messages and test with console commands

### Method 2: Live Server (Recommended for Development)
If you have VS Code with Live Server extension:
1. Right-click `index.html` in VS Code
2. Select "Open with Live Server"
3. Browser will auto-refresh on changes

### Method 3: Node.js HTTP Server
If you have Node.js installed:
```bash
cd d:\github\The_Drazzan_Invasion\client
npx http-server -p 8080
```
Then open: http://localhost:8080

### Method 4: PowerShell Simple Server
For Windows without Node.js:
```powershell
cd "d:\github\The_Drazzan_Invasion\client"
Start-Process "index.html"
```

## Console Testing Commands

Once the page loads, test in browser console:

```javascript
// Test integration
gameIntegration.test()

// Show mode selection UI
gameIntegration.showModes()

// Test single player mode
gameIntegration.testSinglePlayer()

// Check components
console.log('GameModeManager:', typeof window.GameModeManager)
console.log('gameModeManager:', typeof window.gameModeManager)
console.log('SinglePlayerGame:', typeof window.SinglePlayerGame)
```

## Expected Behavior

1. **Page Load**: Should see integration messages in console
2. **Start Button**: Text should change to "Choose Game Mode"
3. **Mode Selection**: Clicking button shows game mode UI
4. **Single Player**: Should integrate with existing game logic
5. **No Errors**: Console should show successful initialization

## Troubleshooting

### Common Issues:
- **Module loading errors**: Check that all script tags are correct
- **CORS errors**: Use a proper HTTP server (not file:// protocol)
- **Integration failures**: Check console for specific error messages

### Debug Steps:
1. Check Network tab for failed script loads
2. Look for JavaScript errors in Console
3. Verify all game objects are loaded before integration
4. Test individual components in isolation

## File Structure Check

Verify these files exist:
- `client/js/pwa/game-mode-manager.js`
- `client/js/pwa/game-mode-ui.js`
- `client/js/pwa/multiplayer-game.js`
- `client/js/pwa/single-player-game.js`
- `client/js/pwa/integration-bridge.js`

All should be referenced correctly in `index.html`.