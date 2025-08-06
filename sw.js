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

const CACHE_NAME = 'portfolio-v1.0.0';
const OFFLINE_CACHE = 'portfolio-offline-v1.0.0';
const RUNTIME_CACHE = 'portfolio-runtime-v1.0.0';

// Assets to cache immediately upon installation
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/reset.css',
    '/css/modern-style.css',
    '/js/modern-script.js',
    '/js/contact-form.js',
    '/js/emailjs-config.js',
    '/js/security.js',
    '/img/favicon.ico',
    '/img/ogp.png',
    '/offline.html'
];

// Assets to cache with network-first strategy
const NETWORK_FIRST_PATHS = [
    '/api/',
    '/.netlify/',
    '/emailjs/'
];

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
            caches.open(CACHE_NAME).then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            caches.open(OFFLINE_CACHE).then(cache => {
                console.log('Setting up offline cache...');
                return cache.add('/offline.html');
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
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && 
                            cacheName !== OFFLINE_CACHE && 
                            cacheName !== RUNTIME_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
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
    
    // Handle different types of requests
    if (isStaticAsset(request)) {
        event.respondWith(cacheFirst(request));
    } else if (isNetworkFirst(request)) {
        event.respondWith(networkFirst(request));
    } else if (isExternalResource(request)) {
        event.respondWith(staleWhileRevalidate(request));
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
    }
});

// Background sync event
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForm());
    }
});

// Push notification event
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/img/favicon.ico',
            badge: '/img/favicon.ico',
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
 * Cache First Strategy
 * Good for: Static assets, images, fonts
 */
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('Cache first failed:', error);
        return new Response('Offline', { status: 408 });
    }
}

/**
 * Network First Strategy
 * Good for: API calls, dynamic content
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('Network first fallback to cache:', error);
        const cached = await caches.match(request);
        return cached || new Response('Offline', { status: 408 });
    }
}

/**
 * Stale While Revalidate Strategy
 * Good for: External resources, CDN assets
 */
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);
    const fetchPromise = fetch(request).then(response => {
        if (response.status === 200) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then(c => c.put(request, response.clone()));
        }
        return response;
    }).catch(error => {
        console.log('Stale while revalidate fetch failed:', error);
        return cached;
    });
    
    return cached || fetchPromise;
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
            return caches.match('/offline.html');
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
        return pathname.startsWith('/css/') ||
               pathname.startsWith('/js/') ||
               pathname.startsWith('/img/') ||
               pathname.endsWith('.ico') ||
               pathname.endsWith('.png') ||
               pathname.endsWith('.jpg') ||
               pathname.endsWith('.jpeg') ||
               pathname.endsWith('.webp') ||
               pathname.endsWith('.svg');
    }
    
    return false;
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
 * Send contact form data
 */
async function sendContactForm(data) {
    // This would integrate with your actual form sending logic
    // For now, just simulate the API call
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
}

// ***** PERFORMANCE MONITORING *****

/**
 * Monitor performance and report metrics
 */
function monitorPerformance() {
    // Monitor cache hit rates
    let cacheHits = 0;
    let cacheMisses = 0;
    
    const originalFetch = self.fetch;
    self.fetch = function(...args) {
        return caches.match(args[0]).then(response => {
            if (response) {
                cacheHits++;
            } else {
                cacheMisses++;
            }
            
            // Report metrics periodically
            if ((cacheHits + cacheMisses) % 100 === 0) {
                const hitRate = cacheHits / (cacheHits + cacheMisses);
                console.log(`Cache hit rate: ${(hitRate * 100).toFixed(2)}%`);
            }
            
            return response || originalFetch.apply(this, args);
        });
    };
}

// Initialize performance monitoring
monitorPerformance();

console.log('Service Worker loaded successfully');