/**
 * Service Worker for Portfolio Website
 * 
 * Provides:
 * - Caching strategies for static assets
 * - Offline functionality
 * - Background sync capabilities
 * - Push notification support
 * - Performance optimizations
 */

const CACHE_VERSION = '1.2.1';
const CACHE_NAME = `portfolio-v${CACHE_VERSION}`;
const OFFLINE_CACHE = `portfolio-offline-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `portfolio-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE = `portfolio-images-v${CACHE_VERSION}`;
const STATIC_CACHE = `portfolio-static-v${CACHE_VERSION}`;
const API_CACHE = `portfolio-api-v${CACHE_VERSION}`;
const FORM_CACHE = `portfolio-forms-v${CACHE_VERSION}`;
const EXTERNAL_CACHE = `portfolio-external-v${CACHE_VERSION}`;

// Get base path from service worker location
const SW_PATH = self.location.pathname;
const BASE_PATH = SW_PATH.substring(0, SW_PATH.lastIndexOf('/') + 1);

// Helper to resolve paths relative to base
const resolvePath = (path) => BASE_PATH + path.replace(/^\//, '');

// Core assets to cache immediately upon installation
const CORE_ASSETS = [
    './',
    'index.html',
    'offline.html',
    'manifest.json',
    'case-study-shachibook.html',
    'case-study-github.html',
    'case-study-blog.html'
].map(resolvePath);

// Static assets to cache with cache-first strategy
const STATIC_ASSETS = [
    'css/reset.css',
    'css/modern-style.css',
    'js/modern-script.js',
    'js/modern-script.min.js',
    'js/contact-form.js',
    'js/contact-form.min.js',
    'js/emailjs-config.js',
    'js/security.js',
    'js/analytics.js',
    'js/cookie-consent.js',
    'js/pwa.js',
    'js/offline-manager.js'
].map(resolvePath);

// Image assets to cache
const IMAGE_ASSETS = [
    'img/favicon.ico',
    'img/ogp.png',
    'img/icons/icon-192x192.png',
    'img/icons/icon-512x512.png'
].map(resolvePath);

// Assets to cache with network-first strategy
const NETWORK_FIRST_PATHS = [
    '/api/',
    '/.netlify/',
    '/emailjs/',
    'https://api.emailjs.com/'
];

// Cache duration settings (in milliseconds)
const CACHE_DURATION = {
    STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
    IMAGES: 7 * 24 * 60 * 60 * 1000,  // 7 days
    API: 5 * 60 * 1000,               // 5 minutes
    EXTERNAL: 24 * 60 * 60 * 1000     // 1 day
};

// Maximum cache sizes
const MAX_CACHE_SIZE = {
    STATIC: 50,
    IMAGES: 100,
    RUNTIME: 50,
    API: 20
};

// External resources that can be cached
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/',
    'https://fonts.gstatic.com/',
    'https://cdnjs.cloudflare.com/',
    'https://unpkg.com/',
    'https://cdn.jsdelivr.net/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache core assets
            caches.open(CACHE_NAME).then(cache => {
                console.log('Caching core assets...');
                return cache.addAll(CORE_ASSETS);
            }),
            // Cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Caching static assets...');
                return Promise.allSettled(STATIC_ASSETS.map(asset => 
                    cache.add(asset).catch(err => {
                        console.warn(`Failed to cache ${asset}:`, err);
                    })
                ));
            }),
            // Cache image assets
            caches.open(IMAGE_CACHE).then(cache => {
                console.log('Caching image assets...');
                return Promise.allSettled(IMAGE_ASSETS.map(asset => 
                    cache.add(asset).catch(err => {
                        console.warn(`Failed to cache ${asset}:`, err);
                    })
                ));
            }),
            // Set up offline cache
            caches.open(OFFLINE_CACHE).then(cache => {
                console.log('Setting up offline cache...');
                return cache.add(resolvePath('offline.html'));
            })
        ])
    );
    
    // Force activation of new service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                const currentCaches = [
                    CACHE_NAME,
                    OFFLINE_CACHE,
                    RUNTIME_CACHE,
                    IMAGE_CACHE,
                    STATIC_CACHE,
                    API_CACHE
                ];
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (!currentCaches.includes(cacheName)) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Clean up old cached items
            cleanupOldCacheItems(),
            // Take control of all clients
            self.clients.claim()
        ])
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Handle different types of requests with enhanced strategies
    if (isImageRequest(request)) {
        event.respondWith(cacheFirstWithExpiry(request, IMAGE_CACHE, CACHE_DURATION.IMAGES));
    } else if (isStaticAsset(request)) {
        event.respondWith(cacheFirstWithExpiry(request, STATIC_CACHE, CACHE_DURATION.STATIC));
    } else if (isApiRequest(request)) {
        event.respondWith(networkFirstWithCache(request, API_CACHE, CACHE_DURATION.API));
    } else if (isNetworkFirst(request)) {
        event.respondWith(networkFirst(request));
    } else if (isExternalResource(request)) {
        event.respondWith(staleWhileRevalidateWithExpiry(request, RUNTIME_CACHE, CACHE_DURATION.EXTERNAL));
    } else {
        event.respondWith(networkWithFallback(request));
    }
});

// Message event - handle updates and commands
self.addEventListener('message', event => {
    const { data } = event;
    
    switch (data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
        case 'CACHE_URLS':
            cacheUrls(data.urls).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
        case 'GET_CACHE_STATS':
            event.ports[0].postMessage({ 
                stats: performanceMonitor.getStats() 
            });
            break;
        case 'CLEANUP_CACHE':
            cleanupOldCacheItems().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
    }
});

// Background sync event - Enhanced
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    switch (event.tag) {
        case 'contact-form-sync':
            event.waitUntil(syncContactForm());
            break;
        case 'analytics-sync':
            event.waitUntil(syncAnalyticsData());
            break;
        case 'cache-cleanup':
            event.waitUntil(periodicCacheCleanup());
            break;
        case 'performance-report':
            event.waitUntil(sendPerformanceReport());
            break;
        default:
            console.log('Unknown sync tag:', event.tag);
    }
});

// Push notification event
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: resolvePath('img/favicon.ico'),
            badge: resolvePath('img/favicon.ico'),
            vibrate: [100, 50, 100],
            data: data.data || {}
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// ***** CACHING STRATEGIES *****

/**
 * Cache First Strategy with Expiry
 * Good for: Static assets, images, fonts
 */
async function cacheFirstWithExpiry(request, cacheName, maxAge) {
    const cached = await caches.match(request);
    
    // Check if cached response exists and is not expired
    if (cached && !isCacheExpired(cached, maxAge)) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.status === 200) {
            const cache = await caches.open(cacheName);
            // Add timestamp header for expiry checking
            const responseWithTimestamp = addTimestampToResponse(response.clone());
            await cache.put(request, responseWithTimestamp);
            await limitCacheSize(cacheName, MAX_CACHE_SIZE.STATIC);
        }
        return response;
    } catch (error) {
        console.log('Cache first failed:', error);
        // Return stale cache if available
        if (cached) {
            console.log('Returning stale cached content');
            return cached;
        }
        return new Response('Offline', { status: 408 });
    }
}

/**
 * Cache First Strategy (legacy support)
 */
async function cacheFirst(request) {
    return cacheFirstWithExpiry(request, STATIC_CACHE, CACHE_DURATION.STATIC);
}

/**
 * Network First Strategy with Cache and Expiry
 * Good for: API calls, dynamic content
 */
async function networkFirstWithCache(request, cacheName, maxAge) {
    try {
        const response = await fetch(request, {
            // Add timeout for API requests
            signal: AbortSignal.timeout(10000)
        });
        
        if (response.status === 200) {
            const cache = await caches.open(cacheName);
            const responseWithTimestamp = addTimestampToResponse(response.clone());
            await cache.put(request, responseWithTimestamp);
            await limitCacheSize(cacheName, MAX_CACHE_SIZE.API);
        }
        return response;
    } catch (error) {
        console.log('Network first fallback to cache:', error);
        const cached = await caches.match(request);
        
        // Return cached version even if expired for API failures
        if (cached) {
            console.log('Returning cached API response');
            return cached;
        }
        return new Response(JSON.stringify({ error: 'Offline' }), { 
            status: 408,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Network First Strategy (legacy support)
 */
async function networkFirst(request) {
    return networkFirstWithCache(request, RUNTIME_CACHE, CACHE_DURATION.API);
}

/**
 * Stale While Revalidate Strategy with Expiry
 * Good for: External resources, CDN assets
 */
async function staleWhileRevalidateWithExpiry(request, cacheName, maxAge) {
    const cached = await caches.match(request);
    
    // Background update if cache is expired or doesn't exist
    const shouldUpdate = !cached || isCacheExpired(cached, maxAge);
    
    if (shouldUpdate) {
        const fetchPromise = fetch(request).then(async response => {
            if (response.status === 200) {
                const cache = await caches.open(cacheName);
                const responseWithTimestamp = addTimestampToResponse(response.clone());
                await cache.put(request, responseWithTimestamp);
                await limitCacheSize(cacheName, MAX_CACHE_SIZE.RUNTIME);
            }
            return response;
        }).catch(error => {
            console.log('Stale while revalidate fetch failed:', error);
            return null;
        });
        
        // Don't wait for the fetch if we have cached content
        if (cached) {
            // Update cache in background
            fetchPromise;
            return cached;
        } else {
            // Wait for fetch if no cached content
            return fetchPromise || new Response('Offline', { status: 408 });
        }
    }
    
    return cached || new Response('Offline', { status: 408 });
}

/**
 * Stale While Revalidate Strategy (legacy support)
 */
async function staleWhileRevalidate(request) {
    return staleWhileRevalidateWithExpiry(request, RUNTIME_CACHE, CACHE_DURATION.EXTERNAL);
}

/**
 * Network with Offline Fallback
 * Good for: HTML pages
 */
async function networkWithFallback(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.log('Network failed, serving offline page:', error);
        
        if (request.destination === 'document') {
            return caches.match(resolvePath('offline.html'));
        }
        
        const cached = await caches.match(request);
        return cached || new Response('Offline', { status: 408 });
    }
}

// ***** UTILITY FUNCTIONS *****

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
    const url = new URL(request.url);

    // Same origin static files
    if (url.origin === self.location.origin) {
        const pathname = url.pathname;
        return pathname.includes('/css/') ||
               pathname.includes('/js/') ||
               pathname.endsWith('.css') ||
               pathname.endsWith('.js') ||
               pathname.endsWith('.json') ||
               pathname.endsWith('.woff') ||
               pathname.endsWith('.woff2') ||
               pathname.endsWith('.ttf') ||
               pathname.endsWith('.otf');
    }

    return false;
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
    const url = new URL(request.url);

    if (url.origin === self.location.origin) {
        const pathname = url.pathname;
        return pathname.includes('/img/') ||
               pathname.endsWith('.ico') ||
               pathname.endsWith('.png') ||
               pathname.endsWith('.jpg') ||
               pathname.endsWith('.jpeg') ||
               pathname.endsWith('.webp') ||
               pathname.endsWith('.svg') ||
               pathname.endsWith('.gif') ||
               pathname.endsWith('.bmp');
    }

    return false;
}

/**
 * Check if request is for an API
 */
function isApiRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') ||
           url.href.includes('api.emailjs.com') ||
           url.href.includes('analytics.google.com');
}

/**
 * Check if request should use network-first strategy
 */
function isNetworkFirst(request) {
    const url = new URL(request.url);
    return NETWORK_FIRST_PATHS.some(path => url.pathname.startsWith(path));
}

/**
 * Check if request is for an external resource
 */
function isExternalResource(request) {
    const url = new URL(request.url);
    return EXTERNAL_RESOURCES.some(resource => url.href.startsWith(resource));
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

/**
 * Cache specific URLs
 */
async function cacheUrls(urls) {
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll(urls);
}

/**
 * Sync contact form data when back online
 */
async function syncContactForm() {
    try {
        // Get stored form data
        const formData = await getStoredFormData();
        
        if (formData && formData.length > 0) {
            // Try to send each stored form submission
            for (const data of formData) {
                try {
                    await sendContactForm(data);
                    // Remove from storage after successful send
                    await removeStoredFormData(data.id);
                } catch (error) {
                    console.log('Failed to sync form data:', error);
                }
            }
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

/**
 * Get stored form data from IndexedDB
 */
async function getStoredFormData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PortfolioFormDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['forms'], 'readonly');
            const store = transaction.objectStore('forms');
            const getAll = store.getAll();
            
            getAll.onsuccess = () => resolve(getAll.result);
            getAll.onerror = () => reject(getAll.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('forms')) {
                db.createObjectStore('forms', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Remove stored form data
 */
async function removeStoredFormData(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PortfolioFormDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['forms'], 'readwrite');
            const store = transaction.objectStore('forms');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

/**
 * Get stored analytics data from IndexedDB
 */
async function getStoredAnalyticsData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PortfolioAnalyticsDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['analytics'], 'readonly');
            const store = transaction.objectStore('analytics');
            const getAll = store.getAll();
            
            getAll.onsuccess = () => resolve(getAll.result);
            getAll.onerror = () => reject(getAll.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('analytics')) {
                db.createObjectStore('analytics', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Store analytics data for later sync
 */
async function storeAnalyticsData(data) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PortfolioAnalyticsDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['analytics'], 'readwrite');
            const store = transaction.objectStore('analytics');
            const addRequest = store.add({
                ...data,
                id: Date.now() + Math.random(),
                timestamp: Date.now()
            });
            
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('analytics')) {
                db.createObjectStore('analytics', { keyPath: 'id' });
            }
        };
    });
}

/**
 * Remove stored analytics data
 */
async function removeStoredAnalyticsData(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PortfolioAnalyticsDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['analytics'], 'readwrite');
            const store = transaction.objectStore('analytics');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

/**
 * Send contact form data
 */
async function sendContactForm(data) {
    try {
        // Check if EmailJS is available
        if (data.emailjsData) {
            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data.emailjsData)
            });
            
            if (!response.ok) {
                throw new Error(`EmailJS error! status: ${response.status}`);
            }
            
            return response;
        }
        
        // Fallback to regular API
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data.formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error('Failed to send contact form:', error);
        throw error;
    }
}

/**
 * Sync analytics data
 */
async function syncAnalyticsData() {
    try {
        const analyticsData = await getStoredAnalyticsData();
        
        if (analyticsData && analyticsData.length > 0) {
            for (const data of analyticsData) {
                try {
                    await sendAnalyticsEvent(data);
                    await removeStoredAnalyticsData(data.id);
                } catch (error) {
                    console.log('Failed to sync analytics data:', error);
                }
            }
        }
    } catch (error) {
        console.log('Analytics sync failed:', error);
    }
}

/**
 * Send analytics event
 */
async function sendAnalyticsEvent(data) {
    if (typeof gtag !== 'undefined') {
        gtag('event', data.event, data.parameters);
    } else {
        // Fallback to Analytics API
        const response = await fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Analytics API error! status: ${response.status}`);
        }
    }
}

/**
 * Periodic cache cleanup
 */
async function periodicCacheCleanup() {
    try {
        await cleanupOldCacheItems();
        console.log('Periodic cache cleanup completed');
        
        // Notify clients of cleanup
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'CACHE_CLEANUP_COMPLETE',
                timestamp: Date.now()
            });
        });
    } catch (error) {
        console.error('Periodic cache cleanup failed:', error);
    }
}

/**
 * Send performance report
 */
async function sendPerformanceReport() {
    try {
        const stats = performanceMonitor.getStats();
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'sw_performance', {
                event_category: 'Performance',
                cache_hit_rate: stats.hitRate,
                total_requests: stats.totalRequests,
                uptime_minutes: Math.round(stats.uptime / 60)
            });
        }
        
        console.log('Performance report sent:', stats);
    } catch (error) {
        console.error('Failed to send performance report:', error);
    }
}

// ***** UTILITY FUNCTIONS FOR CACHE MANAGEMENT *****

/**
 * Check if cached response is expired
 */
function isCacheExpired(response, maxAge) {
    const dateHeader = response.headers.get('sw-cache-timestamp');
    if (!dateHeader) {
        // No timestamp, consider it expired
        return true;
    }
    
    const cacheTime = parseInt(dateHeader);
    const now = Date.now();
    return (now - cacheTime) > maxAge;
}

/**
 * Add timestamp to response for cache expiry
 */
function addTimestampToResponse(response) {
    const headers = new Headers(response.headers);
    headers.set('sw-cache-timestamp', Date.now().toString());
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });
}

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
        // Sort by cache timestamp (oldest first)
        const sortedKeys = await Promise.all(
            keys.map(async (key) => {
                const response = await cache.match(key);
                const timestamp = response?.headers.get('sw-cache-timestamp') || '0';
                return { key, timestamp: parseInt(timestamp) };
            })
        );
        
        sortedKeys.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest entries
        const keysToDelete = sortedKeys.slice(0, keys.length - maxSize);
        await Promise.all(
            keysToDelete.map(item => cache.delete(item.key))
        );
        
        console.log(`Cleaned up ${keysToDelete.length} old entries from ${cacheName}`);
    }
}

/**
 * Clean up old cache items across all caches
 */
async function cleanupOldCacheItems() {
    const cacheConfigs = [
        { name: STATIC_CACHE, maxSize: MAX_CACHE_SIZE.STATIC, maxAge: CACHE_DURATION.STATIC },
        { name: IMAGE_CACHE, maxSize: MAX_CACHE_SIZE.IMAGES, maxAge: CACHE_DURATION.IMAGES },
        { name: RUNTIME_CACHE, maxSize: MAX_CACHE_SIZE.RUNTIME, maxAge: CACHE_DURATION.EXTERNAL },
        { name: API_CACHE, maxSize: MAX_CACHE_SIZE.API, maxAge: CACHE_DURATION.API }
    ];
    
    for (const config of cacheConfigs) {
        try {
            await cleanExpiredCacheEntries(config.name, config.maxAge);
            await limitCacheSize(config.name, config.maxSize);
        } catch (error) {
            console.warn(`Failed to cleanup cache ${config.name}:`, error);
        }
    }
}

/**
 * Remove expired entries from a specific cache
 */
async function cleanExpiredCacheEntries(cacheName, maxAge) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        const expiredKeys = [];
        
        for (const key of keys) {
            const response = await cache.match(key);
            if (response && isCacheExpired(response, maxAge)) {
                expiredKeys.push(key);
            }
        }
        
        await Promise.all(
            expiredKeys.map(key => cache.delete(key))
        );
        
        if (expiredKeys.length > 0) {
            console.log(`Removed ${expiredKeys.length} expired entries from ${cacheName}`);
        }
    } catch (error) {
        console.warn(`Failed to clean expired entries from ${cacheName}:`, error);
    }
}

// ***** PERFORMANCE MONITORING *****

/**
 * Monitor cache performance
 */
class CachePerformanceMonitor {
    constructor() {
        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            totalRequests: 0,
            startTime: Date.now()
        };
    }
    
    recordCacheHit() {
        this.stats.cacheHits++;
        this.stats.totalRequests++;
        this.reportStats();
    }
    
    recordCacheMiss() {
        this.stats.cacheMisses++;
        this.stats.totalRequests++;
        this.reportStats();
    }
    
    reportStats() {
        // Report every 50 requests
        if (this.stats.totalRequests % 50 === 0) {
            const hitRate = (this.stats.cacheHits / this.stats.totalRequests * 100).toFixed(2);
            const uptime = Math.round((Date.now() - this.stats.startTime) / 1000 / 60); // minutes
            
            console.log(`Cache Performance: ${hitRate}% hit rate, ${this.stats.totalRequests} requests, ${uptime}min uptime`);
            
            // Send to client for analytics
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'CACHE_PERFORMANCE',
                        stats: {
                            ...this.stats,
                            hitRate: parseFloat(hitRate),
                            uptime
                        }
                    });
                });
            });
        }
    }
    
    getStats() {
        return {
            ...this.stats,
            hitRate: this.stats.totalRequests > 0 ? 
                (this.stats.cacheHits / this.stats.totalRequests * 100) : 0,
            uptime: Math.round((Date.now() - this.stats.startTime) / 1000)
        };
    }
}

const performanceMonitor = new CachePerformanceMonitor();

// Periodic cache cleanup (every 24 hours)
setInterval(() => {
    console.log('Running periodic cache cleanup...');
    cleanupOldCacheItems();
}, 24 * 60 * 60 * 1000);

// Monitor cache performance
const originalCachesMatch = caches.match;
caches.match = function(...args) {
    return originalCachesMatch.apply(this, args).then(response => {
        if (response) {
            performanceMonitor.recordCacheHit();
        } else {
            performanceMonitor.recordCacheMiss();
        }
        return response;
    });
};

console.log('Service Worker loaded successfully');