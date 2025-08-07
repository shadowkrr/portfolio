/**
 * Offline Form Manager
 * 
 * Handles form submissions when offline and syncs them when online
 * Features:
 * - Queue form submissions when offline
 * - Background sync when connection is restored
 * - Retry mechanism for failed submissions
 * - User feedback and notifications
 */

class OfflineFormManager {
    constructor() {
        this.dbName = 'PortfolioOfflineFormsDB';
        this.dbVersion = 1;
        this.storeName = 'pending_forms';
        this.db = null;
        this.syncInProgress = false;
        
        this.init();
    }
    
    /**
     * Initialize the offline form manager
     */
    async init() {
        try {
            await this.initDatabase();
            this.setupEventListeners();
            this.registerBackgroundSync();
            
            // Process any pending forms on startup
            if (navigator.onLine) {
                this.processPendingForms();
            }
            
            console.log('Offline Form Manager initialized');
        } catch (error) {
            console.error('Failed to initialize Offline Form Manager:', error);
        }
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
                
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                }
            };
        });
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for online/offline events
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Listen for form submissions
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Listen for service worker messages
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
        }
    }
    
    /**
     * Handle form submission
     */
    async handleFormSubmit(event) {
        const form = event.target;
        
        // Only handle contact forms or forms with data-offline attribute
        if (!form.matches('[data-offline="true"]') && !form.matches('#contactForm')) {
            return;
        }
        
        // If we're offline, prevent default and queue the form
        if (!navigator.onLine) {
            event.preventDefault();
            await this.queueFormSubmission(form);
            return;
        }
        
        // If we're online, let the form submit normally but also queue as backup
        this.queueFormSubmission(form, { backup: true });
    }
    
    /**
     * Queue form submission for later processing
     */
    async queueFormSubmission(form, options = {}) {
        try {
            const formData = new FormData(form);
            const data = {};
            
            // Convert FormData to object
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            const submission = {
                id: Date.now() + Math.random(),
                type: form.getAttribute('data-form-type') || 'contact',
                formData: data,
                action: form.action || window.location.href,
                method: form.method || 'POST',
                timestamp: Date.now(),
                status: 'pending',
                retryCount: 0,
                maxRetries: 3,
                backup: options.backup || false
            };
            
            await this.storeFormSubmission(submission);
            
            if (!options.backup) {
                this.showQueuedNotification(submission);
                this.registerBackgroundSync();
            }
            
            console.log('Form submission queued:', submission);
        } catch (error) {
            console.error('Failed to queue form submission:', error);
            this.showErrorNotification('フォームの保存に失敗しました');
        }
    }
    
    /**
     * Store form submission in IndexedDB
     */
    async storeFormSubmission(submission) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(submission);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get all pending form submissions
     */
    async getPendingSubmissions() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('status');
            const request = index.getAll('pending');
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Update form submission status
     */
    async updateSubmissionStatus(id, status, error = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            
            request.onsuccess = () => {
                const submission = request.result;
                if (submission) {
                    submission.status = status;
                    submission.lastAttempt = Date.now();
                    if (error) {
                        submission.error = error;
                    }
                    if (status === 'failed') {
                        submission.retryCount = (submission.retryCount || 0) + 1;
                    }
                    
                    const updateRequest = store.put(submission);
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('Submission not found'));
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Delete form submission
     */
    async deleteSubmission(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Register background sync
     */
    registerBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register('offline-form-sync');
            }).catch(error => {
                console.warn('Background sync registration failed:', error);
            });
        }
    }
    
    /**
     * Handle online event
     */
    async handleOnline() {
        console.log('Connection restored - processing pending forms');
        this.showOnlineNotification();
        
        // Small delay to ensure connection is stable
        setTimeout(() => {
            this.processPendingForms();
        }, 1000);
    }
    
    /**
     * Handle offline event
     */
    handleOffline() {
        console.log('Connection lost - forms will be queued');
        this.showOfflineNotification();
    }
    
    /**
     * Handle service worker messages
     */
    handleSWMessage(event) {
        const { data } = event;
        
        if (data.type === 'FORM_SYNC_COMPLETE') {
            this.handleSyncComplete(data.results);
        } else if (data.type === 'FORM_SYNC_FAILED') {
            this.handleSyncFailed(data.error);
        }
    }
    
    /**
     * Process pending form submissions
     */
    async processPendingForms() {
        if (this.syncInProgress || !navigator.onLine) {
            return;
        }
        
        this.syncInProgress = true;
        
        try {
            const pendingSubmissions = await this.getPendingSubmissions();
            
            if (pendingSubmissions.length === 0) {
                this.syncInProgress = false;
                return;
            }
            
            console.log(`Processing ${pendingSubmissions.length} pending form submissions`);
            this.showSyncingNotification(pendingSubmissions.length);
            
            const results = await Promise.allSettled(
                pendingSubmissions.map(submission => this.submitForm(submission))
            );
            
            let successCount = 0;
            let failureCount = 0;
            
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const submission = pendingSubmissions[i];
                
                if (result.status === 'fulfilled') {
                    await this.deleteSubmission(submission.id);
                    successCount++;
                } else {
                    await this.updateSubmissionStatus(submission.id, 'failed', result.reason.message);
                    
                    // Delete if max retries exceeded
                    if (submission.retryCount >= submission.maxRetries) {
                        await this.deleteSubmission(submission.id);
                    }
                    failureCount++;
                }
            }
            
            this.showSyncResultNotification(successCount, failureCount);
            
        } catch (error) {
            console.error('Error processing pending forms:', error);
            this.showErrorNotification('フォーム同期中にエラーが発生しました');
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * Submit a single form
     */
    async submitForm(submission) {
        try {
            let response;
            
            if (submission.type === 'contact' && window.emailjs) {
                // Use EmailJS if available
                response = await this.submitViaEmailJS(submission);
            } else {
                // Use regular fetch
                response = await this.submitViaFetch(submission);
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            console.error('Form submission failed:', error);
            throw error;
        }
    }
    
    /**
     * Submit via EmailJS
     */
    async submitViaEmailJS(submission) {
        // This would integrate with your EmailJS configuration
        const emailjsConfig = window.emailjsConfig || {};
        
        if (!emailjsConfig.serviceId || !emailjsConfig.templateId || !emailjsConfig.userId) {
            throw new Error('EmailJS not properly configured');
        }
        
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: emailjsConfig.serviceId,
                template_id: emailjsConfig.templateId,
                user_id: emailjsConfig.userId,
                template_params: submission.formData
            })
        });
        
        return response;
    }
    
    /**
     * Submit via regular fetch
     */
    async submitViaFetch(submission) {
        const formData = new FormData();
        
        for (const [key, value] of Object.entries(submission.formData)) {
            formData.append(key, value);
        }
        
        const response = await fetch(submission.action, {
            method: submission.method,
            body: formData
        });
        
        return response;
    }
    
    /**
     * Notification methods
     */
    showQueuedNotification(submission) {
        this.showNotification(
            `📝 フォームを保存しました\nオンライン復帰時に自動送信されます`,
            'info',
            5000
        );
    }
    
    showOnlineNotification() {
        this.showNotification('🌐 接続が復旧しました', 'success', 3000);
    }
    
    showOfflineNotification() {
        this.showNotification(
            '📡 オフラインです\nフォームは自動保存されます',
            'warning',
            4000
        );
    }
    
    showSyncingNotification(count) {
        this.showNotification(
            `🔄 ${count}件のフォームを送信中...`,
            'info',
            3000
        );
    }
    
    showSyncResultNotification(success, failed) {
        if (success > 0 && failed === 0) {
            this.showNotification(
                `✅ ${success}件のフォームを送信しました`,
                'success',
                4000
            );
        } else if (success > 0 && failed > 0) {
            this.showNotification(
                `⚠️ ${success}件送信、${failed}件失敗`,
                'warning',
                5000
            );
        } else if (failed > 0) {
            this.showNotification(
                `❌ ${failed}件のフォーム送信に失敗しました`,
                'error',
                5000
            );
        }
    }
    
    showErrorNotification(message) {
        this.showNotification(message, 'error', 5000);
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 4000) {
        // Use existing notification system if available
        if (typeof showNotification === 'function') {
            showNotification(message, type);
            return;
        }
        
        // Create our own notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            z-index: 10000;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease;
            white-space: pre-line;
        `;
        
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        // Add animation styles if not already present
        if (!document.querySelector('#offline-form-animations')) {
            const style = document.createElement('style');
            style.id = 'offline-form-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Get statistics
     */
    async getStats() {
        try {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            const allSubmissions = await new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            const stats = {
                total: allSubmissions.length,
                pending: allSubmissions.filter(s => s.status === 'pending').length,
                failed: allSubmissions.filter(s => s.status === 'failed').length,
                oldest: allSubmissions.length > 0 ? 
                    Math.min(...allSubmissions.map(s => s.timestamp)) : null
            };
            
            return stats;
        } catch (error) {
            console.error('Failed to get stats:', error);
            return { total: 0, pending: 0, failed: 0, oldest: null };
        }
    }
    
    /**
     * Clear all stored submissions (for debugging)
     */
    async clearAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Auto-initialize if not in test environment
if (typeof window !== 'undefined' && !window.__TEST_ENV__) {
    document.addEventListener('DOMContentLoaded', () => {
        window.offlineFormManager = new OfflineFormManager();
        
        // Expose debug methods
        window.debugOfflineForms = {
            getStats: () => window.offlineFormManager.getStats(),
            clearAll: () => window.offlineFormManager.clearAll(),
            processPending: () => window.offlineFormManager.processPendingForms()
        };
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineFormManager;
}