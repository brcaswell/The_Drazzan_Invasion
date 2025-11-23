---
ai_context:
  type: tech-specific
  role: technology-guide
  scope: generic
  technology: html-web
  categories: [html, css, pwa, responsive-design]
  format_version: "2.0"
last_updated: "2025-11-23"
---

<!-- AI-CONTEXT: html-web-patterns -->
<!-- SCOPE: generic -->

# HTML & Web Technology Instructions for Browser-Native Applications

## @AI-SECTION: html-conventions

### Modern HTML5 Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Application Title</title>
    <meta name="description" content="Browser-native application description">
    
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
<body>
    <!-- Canvas must come first for proper layering -->
    <canvas id="gameCanvas"></canvas>
    
    <!-- UI overlay elements -->
    <div id="ui-container">
        <nav class="game-ui"></nav>
        <div id="mode-selection-ui"></div>
        <div id="lobby-ui"></div>
    </div>
    
    <!-- Script Loading Order: CRITICAL for browser-native apps -->
    <!-- PWA & Networking (Load First) -->
    <script src="js/pwa/service-worker-bridge.js"></script>
    <script src="js/pwa/network-manager.js"></script>
    <script src="js/pwa/wasm-loader.js"></script>
    
    <!-- Core Game Systems (Browser-Native) -->
    <script src="config.js"></script>
    <script src="canvas.js"></script>
    <script src="input.js"></script>
    
    <!-- Game Mode System (ES6 Modules) -->
    <script type="module" src="js/pwa/game-mode-manager.js"></script>
    <script type="module" src="js/pwa/game-mode-ui.js"></script>
    
    <!-- Main Application Entry -->
    <script src="main.js"></script>
</body>
</html>
```

### Progressive Web App Integration
```html
<!-- Essential PWA meta tags -->
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#000000">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

<!-- Service Worker Registration -->
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}
</script>
```

## @AI-SECTION: css-design-system

### CSS Custom Properties & Theme System
**Pattern**: Centralized design tokens for consistent theming
```css
:root {
    /* Core theme colors */
    --primary-bg: #0c0c1e;
    --secondary-bg: #1a1a3e;
    --accent-color: #00ff88;
    --warning-color: #ffaa00;
    --danger-color: #ff6b6b;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --text-muted: #888888;
    
    /* Application-specific colors - customize per project */
    --primary-entity: #00ff88;
    --secondary-entity: #ff6b6b;
    --accent-effect: #00ffff;
    --highlight-effect: #ff4400;
    
    /* UI Element colors */
    --button-bg: rgba(0, 255, 136, 0.1);
    --button-border: #00ff88;
    --button-hover: rgba(0, 255, 136, 0.3);
    --overlay-bg: rgba(0, 0, 0, 0.8);
    
    /* Typography system */
    --font-primary: 'Courier New', 'Consolas', monospace;
    --font-secondary: 'Arial', sans-serif;
    --font-size-base: 16px;
    --font-size-large: 18px;
    --font-size-small: 14px;
}
```

### Canvas Overlay UI Pattern
**Pattern**: UI elements that work with HTML5 Canvas applications
```css
/* Canvas should fill viewport and sit behind UI */
#gameCanvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    background: var(--primary-bg);
}

/* UI container overlays on top of canvas */
#ui-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none; /* Allow canvas interaction */
}

/* Individual UI elements must enable pointer events */
.ui-element {
    pointer-events: auto;
    background: var(--overlay-bg);
    border: 1px solid var(--accent-color);
    border-radius: 4px;
    color: var(--text-primary);
    font-family: var(--font-primary);
}
```

### Mobile-First Responsive Design
**Pattern**: Touch-friendly controls for browser-native applications
```css
/* Base mobile styles */
.game-ui {
    font-size: var(--font-size-base);
    min-height: 44px; /* Touch target minimum */
    padding: 12px 16px;
}

/* Desktop enhancements */
@media (min-width: 768px) {
    .game-ui {
        font-size: var(--font-size-large);
        padding: 8px 12px;
        transition: all 0.2s ease;
    }
    
    .game-ui:hover {
        background: var(--button-hover);
        transform: scale(1.02);
    }
}

/* Prevent mobile zoom on input focus */
input, button, select, textarea {
    font-size: 16px; /* Prevents iOS zoom */
}
```

## @AI-SECTION: file-patterns

### Apply to: `**/*.html`
- Maintain PWA manifest and service worker integration
- Use semantic HTML5 elements
- Ensure mobile responsiveness
- **CRITICAL**: Load JavaScript modules in correct dependency order (PWA first, core systems, then modules)
- Canvas element must come first in DOM for proper z-index layering

### Apply to: `**/*.css`
- Use CSS custom properties (variables) from design system
- Implement mobile-first responsive design
- **Canvas Integration**: UI elements must use pointer-events and z-index properly
- Maintain consistent visual theme with retro sci-fi aesthetic
- Optimize for Canvas overlay UI elements

### Apply to: `**/manifest.json`
- Configure PWA capabilities and theming
- Define app icons and launch behavior
- Set theme colors to match CSS custom properties
- Set up offline capabilities
- Configure display modes and orientations

## @AI-SECTION: css-patterns

### CSS Custom Properties and Theming
```css
:root {
    /* Color palette */
    --primary-color: #00ff00;
    --secondary-color: #ff0000;
    --background-color: #000000;
    --text-color: #ffffff;
    
    /* Spacing system */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 2rem;
    --space-xl: 4rem;
    
    /* Z-index layers */
    --z-canvas: 1;
    --z-ui-overlay: 10;
    --z-modal: 100;
    --z-debug: 1000;
}
```

### Mobile-First Responsive Design
```css
/* Mobile-first approach */
.ui-panel {
    padding: var(--space-sm);
    font-size: 0.875rem;
}

/* Tablet and up */
@media (min-width: 768px) {
    .ui-panel {
        padding: var(--space-md);
        font-size: 1rem;
    }
}

/* Desktop and up */
@media (min-width: 1024px) {
    .ui-panel {
        padding: var(--space-lg);
        font-size: 1.125rem;
    }
}
```

### Canvas Overlay UI Optimization
```css
/* Canvas should fill viewport */
#game-canvas {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-canvas);
    background: var(--background-color);
}

/* UI overlays */
.ui-overlay {
    position: fixed;
    z-index: var(--z-ui-overlay);
    pointer-events: none; /* Allow canvas interaction */
}

.ui-overlay .interactive {
    pointer-events: auto; /* Enable specific UI elements */
}

/* Debug console overlay */
.debug-console {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: var(--z-debug);
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(4px);
}
```

## @AI-SECTION: pwa-patterns

### Service Worker Structure
```javascript
// sw.js - Basic caching strategy
const CACHE_NAME = 'app-v1.0.0';
const ASSETS = [
    './',
    './index.html',
    './js/main.js',
    './css/styles.css',
    './assets/icons/icon-192.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

### Manifest Configuration
```json
{
    "name": "Application Name",
    "short_name": "App",
    "description": "Application description",
    "start_url": "./",
    "display": "fullscreen",
    "orientation": "landscape-primary",
    "theme_color": "#000000",
    "background_color": "#000000",
    "icons": [
        {
            "src": "assets/icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "assets/icons/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

## @AI-SECTION: responsive-patterns

### Viewport Configuration
```html
<!-- Essential for mobile responsiveness -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">

<!-- Prevent zoom on input focus (mobile) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Touch-Friendly UI Design
```css
/* Touch targets should be at least 44px */
.touch-target {
    min-height: 44px;
    min-width: 44px;
    padding: var(--space-sm);
    
    /* Visual feedback */
    transition: background-color 0.15s ease;
}

.touch-target:hover,
.touch-target:focus {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Remove tap highlights on mobile */
.touch-target {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
}
```

### Flexible Layout Patterns
```css
/* Flexbox for responsive layouts */
.flex-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

@media (min-width: 768px) {
    .flex-container {
        flex-direction: row;
        align-items: center;
    }
}

/* CSS Grid for complex layouts */
.grid-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-md);
}

@media (min-width: 768px) {
    .grid-layout {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
}
```

## @AI-SECTION: accessibility

### Semantic HTML Structure
```html
<!-- Use semantic elements -->
<header class="app-header">
    <h1>Application Title</h1>
    <nav class="main-navigation">
        <button aria-label="Settings">⚙️</button>
    </nav>
</header>

<main class="app-content">
    <section class="game-area">
        <canvas 
            id="game-canvas" 
            role="application"
            aria-label="Game canvas"
            tabindex="0">
        </canvas>
    </section>
    
    <aside class="ui-controls">
        <button type="button" class="action-button">
            <span class="sr-only">Pause Game</span>
            ⏸️
        </button>
    </aside>
</main>
```

### Focus Management
```css
/* Visible focus indicators */
.focusable:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* Screen reader only content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

## @AI-SECTION: performance

### Resource Loading Optimization
```html
<!-- Preload critical resources -->
<link rel="preload" href="js/main.js" as="script">
<link rel="preload" href="css/critical.css" as="style">
<link rel="preload" href="assets/fonts/game-font.woff2" as="font" type="font/woff2" crossorigin>

<!-- Non-blocking CSS -->
<link rel="stylesheet" href="css/non-critical.css" media="print" onload="this.media='all'">

<!-- Lazy loading images -->
<img src="placeholder.jpg" data-src="actual-image.jpg" loading="lazy" alt="Description">
```

### Critical CSS Pattern
```css
/* Inline critical CSS in <head> for first paint */
body {
    margin: 0;
    padding: 0;
    font-family: system-ui, sans-serif;
    background: var(--background-color);
    color: var(--text-color);
}

#game-canvas {
    display: block;
    width: 100vw;
    height: 100vh;
}

/* Loading indicator for immediate feedback */
.loading-screen {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: var(--z-modal);
}
```

## @AI-SECTION: anti-patterns

### Avoid These Patterns
```html
<!-- ❌ Bad: Blocking render -->
<head>
    <script src="large-library.js"></script> <!-- Blocks parsing -->
    <link rel="stylesheet" href="all-styles.css"> <!-- Blocks render -->
</head>

<!-- ✅ Good: Non-blocking -->
<head>
    <link rel="preload" href="large-library.js" as="script">
    <style>/* Critical CSS inline */</style>
</head>
<body>
    <script defer src="large-library.js"></script>
</body>
```

```css
/* ❌ Bad: Fixed pixel values */
.ui-element {
    width: 300px;
    height: 200px;
    font-size: 16px;
}

/* ✅ Good: Responsive units */
.ui-element {
    width: min(90vw, 300px);
    height: auto;
    font-size: clamp(0.875rem, 2.5vw, 1.125rem);
}

/* ❌ Bad: No fallbacks */
.modern-feature {
    display: grid;
    backdrop-filter: blur(10px);
}

/* ✅ Good: Progressive enhancement */
.modern-feature {
    display: block; /* Fallback */
    background: rgba(0, 0, 0, 0.8); /* Fallback */
}

@supports (display: grid) {
    .modern-feature {
        display: grid;
    }
}

@supports (backdrop-filter: blur(10px)) {
    .modern-feature {
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.6);
    }
}
```

---

**🔗 Related**: See `javascript.md` for module loading patterns, `pwa.md` for advanced PWA features, and project-specific instructions for application-specific implementations.