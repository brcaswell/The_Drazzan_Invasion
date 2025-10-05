# HTML Development Instructions

## Apply to: `client/**/*.html` (HTML Templates and Main Index)

### Context
HTML files in The Drazzan Invasion serve as the foundation for a Progressive Web App with integrated multiplayer capabilities. The main `index.html` is the single entry point that loads all game systems.

### Core Requirements
1. **PWA Compliance**: Include all required PWA metadata and manifest
2. **Module Loading**: Proper ES6 module loading order and dependencies  
3. **Mobile Responsive**: Support for mobile devices and touch interfaces
4. **Semantic HTML**: Use appropriate HTML5 semantic elements
5. **Performance**: Minimize initial load time and resource blocking

### Standard HTML Structure

#### Document Head
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>The Drazzan Invasion</title>
    <meta name="description" content="Decentralized multiplayer space shooter">
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#000000">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="mobile-web-app-capable" content="yes">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">
    
    <!-- Styles -->
    <link rel="stylesheet" href="css/styles.css">
</head>
```

#### Script Loading Order
**Critical**: Scripts must load in specific order for proper integration:

```html
<!-- PWA & Networking (Load First) -->
<script src="js/pwa/service-worker-bridge.js"></script>
<script src="js/pwa/network-manager.js"></script>
<script src="js/pwa/wasm-loader.js"></script>

<!-- Game Mode System (ES6 Modules) -->
<script type="module" src="js/pwa/single-player-game.js"></script>
<script type="module" src="js/pwa/multiplayer-game.js"></script>
<script type="module" src="js/pwa/game-mode-ui.js"></script>
<script type="module" src="js/pwa/game-mode-manager.js"></script>
<script defer src="js/pwa/integration-bridge.js"></script>

<!-- Core Game Components (Order Matters) -->
<script defer src="js/canvas.js"></script>
<script defer src="js/config.js"></script>
<script defer src="js/player.js"></script>
<script defer src="js/asteroids.js"></script>
<script defer src="js/lasers.js"></script>
<script defer src="js/collisions.js"></script>
<script defer src="js/explosions.js"></script>
<script defer src="js/input.js"></script>
<script defer src="js/gameloop.js"></script>
<script defer src="js/main.js"></script>
```

### PWA Integration Requirements

#### Manifest File Reference
```html
<link rel="manifest" href="manifest.json">
```

#### Service Worker Registration
```html
<!-- Service worker bridge handles registration -->
<script src="js/pwa/service-worker-bridge.js"></script>
```

#### Mobile Optimization
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
```

### Game UI Structure

#### Initial Game Elements
```html
<body>
    <!-- Game Thumbnail (Before Start) -->
    <div id="gameThumbnailContainer">
        <img id="gameThumbnail" src="assets/game_thumbnail.jpg" alt="Game Thumbnail">
    </div>

    <!-- Start Button (Replaced by Mode Selection) -->
    <button id="startButton">Choose Game Mode</button>
    
    <!-- Canvas Element (Created by canvas.js) -->
    <!-- Multiplayer UI (Created by game-mode-ui.js) -->
</body>
```

### CSS Integration

#### Required Stylesheets
```html
<!-- Main game styles -->
<link rel="stylesheet" href="css/styles.css">

<!-- Multiplayer UI styles are injected by game-mode-ui.js -->
```

#### Style Loading Order
1. Base game styles (styles.css)
2. PWA styles (injected by service worker)
3. Multiplayer UI styles (injected by game-mode-ui.js)

### Responsive Design Requirements

#### Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
```

#### CSS Media Queries Support
```html
<style>
/* Ensure mobile compatibility */
@media (max-width: 768px) {
    .game-mode-ui { font-size: 0.9em; }
    .mode-buttons { grid-template-columns: 1fr; }
}

@media (orientation: landscape) and (max-height: 500px) {
    .mode-selection { padding: 20px; }
}
</style>
```

### Performance Optimization

#### Script Loading Strategy
- **Immediate**: PWA and networking scripts (no defer)
- **Module**: ES6 modules for game mode system  
- **Deferred**: Core game scripts to prevent blocking
- **Async**: Not used (order dependencies are critical)

#### Resource Preloading
```html
<!-- Preload critical game assets -->
<link rel="preload" href="assets/spaceship.png" as="image">
<link rel="preload" href="assets/8bit_retro.mp3" as="audio">
```

### Accessibility Considerations

#### Semantic Elements
```html
<main role="main">
    <section aria-label="Game Area">
        <canvas aria-label="Game Canvas"></canvas>
    </section>
    
    <aside aria-label="Game Controls">
        <button aria-label="Start Game" id="startButton">Choose Game Mode</button>
    </aside>
</main>
```

#### Screen Reader Support
```html
<div role="dialog" aria-labelledby="lobby-title" aria-describedby="lobby-description">
    <h2 id="lobby-title">Game Lobby</h2>
    <p id="lobby-description">Configure multiplayer game settings</p>
</div>
```

### Testing & Development

#### Development Mode Detection
```html
<script>
// Development mode helpers
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    // Add development tools
    console.log('[DEV] Development mode detected');
}
</script>
```

#### Debug Information
```html
<!-- Include build info for debugging -->
<meta name="build-date" content="<!-- Inject build date here -->">
<meta name="version" content="<!-- Inject version here -->">
```

### Anti-Patterns to Avoid

❌ **Don't:**
```html
<!-- External CDN dependencies -->
<script src="https://cdn.example.com/library.js"></script>

<!-- Blocking synchronous scripts -->
<script src="js/heavy-library.js"></script>

<!-- Incorrect module syntax -->
<script type="module" defer src="js/module.js"></script>

<!-- Missing PWA metadata -->
<!-- No manifest, no service worker registration -->
```

✅ **Do:**
```html
<!-- Self-contained resources -->
<script src="js/local-library.js"></script>

<!-- Non-blocking deferred scripts -->
<script defer src="js/game-component.js"></script>

<!-- Correct module loading -->
<script type="module" src="js/module.js"></script>

<!-- Complete PWA setup -->
<link rel="manifest" href="manifest.json">
<script src="js/pwa/service-worker-bridge.js"></script>
```

### Integration Testing

Test these aspects in every HTML file:
1. **Load Order**: All scripts load without dependency errors
2. **PWA Features**: Installable, works offline, proper manifest
3. **Mobile**: Touch interactions work, responsive layout
4. **Performance**: No blocking resources, fast initial paint
5. **Accessibility**: Screen reader compatible, keyboard navigation

This ensures all HTML files maintain consistency with the project's architecture and provide a solid foundation for the JavaScript game systems.

## AI-Assisted HTML Development

### Context-Aware HTML Generation
When working on HTML files, AI should consider:
- **Current Feature**: What UI components are being added/modified
- **Script Dependencies**: How new JavaScript modules affect loading order
- **PWA Requirements**: Manifest, service worker, and mobile meta tags
- **Accessibility**: Semantic markup and ARIA attributes

### Feature Branch HTML Changes
```bash
# Typical HTML modifications during feature development:
client/index.html                      # Main entry point updates
client/manifest.json                   # PWA manifest changes
client/css/styles.css                  # Corresponding style updates
docs/html-structure.md                 # Updated documentation
```

### AI HTML Generation Patterns
**AI Excels At:**
- Semantic HTML5 structure generation
- Meta tag and PWA configuration
- Script loading order optimization
- Responsive viewport configurations

**Human Review Required:**
- Game-specific UI element placement
- Performance impact of script loading
- Mobile UX considerations
- Accessibility compliance

### Git Staging for HTML Work
```bash
# Good: Stage HTML with related assets
git add client/index.html              # Main HTML changes
git add client/manifest.json           # PWA updates
git add client/css/                    # Related styling

# Include documentation
git add docs/ui-architecture.md        # UI documentation
```