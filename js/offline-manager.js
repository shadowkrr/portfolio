/**
 * Offline Manager for Enhanced PWA Functionality
 * 
 * Features:
 * - Background sync for form submissions
 * - Offline data storage with IndexedDB
 * - Queue management for delayed operations
 * - Offline notification system
 * - Data synchronization when online
 */

class OfflineManager {
    constructor() {
        this.dbName = 'PortfolioOfflineDB';
        this.dbVersion = 1;
        this.db = null;
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        
        this.init();
    }
    
    /**
     * Initialize offline manager
     */
    async init() {
        await this.initDatabase();
        this.setupEventListeners();
        this.setupBackgroundSync();
        this.processQueueOnStartup();
        
        console.log('Offline Manager initialized');
    }
    
    /**
     * Initialize IndexedDB database
     */
    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create stores
                if (!db.objectStoreNames.contains('formSubmissions')) {
                    const formStore = db.createObjectStore('formSubmissions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    formStore.createIndex('timestamp', 'timestamp', { unique: false });
                    formStore.createIndex('synced', 'synced', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('offlineActions')) {
                    const actionStore = db.createObjectStore('offlineActions', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    actionStore.createIndex('type', 'type', { unique: false });
                    actionStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('offlineContent')) {
                    const contentStore = db.createObjectStore('offlineContent', { 
                        keyPath: 'url' 
                    });
                    contentStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Online/offline events
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Form submission interceptor
        document.addEventListener('submit', this.handleFormSubmission.bind(this));
        
        // Page visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Service worker messages
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
        }
    }
    
    /**
     * Set up background sync
     */
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            console.log('Background sync is supported');
            
            // Register sync events
            this.registerBackgroundSync('form-submission-sync');
            this.registerBackgroundSync('data-sync');
        } else {
            console.log('Background sync not supported, using fallback');
            // Fallback to regular sync checks
            setInterval(this.checkAndSync.bind(this), 30000); // Every 30 seconds
        }
    }
    
    /**
     * Register background sync
     */
    async registerBackgroundSync(tag) {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                if (registration.sync) {
                    await registration.sync.register(tag);
                    console.log(`Background sync registered: ${tag}`);
                }
            }
        } catch (error) {
            console.error('Background sync registration failed:', error);
        }
    }
    
    /**
     * Handle online event
     */
    async handleOnline() {
        this.isOnline = true;
        console.log('Connection restored - processing offline queue');
        
        this.showNotification('🌐 接続が復旧しました', 'success');
        
        // Process any queued items
        await this.processOfflineQueue();
        
        // Sync with server
        await this.syncWithServer();
    }
    
    /**
     * Handle offline event
     */
    handleOffline() {
        this.isOnline = false;
        console.log('Gone offline - enabling offline mode');
        
        this.showNotification('📡 オフラインモードです', 'warning');
    }
    
    /**
     * Handle form submissions
     */
    async handleFormSubmission(event) {
        const form = event.target;
        
        // Only handle contact forms
        if (!form.classList.contains('contact-form')) {
            return;
        }
        
        if (!this.isOnline) {
            event.preventDefault();
            await this.storeFormSubmission(form);
            this.showNotification('📝 フォームデータを保存しました。オンライン復旧時に送信されます。', 'info');
        }
    }
    
    /**
     * Store form submission for later sync
     */
    async storeFormSubmission(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        const submission = {
            formData: data,
            timestamp: Date.now(),
            synced: false,
            url: form.action || window.location.href,
            type: 'contact-form'
        };
        
        return this.storeData('formSubmissions', submission);
    }
    
    /**
     * Store data in IndexedDB
     */
    async storeData(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get data from IndexedDB
     */
    async getData(storeName, query = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = query ? store.get(query) : store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Update data in IndexedDB
     */
    async updateData(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Delete data from IndexedDB
     */
    async deleteData(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Process offline queue when coming back online
     */
    async processOfflineQueue() {
        try {
            // Get unsynced form submissions
            const submissions = await this.getData('formSubmissions');
            const unsynced = submissions.filter(s => !s.synced);
            
            for (const submission of unsynced) {
                try {
                    await this.syncFormSubmission(submission);
                    
                    // Mark as synced
                    submission.synced = true;
                    submission.syncedAt = Date.now();
                    await this.updateData('formSubmissions', submission);
                    
                    console.log('Form submission synced successfully');
                } catch (error) {
                    console.error('Failed to sync form submission:', error);
                }
            }
            
            if (unsynced.length > 0) {
                this.showNotification(`✅ ${unsynced.length}件のフォーム送信が完了しました`, 'success');
            }
            
        } catch (error) {
            console.error('Error processing offline queue:', error);
        }
    }
    
    /**
     * Sync individual form submission
     */
    async syncFormSubmission(submission) {
        // Use EmailJS if available
        if (typeof emailjs !== 'undefined' && window.EMAILJS_CONFIG) {
            return emailjs.send(
                window.EMAILJS_CONFIG.serviceId,
                window.EMAILJS_CONFIG.templateId,
                {
                    from_name: submission.formData.from_name || '',
                    from_email: submission.formData.from_email || '',
                    subject: submission.formData.subject || '',
                    message: submission.formData.message || '',
                    to_name: 'Portfolio Owner'
                },
                window.EMAILJS_CONFIG.publicKey
            );
        } else {
            // Fallback to fetch API
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submission.formData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        }
    }
    
    /**
     * Cache content for offline access
     */
    async cacheContent(url, content) {
        const contentData = {
            url,
            content,
            timestamp: Date.now(),
            type: 'html'
        };
        
        return this.storeData('offlineContent', contentData);
    }
    
    /**
     * Get cached content
     */
    async getCachedContent(url) {
        return this.getData('offlineContent', url);
    }
    
    /**
     * Handle service worker messages
     */
    handleSWMessage(event) {
        const { data } = event;
        
        switch (data.type) {
            case 'SYNC_FORMS':
                this.processOfflineQueue();
                break;
            case 'CACHE_CONTENT':
                this.cacheContent(data.url, data.content);
                break;
        }
    }
    
    /**
     * Handle page visibility changes
     */
    async handleVisibilityChange() {
        if (!document.hidden && this.isOnline) {
            // Page became visible and we're online - check for sync
            await this.checkAndSync();
        }
    }
    
    /**
     * Check and sync periodically
     */
    async checkAndSync() {
        if (this.isOnline) {
            await this.processOfflineQueue();
        }
    }
    
    /**
     * Sync with server
     */
    async syncWithServer() {
        try {
            // Check for any server-side updates
            // This could include checking for new content, updates, etc.
            console.log('Syncing with server...');
            
            // Placeholder for server sync logic
            // You could implement checking for new blog posts,
            // portfolio updates, etc.
            
        } catch (error) {
            console.error('Server sync failed:', error);
        }
    }
    
    /**
     * Process queue on startup
     */
    async processQueueOnStartup() {
        if (this.isOnline) {
            // Small delay to ensure everything is loaded
            setTimeout(() => {
                this.processOfflineQueue();
            }, 2000);
        }
    }
    
    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `offline-notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        const style = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInFromRight 0.3s ease;
        `;
        
        notification.style.cssText = style;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#4CAF50';
                break;
            case 'warning':
                notification.style.background = '#FF9800';
                break;
            case 'error':
                notification.style.background = '#F44336';
                break;
            default:
                notification.style.background = '#2196F3';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    /**
     * Get offline statistics
     */
    async getOfflineStats() {
        const submissions = await this.getData('formSubmissions');
        const actions = await this.getData('offlineActions');
        const content = await this.getData('offlineContent');
        
        return {
            totalSubmissions: submissions.length,
            pendingSubmissions: submissions.filter(s => !s.synced).length,
            totalActions: actions.length,
            cachedContentItems: content.length,
            lastSync: submissions.filter(s => s.synced).reduce((latest, s) => 
                Math.max(latest, s.syncedAt || 0), 0
            )
        };
    }
    
    /**
     * Clear offline data
     */
    async clearOfflineData() {
        const stores = ['formSubmissions', 'offlineActions', 'offlineContent'];
        
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
        
        console.log('Offline data cleared');
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutToRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize offline manager
document.addEventListener('DOMContentLoaded', () => {
    if (!window.offlineManager) {
        window.offlineManager = new OfflineManager();
    }
});

// Export for external use
if (typeof window !== 'undefined') {
    window.OfflineManager = OfflineManager;
}