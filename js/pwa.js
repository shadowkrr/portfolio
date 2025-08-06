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
     * Set up Service Worker
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
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
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
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccessMessage();
            
            // Track install event
            this.trackEvent('app_installed');
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
     * Set up update handler
     */
    setupUpdateHandler() {
        // Check for updates every 30 minutes
        setInterval(() => {
            if (this.swRegistration) {
                this.swRegistration.update();
            }
        }, 30 * 60 * 1000);
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
     * Get app info
     */
    getAppInfo() {
        return {
            isInstalled: this.isInstalled,
            isOnline: navigator.onLine,
            hasServiceWorker: 'serviceWorker' in navigator,
            swRegistration: !!this.swRegistration,
            canInstall: !!this.deferredPrompt
        };
    }
    
    /**
     * Clear app data
     */
    async clearAppData() {
        try {
            // Clear caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            
            // Clear service worker
            if (this.swRegistration) {
                await this.swRegistration.unregister();
            }
            
            // Clear storage
            localStorage.clear();
            sessionStorage.clear();
            
            console.log('App data cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear app data:', error);
            return false;
        }
    }
}

// Initialize PWA Manager
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});

// Export for external use
if (typeof window !== 'undefined') {
    window.PWAManager = PWAManager;
}