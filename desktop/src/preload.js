const { contextBridge, ipcRenderer } = require('electron');
const { EventEmitter } = require('events');

// Enhanced desktop API bridge
class DesktopAPIBridge extends EventEmitter {
  constructor() {
    super();
    this.setupIPCListeners();
  }

  setupIPCListeners() {
    // Forward IPC messages to the renderer as events
    const forwardedEvents = [
      'menu-new-game',
      'menu-join-game',
      'menu-settings',
      'menu-network-status',
      'menu-discover-local',
      'menu-connection-settings',
      'menu-show-controls',
      'update-available',
      'update-downloaded',
      'enhanced-ice-complete',
      'peer-discovered-torrent',
      'local-game-discovered'
    ];

    forwardedEvents.forEach(eventName => {
      ipcRenderer.on(eventName, (event, ...args) => {
        this.emit(eventName, ...args);
      });
    });
  }

  // App information
  async getAppVersion() {
    return await ipcRenderer.invoke('get-app-version');
  }

  // Persistent storage
  async getStoreValue(key) {
    return await ipcRenderer.invoke('get-store-value', key);
  }

  async setStoreValue(key, value) {
    return await ipcRenderer.invoke('set-store-value', key, value);
  }

  // File dialogs
  async showSaveDialog(options = {}) {
    const defaultOptions = {
      title: 'Save Game',
      defaultPath: 'drazzan-save.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    };
    return await ipcRenderer.invoke('show-save-dialog', { ...defaultOptions, ...options });
  }

  async showOpenDialog(options = {}) {
    const defaultOptions = {
      title: 'Load Game',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    };
    return await ipcRenderer.invoke('show-open-dialog', { ...defaultOptions, ...options });
  }

  // Enhanced P2P networking
  async advertiseGame(gameInfo) {
    return await ipcRenderer.invoke('advertise-game', gameInfo);
  }

  async getEnhancedWebRTCConfig() {
    return await ipcRenderer.invoke('get-enhanced-webrtc-config');
  }

  // Auto-updater
  async restartAndInstallUpdate() {
    return await ipcRenderer.invoke('restart-and-install-update');
  }

  // Desktop-specific features
  isDesktop() {
    return true;
  }

  getPlatform() {
    return process.platform;
  }

  async exportGameData(gameData) {
    const result = await this.showSaveDialog({
      title: 'Export Game Data',
      defaultPath: `drazzan-export-${Date.now()}.json`
    });

    if (!result.canceled) {
      const fs = require('fs').promises;
      try {
        await fs.writeFile(result.filePath, JSON.stringify(gameData, null, 2));
        return { success: true, path: result.filePath };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, canceled: true };
  }

  async importGameData() {
    const result = await this.showOpenDialog({
      title: 'Import Game Data'
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const fs = require('fs').promises;
      try {
        const data = await fs.readFile(result.filePaths[0], 'utf8');
        return { success: true, data: JSON.parse(data) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, canceled: true };
  }

  // Enhanced clipboard support for sharing game codes
  async writeToClipboard(text) {
    const { clipboard } = require('electron');
    clipboard.writeText(text);
    return true;
  }

  async readFromClipboard() {
    const { clipboard } = require('electron');
    return clipboard.readText();
  }

  // System notifications
  showNotification(title, options = {}) {
    const notification = new Notification(title, {
      body: options.body || '',
      icon: options.icon || '../build/icon.png',
      badge: options.badge || '../build/icon.png',
      ...options
    });

    if (options.onClick) {
      notification.onclick = options.onClick;
    }

    return notification;
  }

  // Enhanced local storage with encryption
  async setSecureData(key, value) {
    // This would implement secure storage for sensitive game data
    // For now, using regular storage
    return await this.setStoreValue(`secure.${key}`, value);
  }

  async getSecureData(key) {
    return await this.getStoreValue(`secure.${key}`);
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      memory: process.memoryUsage(),
      platform: process.platform,
      arch: process.arch,
      versions: process.versions
    };
  }

  // Game link handling
  registerGameLinkHandler(callback) {
    // Handle drazzan:// protocol links
    this.on('protocol-link', callback);
  }
}

// Create the bridge instance
const desktopAPI = new DesktopAPIBridge();

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => desktopAPI.getAppVersion(),
  isDesktop: () => desktopAPI.isDesktop(),
  getPlatform: () => desktopAPI.getPlatform(),

  // Storage
  getStoreValue: (key) => desktopAPI.getStoreValue(key),
  setStoreValue: (key, value) => desktopAPI.setStoreValue(key, value),
  getSecureData: (key) => desktopAPI.getSecureData(key),
  setSecureData: (key, value) => desktopAPI.setSecureData(key, value),

  // File operations
  showSaveDialog: (options) => desktopAPI.showSaveDialog(options),
  showOpenDialog: (options) => desktopAPI.showOpenDialog(options),
  exportGameData: (data) => desktopAPI.exportGameData(data),
  importGameData: () => desktopAPI.importGameData(),

  // Clipboard
  writeToClipboard: (text) => desktopAPI.writeToClipboard(text),
  readFromClipboard: () => desktopAPI.readFromClipboard(),

  // Notifications
  showNotification: (title, options) => desktopAPI.showNotification(title, options),

  // Enhanced P2P
  advertiseGame: (gameInfo) => desktopAPI.advertiseGame(gameInfo),
  getEnhancedWebRTCConfig: () => desktopAPI.getEnhancedWebRTCConfig(),

  // Auto-updater
  restartAndInstallUpdate: () => desktopAPI.restartAndInstallUpdate(),

  // Performance
  getPerformanceMetrics: () => desktopAPI.getPerformanceMetrics(),

  // Event handling
  on: (event, callback) => desktopAPI.on(event, callback),
  off: (event, callback) => desktopAPI.off(event, callback),
  once: (event, callback) => desktopAPI.once(event, callback),

  // Game links
  registerGameLinkHandler: (callback) => desktopAPI.registerGameLinkHandler(callback)
});

// Enhanced desktop integration
contextBridge.exposeInMainWorld('desktopFeatures', {
  // Desktop-specific game features
  async saveGameToDesktop(gameData) {
    return await desktopAPI.exportGameData(gameData);
  },

  async loadGameFromDesktop() {
    return await desktopAPI.importGameData();
  },

  async shareGameCode(gameCode) {
    await desktopAPI.writeToClipboard(gameCode);
    desktopAPI.showNotification('Game Code Copied', {
      body: 'Game code has been copied to clipboard',
      icon: '../build/icon.png'
    });
    return true;
  },

  async getGameCodeFromClipboard() {
    const text = await desktopAPI.readFromClipboard();
    // Validate if it looks like a game code
    if (text && text.match(/^[A-Z0-9]{6,12}$/)) {
      return text;
    }
    return null;
  },

  // Enhanced P2P discovery
  async startLocalGameDiscovery() {
    desktopAPI.emit('start-local-discovery');
    return true;
  },

  async stopLocalGameDiscovery() {
    desktopAPI.emit('stop-local-discovery');
    return true;
  },

  // System integration
  async minimizeToSystemTray() {
    // This would be implemented in main process
    desktopAPI.emit('minimize-to-tray');
    return true;
  },

  async setGameStatusInProfile(status) {
    // Update system status (Discord RPC, etc.)
    desktopAPI.emit('update-game-status', status);
    return true;
  }
});

// Performance monitoring integration
let performanceMetrics = {
  frameCount: 0,
  lastFrameTime: performance.now(),
  averageFPS: 60
};

contextBridge.exposeInMainWorld('performanceMonitor', {
  updateFrameStats() {
    performanceMetrics.frameCount++;
    const now = performance.now();
    const deltaTime = now - performanceMetrics.lastFrameTime;
    
    if (deltaTime >= 1000) { // Update every second
      performanceMetrics.averageFPS = (performanceMetrics.frameCount * 1000) / deltaTime;
      performanceMetrics.frameCount = 0;
      performanceMetrics.lastFrameTime = now;
    }
  },

  getStats() {
    return {
      ...performanceMetrics,
      system: desktopAPI.getPerformanceMetrics()
    };
  },

  async reportPerformanceIssue(issueData) {
    const fullReport = {
      ...issueData,
      timestamp: Date.now(),
      system: desktopAPI.getPerformanceMetrics(),
      performance: performanceMetrics
    };

    const result = await desktopAPI.showSaveDialog({
      title: 'Save Performance Report',
      defaultPath: `drazzan-performance-${Date.now()}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (!result.canceled) {
      const fs = require('fs').promises;
      try {
        await fs.writeFile(result.filePath, JSON.stringify(fullReport, null, 2));
        return { success: true, path: result.filePath };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, canceled: true };
  }
});

console.log('[Desktop] Preload script initialized with enhanced features');