---
ai_context:
  type: tech-specific
  role: technology-guide
  scope: generic
  technology: canvas-wasm
  categories: [canvas, webassembly, graphics, performance]
  format_version: "2.0"
last_updated: "2025-11-23"
---

<!-- AI-CONTEXT: canvas-wasm-patterns -->
<!-- SCOPE: generic -->

# Canvas & WebAssembly Instructions for Browser-Native Applications

## @AI-SECTION: wasm-architecture

### WebAssembly Browser-Server Pattern
**Pattern**: WASM modules acting as high-performance game servers within browser
```javascript
// WASM module structure for browser-based P2P servers
class WasmLoader {
    constructor() {
        this.modules = new Map();
        this.isSupported = this.checkWasmSupport();
    }
    
    async loadModule(name, wasmPath) {
        if (!this.isSupported) {
            console.warn(`[WASM] WebAssembly not supported, using fallback for ${name}`);
            return null;
        }
        
        try {
            const wasmModule = await WebAssembly.instantiateStreaming(fetch(wasmPath));
            this.modules.set(name, wasmModule);
            console.log(`[WASM] Loaded ${name} successfully`);
            return wasmModule;
        } catch (error) {
            console.error(`[WASM] Failed to load ${name}:`, error);
            return null; // Graceful degradation
        }
    }
    
    checkWasmSupport() {
        return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
    }
    
    // P2P Authority Pattern - each peer can host
    async initializePeerServer(moduleType) {
        const module = this.modules.get(moduleType);
        if (!module) {
            console.warn(`[WASM] ${moduleType} not available, using JS fallback`);
            return this.initializeJavaScriptFallback(moduleType);
        }
        
        return module;
    }
}
```

### JavaScript Bridge Pattern
**Pattern**: Safe integration between WASM modules and browser-native code
```javascript
// Bridge pattern for WASM integration
class GameServerBridge {
    constructor(wasmModule) {
        this.wasmModule = wasmModule;
        this.isWasmAvailable = !!wasmModule;
        
        // Always provide JavaScript fallback
        this.fallbackImplementation = new JavaScriptGameServer();
    }
    
    // Method calls that work with or without WASM
    processGameUpdate(gameState) {
        if (this.isWasmAvailable) {
            try {
                return this.wasmModule.instance.exports.process_game_update(gameState);
            } catch (error) {
                console.warn('[WASM] Game update failed, using fallback:', error);
                this.isWasmAvailable = false; // Disable for this session
            }
        }
        
        // JavaScript fallback always available
        return this.fallbackImplementation.processGameUpdate(gameState);
    }
}
```

## @AI-SECTION: canvas-patterns

### Canvas Setup and Management
```javascript
class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
    }
    
    setupCanvas() {
        // Set up proper canvas sizing
        this.resizeCanvas();
        
        // Optimize for performance
        this.ctx.imageSmoothingEnabled = false; // For pixel art
        
        // Set up coordinate system
        this.setupCoordinateSystem();
    }
    
    resizeCanvas() {
        // Handle high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        // CSS size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Prevent context menu on right-click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Focus management for keyboard input
        this.canvas.addEventListener('click', () => this.canvas.focus());
        this.canvas.tabIndex = 0; // Make focusable
    }
}
```

### Efficient Rendering Patterns
```javascript
class Renderer {
    constructor(canvasManager) {
        this.canvas = canvasManager;
        this.ctx = canvasManager.ctx;
        this.frameCount = 0;
        this.lastRenderTime = 0;
        
        // Performance optimization
        this.dirtyRectangles = [];
        this.useOffscreenCanvas = this.supportsOffscreenCanvas();
    }
    
    // Main render loop with 60 FPS targeting
    render(currentTime) {
        const deltaTime = currentTime - this.lastRenderTime;
        
        // Skip frames if running too fast
        if (deltaTime < 16.67) { // ~60 FPS
            requestAnimationFrame(this.render.bind(this));
            return;
        }
        
        this.clearCanvas();
        this.renderScene(deltaTime);
        this.frameCount++;
        this.lastRenderTime = currentTime;
        
        requestAnimationFrame(this.render.bind(this));
    }
    
    clearCanvas() {
        // Full clear for simple scenes
        this.ctx.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
        
        // Or dirty rectangle clearing for complex scenes
        // this.clearDirtyRectangles();
    }
    
    // Sprite rendering with caching
    drawSprite(sprite, x, y, width = null, height = null) {
        if (!sprite.loaded) return;
        
        const w = width || sprite.width;
        const h = height || sprite.height;
        
        this.ctx.drawImage(sprite.image, x, y, w, h);
        
        // Track dirty rectangle for optimization
        this.addDirtyRectangle(x, y, w, h);
    }
    
    // Text rendering with proper alignment
    drawText(text, x, y, options = {}) {
        const {
            font = '16px monospace',
            fillStyle = '#ffffff',
            textAlign = 'left',
            textBaseline = 'top',
            maxWidth = null
        } = options;
        
        this.ctx.save();
        this.ctx.font = font;
        this.ctx.fillStyle = fillStyle;
        this.ctx.textAlign = textAlign;
        this.ctx.textBaseline = textBaseline;
        
        if (maxWidth) {
            this.ctx.fillText(text, x, y, maxWidth);
        } else {
            this.ctx.fillText(text, x, y);
        }
        
        this.ctx.restore();
    }
}
```

### Animation and Easing Patterns
```javascript
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1
        };
    }
    
    animate(target, property, from, to, duration, easing = 'easeInOutQuad') {
        const animationId = `${target.id || 'anonymous'}_${property}`;
        const easingFn = this.easingFunctions[easing] || this.easingFunctions.linear;
        
        const animation = {
            target,
            property,
            from,
            to,
            duration,
            easingFn,
            startTime: performance.now(),
            active: true
        };
        
        this.animations.set(animationId, animation);
        return animationId;
    }
    
    update(currentTime) {
        for (const [id, animation] of this.animations) {
            if (!animation.active) continue;
            
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            const easedProgress = animation.easingFn(progress);
            
            const currentValue = animation.from + 
                (animation.to - animation.from) * easedProgress;
            
            animation.target[animation.property] = currentValue;
            
            if (progress >= 1) {
                animation.active = false;
                this.animations.delete(id);
            }
        }
    }
    
    stopAnimation(animationId) {
        const animation = this.animations.get(animationId);
        if (animation) {
            animation.active = false;
            this.animations.delete(animationId);
        }
    }
}
```

## @AI-SECTION: webassembly-patterns

### WASM Module Loading and Integration
```javascript
class WasmManager {
    constructor() {
        this.modules = new Map();
        this.isSupported = this.checkWasmSupport();
        this.fallbacks = new Map();
    }
    
    checkWasmSupport() {
        try {
            if (typeof WebAssembly === 'object' &&
                typeof WebAssembly.instantiate === 'function') {
                // Test basic WASM support
                const module = new WebAssembly.Module(
                    Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
                );
                return WebAssembly.validate(module);
            }
        } catch (error) {
            console.warn('WebAssembly not supported:', error);
        }
        return false;
    }
    
    async loadModule(name, wasmPath, fallbackModule = null) {
        if (!this.isSupported && fallbackModule) {
            console.log(`Loading fallback module for ${name}`);
            this.modules.set(name, fallbackModule);
            return fallbackModule;
        }
        
        try {
            const wasmResponse = await fetch(wasmPath);
            const wasmBytes = await wasmResponse.arrayBuffer();
            
            const wasmModule = await WebAssembly.instantiate(wasmBytes, {
                env: this.createWasmEnvironment()
            });
            
            const moduleWrapper = this.createModuleWrapper(wasmModule);
            this.modules.set(name, moduleWrapper);
            
            console.log(`WASM module '${name}' loaded successfully`);
            return moduleWrapper;
            
        } catch (error) {
            console.error(`Failed to load WASM module '${name}':`, error);
            
            if (fallbackModule) {
                console.log(`Using fallback for ${name}`);
                this.modules.set(name, fallbackModule);
                return fallbackModule;
            }
            
            throw error;
        }
    }
    
    createWasmEnvironment() {
        return {
            log: (message) => console.log(`[WASM] ${message}`),
            error: (message) => console.error(`[WASM] ${message}`),
            // Memory management functions
            malloc: (size) => this.allocateMemory(size),
            free: (ptr) => this.freeMemory(ptr)
        };
    }
    
    createModuleWrapper(wasmModule) {
        return {
            instance: wasmModule.instance,
            exports: wasmModule.instance.exports,
            memory: wasmModule.instance.exports.memory,
            
            // Helper methods
            writeString: (str, ptr) => this.writeStringToMemory(str, ptr, wasmModule),
            readString: (ptr, length) => this.readStringFromMemory(ptr, length, wasmModule),
            writeFloat32Array: (array, ptr) => this.writeFloat32ArrayToMemory(array, ptr, wasmModule)
        };
    }
}
```

### High-Performance Computations with WASM
```javascript
class PerformanceCriticalOperations {
    constructor(wasmManager) {
        this.wasm = wasmManager;
        this.mathModule = null;
        this.physicsModule = null;
    }
    
    async initialize() {
        // Load performance-critical modules
        this.mathModule = await this.wasm.loadModule(
            'math',
            './wasm/math-operations.wasm',
            new JSMathFallback() // Pure JS fallback
        );
        
        this.physicsModule = await this.wasm.loadModule(
            'physics',
            './wasm/physics-engine.wasm',
            new JSPhysicsFallback()
        );
    }
    
    // Vector operations (WASM optimized)
    calculateVectorOperations(vectorsArray) {
        if (this.mathModule.instance) {
            // Use WASM for bulk vector operations
            const inputPtr = this.mathModule.writeFloat32Array(vectorsArray);
            const resultPtr = this.mathModule.exports.process_vectors(
                inputPtr, 
                vectorsArray.length
            );
            return this.mathModule.readFloat32Array(resultPtr, vectorsArray.length);
        } else {
            // Fallback to JavaScript
            return this.mathModule.processVectors(vectorsArray);
        }
    }
    
    // Physics simulation (WASM optimized)
    updatePhysicsSimulation(entities, deltaTime) {
        if (this.physicsModule.instance) {
            // Serialize entity data for WASM
            const entityData = this.serializeEntities(entities);
            const inputPtr = this.physicsModule.writeFloat32Array(entityData);
            
            this.physicsModule.exports.update_physics(
                inputPtr,
                entities.length,
                deltaTime
            );
            
            // Read back updated positions
            const results = this.physicsModule.readFloat32Array(inputPtr, entityData.length);
            return this.deserializeEntities(results);
        } else {
            // JavaScript fallback
            return this.physicsModule.updateSimulation(entities, deltaTime);
        }
    }
}
```

## @AI-SECTION: performance-optimization

### Memory Management for Canvas and WASM
```javascript
class MemoryManager {
    constructor() {
        this.imageCache = new Map();
        this.wasmMemoryPools = new Map();
        this.canvasBuffers = new Map();
        
        // Monitor memory usage
        this.setupMemoryMonitoring();
    }
    
    setupMemoryMonitoring() {
        if (performance.memory) {
            setInterval(() => {
                const memInfo = performance.memory;
                if (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize > 0.9) {
                    console.warn('High memory usage detected, triggering cleanup');
                    this.performMemoryCleanup();
                }
            }, 5000);
        }
    }
    
    // Image caching with automatic cleanup
    async loadImage(url) {
        if (this.imageCache.has(url)) {
            return this.imageCache.get(url);
        }
        
        const image = new Image();
        image.crossOrigin = 'anonymous';
        
        return new Promise((resolve, reject) => {
            image.onload = () => {
                // Cache with metadata
                const cacheEntry = {
                    image,
                    lastUsed: Date.now(),
                    size: image.width * image.height * 4 // Estimated bytes
                };
                
                this.imageCache.set(url, cacheEntry);
                resolve(image);
            };
            
            image.onerror = reject;
            image.src = url;
        });
    }
    
    // WASM memory pool management
    createWasmMemoryPool(moduleId, initialSize = 1024 * 1024) {
        const pool = {
            buffer: new ArrayBuffer(initialSize),
            allocated: new Set(),
            freeBlocks: [{ start: 0, size: initialSize }],
            totalSize: initialSize
        };
        
        this.wasmMemoryPools.set(moduleId, pool);
        return pool;
    }
    
    allocateWasmMemory(moduleId, size) {
        const pool = this.wasmMemoryPools.get(moduleId);
        if (!pool) throw new Error(`Memory pool ${moduleId} not found`);
        
        // Find suitable free block
        const blockIndex = pool.freeBlocks.findIndex(block => block.size >= size);
        if (blockIndex === -1) {
            throw new Error(`Insufficient memory in pool ${moduleId}`);
        }
        
        const block = pool.freeBlocks[blockIndex];
        const allocation = { start: block.start, size };
        
        // Update free block
        if (block.size > size) {
            block.start += size;
            block.size -= size;
        } else {
            pool.freeBlocks.splice(blockIndex, 1);
        }
        
        pool.allocated.add(allocation);
        return allocation.start;
    }
    
    performMemoryCleanup() {
        // Clean up unused images
        const now = Date.now();
        const maxAge = 300000; // 5 minutes
        
        for (const [url, entry] of this.imageCache) {
            if (now - entry.lastUsed > maxAge) {
                this.imageCache.delete(url);
            }
        }
        
        // Trigger garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }
}
```

### Canvas Rendering Optimizations
```javascript
class OptimizedRenderer {
    constructor(canvasManager) {
        this.canvas = canvasManager;
        this.ctx = canvasManager.ctx;
        
        // Create offscreen canvases for layers
        this.backgroundLayer = this.createOffscreenCanvas();
        this.entityLayer = this.createOffscreenCanvas();
        this.uiLayer = this.createOffscreenCanvas();
        
        // Performance tracking
        this.renderStats = {
            frameTime: 0,
            drawCalls: 0,
            lastFpsUpdate: 0,
            fps: 0
        };
    }
    
    createOffscreenCanvas() {
        if (typeof OffscreenCanvas !== 'undefined') {
            const offscreen = new OffscreenCanvas(
                this.canvas.canvas.width,
                this.canvas.canvas.height
            );
            return {
                canvas: offscreen,
                ctx: offscreen.getContext('2d')
            };
        } else {
            // Fallback to regular canvas
            const canvas = document.createElement('canvas');
            canvas.width = this.canvas.canvas.width;
            canvas.height = this.canvas.canvas.height;
            return {
                canvas,
                ctx: canvas.getContext('2d')
            };
        }
    }
    
    renderWithLayers(entities, ui, background) {
        const startTime = performance.now();
        
        // Render background (infrequent updates)
        if (background.dirty) {
            this.renderBackground(this.backgroundLayer.ctx, background);
            background.dirty = false;
        }
        
        // Clear and render entities
        this.entityLayer.ctx.clearRect(0, 0, 
            this.entityLayer.canvas.width, 
            this.entityLayer.canvas.height
        );
        this.renderEntities(this.entityLayer.ctx, entities);
        
        // Render UI (frequent updates)
        this.uiLayer.ctx.clearRect(0, 0,
            this.uiLayer.canvas.width,
            this.uiLayer.canvas.height
        );
        this.renderUI(this.uiLayer.ctx, ui);
        
        // Composite layers
        this.ctx.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
        this.ctx.drawImage(this.backgroundLayer.canvas, 0, 0);
        this.ctx.drawImage(this.entityLayer.canvas, 0, 0);
        this.ctx.drawImage(this.uiLayer.canvas, 0, 0);
        
        // Update performance stats
        this.updateRenderStats(performance.now() - startTime);
    }
    
    updateRenderStats(frameTime) {
        this.renderStats.frameTime = frameTime;
        this.renderStats.drawCalls++;
        
        const now = performance.now();
        if (now - this.renderStats.lastFpsUpdate > 1000) {
            this.renderStats.fps = Math.round(1000 / this.renderStats.frameTime);
            this.renderStats.lastFpsUpdate = now;
            this.renderStats.drawCalls = 0;
        }
    }
}
```

## @AI-SECTION: file-patterns

### Apply to: `**/canvas/*.js` (Canvas Components)
- Implement proper canvas lifecycle management
- Use requestAnimationFrame for smooth animations
- Optimize for 60 FPS performance
- Handle high-DPI displays correctly

### Apply to: `**/wasm/*.js` (WASM Integration)
- Provide JavaScript fallbacks for all WASM modules
- Handle WASM loading failures gracefully
- Implement proper memory management
- Use WASM for performance-critical operations only

### Apply to: `**/graphics/*.js` (Graphics Utilities)
- Cache frequently used graphics resources
- Use object pooling for temporary graphics objects
- Implement dirty rectangle tracking for partial redraws
- Optimize sprite batching and texture atlases

## @AI-SECTION: anti-patterns

### Avoid These Patterns
```javascript
// ❌ Bad: Synchronous WASM loading
const wasmModule = WebAssembly.instantiateSync(wasmBytes);

// ✅ Good: Asynchronous with fallback
async function loadWasmWithFallback() {
    try {
        return await WebAssembly.instantiate(wasmBytes);
    } catch (error) {
        return new JavaScriptFallback();
    }
}

// ❌ Bad: Canvas operations without context save/restore
function drawWithStyle() {
    ctx.fillStyle = '#ff0000';
    ctx.globalAlpha = 0.5;
    // ... drawing operations
    // Properties persist and affect subsequent draws
}

// ✅ Good: Proper context management
function drawWithStyle() {
    ctx.save();
    ctx.fillStyle = '#ff0000';
    ctx.globalAlpha = 0.5;
    // ... drawing operations
    ctx.restore(); // Clean state for next operations
}

// ❌ Bad: Memory leaks in animation loops
function animate() {
    const entities = new Array(1000).fill(0).map(() => new Entity());
    // entities created every frame, never cleaned up
    requestAnimationFrame(animate);
}

// ✅ Good: Object pooling and reuse
class EntityPool {
    constructor() {
        this.pool = [];
        this.active = [];
    }
    
    acquire() {
        return this.pool.pop() || new Entity();
    }
    
    release(entity) {
        entity.reset();
        this.pool.push(entity);
    }
}
```

---

**🔗 Related**: See `javascript.md` for general patterns, `pwa-webrtc.md` for performance considerations in multiplayer contexts, and project-specific instructions for application-specific graphics implementations.