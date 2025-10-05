# Testing & Development Instructions

## Apply to: All test files, development scripts, and debugging tools

### Context
Testing and development practices for The Drazzan Invasion must account for its unique architecture: a browser-native, decentralized multiplayer game with no build tools or external dependencies for basic functionality.

### Testing Philosophy
1. **Browser-First**: All testing happens in the browser, no Node.js test runners
2. **Console-Driven**: Use browser console for interactive testing and debugging
3. **Integration-Focused**: Test the full stack from UI to game logic
4. **Device Testing**: Test across desktop, mobile, and different browsers
5. **Network-Optional**: Test offline functionality and graceful degradation

### Testing Environment Setup

#### Local Development Server Options
```powershell
# Method 1: Direct browser testing (simplest)
cd "d:\github\The_Drazzan_Invasion\client"
Start-Process "index.html"

# Method 2: VS Code Live Server (recommended)
# Right-click index.html in VS Code → "Open with Live Server"

# Method 3: Node.js HTTP server (if Node.js available)
cd "d:\github\The_Drazzan_Invasion\client"
npx http-server -p 8080

# Method 4: PowerShell simple HTTP server (Windows 10+)
cd "d:\github\The_Drazzan_Invasion\client"
# Note: No built-in HTTP server in PowerShell, use other methods
```

#### Browser Console Testing
```javascript
// Available in browser console after page load
// Test integration
gameIntegration.test()

// Show mode selection UI
gameIntegration.showModes()

// Test single player mode
gameIntegration.testSinglePlayer()

// Check component availability
console.log('Components:', {
    GameModeManager: typeof window.GameModeManager,
    gameModeManager: typeof window.gameModeManager,
    SinglePlayerGame: typeof window.SinglePlayerGame,
    MultiplayerGame: typeof window.MultiplayerGame
});
```

### Testing Categories

#### Unit Testing (Console-Based)
```javascript
// Create test suites in browser console
class GameTestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
    }
    
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    async runAll() {
        console.log('🧪 Running Game Test Suite...');
        this.results = [];
        
        for (const test of this.tests) {
            try {
                const result = await test.testFn();
                this.results.push({ name: test.name, status: 'PASS', result });
                console.log(`✅ ${test.name}: PASS`);
            } catch (error) {
                this.results.push({ name: test.name, status: 'FAIL', error });
                console.error(`❌ ${test.name}: FAIL`, error);
            }
        }
        
        this.printSummary();
    }
    
    printSummary() {
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const total = this.results.length;
        console.log(`\n📊 Test Summary: ${passed}/${total} passed`);
    }
}

// Example usage
const testSuite = new GameTestSuite();
testSuite.addTest('Game Mode Manager Initialization', () => {
    return window.gameModeManager && typeof window.gameModeManager.initialize === 'function';
});
testSuite.runAll();
```

#### Integration Testing
```javascript
// Test complete game flow
class IntegrationTests {
    async testSinglePlayerFlow() {
        console.log('🎮 Testing Single Player Flow...');
        
        // 1. Show mode selection
        window.gameModeManager.showModeSelection();
        await this.wait(1000);
        
        // 2. Select single player
        window.gameModeManager.setMode('single');
        
        // 3. Start game
        window.gameModeManager.startSinglePlayer();
        
        // 4. Verify game state
        const gameState = window.gameModeManager.singlePlayerGame.getGameState();
        console.log('Game State:', gameState);
        
        return gameState.score >= 0; // Basic validation
    }
    
    async testMultiplayerLobby() {
        console.log('🤝 Testing Multiplayer Lobby...');
        
        // 1. Create lobby
        window.gameModeManager.setMode('coop');
        window.gameModeManager.createLobby();
        
        // 2. Add test player
        window.gameModeManager.addPlayer('test-player', {
            name: 'Test Player',
            isHost: false
        });
        
        // 3. Verify lobby state
        const players = window.gameModeManager.getActivePlayers();
        console.log('Active Players:', players);
        
        return players.length > 0;
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run integration tests
const integrationTests = new IntegrationTests();
// integrationTests.testSinglePlayerFlow();
```

#### Performance Testing
```javascript
// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.isMonitoring = false;
    }
    
    startMonitoring() {
        this.isMonitoring = true;
        this.monitorGameLoop();
        this.monitorMemory();
        this.monitorNetwork();
    }
    
    monitorGameLoop() {
        let lastFrameTime = performance.now();
        let frameCount = 0;
        let totalFrameTime = 0;
        
        const checkFrame = () => {
            if (!this.isMonitoring) return;
            
            const currentTime = performance.now();
            const frameTime = currentTime - lastFrameTime;
            
            frameCount++;
            totalFrameTime += frameTime;
            
            if (frameTime > 16.67) { // > 60fps
                console.warn(`⚠️ Slow frame: ${frameTime.toFixed(2)}ms`);
            }
            
            if (frameCount % 60 === 0) { // Every 60 frames
                const avgFrameTime = totalFrameTime / frameCount;
                const fps = 1000 / avgFrameTime;
                console.log(`📊 FPS: ${fps.toFixed(1)}, Avg Frame: ${avgFrameTime.toFixed(2)}ms`);
            }
            
            lastFrameTime = currentTime;
            requestAnimationFrame(checkFrame);
        };
        
        requestAnimationFrame(checkFrame);
    }
    
    monitorMemory() {
        if (!performance.memory) {
            console.log('❌ Memory monitoring not available');
            return;
        }
        
        setInterval(() => {
            if (!this.isMonitoring) return;
            
            const memory = performance.memory;
            const used = Math.round(memory.usedJSHeapSize / 1048576);
            const total = Math.round(memory.totalJSHeapSize / 1048576);
            
            console.log(`💾 Memory: ${used}MB / ${total}MB`);
            
            if (used > total * 0.8) {
                console.warn('⚠️ High memory usage detected');
            }
        }, 5000);
    }
    
    stopMonitoring() {
        this.isMonitoring = false;
    }
}

// Usage
const perfMonitor = new PerformanceMonitor();
// perfMonitor.startMonitoring();
```

### Device Testing

#### Mobile Testing
```javascript
// Mobile-specific tests
class MobileTests {
    testTouchInterface() {
        console.log('📱 Testing Touch Interface...');
        
        // Check if touch events are supported
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        console.log('Touch Support:', hasTouch);
        
        // Test touch target sizes
        const buttons = document.querySelectorAll('.game-button');
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            const minSize = 44; // Minimum touch target size
            
            if (rect.width < minSize || rect.height < minSize) {
                console.warn(`⚠️ Touch target too small: ${button.className}`);
            }
        });
        
        return hasTouch;
    }
    
    testResponsiveLayout() {
        console.log('📐 Testing Responsive Layout...');
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        console.log(`Viewport: ${viewportWidth}x${viewportHeight}`);
        
        // Test different viewport sizes
        const breakpoints = [320, 768, 1024, 1920];
        breakpoints.forEach(width => {
            const matches = window.matchMedia(`(min-width: ${width}px)`).matches;
            console.log(`Breakpoint ${width}px: ${matches ? 'active' : 'inactive'}`);
        });
    }
    
    testOrientation() {
        console.log('🔄 Testing Orientation...');
        
        const orientation = screen.orientation?.type || 'unknown';
        console.log('Orientation:', orientation);
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                console.log('📱 Orientation changed:', screen.orientation?.type);
                this.testResponsiveLayout();
            }, 100);
        });
    }
}

// Run mobile tests
const mobileTests = new MobileTests();
// mobileTests.testTouchInterface();
// mobileTests.testResponsiveLayout();
```

#### Cross-Browser Testing
```javascript
// Browser compatibility tests
class CompatibilityTests {
    getBrowserInfo() {
        const ua = navigator.userAgent;
        const browser = {
            chrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor),
            firefox: /Firefox/.test(ua),
            safari: /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor),
            edge: /Edg/.test(ua)
        };
        
        console.log('🌐 Browser:', browser);
        return browser;
    }
    
    testWebRTCSupport() {
        const hasWebRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection);
        console.log('📡 WebRTC Support:', hasWebRTC);
        return hasWebRTC;
    }
    
    testWebAssemblySupport() {
        const hasWASM = typeof WebAssembly === 'object';
        console.log('⚡ WebAssembly Support:', hasWASM);
        return hasWASM;
    }
    
    testServiceWorkerSupport() {
        const hasSW = 'serviceWorker' in navigator;
        console.log('🔧 Service Worker Support:', hasSW);
        return hasSW;
    }
    
    runAll() {
        console.log('🧪 Running Compatibility Tests...');
        
        const results = {
            browser: this.getBrowserInfo(),
            webrtc: this.testWebRTCSupport(),
            wasm: this.testWebAssemblySupport(),
            serviceWorker: this.testServiceWorkerSupport()
        };
        
        console.log('📊 Compatibility Results:', results);
        return results;
    }
}

// Run compatibility tests
const compatTests = new CompatibilityTests();
// compatTests.runAll();
```

### Network Testing

#### Offline Testing
```javascript
// Test offline functionality
class OfflineTests {
    testOfflineMode() {
        console.log('📴 Testing Offline Mode...');
        
        // Simulate offline
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                console.log('SW Message:', event.data);
            });
        }
        
        // Test game functionality offline
        window.gameModeManager.setMode('single');
        const canStartOffline = window.gameModeManager.startSinglePlayer();
        
        console.log('Single Player Offline:', canStartOffline !== false);
        return canStartOffline;
    }
    
    simulateNetworkConditions(latency = 100, packetLoss = 0) {
        console.log(`🌐 Simulating Network: ${latency}ms latency, ${packetLoss}% loss`);
        
        // Mock network delays (for testing)
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            await new Promise(resolve => setTimeout(resolve, latency));
            
            if (Math.random() < packetLoss / 100) {
                throw new Error('Simulated packet loss');
            }
            
            return originalFetch(...args);
        };
    }
}
```

### Debugging Tools

#### Game State Inspector
```javascript
// Debug tools
window.gameDebug = {
    // Inspect current game state
    inspect() {
        const state = {
            mode: window.gameModeManager?.currentMode,
            gameState: window.gameModeManager?.gameState,
            players: window.gameModeManager?.getActivePlayers(),
            singlePlayer: window.gameModeManager?.singlePlayerGame?.getGameState(),
            canvas: { width: window.canvas?.width, height: window.canvas?.height }
        };
        
        console.table(state);
        return state;
    },
    
    // Force specific game states
    setMode(mode) {
        window.gameModeManager?.setMode(mode);
        console.log(`Set mode to: ${mode}`);
    },
    
    // Performance snapshot
    perf() {
        const memory = performance.memory;
        const timing = performance.timing;
        
        return {
            memory: memory ? {
                used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
                total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB'
            } : 'Not available',
            loadTime: timing.loadEventEnd - timing.navigationStart + 'ms',
            fps: this.calculateFPS()
        };
    },
    
    calculateFPS() {
        let frames = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                console.log(`Current FPS: ${fps}`);
                frames = 0;
                lastTime = currentTime;
                return fps;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
};

console.log('🔧 Debug tools available at window.gameDebug');
```

### Automated Testing Setup

#### Test Runner
```javascript
// Simple test runner for browser console
class GameTestRunner {
    constructor() {
        this.suites = [];
    }
    
    addSuite(name, suite) {
        this.suites.push({ name, suite });
    }
    
    async runAll() {
        console.log('🚀 Running All Test Suites...');
        
        let totalPassed = 0;
        let totalTests = 0;
        
        for (const { name, suite } of this.suites) {
            console.log(`\n📦 Running ${name}...`);
            const results = await suite.runAll();
            
            const passed = results.filter(r => r.status === 'PASS').length;
            totalPassed += passed;
            totalTests += results.length;
            
            console.log(`${name}: ${passed}/${results.length} passed`);
        }
        
        console.log(`\n🎯 Overall: ${totalPassed}/${totalTests} tests passed`);
        return { passed: totalPassed, total: totalTests };
    }
}

// Global test runner
window.gameTestRunner = new GameTestRunner();
```

This comprehensive testing approach ensures the game works reliably across all supported platforms and network conditions while maintaining the project's core principle of browser-native operation.

## AI-Assisted Testing Workflow

### Test Generation with AI
**AI Excels At:**
- Generating test case boilerplate and structure
- Creating mock data and test scenarios
- Identifying edge cases based on code analysis
- Generating integration test patterns

**Human Oversight Required:**
- Game-specific logic validation
- User experience testing scenarios
- Performance benchmarking criteria
- Cross-browser compatibility priorities

### Feature Branch Testing Strategy
```bash
# Testing files for feature development:
client/js/pwa/integration-bridge.js    # Integration testing utilities
docs/testing-session-2025-10-05.md     # Session-specific test results
docs/feature-test-analysis.md          # Feature testing analysis
.github/testing-instructions.md        # Updated testing procedures
```

### AI-Generated Test Patterns
```javascript
// AI-Generated Test Suite Structure
class AIAssistedTestSuite {
    constructor(featureName, sessionDate) {
        this.featureName = featureName;
        this.sessionDate = sessionDate;
        this.tests = [];
        this.results = [];
    }
    
    // AI can generate comprehensive test scenarios
    generateFeatureTests() {
        // AI identifies test cases based on code analysis
        this.addTest('Component Initialization', () => {
            // AI-generated validation logic
        });
        
        this.addTest('Integration Points', () => {
            // AI-suggested integration tests
        });
    }
    
    // Human-designed game-specific tests
    addGameLogicTests() {
        // Requires domain knowledge and creativity
    }
}
```

### Session-Based Testing Documentation
```markdown
# Testing Session: [Feature Name] - [Date]
**Branch**: feature/ai-multiplayer-foundation
**AI Tools**: GitHub Copilot for test generation
**Duration**: 30 minutes testing, 1 hour AI-assisted test creation

## AI-Generated Tests
- [ ] Component initialization validation
- [ ] Integration point verification
- [ ] Error handling scenario testing
- [ ] Performance baseline measurements

## Human-Designed Tests
- [ ] User experience flow validation
- [ ] Game logic correctness verification
- [ ] Cross-device compatibility testing
- [ ] Accessibility compliance checking

## Test Results Summary
- **AI-Generated Tests**: 15/18 passed (AI identified 3 edge cases)
- **Human-Designed Tests**: 8/10 passed (2 UX issues found)
- **Performance**: Within acceptable ranges
- **Compatibility**: Tested on Chrome, Firefox, Safari
```

### Git Staging for Testing Work
```bash
# Good: Stage test utilities and documentation
git add client/js/pwa/integration-bridge.js    # Testing utilities
git add docs/testing-session-*.md              # Test session logs
git add docs/feature-test-analysis.md          # Analysis updates

# Include updated testing procedures
git add .github/testing-instructions.md        # Updated procedures
```

### AI Testing Integration Points
```javascript
// AI-Assisted Test Integration
window.aiTestingSuite = {
    // AI generates comprehensive system validation
    validateSystemIntegration() {
        const components = ['GameModeManager', 'GameModeUI', 'MultiplayerGame'];
        return components.every(comp => typeof window[comp] !== 'undefined');
    },
    
    // AI creates performance monitoring
    monitorPerformance(duration = 10000) {
        // AI-generated performance testing patterns
    },
    
    // Human-designed game testing
    validateGameLogic() {
        // Requires game development expertise
    }
};
```