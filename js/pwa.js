/**
 * PWA (Progressive Web App) Manager
 * 
 * Handles:
 * - Service Worker registration
 * - Install prompts
 * - Update notifications
 * - App install banner
 * - Push notifications setup
 * - Background sync
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.swRegistration = null;
        
        this.init();
    }
    
    /**
     * Initialize PWA features
     */
    async init() {
        this.checkInstallStatus();
        this.setupServiceWorker();
        this.setupInstallPrompt();
        this.setupUpdateHandler();
        this.createInstallButton();
        this.setupOfflineIndicator();
        
        console.log('PWA Manager initialized');
    }
    
    /**
     * Check if app is already installed
     */
    checkInstallStatus() {
        // Check if running as standalone app
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://');
        
        if (this.isInstalled) {
            console.log('App is running as installed PWA');
            document.body.classList.add('pwa-installed');
        }
    }
    
    /**
     * Set up Service Worker with enhanced features
     */
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                console.log('Service Worker registered:', this.swRegistration);
                
                // Listen for service worker messages
                navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
                
                // Check for updates
                this.swRegistration.addEventListener('updatefound', this.handleSWUpdate.bind(this));
                
                // Get service worker version
                await this.getServiceWorkerVersion();
                
                // Track registration success
                this.trackEvent('sw_registered', {
                    scope: this.swRegistration.scope
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
                this.trackEvent('sw_registration_failed', {
                    error: error.message
                });
            }
        }
    }
    
    /**
     * Get service worker version
     */
    async getServiceWorkerVersion() {
        try {
            if (this.swRegistration && this.swRegistration.active) {
                const messageChannel = new MessageChannel();
                const versionPromise = new Promise((resolve) => {
                    messageChannel.port1.onmessage = (event) => {
                        this.swVersion = event.data.version;
                        console.log('Service Worker version:', this.swVersion);
                        resolve(event.data.version);
                    };
                    
                    // Timeout after 5 seconds
                    setTimeout(() => resolve('unknown'), 5000);
                });
                
                this.swRegistration.active.postMessage(
                    { type: 'GET_VERSION' },
                    [messageChannel.port2]
                );
                
                return await versionPromise;
            }
        } catch (error) {
            console.warn('Could not get service worker version:', error);
            return 'unknown';
        }
    }
    
    /**
     * Handle service worker messages
     */
    handleSWMessage(event) {
        const { data } = event;
        
        switch (data.type) {
            case 'SW_UPDATED':
                this.showUpdateNotification();
                break;
            case 'CACHE_UPDATED':
                console.log('App cache updated');
                break;
            case 'OFFLINE':
                this.showOfflineIndicator();
                break;
            case 'ONLINE':
                this.hideOfflineIndicator();
                break;
        }
    }
    
    /**
     * Handle service worker updates
     */
    handleSWUpdate() {
        const installingWorker = this.swRegistration.installing;
        
        if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        // New version available
                        this.showUpdateNotification();
                    }
                }
            });
        }
    }
    
    /**
     * Set up install prompt handling
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Show install button after a delay
            setTimeout(() => {
                this.showInstallButton();
            }, 3000);
            
            // Show install banner if user hasn't dismissed it
            if (!localStorage.getItem('pwa-install-dismissed')) {
                this.showInstallBanner();
            }
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.hideInstallBanner();
            this.showInstallSuccessMessage();
            
            // Track install event
            this.trackEvent('app_installed');
            
            // Clear dismissal flag
            localStorage.removeItem('pwa-install-dismissed');
        });
        
        // Check for related app installs
        window.addEventListener('beforeunload', () => {
            if (this.deferredPrompt) {
                this.trackEvent('install_prompt_abandoned');
            }
        });
    }
    
    /**
     * Create install button
     */
    createInstallButton() {
        // Check if button already exists
        if (document.querySelector('.pwa-install-button')) return;
        
        const installButton = document.createElement('button');
        installButton.className = 'pwa-install-button';
        installButton.innerHTML = `
            <i class="fas fa-download"></i>
            <span>アプリをインストール</span>
        `;
        installButton.addEventListener('click', this.promptInstall.bind(this));
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .pwa-install-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
                display: none;
                align-items: center;
                gap: 8px;
            }
            
            .pwa-install-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .pwa-install-button.show {
                display: flex;
                animation: slideInRight 0.3s ease;
            }
            
            .pwa-update-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4caf50;
                color: white;
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 1001;
                max-width: 300px;
                font-size: 14px;
                display: none;
            }
            
            .pwa-update-notification.show {
                display: block;
                animation: slideInDown 0.3s ease;
            }
            
            .pwa-update-button {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                margin-top: 10px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .pwa-offline-indicator {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff9800;
                color: white;
                text-align: center;
                padding: 8px;
                font-size: 14px;
                z-index: 1002;
                transform: translateY(-100%);
                transition: transform 0.3s ease;
            }
            
            .pwa-offline-indicator.show {
                transform: translateY(0);
            }
            
            .pwa-install-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                display: none;
                align-items: center;
                justify-content: space-between;
                z-index: 1003;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            
            .pwa-install-banner.show {
                display: flex;
                animation: slideInDown 0.3s ease;
            }
            
            .pwa-install-banner .banner-content {
                display: flex;
                align-items: center;
                gap: 15px;
                flex: 1;
            }
            
            .pwa-install-banner .banner-text {
                flex: 1;
            }
            
            .pwa-install-banner .banner-title {
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .pwa-install-banner .banner-subtitle {
                font-size: 12px;
                opacity: 0.9;
            }
            
            .pwa-install-banner .banner-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .pwa-install-banner .banner-button {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .pwa-install-banner .banner-button:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
            }
            
            .pwa-install-banner .banner-button.primary {
                background: rgba(255, 255, 255, 0.9);
                color: #667eea;
            }
            
            .pwa-install-banner .banner-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 4px;
                margin-left: 10px;
                opacity: 0.8;
            }
            
            .pwa-install-banner .banner-close:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideInDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .pwa-install-button {
                    bottom: 80px;
                    right: 20px;
                    font-size: 12px;
                    padding: 10px 16px;
                }
                
                .pwa-update-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(installButton);
        
        // Also create install banner
        this.createInstallBanner();
    }
    
    /**
     * Create install banner
     */
    createInstallBanner() {
        if (document.querySelector('.pwa-install-banner')) return;
        
        const banner = document.createElement('div');
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-icon">📱</div>
                <div class="banner-text">
                    <div class="banner-title">アプリとしてインストール</div>
                    <div class="banner-subtitle">ホーム画面に追加してより便利に</div>
                </div>
            </div>
            <div class="banner-actions">
                <button class="banner-button primary" onclick="window.pwaManager.promptInstall()">
                    インストール
                </button>
                <button class="banner-button" onclick="window.pwaManager.dismissInstallBanner()">
                    後で
                </button>
                <button class="banner-close" onclick="window.pwaManager.dismissInstallBanner(true)">
                    ✕
                </button>
            </div>
        `;
        
        document.body.appendChild(banner);
    }
    
    /**
     * Show install button
     */
    showInstallButton() {
        if (this.isInstalled) return;
        
        const button = document.querySelector('.pwa-install-button');
        if (button) {
            button.classList.add('show');
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (!this.isInstalled) {
                    this.hideInstallButton();
                }
            }, 10000);
        }
    }
    
    /**
     * Hide install button
     */
    hideInstallButton() {
        const button = document.querySelector('.pwa-install-button');
        if (button) {
            button.classList.remove('show');
        }
    }
    
    /**
     * Show install banner
     */
    showInstallBanner() {
        if (this.isInstalled) return;
        
        const banner = document.querySelector('.pwa-install-banner');
        if (banner) {
            banner.classList.add('show');
            
            // Auto-hide after 15 seconds if not interacted with
            setTimeout(() => {
                if (!localStorage.getItem('pwa-install-dismissed') && banner.classList.contains('show')) {
                    this.dismissInstallBanner(false);
                }
            }, 15000);
        }
    }
    
    /**
     * Hide install banner
     */
    hideInstallBanner() {
        const banner = document.querySelector('.pwa-install-banner');
        if (banner) {
            banner.classList.remove('show');
        }
    }
    
    /**
     * Dismiss install banner
     */
    dismissInstallBanner(permanent = false) {
        this.hideInstallBanner();
        
        if (permanent) {
            localStorage.setItem('pwa-install-dismissed', 'true');
            this.trackEvent('install_banner_dismissed_permanently');
        } else {
            // Temporarily dismissed - show again after 24 hours
            const dismissTime = Date.now();
            localStorage.setItem('pwa-install-temp-dismissed', dismissTime.toString());
            this.trackEvent('install_banner_dismissed_temporarily');
        }
    }
    
    /**
     * Prompt user to install app
     */
    async promptInstall() {
        if (!this.deferredPrompt) return;
        
        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`Install prompt outcome: ${outcome}`);
            this.trackEvent('install_prompt', { outcome });
            
            this.deferredPrompt = null;
            this.hideInstallButton();
            
        } catch (error) {
            console.error('Install prompt failed:', error);
        }
    }
    
    /**
     * Show update notification
     */
    showUpdateNotification() {
        // Remove existing notification
        const existing = document.querySelector('.pwa-update-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div>🚀 新しいバージョンが利用可能です！</div>
            <button class="pwa-update-button" onclick="window.pwaManager.applyUpdate()">
                更新する
            </button>
            <button class="pwa-update-button" onclick="this.parentElement.remove()" style="margin-left: 8px;">
                後で
            </button>
        `;
        
        document.body.appendChild(notification);
        notification.classList.add('show');
        
        // Auto-hide after 30 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 30000);
    }
    
    /**
     * Apply service worker update
     */
    async applyUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }
    
    /**
     * Show install success message
     */
    showInstallSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'pwa-update-notification';
        message.style.background = '#4caf50';
        message.innerHTML = '✅ アプリのインストールが完了しました！';
        
        document.body.appendChild(message);
        message.classList.add('show');
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
    
    /**
     * Set up offline indicator
     */
    setupOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pwa-offline-indicator';
        indicator.innerHTML = '📡 オフラインモードです';
        
        document.body.appendChild(indicator);
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.hideOfflineIndicator();
            this.showConnectionRestoredMessage();
        });
        
        window.addEventListener('offline', () => {
            this.showOfflineIndicator();
        });
        
        // Initial state
        if (!navigator.onLine) {
            this.showOfflineIndicator();
        }
    }
    
    /**
     * Show offline indicator
     */
    showOfflineIndicator() {
        const indicator = document.querySelector('.pwa-offline-indicator');
        if (indicator) {
            indicator.classList.add('show');
        }
    }
    
    /**
     * Hide offline indicator
     */
    hideOfflineIndicator() {
        const indicator = document.querySelector('.pwa-offline-indicator');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }
    
    /**
     * Show connection restored message
     */
    showConnectionRestoredMessage() {
        const message = document.createElement('div');
        message.className = 'pwa-update-notification';
        message.style.background = '#4caf50';
        message.innerHTML = '🌐 インターネット接続が復旧しました';
        
        document.body.appendChild(message);
        message.classList.add('show');
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    /**
     * Set up update handler with smarter logic
     */
    setupUpdateHandler() {
        // Check for updates every 30 minutes
        setInterval(() => {
            if (this.swRegistration) {
                this.swRegistration.update();
            }
        }, 30 * 60 * 1000);
        
        // Also check on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.swRegistration) {
                this.swRegistration.update();
            }
        });
        
        // Check immediately if online
        if (navigator.onLine && this.swRegistration) {
            this.swRegistration.update();
        }
    }
    
    /**
     * Track PWA events
     */
    trackEvent(eventName, parameters = {}) {
        // Integration with analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'PWA',
                ...parameters
            });
        }
        
        console.log('PWA Event:', eventName, parameters);
    }
    
    /**
     * Get comprehensive app info
     */
    getAppInfo() {
        return {
            isInstalled: this.isInstalled,
            isOnline: navigator.onLine,
            hasServiceWorker: 'serviceWorker' in navigator,
            swRegistration: !!this.swRegistration,
            canInstall: !!this.deferredPrompt,
            
            // Additional info
            swState: this.swRegistration?.active?.state || 'none',
            swScope: this.swRegistration?.scope || 'none',
            lastUpdate: this.lastUpdateCheck || null,
            cacheApiSupported: 'caches' in window,
            notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported',
            storage: this.getStorageInfo()
        };
    }
    
    /**
     * Get storage information
     */
    getStorageInfo() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
                console.log('Storage estimate:', estimate);
                return {
                    quota: estimate.quota,
                    usage: estimate.usage,
                    usagePercentage: ((estimate.usage || 0) / (estimate.quota || 1) * 100).toFixed(2)
                };
            });
        }
        return { supported: false };
    }
    
    /**
     * Clear app data with options
     */
    async clearAppData(options = {}) {
        const {
            clearCaches = true,
            clearStorage = true,
            clearServiceWorker = false,
            clearIndexedDB = false
        } = options;
        
        try {
            const results = {};
            
            // Clear caches
            if (clearCaches && 'caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                results.caches = `Cleared ${cacheNames.length} caches`;
            }
            
            // Clear service worker
            if (clearServiceWorker && this.swRegistration) {
                await this.swRegistration.unregister();
                results.serviceWorker = 'Service worker unregistered';
            }
            
            // Clear storage
            if (clearStorage) {
                localStorage.clear();
                sessionStorage.clear();
                results.storage = 'Local and session storage cleared';
            }
            
            // Clear IndexedDB
            if (clearIndexedDB) {
                results.indexedDB = await this.clearIndexedDB();
            }
            
            console.log('App data cleared:', results);
            return { success: true, results };
        } catch (error) {
            console.error('Failed to clear app data:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Clear IndexedDB databases
     */
    async clearIndexedDB() {
        try {
            if (!('indexedDB' in window)) {
                return 'IndexedDB not supported';
            }
            
            // This is a simplified approach - in practice you'd want to
            // enumerate and clear specific databases
            const dbNames = ['PortfolioOfflineDB', 'PortfolioFormDB'];
            const results = [];
            
            for (const dbName of dbNames) {
                try {
                    const deleteReq = indexedDB.deleteDatabase(dbName);
                    await new Promise((resolve, reject) => {
                        deleteReq.onsuccess = resolve;
                        deleteReq.onerror = reject;
                        deleteReq.onblocked = () => {
                            console.warn(`Database ${dbName} deletion blocked`);
                            resolve();
                        };
                    });
                    results.push(`${dbName} cleared`);
                } catch (error) {
                    results.push(`${dbName} error: ${error.message}`);
                }
            }
            
            return results.join(', ');
        } catch (error) {
            return `IndexedDB clear error: ${error.message}`;
        }
    }
    
    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            if (!('caches' in window)) {
                return { supported: false };
            }
            
            const cacheNames = await caches.keys();
            const stats = {
                supported: true,
                totalCaches: cacheNames.length,
                caches: []
            };
            
            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                stats.caches.push({
                    name: cacheName,
                    entryCount: keys.length
                });
            }
            
            return stats;
        } catch (error) {
            return { supported: true, error: error.message };
        }
    }
    
    /**
     * Force service worker update
     */
    async forceUpdate() {
        try {
            if (!this.swRegistration) {
                throw new Error('No service worker registration');
            }
            
            // Update the service worker
            await this.swRegistration.update();
            
            // If there's a waiting service worker, activate it
            if (this.swRegistration.waiting) {
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
                return true;
            }
            
            return false; // No update available
        } catch (error) {
            console.error('Force update failed:', error);
            throw error;
        }
    }
}

// Initialize PWA Manager
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
    
    // Expose debug methods
    if (typeof window !== 'undefined') {
        window.debugPWA = {
            getInfo: () => window.pwaManager.getAppInfo(),
            getCacheStats: () => window.pwaManager.getCacheStats(),
            clearData: (options) => window.pwaManager.clearAppData(options),
            forceUpdate: () => window.pwaManager.forceUpdate(),
            getVersion: () => window.pwaManager.getServiceWorkerVersion()
        };
    }
});

// Export for external use
if (typeof window !== 'undefined') {
    window.PWAManager = PWAManager;
}