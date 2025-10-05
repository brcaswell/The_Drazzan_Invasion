// Debug Console - Developer cheats and testing commands
class DebugConsole {
    constructor() {
        this.isVisible = false;
        this.commands = new Map();
        this.commandHistory = [];
        this.historyIndex = -1;
        this.element = null;
        this.input = null;
        this.output = null;
        this.enabled = false; // Only enable in single player mode

        // Autocomplete system
        this.autocompleteVisible = false;
        this.autocompleteElement = null;
        this.autocompleteSuggestions = [];
        this.autocompleteIndex = -1;

        // Console state management
        this.hasShownInitialHelp = false;
        this.lastCommands = [];

        this.setupCommands();
        this.createUI();
        this.setupEventListeners();

        console.log('[Debug] Debug console initialized. Available in single player mode only.');
        console.log('[Debug] Commands registered:', Array.from(this.commands.keys()));
    }

    setupCommands() {
        // Game Progression commands (shown first in help)
        this.commands.set('skipToBoss', {
            description: 'Skip directly to boss fight (Level 4)',
            execute: () => this.skipToBoss()
        });

        this.commands.set('setLevel', {
            description: 'Set current level (1-4)',
            execute: (levelNum) => this.setLevel(parseInt(levelNum))
        });

        this.commands.set('setScore', {
            description: 'Set current score',
            execute: (newScore) => this.setScore(parseInt(newScore))
        });

        // Player Cheats commands (shown second in help)
        this.commands.set('invincible', {
            description: 'Toggle player invincibility',
            execute: () => this.toggleInvincibility()
        });

        this.commands.set('doubleFire', {
            description: 'Toggle double fire mode',
            execute: () => this.toggleDoubleFire()
        });

        this.commands.set('addLives', {
            description: 'Add extra lives to player',
            execute: (lives) => this.addLives(parseInt(lives) || 1)
        });

        this.commands.set('killAll', {
            description: 'Destroy all enemies on screen',
            execute: () => this.killAllEnemies()
        });

        // Utility commands (shown third in help)
        this.commands.set('gameState', {
            description: 'Show current game state variables',
            execute: () => this.showGameState()
        });

        this.commands.set('resetGame', {
            description: 'Reset game to initial state',
            execute: () => this.resetGame()
        });

        this.commands.set('sync', {
            description: 'Force synchronize all game variables',
            execute: () => this.forceSync()
        });

        this.commands.set('pause', {
            description: 'Toggle game pause state',
            execute: () => this.togglePause()
        });

        this.commands.set('features', {
            description: 'Show all feature flags status',
            execute: () => this.showFeatures()
        });

        this.commands.set('clear', {
            description: 'Clear console output',
            execute: () => this.clearOutput()
        });

        // Special commands (not shown in main help)
        this.commands.set('help', {
            description: 'Show all available commands',
            execute: () => this.showHelp()
        });

        // Developer-only commands (not shown in help)
        this.commands.set('enableFeature', {
            description: 'Enable a feature flag (dev only)',
            execute: (flagName) => this.enableFeature(flagName?.toUpperCase())
        });

        this.commands.set('disableFeature', {
            description: 'Disable a feature flag (dev only)',
            execute: (flagName) => this.disableFeature(flagName?.toUpperCase())
        });
    }

    createUI() {
        // Main console container
        this.element = document.createElement('div');
        this.element.id = 'debugConsole';
        this.element.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            width: 400px;
            height: 300px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff88;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #00ff88;
            z-index: 10000;
            display: none;
            flex-direction: column;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 5px 10px;
            background: rgba(0, 255, 136, 0.2);
            border-bottom: 1px solid #00ff88;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <span>Debug Console</span>
            <span style="cursor: pointer; color: #ff6666;" onclick="window.debugConsole.toggle()">×</span>
        `;

        // Output area
        this.output = document.createElement('div');
        this.output.style.cssText = `
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.5);
        `;

        // Input area
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            padding: 5px;
            border-top: 1px solid #00ff88;
            background: rgba(0, 0, 0, 0.7);
        `;

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Enter command (try "help")';
        this.input.style.cssText = `
            width: 100%;
            background: transparent;
            border: none;
            color: #00ff88;
            font-family: inherit;
            font-size: inherit;
            outline: none;
        `;

        inputContainer.appendChild(this.input);
        this.element.appendChild(header);
        this.element.appendChild(this.output);
        this.element.appendChild(inputContainer);

        // Create autocomplete dropdown
        this.createAutocompleteUI();

        document.body.appendChild(this.element);

        // Initial welcome message
        this.log('Debug Console Ready! Type "help" for commands.');
        this.log('Press Ctrl+Space for command suggestions', '#888888');
    }

    createAutocompleteUI() {
        this.autocompleteElement = document.createElement('div');
        this.autocompleteElement.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            max-height: 150px;
            background: rgba(0, 0, 0, 0.95);
            border: 1px solid #00ff88;
            border-bottom: none;
            border-radius: 5px 5px 0 0;
            display: none;
            overflow-y: auto;
            z-index: 1000;
        `;

        // Position relative to input container
        this.input.parentElement.style.position = 'relative';
        this.input.parentElement.appendChild(this.autocompleteElement);
    }

    setupEventListeners() {
        // Toggle console with ~ or F12 (only in single player)
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~' || e.key === 'F12') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Command input handling
        this.input.addEventListener('keydown', (e) => {
            // Handle autocomplete navigation when visible
            if (this.autocompleteVisible) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateAutocomplete(-1);
                    return;
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateAutocomplete(1);
                    return;
                } else if (e.key === 'Tab' || e.key === 'Enter') {
                    e.preventDefault();
                    this.selectAutocomplete();
                    return;
                } else if (e.key === 'Escape') {
                    this.hideAutocomplete();
                    return;
                }
            }

            // Regular command handling
            if (e.key === 'Enter') {
                this.executeCommand(this.input.value.trim());
                this.input.value = '';
                this.hideAutocomplete();
            } else if (e.key === 'ArrowUp' && !this.autocompleteVisible) {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown' && !this.autocompleteVisible) {
                e.preventDefault();
                this.navigateHistory(1);
            } else if (e.ctrlKey && e.key === ' ') {
                e.preventDefault();
                this.showAutocomplete();
            } else if (e.key === 'Escape') {
                this.hideAutocomplete();
            }
        });

        // Hide autocomplete when input loses focus
        this.input.addEventListener('blur', () => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => this.hideAutocomplete(), 100);
        });

        // Show autocomplete on input changes
        this.input.addEventListener('input', () => {
            if (this.input.value.trim()) {
                this.updateAutocomplete();
            } else {
                this.hideAutocomplete();
            }
        });
    }

    toggle() {
        // Check if we're in single player mode
        if (!this.isSinglePlayerMode()) {
            console.log('[Debug] Debug console only available in single player mode');
            return;
        }

        this.isVisible = !this.isVisible;
        this.element.style.display = this.isVisible ? 'flex' : 'none';

        if (this.isVisible) {
            // Pause game when console opens
            if (typeof window.pauseGame === 'function') {
                window.pauseGame();
            }

            // Clear output and restore state
            this.clearOutput();

            // Show initial help if first time, or restore last 2 commands
            if (!this.hasShownInitialHelp) {
                this.log('Debug Console - Single Player Mode Only');
                this.log('Type "help" for available commands.');
                this.log('Game paused while console is open.');
                this.hasShownInitialHelp = true;
            } else {
                this.log('Debug Console - Single Player Mode Only');
                this.log('Game paused while console is open.');

                // Show last 2 commands from history
                const recentCommands = this.lastCommands.slice(-2);
                recentCommands.forEach(cmd => {
                    this.log('> ' + cmd.command, '#ffaa00');
                    this.log(cmd.result, '#cccccc');
                });
            }

            this.input.focus();
        } else {
            // Resume game when console closes
            if (typeof window.resumeGame === 'function') {
                window.resumeGame();
            }
        }
    }

    // Check if we're in single player mode
    isSinglePlayerMode() {
        // Check various indicators that we're in single player
        const gameModeManager = window.gameModeManager;
        if (gameModeManager && gameModeManager.currentMode === 'single') {
            return true;
        }

        // Check if we're not in PWA mode selection (fallback check)
        const gameModeUI = document.getElementById('gameModeUI');
        if (!gameModeUI || gameModeUI.style.display === 'none') {
            return true; // Assume single player if mode selection not visible
        }

        return false;
    }

    executeCommand(commandLine) {
        if (!commandLine) return;

        // Double check we're still in single player mode
        if (!this.isSinglePlayerMode()) {
            this.log('Debug console only available in single player mode!', '#ff6666');
            return;
        }

        this.commandHistory.push(commandLine);
        this.historyIndex = this.commandHistory.length;

        this.log(`> ${commandLine}`, '#ffaa00');

        const [command, ...args] = commandLine.split(' ');
        const cmd = this.commands.get(command);

        console.log(`[Debug] Looking for command: "${command}", found:`, !!cmd);
        console.log(`[Debug] Available commands:`, Array.from(this.commands.keys()));

        if (cmd) {
            try {
                const result = cmd.execute(...args);

                // Track command in history (limit to last 10)
                this.lastCommands.push({
                    command: commandLine,
                    result: result || 'Command executed'
                });
                if (this.lastCommands.length > 10) {
                    this.lastCommands.shift();
                }

                if (result !== undefined && result !== null) {
                    this.log(result.toString());
                }
            } catch (error) {
                this.log(`Error: ${error.message}`, '#ff6666');
                console.error('[Debug] Command execution error:', error);
            }
        } else {
            this.log(`Unknown command: ${command}. Type "help" for available commands.`, '#ff6666');
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        this.historyIndex += direction;
        this.historyIndex = Math.max(0, Math.min(this.historyIndex, this.commandHistory.length));

        if (this.historyIndex < this.commandHistory.length) {
            this.input.value = this.commandHistory[this.historyIndex];
        } else {
            this.input.value = '';
        }
    }

    log(message, color = '#00ff88') {
        const line = document.createElement('div');
        line.style.color = color;
        line.style.marginBottom = '2px';
        line.textContent = message;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    // Command implementations
    skipToBoss() {
        // Check if game variables are available
        const gameVars = ['level', 'enemiesDestroyed', 'enemiesNeeded', 'bossFightStarted', 'bossActive'];
        const missing = gameVars.filter(v => typeof window[v] === 'undefined');

        if (missing.length > 0) {
            this.log(`Missing game variables: ${missing.join(', ')}`, '#ff6666');
            return 'Error: Game not running or variables not available. Try starting single player mode first.';
        }

        // Force sync global variables to local scope first
        this.syncGlobalVariables();

        // Set up boss fight conditions
        window.level = 4;
        window.enemiesDestroyed = window.enemiesNeeded || 15;
        window.bossFightStarted = false;
        window.bossActive = false;
        window.drazzanBoss = null;
        window.bossWarningActive = false;
        window.bossWarningTimer = 0;
        window.endCinematicActive = false;

        // Update local variables through window object assignment
        try {
            // Access global scope variables
            if (typeof window.eval === 'function') {
                window.eval('level = 4');
                window.eval('enemiesDestroyed = ' + window.enemiesDestroyed);
                window.eval('bossFightStarted = false');
                window.eval('bossActive = false');
                window.eval('drazzanBoss = null');
                window.eval('bossWarningActive = false');
                window.eval('bossWarningTimer = 0');
                window.eval('endCinematicActive = false');
            }
        } catch (e) {
            this.log('Warning: Could not sync all local variables: ' + e.message, '#ffaa00');
        }

        // Clear existing enemies and boss-related objects
        if (window.enemies && Array.isArray(window.enemies)) {
            window.enemies.length = 0;
        }
        if (window.enemyLasers && Array.isArray(window.enemyLasers)) {
            window.enemyLasers.length = 0;
        }
        if (window.bossLasers && Array.isArray(window.bossLasers)) {
            window.bossLasers.length = 0;
        }

        // Final sync to ensure everything is updated
        this.syncGlobalVariables();

        this.log('Set level = 4, enemiesDestroyed = ' + window.enemiesDestroyed, '#00ff88');
        this.log('Cleared all enemies and boss state', '#00ff88');
        this.log('Boss fight will trigger on next game update cycle', '#00ff88');

        return 'Successfully skipped to Level 4 boss fight!';
    }

    setLevel(levelNum) {
        if (isNaN(levelNum) || levelNum < 1 || levelNum > 4) {
            return 'Error: Level must be between 1 and 4';
        }

        if (typeof window.level !== 'undefined') {
            window.level = levelNum;

            // Sync to local variable if possible
            try {
                if (typeof window.eval === 'function') {
                    window.eval('level = ' + levelNum);
                }
            } catch (e) {
                this.log('Warning: Could not sync local level variable', '#ffaa00');
            }

            this.syncGlobalVariables();
            return `Level set to ${levelNum}`;
        } else {
            return 'Error: Game not running';
        }
    }

    setScore(newScore) {
        if (isNaN(newScore) || newScore < 0) {
            return 'Error: Score must be a positive number';
        }

        if (typeof window.score !== 'undefined') {
            window.score = newScore;

            // Sync to local variable if possible
            try {
                if (typeof window.eval === 'function') {
                    window.eval('score = ' + newScore);
                }
            } catch (e) {
                this.log('Warning: Could not sync local score variable', '#ffaa00');
            }

            this.syncGlobalVariables();
            return `Score set to ${newScore}`;
        } else {
            return 'Error: Game not running';
        }
    }

    toggleInvincibility() {
        // Check multiple possible locations for player object
        let player = window.player;
        if (!player && typeof window.gameLoop !== 'undefined') {
            player = window.gameLoop.player;
        }
        if (!player && typeof player !== 'undefined') {
            player = window.player;
        }

        if (player && typeof player === 'object') {
            player.invincible = !player.invincible;
            // Also update global reference
            if (window.player) window.player.invincible = player.invincible;
            return `Player invincibility: ${player.invincible ? 'ON' : 'OFF'}`;
        } else {
            // Debug info to help troubleshoot
            this.log('Debug: Checking player access...', '#ffaa00');
            this.log(`window.player: ${typeof window.player}`, '#cccccc');
            this.log(`global player: ${typeof player}`, '#cccccc');
            return 'Error: Player object not found. Make sure game is running.';
        }
    }

    toggleDoubleFire() {
        if (typeof window.doubleFire !== 'undefined') {
            window.doubleFire = !window.doubleFire;
            return `Double fire mode: ${window.doubleFire ? 'ON' : 'OFF'}`;
        } else {
            return 'Error: Double fire variable not available';
        }
    }

    killAllEnemies() {
        let killed = 0;

        if (window.enemies && Array.isArray(window.enemies)) {
            killed += window.enemies.length;
            window.enemies.length = 0;
        }

        if (window.asteroids && Array.isArray(window.asteroids)) {
            killed += window.asteroids.length;
            window.asteroids.length = 0;
        }

        return `Destroyed ${killed} enemies`;
    }

    addLives(lives) {
        if (typeof window.player !== 'undefined' && window.player && typeof window.player.lives !== 'undefined') {
            window.player.lives += lives;
            return `Added ${lives} lives. Total: ${window.player.lives}`;
        } else {
            return 'Error: Player lives not available';
        }
    }

    resetGame() {
        // Preserve debug console state before reset
        const wasVisible = this.isVisible;
        const wasPaused = window.gamePaused || false;

        if (typeof window.restartGame === 'function') {
            window.restartGame();

            // Restore debug console visibility after reset
            if (wasVisible && !this.isVisible) {
                this.show();
            }

            // Log the reset with state information
            this.log('Game reset to initial state', '#00ff88');
            if (wasPaused) {
                this.log('Note: Game was paused before reset - now unpaused', '#ffaa00');
            }

            return 'Game reset to initial state';
        } else if (typeof restartGame === 'function') {
            restartGame();

            // Restore debug console visibility after reset
            if (wasVisible && !this.isVisible) {
                this.show();
            }

            this.log('Game reset to initial state', '#00ff88');
            if (wasPaused) {
                this.log('Note: Game was paused before reset - now unpaused', '#ffaa00');
            }

            return 'Game reset to initial state';
        } else {
            return 'Error: restartGame function not available. Make sure game is running.';
        }
    }

    showHelp() {
        this.log('Debug Console - Single Player Mode', '#ffaa00');
        this.log('Available Commands:', '#ffaa00');
        this.log('  Game Progression:', '#00ff88');
        this.log('    skipToBoss - Skip directly to Level 4 boss fight', '#cccccc');
        this.log('    setLevel <1-4> - Jump to specific level', '#cccccc');
        this.log('    setScore <number> - Set current score', '#cccccc');
        this.log('  Player Cheats:', '#00ff88');
        this.log('    invincible - Toggle player invincibility', '#cccccc');
        this.log('    doubleFire - Toggle double fire mode', '#cccccc');
        this.log('    addLives <number> - Add extra lives', '#cccccc');
        this.log('    killAll - Destroy all enemies on screen', '#cccccc');
        this.log('  Utility:', '#00ff88');
        this.log('    gameState - Show current game variables', '#cccccc');
        this.log('    resetGame - Reset to game start', '#cccccc');
        this.log('    sync - Force synchronize all game variables', '#cccccc');
        this.log('    pause - Toggle game pause state', '#cccccc');
        this.log('    features - Show feature flags', '#cccccc');
        this.log('    clear - Clear console output', '#cccccc');
        this.log('  Note: Commands are case-sensitive - use exact casing shown above', '#888888');
        return null;
    }

    clearOutput() {
        this.output.innerHTML = '';
        return null;
    }

    syncGlobalVariables() {
        // Helper method to sync window globals with local variables
        const gameVars = {
            gameOver: window.gameOver,
            score: window.score,
            level: window.level,
            enemiesDestroyed: window.enemiesDestroyed,
            enemiesNeeded: window.enemiesNeeded,
            bossFightStarted: window.bossFightStarted,
            bossActive: window.bossActive,
            doubleFire: window.doubleFire,
            gameTime: window.gameTime,
            gamePaused: window.gamePaused
        };

        // Force update window object
        Object.keys(gameVars).forEach(key => {
            window[key] = gameVars[key];
        });
    }

    showGameState() {
        this.log('=== GAME STATE DEBUG INFO ===', '#ffaa00');

        // Core game variables
        const coreVars = ['level', 'score', 'gameOver', 'enemiesDestroyed', 'enemiesNeeded'];
        this.log('Core Game Variables:', '#00ff88');
        coreVars.forEach(varName => {
            const value = window[varName];
            const type = typeof value;
            this.log(`  ${varName}: ${value} (${type})`, '#cccccc');
        });

        // Boss fight variables
        const bossVars = ['bossFightStarted', 'bossActive'];
        this.log('Boss Fight Variables:', '#00ff88');
        bossVars.forEach(varName => {
            const value = window[varName];
            const type = typeof value;
            this.log(`  ${varName}: ${value} (${type})`, '#cccccc');
        });

        // Player variables
        this.log('Player State:', '#00ff88');
        if (window.player) {
            this.log(`  player.lives: ${window.player.lives || 'N/A'}`, '#cccccc');
            this.log(`  player.invincible: ${window.player.invincible || false}`, '#cccccc');
            this.log(`  player.x: ${window.player.x || 'N/A'}`, '#cccccc');
            this.log(`  player.y: ${window.player.y || 'N/A'}`, '#cccccc');
        } else {
            this.log('  player object: NOT AVAILABLE', '#ff6666');
        }

        // Array lengths
        this.log('Game Arrays:', '#00ff88');
        const arrays = ['enemies', 'lasers', 'asteroids', 'explosions'];
        arrays.forEach(arrName => {
            const arr = window[arrName];
            if (Array.isArray(arr)) {
                this.log(`  ${arrName}.length: ${arr.length}`, '#cccccc');
            } else {
                this.log(`  ${arrName}: NOT AVAILABLE or not array`, '#ff6666');
            }
        });

        // Power-ups and features
        this.log('Features & Power-ups:', '#00ff88');
        this.log(`  doubleFire: ${window.doubleFire}`, '#cccccc');
        this.log(`  powerUp: ${window.powerUp || 'none'}`, '#cccccc');

        // Game timer and pause state
        this.log('Game Timer & Pause:', '#00ff88');
        this.log(`  gameTime: ${window.gameTime || 0} seconds`, '#cccccc');
        this.log(`  gamePaused: ${window.gamePaused || false}`, '#cccccc');

        return null;
    }

    showFeatures() {
        if (window.featureFlags) {
            this.log('Feature Flags Status:', '#ffaa00');
            window.featureFlags.logStatus();
            return 'Feature flags displayed in browser console';
        } else {
            return 'Error: Feature flags not available';
        }
    }

    togglePause() {
        if (typeof window.gamePaused === 'undefined') {
            return 'Error: Game pause system not available';
        }

        if (window.gamePaused) {
            if (typeof window.resumeGame === 'function') {
                window.resumeGame();
                this.log('Game resumed', '#00ff88');
                return 'Game resumed';
            } else {
                return 'Error: Resume function not available';
            }
        } else {
            if (typeof window.pauseGame === 'function') {
                window.pauseGame();
                this.log('Game paused', '#ffaa00');
                return 'Game paused';
            } else {
                return 'Error: Pause function not available';
            }
        }
    }

    forceSync() {
        try {
            this.syncGlobalVariables();

            // Also try to trigger a re-sync from gameloop if available
            if (typeof window.eval === 'function') {
                const syncCommands = [
                    'window.gameOver = gameOver',
                    'window.score = score',
                    'window.level = level',
                    'window.enemiesDestroyed = enemiesDestroyed',
                    'window.enemiesNeeded = enemiesNeeded',
                    'window.bossFightStarted = bossFightStarted',
                    'window.bossActive = bossActive',
                    'window.doubleFire = doubleFire',
                    'window.gameTime = gameTime',
                    'window.gamePaused = gamePaused'
                ];

                syncCommands.forEach(cmd => {
                    try {
                        window.eval(cmd);
                    } catch (e) {
                        // Silently continue if variable doesn't exist
                    }
                });
            }

            this.log('Force synchronized all game variables', '#00ff88');
            return 'Variables synchronized successfully';
        } catch (error) {
            this.log('Error during sync: ' + error.message, '#ff6666');
            return 'Error: Could not sync variables - ' + error.message;
        }
    }

    enableFeature(flagName) {
        if (!flagName) {
            return 'Error: Please specify a feature flag name';
        }

        if (window.featureFlags) {
            const result = window.featureFlags.setEnabled(flagName, true);
            return result ? `Enabled feature: ${flagName}` : `Error: Could not enable ${flagName}`;
        } else {
            return 'Error: Feature flags not available';
        }
    }

    disableFeature(flagName) {
        if (!flagName) {
            return 'Error: Please specify a feature flag name';
        }

        if (window.featureFlags) {
            const result = window.featureFlags.setEnabled(flagName, false);
            return result ? `Disabled feature: ${flagName}` : `Error: Could not disable ${flagName}`;
        } else {
            return 'Error: Feature flags not available';
        }
    }

    // Autocomplete functionality
    showAutocomplete() {
        const input = this.input.value.trim();
        const suggestions = this.getCommandSuggestions(input);

        if (suggestions.length > 0) {
            this.displayAutocomplete(suggestions);
        }
    }

    updateAutocomplete() {
        const input = this.input.value.trim();
        if (!input) {
            this.hideAutocomplete();
            return;
        }

        const suggestions = this.getCommandSuggestions(input);
        if (suggestions.length > 0) {
            this.displayAutocomplete(suggestions);
        } else {
            this.hideAutocomplete();
        }
    }

    getCommandSuggestions(input) {
        if (!input) {
            // If no input, show all commands
            return Array.from(this.commands.keys()).map(cmd => ({
                command: cmd,
                description: this.commands.get(cmd).description,
                match: 'all'
            }));
        }

        const suggestions = [];
        const inputLower = input.toLowerCase();

        for (const [command, commandObj] of this.commands.entries()) {
            const commandLower = command.toLowerCase();

            // Exact match (highest priority)
            if (commandLower === inputLower) {
                suggestions.unshift({
                    command: command,
                    description: commandObj.description,
                    match: 'exact'
                });
            }
            // Starts with (high priority)
            else if (commandLower.startsWith(inputLower)) {
                suggestions.push({
                    command: command,
                    description: commandObj.description,
                    match: 'prefix'
                });
            }
            // Contains (lower priority)
            else if (commandLower.includes(inputLower)) {
                suggestions.push({
                    command: command,
                    description: commandObj.description,
                    match: 'contains'
                });
            }
        }

        return suggestions.slice(0, 8); // Limit to 8 suggestions
    }

    displayAutocomplete(suggestions) {
        this.autocompleteSuggestions = suggestions;
        this.autocompleteIndex = 0;
        this.autocompleteVisible = true;

        this.autocompleteElement.innerHTML = '';

        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid rgba(0, 255, 136, 0.2);
                color: #cccccc;
                background: ${index === 0 ? 'rgba(0, 255, 136, 0.2)' : 'transparent'};
            `;

            // Highlight matching part
            const command = suggestion.command;
            const input = this.input.value.trim();
            let highlightedCommand = command;

            if (input && suggestion.match !== 'all') {
                const regex = new RegExp(`(${input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                highlightedCommand = command.replace(regex, '<span style="color: #00ff88; font-weight: bold;">$1</span>');
            }

            item.innerHTML = `
                <div style="font-family: 'Courier New', monospace;">
                    <span style="color: #00ff88;">${highlightedCommand}</span>
                    <span style="color: #888; font-size: 0.9em; margin-left: 10px;">- ${suggestion.description}</span>
                </div>
            `;

            item.addEventListener('mouseenter', () => {
                this.autocompleteIndex = index;
                this.updateAutocompleteSelection();
            });

            item.addEventListener('click', () => {
                this.autocompleteIndex = index;
                this.selectAutocomplete();
            });

            this.autocompleteElement.appendChild(item);
        });

        this.autocompleteElement.style.display = 'block';
        this.updateAutocompleteSelection();
    }

    navigateAutocomplete(direction) {
        if (!this.autocompleteVisible || this.autocompleteSuggestions.length === 0) return;

        this.autocompleteIndex += direction;

        if (this.autocompleteIndex < 0) {
            this.autocompleteIndex = this.autocompleteSuggestions.length - 1;
        } else if (this.autocompleteIndex >= this.autocompleteSuggestions.length) {
            this.autocompleteIndex = 0;
        }

        this.updateAutocompleteSelection();
    }

    updateAutocompleteSelection() {
        if (!this.autocompleteVisible) return;

        const items = this.autocompleteElement.children;
        for (let i = 0; i < items.length; i++) {
            items[i].style.background = i === this.autocompleteIndex ?
                'rgba(0, 255, 136, 0.2)' : 'transparent';
        }

        // Scroll selected item into view
        if (items[this.autocompleteIndex]) {
            items[this.autocompleteIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }

    selectAutocomplete() {
        if (!this.autocompleteVisible || this.autocompleteIndex < 0 ||
            this.autocompleteIndex >= this.autocompleteSuggestions.length) {
            return;
        }

        const suggestion = this.autocompleteSuggestions[this.autocompleteIndex];
        this.input.value = suggestion.command;
        this.hideAutocomplete();
        this.input.focus();

        // Position cursor at end
        this.input.setSelectionRange(this.input.value.length, this.input.value.length);
    }

    hideAutocomplete() {
        this.autocompleteVisible = false;
        this.autocompleteElement.style.display = 'none';
        this.autocompleteSuggestions = [];
        this.autocompleteIndex = -1;
    }
}

// Initialize debug console and make it globally available
// Wait for DOM to be ready before creating console
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.debugConsole = new DebugConsole();
    });
} else {
    window.debugConsole = new DebugConsole();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebugConsole;
}