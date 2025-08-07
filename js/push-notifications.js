/**
 * Push Notification Manager
 * 
 * Handles push notification subscription and management
 * Features:
 * - VAPID key management
 * - Subscription management
 * - Notification display and interaction
 * - User preference handling
 * - Analytics integration
 */

class PushNotificationManager {
    constructor() {
        this.swRegistration = null;
        this.subscription = null;
        this.vapidPublicKey = null; // Set this with your VAPID public key
        this.serverEndpoint = '/api/push-subscribe'; // Your server endpoint
        this.isSupported = this.checkSupport();
        
        this.init();
    }
    
    /**
     * Initialize push notification manager
     */
    async init() {
        if (!this.isSupported) {
            console.warn('Push notifications not supported');
            return;
        }
        
        try {
            await this.setupServiceWorker();
            await this.checkExistingSubscription();
            this.setupUI();
            
            console.log('Push Notification Manager initialized');
        } catch (error) {
            console.error('Failed to initialize Push Notification Manager:', error);
        }
    }
    
    /**
     * Check if push notifications are supported
     */
    checkSupport() {
        return 'serviceWorker' in navigator && 
               'PushManager' in window && 
               'Notification' in window;
    }
    
    /**
     * Setup service worker
     */
    async setupServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Worker not supported');
        }
        
        this.swRegistration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready for push notifications');
    }
    
    /**
     * Check for existing subscription
     */
    async checkExistingSubscription() {
        try {
            this.subscription = await this.swRegistration.pushManager.getSubscription();
            
            if (this.subscription) {
                console.log('Existing push subscription found');
                this.updateSubscriptionOnServer(this.subscription);
            }
        } catch (error) {
            console.error('Error checking existing subscription:', error);
        }
    }
    
    /**
     * Setup notification UI
     */
    setupUI() {
        this.createNotificationButton();
        this.updateButtonState();
    }
    
    /**
     * Create notification permission button
     */
    createNotificationButton() {
        // Check if button already exists
        if (document.querySelector('.push-notification-button')) return;
        
        const button = document.createElement('button');
        button.className = 'push-notification-button';
        button.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="button-text">通知を許可</span>
        `;
        
        button.addEventListener('click', this.handleButtonClick.bind(this));
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .push-notification-button {
                position: fixed;
                bottom: 80px;
                right: 80px;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                transition: all 0.3s ease;
                z-index: 999;
                display: none;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .push-notification-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
            }
            
            .push-notification-button.show {
                display: flex;
                animation: fadeInUp 0.3s ease;
            }
            
            .push-notification-button.subscribed {
                background: linear-gradient(45deg, #2196F3, #1976D2);
                box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
            }
            
            .push-notification-button.subscribed:hover {
                box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
            }
            
            .push-notification-button.disabled {
                background: #999;
                cursor: not-allowed;
                box-shadow: none;
            }
            
            .push-notification-banner {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                display: none;
                align-items: center;
                justify-content: space-between;
            }
            
            .push-notification-banner.show {
                display: flex;
                animation: slideInUp 0.3s ease;
            }
            
            .push-notification-banner .banner-content {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .push-notification-banner .banner-text {
                flex: 1;
            }
            
            .push-notification-banner .banner-title {
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .push-notification-banner .banner-subtitle {
                font-size: 12px;
                opacity: 0.9;
            }
            
            .push-notification-banner .banner-actions {
                display: flex;
                gap: 10px;
            }
            
            .push-notification-banner .banner-button {
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
            
            .push-notification-banner .banner-button:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .push-notification-banner .banner-button.primary {
                background: rgba(255, 255, 255, 0.9);
                color: #4CAF50;
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slideInUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .push-notification-button {
                    bottom: 140px;
                    right: 20px;
                }
                
                .push-notification-banner {
                    left: 10px;
                    right: 10px;
                    bottom: 10px;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(button);
        this.createNotificationBanner();
    }
    
    /**
     * Create notification permission banner
     */
    createNotificationBanner() {
        if (document.querySelector('.push-notification-banner')) return;
        
        const banner = document.createElement('div');
        banner.className = 'push-notification-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-icon">🔔</div>
                <div class="banner-text">
                    <div class="banner-title">通知を有効にする</div>
                    <div class="banner-subtitle">新しい情報やアップデートをお知らせします</div>
                </div>
            </div>
            <div class="banner-actions">
                <button class="banner-button primary" onclick="window.pushManager.requestPermission()">
                    許可する
                </button>
                <button class="banner-button" onclick="window.pushManager.dismissBanner()">
                    後で
                </button>
            </div>
        `;
        
        document.body.appendChild(banner);
    }
    
    /**
     * Update button state based on permission and subscription status
     */
    updateButtonState() {
        const button = document.querySelector('.push-notification-button');
        if (!button) return;
        
        const permission = Notification.permission;
        
        if (permission === 'granted' && this.subscription) {
            button.innerHTML = `
                <i class="fas fa-bell"></i>
                <span class="button-text">通知ON</span>
            `;
            button.classList.add('subscribed');
            button.classList.remove('show'); // Hide when already subscribed
        } else if (permission === 'denied') {
            button.innerHTML = `
                <i class="fas fa-bell-slash"></i>
                <span class="button-text">通知OFF</span>
            `;
            button.classList.add('disabled');
            button.classList.remove('show');
        } else {
            button.innerHTML = `
                <i class="fas fa-bell"></i>
                <span class="button-text">通知を許可</span>
            `;
            button.classList.remove('subscribed', 'disabled');
            
            // Show button if permission is default and user hasn't dismissed
            if (permission === 'default' && !localStorage.getItem('push-notifications-dismissed')) {
                this.showButton();
            }
        }
    }
    
    /**
     * Handle button click
     */
    async handleButtonClick() {
        try {
            if (this.subscription) {
                await this.unsubscribe();
            } else {
                await this.requestPermission();
            }
        } catch (error) {
            console.error('Error handling notification button click:', error);
            this.showErrorMessage('通知設定の変更に失敗しました');
        }
    }
    
    /**
     * Request notification permission
     */
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                await this.subscribe();
                this.showSuccessMessage('通知が有効になりました');
                this.trackEvent('notification_permission_granted');
            } else if (permission === 'denied') {
                this.showErrorMessage('通知が拒否されました');
                this.trackEvent('notification_permission_denied');
            } else {
                this.showInfoMessage('通知の許可が必要です');
                this.trackEvent('notification_permission_dismissed');
            }
            
            this.updateButtonState();
            this.hideBanner();
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            this.showErrorMessage('通知許可の要求に失敗しました');
        }
    }
    
    /**
     * Subscribe to push notifications
     */
    async subscribe() {
        try {
            if (!this.vapidPublicKey) {
                throw new Error('VAPID public key not configured');
            }
            
            const subscriptionOptions = {
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
            };
            
            this.subscription = await this.swRegistration.pushManager.subscribe(subscriptionOptions);
            console.log('Push subscription successful:', this.subscription);
            
            // Send subscription to server
            await this.updateSubscriptionOnServer(this.subscription);
            
            this.trackEvent('push_subscription_created');
        } catch (error) {
            console.error('Push subscription failed:', error);
            throw error;
        }
    }
    
    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe() {
        try {
            if (!this.subscription) {
                throw new Error('No subscription to unsubscribe from');
            }
            
            await this.subscription.unsubscribe();
            await this.removeSubscriptionFromServer(this.subscription);
            
            this.subscription = null;
            this.showInfoMessage('通知を無効にしました');
            this.updateButtonState();
            
            this.trackEvent('push_subscription_removed');
        } catch (error) {
            console.error('Push unsubscription failed:', error);
            throw error;
        }
    }
    
    /**
     * Send subscription to server
     */
    async updateSubscriptionOnServer(subscription) {
        try {
            const response = await fetch(this.serverEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'subscribe',
                    subscription: subscription,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            console.log('Subscription sent to server successfully');
        } catch (error) {
            console.warn('Failed to send subscription to server:', error);
            // Don't throw - subscription still works locally
        }
    }
    
    /**
     * Remove subscription from server
     */
    async removeSubscriptionFromServer(subscription) {
        try {
            const response = await fetch(this.serverEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'unsubscribe',
                    subscription: subscription
                })
            });
            
            if (!response.ok) {
                console.warn(`Failed to remove subscription from server: ${response.status}`);
            }
        } catch (error) {
            console.warn('Failed to remove subscription from server:', error);
        }
    }
    
    /**
     * Convert VAPID key to Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
            
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
    
    /**
     * Show button
     */
    showButton() {
        const button = document.querySelector('.push-notification-button');
        if (button) {
            button.classList.add('show');
            
            // Auto-hide after 30 seconds
            setTimeout(() => {
                if (!this.subscription) {
                    this.hideButton();
                }
            }, 30000);
        }
    }
    
    /**
     * Hide button
     */
    hideButton() {
        const button = document.querySelector('.push-notification-button');
        if (button) {
            button.classList.remove('show');
        }
    }
    
    /**
     * Show banner
     */
    showBanner() {
        const banner = document.querySelector('.push-notification-banner');
        if (banner && Notification.permission === 'default') {
            banner.classList.add('show');
        }
    }
    
    /**
     * Hide banner
     */
    hideBanner() {
        const banner = document.querySelector('.push-notification-banner');
        if (banner) {
            banner.classList.remove('show');
        }
    }
    
    /**
     * Dismiss banner permanently
     */
    dismissBanner() {
        this.hideBanner();
        localStorage.setItem('push-notifications-dismissed', 'true');
        this.trackEvent('notification_banner_dismissed');
    }
    
    /**
     * Notification methods
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }
    
    showInfoMessage(message) {
        this.showMessage(message, 'info');
    }
    
    showMessage(message, type = 'info') {
        // Use existing notification system if available
        if (typeof showNotification === 'function') {
            showNotification(message, type);
            return;
        }
        
        // Create simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            z-index: 10001;
            max-width: 300px;
        `;
        
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            info: '#2196F3'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    /**
     * Track events
     */
    trackEvent(eventName, parameters = {}) {
        // Integration with analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'Push Notifications',
                ...parameters
            });
        }
        
        console.log('Push Notification Event:', eventName, parameters);
    }
    
    /**
     * Get subscription info
     */
    getSubscriptionInfo() {
        return {
            isSupported: this.isSupported,
            permission: Notification.permission,
            isSubscribed: !!this.subscription,
            subscription: this.subscription ? {
                endpoint: this.subscription.endpoint,
                keys: this.subscription.keys
            } : null
        };
    }
    
    /**
     * Test notification (for debugging)
     */
    async testNotification() {
        if (Notification.permission !== 'granted') {
            throw new Error('Notification permission not granted');
        }
        
        const notification = new Notification('テスト通知', {
            body: 'これはテスト通知です',
            icon: '/img/icons/icon-192x192.png',
            badge: '/img/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            actions: [
                {
                    action: 'view',
                    title: '表示'
                },
                {
                    action: 'close',
                    title: '閉じる'
                }
            ]
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        return notification;
    }
    
    /**
     * Configure VAPID key (call this during initialization)
     */
    setVapidKey(vapidKey) {
        this.vapidPublicKey = vapidKey;
    }
    
    /**
     * Configure server endpoint
     */
    setServerEndpoint(endpoint) {
        this.serverEndpoint = endpoint;
    }
}

// Auto-initialize if not in test environment
if (typeof window !== 'undefined' && !window.__TEST_ENV__) {
    document.addEventListener('DOMContentLoaded', () => {
        window.pushManager = new PushNotificationManager();
        
        // Example VAPID key - replace with your own
        // window.pushManager.setVapidKey('YOUR_VAPID_PUBLIC_KEY');
        
        // Show banner after a delay if permission is default
        setTimeout(() => {
            if (Notification.permission === 'default' && 
                !localStorage.getItem('push-notifications-dismissed')) {
                window.pushManager.showBanner();
            }
        }, 10000);
        
        // Expose debug methods
        window.debugPushNotifications = {
            getInfo: () => window.pushManager.getSubscriptionInfo(),
            test: () => window.pushManager.testNotification(),
            subscribe: () => window.pushManager.requestPermission(),
            unsubscribe: () => window.pushManager.unsubscribe()
        };
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PushNotificationManager;
}