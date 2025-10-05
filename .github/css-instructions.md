# CSS Development Instructions

## Apply to: `client/css/**/*.css` (Stylesheets and UI Styling)

### Context
CSS files in The Drazzan Invasion define the visual aesthetics for a retro sci-fi space shooter with modern responsive design. The styling must work across desktop and mobile platforms while maintaining a consistent game aesthetic.

### Design Philosophy
1. **Retro Sci-Fi Aesthetic**: Dark backgrounds, neon colors, futuristic typography
2. **Mobile-First**: Responsive design prioritizing mobile experience
3. **Canvas Overlay**: UI elements that work with HTML5 Canvas game area
4. **Performance**: Efficient CSS with hardware acceleration where possible
5. **Accessibility**: High contrast ratios and readable text

### Color Palette & Theme

#### Primary Colors
```css
:root {
    /* Main theme colors */
    --primary-bg: #0c0c1e;
    --secondary-bg: #1a1a3e;
    --accent-color: #00ff88;
    --warning-color: #ffaa00;
    --danger-color: #ff6b6b;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --text-muted: #888888;
    
    /* Game-specific colors */
    --player-color: #00ff88;
    --enemy-color: #ff6b6b;
    --laser-color: #00ffff;
    --explosion-color: #ff4400;
    
    /* UI Element colors */
    --button-bg: rgba(0, 255, 136, 0.1);
    --button-border: #00ff88;
    --button-hover: rgba(0, 255, 136, 0.3);
    --overlay-bg: rgba(0, 0, 0, 0.8);
}
```

#### Typography
```css
/* Font stack for retro sci-fi feel */
:root {
    --font-primary: 'Courier New', 'Consolas', monospace;
    --font-secondary: 'Arial', sans-serif;
    
    /* Font sizes */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 2rem;
    --text-4xl: 2.5rem;
}
```

### Layout Patterns

#### Game UI Container
```css
.game-ui-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Allow canvas interactions */
    z-index: 100;
    font-family: var(--font-primary);
    color: var(--text-primary);
}

.game-ui-overlay > * {
    pointer-events: auto; /* Re-enable for UI elements */
}
```

#### Responsive Grid System
```css
.game-grid {
    display: grid;
    gap: 1rem;
    padding: 1rem;
}

/* Mobile first */
.game-grid {
    grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
    .game-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .game-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### Component Styling

#### Buttons
```css
.game-button {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--button-border);
    background: var(--button-bg);
    color: var(--text-primary);
    font-family: var(--font-primary);
    font-size: var(--text-base);
    cursor: pointer;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.game-button:hover {
    background: var(--button-hover);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
}

.game-button:active {
    transform: translateY(0);
}

.game-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* Button variants */
.game-button.primary {
    background: var(--button-hover);
}

.game-button.danger {
    border-color: var(--danger-color);
    background: rgba(255, 107, 107, 0.1);
}

.game-button.danger:hover {
    background: rgba(255, 107, 107, 0.3);
}
```

#### Cards and Panels
```css
.game-panel {
    background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.game-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    padding: 1rem;
    transition: all 0.3s ease;
}

.game-card:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
}
```

#### Form Elements
```css
.game-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
    color: var(--text-primary);
    font-family: var(--font-primary);
    font-size: var(--text-base);
    border-radius: 0.5rem;
    transition: border-color 0.3s ease;
}

.game-input:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.2);
}

.game-input::placeholder {
    color: var(--text-muted);
}
```

### Animation Patterns

#### Sci-Fi Effects
```css
/* Glowing text effect */
.glow-text {
    color: var(--accent-color);
    text-shadow: 0 0 10px var(--accent-color),
                 0 0 20px var(--accent-color),
                 0 0 30px var(--accent-color);
    animation: pulse-glow 2s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
    from {
        text-shadow: 0 0 10px var(--accent-color),
                     0 0 20px var(--accent-color),
                     0 0 30px var(--accent-color);
    }
    to {
        text-shadow: 0 0 5px var(--accent-color),
                     0 0 10px var(--accent-color),
                     0 0 15px var(--accent-color);
    }
}

/* Scanning line effect */
.scan-lines::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        transparent 0%,
        rgba(0, 255, 136, 0.03) 50%,
        transparent 100%
    );
    background-size: 100% 4px;
    animation: scan 2s linear infinite;
    pointer-events: none;
}

@keyframes scan {
    0% { background-position: 0 0; }
    100% { background-position: 0 100%; }
}
```

#### Loading States
```css
.loading-spinner {
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid var(--accent-color);
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-dots::after {
    content: '';
    animation: loading-dots 1.5s steps(4, end) infinite;
}

@keyframes loading-dots {
    0%, 20% { content: ''; }
    40% { content: '.'; }
    60% { content: '..'; }
    80%, 100% { content: '...'; }
}
```

### Responsive Design

#### Mobile Optimization
```css
/* Mobile-first approach */
@media (max-width: 767px) {
    .game-panel {
        padding: 1rem;
        border-radius: 0.5rem;
    }
    
    .game-button {
        padding: 1rem;
        font-size: var(--text-lg);
        min-height: 48px; /* Touch target size */
    }
    
    .game-grid {
        gap: 0.75rem;
        padding: 0.75rem;
    }
}

/* Landscape mobile */
@media (orientation: landscape) and (max-height: 500px) {
    .game-panel {
        padding: 0.75rem;
    }
    
    .game-button {
        padding: 0.5rem 1rem;
    }
}
```

#### Touch Interface
```css
/* Ensure touch targets are accessible */
.touch-target {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Remove hover effects on touch devices */
@media (hover: none) {
    .game-button:hover {
        transform: none;
        box-shadow: none;
    }
}
```

### Performance Optimization

#### Hardware Acceleration
```css
/* Use transform for animations (GPU accelerated) */
.hardware-accelerated {
    transform: translateZ(0);
    will-change: transform;
}

/* Optimize repaints */
.optimize-repaint {
    contain: layout style paint;
}
```

#### Efficient Selectors
```css
/* Good: Specific, efficient selectors */
.game-ui .player-list .player-item { }

/* Avoid: Expensive universal selectors */
/* * { box-sizing: border-box; } */

/* Better: Scoped universal selectors */
.game-ui * { box-sizing: border-box; }
```

### Dark Mode Support

#### Theme Switching
```css
/* Light mode overrides (if needed) */
@media (prefers-color-scheme: light) {
    :root {
        --primary-bg: #f0f0f0;
        --text-primary: #000000;
        /* Adjust other colors as needed */
    }
}

/* Force dark mode for game */
.game-container {
    color-scheme: dark;
}
```

### Canvas Integration

#### Overlay Positioning
```css
/* UI elements over canvas */
.canvas-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

.canvas-overlay .ui-element {
    pointer-events: auto;
    position: absolute;
}

/* HUD elements */
.hud-top-left { top: 1rem; left: 1rem; }
.hud-top-right { top: 1rem; right: 1rem; }
.hud-bottom-left { bottom: 1rem; left: 1rem; }
.hud-bottom-right { bottom: 1rem; right: 1rem; }
.hud-center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
```

### Anti-Patterns to Avoid

❌ **Don't:**
```css
/* Avoid expensive box-shadow animations */
.bad-animation {
    transition: box-shadow 0.3s ease;
}

/* Avoid !important unless absolutely necessary */
.bad-override {
    color: red !important;
}

/* Avoid fixed pixel values for responsive design */
.bad-responsive {
    width: 300px;
    height: 200px;
}
```

✅ **Do:**
```css
/* Use transform for performant animations */
.good-animation {
    transition: transform 0.3s ease;
}

/* Use proper specificity instead of !important */
.game-ui .good-override {
    color: var(--danger-color);
}

/* Use relative units and CSS custom properties */
.good-responsive {
    width: min(300px, 90vw);
    height: clamp(200px, 50vh, 400px);
}
```

This ensures all CSS follows the established design system while maintaining performance and accessibility across all devices and contexts.

## AI-Assisted CSS Development

### AI Effectiveness in CSS Work
**High AI Value:**
- Responsive grid and flexbox layouts
- CSS custom property (variable) systems
- Animation and transition patterns
- Cross-browser compatibility fixes

**Medium AI Value:**
- Color scheme and theming systems
- Component-specific styling patterns
- Mobile-first responsive breakpoints

**Human-Led:**
- Visual design decisions and aesthetics
- User experience and interaction design
- Performance optimization trade-offs
- Game-specific UI/UX considerations

### Feature Branch CSS Development
```bash
# CSS changes typically accompany feature work:
client/css/styles.css                  # Main stylesheet updates
client/js/pwa/game-mode-ui.js          # CSS-in-JS for components
client/index.html                      # Related markup changes
docs/ui-design-system.md               # Design documentation
```

### Session-Based CSS Workflow
1. **Component Analysis**: AI helps identify styling requirements
2. **Pattern Generation**: AI creates CSS following established patterns
3. **Responsive Design**: AI generates mobile-first breakpoints
4. **Integration**: Human review ensures design consistency

### Git Staging for CSS Work
```bash
# Good: Stage CSS with related components
git add client/css/styles.css          # Stylesheet changes
git add client/js/pwa/*ui*.js          # Components with CSS-in-JS
git add docs/design-system.md          # Updated design docs

# Consider staging order for related changes
git add client/css/                    # All styling updates
git add client/js/pwa/                 # Related component updates
```

### AI CSS Generation Patterns
```css
/* AI-Generated Component Styling */
.ai-generated-component {
    /* AI excels at consistent pattern application */
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    
    /* AI can suggest accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
    
    /* AI helps with responsive patterns */
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
    }
}

/* Human-designed aesthetics */
.game-specific-styling {
    /* Visual design requires human creativity */
    background: linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 100%);
    box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
}
```