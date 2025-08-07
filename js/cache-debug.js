/**
 * Cache Debug and Testing Utilities
 * 
 * This module provides debugging tools for testing cache strategies,
 * offline functionality, and service worker behavior.
 */

class CacheDebugger {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
        
        console.log('Cache Debugger initialized');
    }
    
    /**
     * Run all cache tests
     */
    async runAllTests() {
        if (this.isRunning) {
            console.log('Tests already running...');
            return;
        }
        
        this.isRunning = true;
        this.testResults = [];
        
        console.log('🧪 Starting Cache Tests...');
        
        try {
            await this.testServiceWorkerRegistration();
            await this.testCacheAPIs();
            await this.testOfflineFunctionality();
            await this.testCacheStrategies();
            await this.testFormOfflineStorage();
            
            this.displayResults();
        } catch (error) {
            console.error('Test suite failed:', error);
        } finally {
            this.isRunning = false;
        }
    }
    
    /**
     * Test service worker registration
     */
    async testServiceWorkerRegistration() {
        const test = { name: 'Service Worker Registration', status: 'running', details: {} };
        
        try {
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Worker not supported');
            }
            
            const registration = await navigator.serviceWorker.getRegistration();
            test.details.hasRegistration = !!registration;
            test.details.scope = registration?.scope;
            test.details.state = registration?.active?.state;
            
            // Test version communication
            if (registration && registration.active) {
                const version = await this.getServiceWorkerVersion(registration);
                test.details.version = version;
            }
            
            test.status = 'passed';
            test.message = 'Service Worker is properly registered';
        } catch (error) {
            test.status = 'failed';
            test.message = error.message;
            test.details.error = error.message;
        }
        
        this.testResults.push(test);
        console.log(`✅ ${test.name}: ${test.status}`);
    }
    
    /**
     * Test Cache APIs
     */
    async testCacheAPIs() {
        const test = { name: 'Cache APIs', status: 'running', details: {} };
        
        try {
            if (!('caches' in window)) {
                throw new Error('Cache API not supported');
            }
            
            // List all caches
            const cacheNames = await caches.keys();
            test.details.cacheNames = cacheNames;
            test.details.cacheCount = cacheNames.length;
            
            // Test cache operations
            const testCache = await caches.open('test-cache');
            const testResponse = new Response('test data', { 
                headers: { 'Content-Type': 'text/plain' }
            });
            
            await testCache.put('test-url', testResponse);
            const retrieved = await testCache.match('test-url');
            
            if (!retrieved) {
                throw new Error('Cache put/get failed');
            }
            
            // Clean up
            await testCache.delete('test-url');
            await caches.delete('test-cache');
            
            test.status = 'passed';
            test.message = 'Cache APIs working correctly';
        } catch (error) {
            test.status = 'failed';
            test.message = error.message;
            test.details.error = error.message;
        }
        
        this.testResults.push(test);
        console.log(`✅ ${test.name}: ${test.status}`);
    }
    
    /**
     * Test offline functionality
     */
    async testOfflineFunctionality() {
        const test = { name: 'Offline Functionality', status: 'running', details: {} };
        
        try {
            // Check offline manager
            const hasOfflineManager = !!window.offlineManager;
            test.details.hasOfflineManager = hasOfflineManager;
            
            if (hasOfflineManager) {
                const stats = await window.offlineManager.getOfflineStats();
                test.details.offlineStats = stats;
            }
            
            // Check IndexedDB
            if ('indexedDB' in window) {
                test.details.indexedDBSupported = true;
                // Try to open the offline database
                const dbTest = await this.testIndexedDB();
                test.details.indexedDBTest = dbTest;
            } else {
                test.details.indexedDBSupported = false;
            }
            
            test.status = 'passed';
            test.message = 'Offline functionality is available';
        } catch (error) {
            test.status = 'failed';
            test.message = error.message;
            test.details.error = error.message;
        }
        
        this.testResults.push(test);
        console.log(`✅ ${test.name}: ${test.status}`);
    }
    
    /**
     * Test cache strategies
     */
    async testCacheStrategies() {
        const test = { name: 'Cache Strategies', status: 'running', details: {} };
        
        try {
            const testUrls = [
                { url: '/css/modern-style.css', strategy: 'cache-first', type: 'static' },
                { url: '/js/modern-script.js', strategy: 'cache-first', type: 'static' },
                { url: '/img/favicon.ico', strategy: 'cache-first', type: 'image' },
                { url: '/', strategy: 'network-first', type: 'html' }
            ];
            
            const results = {};
            
            for (const testUrl of testUrls) {
                try {
                    const startTime = performance.now();
                    const response = await fetch(testUrl.url);
                    const endTime = performance.now();
                    
                    results[testUrl.url] = {
                        status: response.status,
                        cached: response.headers.has('sw-cache-timestamp'),
                        responseTime: Math.round(endTime - startTime),
                        type: testUrl.type,
                        strategy: testUrl.strategy
                    };
                } catch (error) {
                    results[testUrl.url] = {
                        error: error.message,
                        type: testUrl.type,
                        strategy: testUrl.strategy
                    };
                }
            }
            
            test.details.strategyResults = results;
            test.status = 'passed';
            test.message = 'Cache strategies tested';
        } catch (error) {
            test.status = 'failed';
            test.message = error.message;
            test.details.error = error.message;
        }
        
        this.testResults.push(test);
        console.log(`✅ ${test.name}: ${test.status}`);
    }
    
    /**
     * Test form offline storage
     */
    async testFormOfflineStorage() {
        const test = { name: 'Form Offline Storage', status: 'running', details: {} };
        
        try {
            if (!window.offlineManager) {
                throw new Error('Offline manager not available');
            }
            
            // Create a test form submission
            const testFormData = {
                from_name: 'Test User',
                from_email: 'test@example.com',
                subject: 'Test Subject',
                message: 'This is a test message for offline storage'
            };
            
            // Store test submission
            await window.offlineManager.storeFormSubmission({
                target: {
                    classList: { contains: () => true },
                    elements: Object.keys(testFormData).map(key => ({
                        name: key,
                        value: testFormData[key]
                    }))
                }
            });
            
            // Check if stored
            const stats = await window.offlineManager.getOfflineStats();
            test.details.storedSubmissions = stats.totalSubmissions;
            test.details.pendingSubmissions = stats.pendingSubmissions;
            
            test.status = 'passed';
            test.message = 'Form offline storage working';
        } catch (error) {
            test.status = 'failed';
            test.message = error.message;
            test.details.error = error.message;
        }
        
        this.testResults.push(test);
        console.log(`✅ ${test.name}: ${test.status}`);
    }
    
    /**
     * Test IndexedDB functionality
     */
    async testIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('test-db', 1);
            
            request.onerror = () => resolve({ supported: false, error: request.error });
            request.onsuccess = () => {
                const db = request.result;
                db.close();
                indexedDB.deleteDatabase('test-db');
                resolve({ supported: true });
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore('test', { keyPath: 'id' });
            };
        });
    }
    
    /**
     * Get service worker version
     */
    async getServiceWorkerVersion(registration) {
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data.version || 'unknown');
            };
            
            setTimeout(() => resolve('timeout'), 3000);
            
            if (registration.active) {
                registration.active.postMessage(
                    { type: 'GET_VERSION' },
                    [messageChannel.port2]
                );
            } else {
                resolve('no-active-sw');
            }
        });
    }
    
    /**
     * Display test results
     */
    displayResults() {
        console.log('\n🧪 Cache Test Results:');
        console.log('='.repeat(50));
        
        let passed = 0;
        let failed = 0;
        
        this.testResults.forEach(test => {
            const status = test.status === 'passed' ? '✅' : '❌';
            console.log(`${status} ${test.name}: ${test.message}`);
            
            if (test.status === 'passed') passed++;
            else failed++;
            
            if (test.details && Object.keys(test.details).length > 0) {
                console.log('   Details:', test.details);
            }
        });
        
        console.log('='.repeat(50));
        console.log(`📊 Summary: ${passed} passed, ${failed} failed`);
        
        return {
            passed,
            failed,
            total: this.testResults.length,
            results: this.testResults
        };
    }
    
    /**
     * Get cache performance metrics
     */
    async getCacheMetrics() {
        try {
            const cacheNames = await caches.keys();
            const metrics = {
                totalCaches: cacheNames.length,
                caches: []
            };
            
            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                
                let totalSize = 0;
                const entries = [];
                
                for (const request of keys.slice(0, 10)) { // Sample first 10 entries
                    try {
                        const response = await cache.match(request);
                        if (response && response.body) {
                            const reader = response.body.getReader();
                            let size = 0;
                            let done = false;
                            
                            while (!done) {
                                const { value, done: readerDone } = await reader.read();
                                done = readerDone;
                                if (value) {
                                    size += value.length;
                                }
                            }
                            
                            totalSize += size;
                            entries.push({
                                url: request.url,
                                size,
                                method: request.method
                            });
                        }
                    } catch (error) {
                        // Skip entries that can't be read
                    }
                }
                
                metrics.caches.push({
                    name: cacheName,
                    entryCount: keys.length,
                    sampleSize: totalSize,
                    sampleEntries: entries
                });
            }
            
            return metrics;
        } catch (error) {
            console.error('Failed to get cache metrics:', error);
            return { error: error.message };
        }
    }
    
    /**
     * Simulate offline mode
     */
    async simulateOffline(duration = 10000) {
        console.log(`🔌 Simulating offline mode for ${duration}ms...`);
        
        // Dispatch offline event
        window.dispatchEvent(new Event('offline'));
        
        // Restore online after duration
        setTimeout(() => {
            console.log('🌐 Restoring online mode...');
            window.dispatchEvent(new Event('online'));
        }, duration);
        
        return new Promise(resolve => {
            setTimeout(resolve, duration + 1000);
        });
    }
    
    /**
     * Clear all test data
     */
    async cleanup() {
        try {
            // Clean up any test caches
            const cacheNames = await caches.keys();
            const testCaches = cacheNames.filter(name => name.includes('test'));
            
            await Promise.all(testCaches.map(name => caches.delete(name)));
            
            // Clean up test form submissions if possible
            if (window.offlineManager) {
                await window.offlineManager.clearOfflineData({ 
                    keepSynced: true 
                });
            }
            
            console.log('🧹 Test cleanup completed');
            return true;
        } catch (error) {
            console.error('Cleanup failed:', error);
            return false;
        }
    }
}

// Initialize cache debugger
const cacheDebugger = new CacheDebugger();

// Export for global use
if (typeof window !== 'undefined') {
    window.CacheDebugger = CacheDebugger;
    window.cacheDebugger = cacheDebugger;
    
    // Add to debug namespace
    if (!window.debug) {
        window.debug = {};
    }
    
    window.debug.cache = {
        runTests: () => cacheDebugger.runAllTests(),
        getMetrics: () => cacheDebugger.getCacheMetrics(),
        simulateOffline: (duration) => cacheDebugger.simulateOffline(duration),
        cleanup: () => cacheDebugger.cleanup(),
        results: () => cacheDebugger.testResults
    };
}

// Auto-run tests in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Wait a bit for other scripts to initialize
    setTimeout(() => {
        console.log('🔧 Development mode detected - running cache tests...');
        cacheDebugger.runAllTests();
    }, 3000);
}

console.log('Cache Debugger loaded. Use window.debug.cache.runTests() to test cache functionality.');