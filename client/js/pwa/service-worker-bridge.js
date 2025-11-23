// Service Worker Bridge - handles PWA functionality
class ServiceWorkerBridge {
    constructor() {
        this.registration = null;
        this.isOnline = navigator.onLine;
        this.updateAvailable = false;
        this.init();
    }

    async init() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                console.log('[PWA] Service Worker registered successfully');
                
                // Handle updates
                this.registration.addEventListener('updatefound', () => {
                    const newWorker = this.registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.updateAvailable = true;
                            this.showUpdateNotification();
                        }
                    });
                });

                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event.data);
                });

            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        }

        // Set up network status monitoring
        this.setupNetworkMonitoring();
        
        // Set up install prompt
        this.setupInstallPrompt();
        
        // Set up notifications
        this.setupNotifications();
    }

    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleNetworkChange(true);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleNetworkChange(false);
        });
    }

    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            deferredPrompt = e;
            
            // Show custom install button
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('[PWA] App was installed');
            this.hideInstallButton();
            
            // Track installation
            if (typeof gtag !== 'undefined') {
                gtag('event', 'app_installed', {
                    event_category: 'PWA'
                });
            }
        });
    }

    async setupNotifications() {
        // Request notification permission
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('[PWA] Notification permission:', permission);
        }

        // Handle push notifications
        if ('PushManager' in window && this.registration) {
            try {
                const subscription = await this.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(
                        'YOUR_VAPID_PUBLIC_KEY_HERE' // Replace with actual VAPID key
                    )
                });
                
                console.log('[PWA] Push subscription:', subscription);
                // Send subscription to server for multiplayer invites
                
            } catch (error) {
                console.warn('[PWA] Push subscription failed:', error);
            }
        }
    }

    showInstallButton(deferredPrompt) {
        const installBtn = document.createElement('button');
        installBtn.id = 'install-pwa-btn';
        installBtn.textContent = '📱 Install Game';
        installBtn.className = 'pwa-install-btn';
        
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                console.log('[PWA] Install prompt result:', result);
                deferredPrompt = null;
                this.hideInstallButton();
            }
        });

        // Add to appropriate location in the UI
        const header = document.querySelector('header') || document.body;
        header.appendChild(installBtn);
    }

    hideInstallButton() {
        const installBtn = document.getElementById('install-pwa-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    showUpdateNotification() {
        const updateBanner = document.createElement('div');
        updateBanner.id = 'update-banner';
        updateBanner.className = 'pwa-update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <span>🚀 New version available!</span>
                <button id="update-btn">Update Now</button>
                <button id="dismiss-btn">×</button>
            </div>
        `;

        document.body.appendChild(updateBanner);

        // Handle update button click
        document.getElementById('update-btn').addEventListener('click', () => {
            this.applyUpdate();
        });

        // Handle dismiss button click
        document.getElementById('dismiss-btn').addEventListener('click', () => {
            updateBanner.remove();
        });
    }

    applyUpdate() {
        if (this.registration && this.registration.waiting) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    handleNetworkChange(isOnline) {
        console.log('[PWA] Network status changed:', isOnline ? 'online' : 'offline');
        
        // Show network status indicator
        const indicator = document.getElementById('network-indicator') || 
                         this.createNetworkIndicator();
        
        indicator.className = `network-indicator ${isOnline ? 'online' : 'offline'}`;
        indicator.textContent = isOnline ? '🌐 Online' : '📱 Offline';

        // Notify game systems
        if (window.gameInstance) {
            window.gameInstance.handleNetworkChange(isOnline);
        }

        // Trigger background sync when coming back online
        if (isOnline && this.registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
            this.registration.sync.register('sync-game-state');
            this.registration.sync.register('sync-peer-discovery');
        }
    }

    createNetworkIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'network-indicator';
        indicator.className = 'network-indicator';
        
        // Position in top-right corner
        Object.assign(indicator.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '12px',
            zIndex: '10000',
            transition: 'all 0.3s ease'
        });

        document.body.appendChild(indicator);
        return indicator;
    }

    handleServiceWorkerMessage(data) {
        console.log('[PWA] Message from service worker:', data);
        
        switch (data.type) {
            case 'SYNC_GAME_STATE':
                if (window.gameInstance && window.gameInstance.syncGameState) {
                    window.gameInstance.syncGameState();
                }
                break;
                
            case 'SYNC_PEER_DISCOVERY':
                if (window.networkManager && window.networkManager.refreshPeerDiscovery) {
                    window.networkManager.refreshPeerDiscovery();
                }
                break;
        }
    }

    // Cache additional resources
    async cacheResources(urls) {
        if (this.registration) {
            const messageChannel = new MessageChannel();
            
            return new Promise((resolve, reject) => {
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        resolve();
                    } else {
                        reject(new Error(event.data.error));
                    }
                };

                navigator.serviceWorker.controller.postMessage({
                    type: 'CACHE_URLS',
                    urls: urls
                }, [messageChannel.port2]);
            });
        }
    }

    // Utility function for VAPID key conversion
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Get current version
    async getVersion() {
        if (this.registration) {
            const messageChannel = new MessageChannel();
            
            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.version);
                };

                navigator.serviceWorker.controller.postMessage({
                    type: 'GET_VERSION'
                }, [messageChannel.port2]);
            });
        }
        return null;
    }
}

// Initialize service worker bridge when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.swBridge = new ServiceWorkerBridge();
    });
} else {
    window.swBridge = new ServiceWorkerBridge();
}