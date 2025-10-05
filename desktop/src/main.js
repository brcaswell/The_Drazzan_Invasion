const { app, BrowserWindow, Menu, ipcMain, protocol, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const path = require('path');
const fs = require('fs');

// Initialize electron store for persistent data
const store = new Store({
  defaults: {
    windowBounds: { width: 1280, height: 720 },
    gameSettings: {
      fullscreen: false,
      soundEnabled: true,
      musicEnabled: true,
      difficulty: 'normal'
    },
    networkSettings: {
      maxConnections: 8,
      autoHost: false,
      preferredSignaling: 'webrtc'
    }
  }
});

let mainWindow;
let gameServer;
let isDev = process.argv.includes('--dev');

// Enhanced P2P capabilities for desktop
class DesktopP2PEnhancer {
  constructor() {
    this.natTraversal = null;
    this.torrentClient = null;
    this.localNetwork = null;
  }

  async initialize() {
    try {
      // Initialize enhanced NAT traversal
      if (require.resolve('node-datachannel')) {
        const nodeDataChannel = require('node-datachannel');
        this.setupAdvancedWebRTC(nodeDataChannel);
      }

      // Initialize BitTorrent-based discovery
      if (require.resolve('webtorrent-desktop')) {
        const WebTorrent = require('webtorrent-desktop');
        this.torrentClient = new WebTorrent();
        this.setupTorrentDiscovery();
      }

      // Initialize local network discovery
      this.setupLocalNetworkDiscovery();

      console.log('[Desktop] P2P enhancements initialized');
    } catch (error) {
      console.warn('[Desktop] P2P enhancements not available:', error.message);
    }
  }

  setupAdvancedWebRTC(nodeDataChannel) {
    // Enhanced WebRTC with better NAT traversal
    this.natTraversal = {
      createPeerConnection: (config) => {
        const pc = nodeDataChannel.createPeerConnection(config);
        
        // Enhanced ICE candidate gathering
        pc.gatheringStateChangeCallback = (state) => {
          if (state === 'complete') {
            mainWindow.webContents.send('enhanced-ice-complete', pc.localDescription);
          }
        };

        return pc;
      },
      
      setupTurnServers: () => {
        // Community TURN servers for better connectivity
        return [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          // Add community TURN servers
          { urls: 'turn:turn.drazzan.community:3478', username: 'player', credential: 'game' }
        ];
      }
    };
  }

  setupTorrentDiscovery() {
    // Use BitTorrent DHT for game discovery
    const gameDiscoveryInfoHash = 'drazzan-invasion-multiplayer-discovery';
    
    this.torrentClient.on('torrent', (torrent) => {
      if (torrent.infoHash === gameDiscoveryInfoHash) {
        // Peer discovered through BitTorrent
        torrent.on('wire', (wire) => {
          mainWindow.webContents.send('peer-discovered-torrent', {
            peerId: wire.peerId,
            address: wire.remoteAddress
          });
        });
      }
    });
  }

  setupLocalNetworkDiscovery() {
    // mDNS/Bonjour discovery for local network games
    try {
      const mdns = require('mdns-js');
      
      // Advertise local game
      const advertisement = mdns.createAdvertisement(mdns.tcp('drazzan'), 9999, {
        name: 'Drazzan Invasion Game',
        txt: {
          version: '2.0.0',
          players: '1/4',
          mode: 'versus'
        }
      });

      // Browse for other games
      const browser = mdns.createBrowser(mdns.tcp('drazzan'));
      browser.on('ready', () => browser.discover());
      
      browser.on('update', (data) => {
        mainWindow.webContents.send('local-game-discovered', {
          name: data.fullname,
          address: data.addresses[0],
          port: data.port,
          txt: data.txt
        });
      });

      this.localNetwork = { advertisement, browser };
    } catch (error) {
      console.warn('[Desktop] mDNS not available:', error.message);
    }
  }

  advertiseGame(gameInfo) {
    // Advertise through all available channels
    if (this.torrentClient) {
      // Create discovery torrent
      const discoveryData = {
        gameId: gameInfo.gameId,
        hostPeerId: gameInfo.hostPeerId,
        gameMode: gameInfo.gameMode,
        timestamp: Date.now()
      };
      
      // This would need a proper torrent creation mechanism
      console.log('[Desktop] Advertising game via BitTorrent:', discoveryData);
    }

    if (this.localNetwork) {
      // Update mDNS advertisement
      this.localNetwork.advertisement.txt = {
        gameId: gameInfo.gameId,
        players: `${gameInfo.currentPlayers}/${gameInfo.maxPlayers}`,
        mode: gameInfo.gameMode
      };
    }
  }

  cleanup() {
    if (this.torrentClient) {
      this.torrentClient.destroy();
    }
    
    if (this.localNetwork) {
      this.localNetwork.advertisement.stop();
      this.localNetwork.browser.stop();
    }
  }
}

function createWindow() {
  // Get stored window bounds
  const { width, height } = store.get('windowBounds');

  // Create the browser window
  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    },
    icon: path.join(__dirname, '../build/icon.png'),
    show: false, // Don't show until ready
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Load the game
  const gameUrl = isDev 
    ? 'http://localhost:8081' 
    : `file://${path.join(__dirname, '../../client/index.html')}`;
  
  mainWindow.loadURL(gameUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Save window bounds on resize/move
  mainWindow.on('resize', () => saveWindowBounds());
  mainWindow.on('move', () => saveWindowBounds());

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function saveWindowBounds() {
  if (mainWindow) {
    store.set('windowBounds', mainWindow.getBounds());
  }
}

function createMenu() {
  const template = [
    {
      label: 'Game',
      submenu: [
        {
          label: 'New Single Player Game',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu-new-game', 'single')
        },
        {
          label: 'Host Multiplayer Game',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow.webContents.send('menu-new-game', 'host')
        },
        {
          label: 'Join Multiplayer Game',
          accelerator: 'CmdOrCtrl+J',
          click: () => mainWindow.webContents.send('menu-join-game')
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => mainWindow.webContents.send('menu-settings')
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: () => {
            const isFullscreen = mainWindow.isFullScreen();
            mainWindow.setFullScreen(!isFullscreen);
            store.set('gameSettings.fullscreen', !isFullscreen);
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomFactor();
            mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomFactor();
            mainWindow.webContents.setZoomFactor(Math.max(0.5, currentZoom - 0.1));
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => mainWindow.webContents.setZoomFactor(1.0)
        },
        { type: 'separator' },
        {
          label: 'Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => mainWindow.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: 'Network',
      submenu: [
        {
          label: 'Network Status',
          click: () => mainWindow.webContents.send('menu-network-status')
        },
        {
          label: 'Discover Local Games',
          click: () => {
            if (p2pEnhancer) {
              mainWindow.webContents.send('menu-discover-local');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Connection Settings',
          click: () => mainWindow.webContents.send('menu-connection-settings')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Drazzan Invasion',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Drazzan Invasion',
              message: 'The Drazzan Invasion v2.0.0',
              detail: 'Decentralized multiplayer space shooter with peer-to-peer WebAssembly servers.\n\nBuilt with Electron, WebRTC, and WebAssembly.',
              buttons: ['OK']
            });
          }
        },
        {
          label: 'Game Controls',
          click: () => mainWindow.webContents.send('menu-show-controls')
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/brcaswell/The_Drazzan_Invasion/issues');
          }
        },
        {
          label: 'View Source',
          click: () => {
            shell.openExternal('https://github.com/brcaswell/The_Drazzan_Invasion');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: 'About ' + app.getName(),
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        { type: 'separator' },
        {
          label: 'Hide ' + app.getName(),
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit()
        }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Initialize enhanced P2P
const p2pEnhancer = new DesktopP2PEnhancer();

// App event handlers
app.whenReady().then(async () => {
  // Register custom protocol for game links
  protocol.registerFileProtocol('drazzan', (request, callback) => {
    const url = request.url.substr(9); // Remove 'drazzan://'
    callback({ path: path.normalize(`${__dirname}/../client/${url}`) });
  });

  createWindow();
  createMenu();
  
  // Initialize P2P enhancements
  await p2pEnhancer.initialize();
  
  // Set up auto-updater
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Cleanup P2P enhancements
  if (p2pEnhancer) {
    p2pEnhancer.cleanup();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('get-store-value', (event, key) => store.get(key));

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('advertise-game', (event, gameInfo) => {
  if (p2pEnhancer) {
    p2pEnhancer.advertiseGame(gameInfo);
  }
  return true;
});

ipcMain.handle('get-enhanced-webrtc-config', () => {
  if (p2pEnhancer && p2pEnhancer.natTraversal) {
    return p2pEnhancer.natTraversal.setupTurnServers();
  }
  return null;
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

ipcMain.handle('restart-and-install-update', () => {
  autoUpdater.quitAndInstall();
});