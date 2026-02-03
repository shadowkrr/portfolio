/**
 * Lighthouse Optimizer
 * 
 * Optimizes the website for better Lighthouse scores
 * Focuses on:
 * - Performance
 * - Accessibility
 * - Best Practices
 * - SEO
 * - PWA
 */

class LighthouseOptimizer {
    constructor() {
        this.metrics = {
            performance: {},
            accessibility: {},
            bestPractices: {},
            seo: {},
            pwa: {}
        };
        
        this.init();
    }
    
    /**
     * Initialize optimizer
     */
    init() {
        this.optimizePerformance();
        this.optimizeAccessibility();
        this.optimizeBestPractices();
        this.optimizeSEO();
        this.optimizePWA();
        this.setupMonitoring();
        
        console.log('Lighthouse Optimizer initialized');
    }
    
    /**
     * Optimize performance metrics
     */
    optimizePerformance() {
        // Critical Resource Hints
        this.addResourceHints();
        
        // Image Optimization
        this.optimizeImages();
        
        // Font Loading Optimization
        this.optimizeFonts();
        
        // Script Loading Optimization
        this.optimizeScripts();
        
        // CSS Optimization
        this.optimizeCSS();
        
        // Third-party Performance
        this.optimizeThirdParty();
        
        console.log('Performance optimizations applied');
    }
    
    /**
     * Add critical resource hints
     */
    addResourceHints() {
        const hints = [
            // DNS prefetch for external domains
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
            { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
            { rel: 'dns-prefetch', href: '//unpkg.com' },
            { rel: 'dns-prefetch', href: '//api.emailjs.com' },
            { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
            
            // Preconnect for critical resources
            { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: '' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
            
            // Module preload for critical scripts
            { rel: 'modulepreload', href: 'js/modern-script.js' },
            { rel: 'modulepreload', href: 'js/pwa.js' }
        ];
        
        hints.forEach(hint => {
            if (!document.querySelector(`link[href="${hint.href}"]`)) {
                const link = document.createElement('link');
                Object.assign(link, hint);
                document.head.appendChild(link);
            }
        });
    }
    
    /**
     * Optimize images
     */
    optimizeImages() {
        // Add loading="lazy" to images below the fold
        const images = document.querySelectorAll('img:not([loading])');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.loading = 'lazy';
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });
        
        images.forEach(img => {
            // Skip hero images and above-the-fold content
            const rect = img.getBoundingClientRect();
            if (rect.top > window.innerHeight) {
                img.loading = 'lazy';
            }
        });
        
        // Add proper sizing to images
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
                // Set intrinsic dimensions to prevent layout shift
                img.addEventListener('load', function() {
                    if (!this.hasAttribute('width')) {
                        this.setAttribute('width', this.naturalWidth);
                    }
                    if (!this.hasAttribute('height')) {
                        this.setAttribute('height', this.naturalHeight);
                    }
                }, { once: true });
            }
        });
    }
    
    /**
     * Optimize font loading
     */
    optimizeFonts() {
        // Add font-display: swap to Google Fonts
        const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        fontLinks.forEach(link => {
            if (!link.href.includes('display=')) {
                link.href += link.href.includes('?') ? '&display=swap' : '?display=swap';
            }
        });
        
        // Preload critical fonts (disabled - using Google Fonts CDN)
        const criticalFonts = [
            // 'fonts/Poppins-Regular.woff2',
            // 'fonts/Poppins-Bold.woff2',
            // 'fonts/NotoSansJP-Regular.woff2'
        ];
        
        criticalFonts.forEach(font => {
            if (!document.querySelector(`link[href="${font}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'font';
                link.type = 'font/woff2';
                link.href = font;
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            }
        });
    }
    
    /**
     * Optimize script loading
     */
    optimizeScripts() {
        // Add defer/async to non-critical scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            
            // Critical scripts that should load immediately
            const criticalScripts = [
                'modern-script',
                'pwa.js',
                'security.js'
            ];
            
            const isCritical = criticalScripts.some(critical => src.includes(critical));
            
            if (!isCritical && !script.hasAttribute('defer') && !script.hasAttribute('async')) {
                script.setAttribute('defer', '');
            }
        });
        
        // Optimize third-party scripts
        this.optimizeThirdPartyScripts();
    }
    
    /**
     * Optimize third-party scripts
     */
    optimizeThirdPartyScripts() {
        // Delay non-critical third-party scripts
        const delayScripts = [
            'google-analytics',
            'googletagmanager',
            'particles.js',
            'typed.js',
            'aos.js'
        ];
        
        // Load after user interaction or page load + delay
        const loadDelayedScripts = () => {
            delayScripts.forEach(scriptName => {
                const script = document.querySelector(`script[src*="${scriptName}"]`);
                if (script && script.hasAttribute('data-delayed')) {
                    script.removeAttribute('data-delayed');
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    newScript.async = true;
                    script.parentNode.replaceChild(newScript, script);
                }
            });
        };
        
        // Delay until user interaction or 3 seconds after load
        let userInteracted = false;
        const interactionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
        
        const handleInteraction = () => {
            if (!userInteracted) {
                userInteracted = true;
                loadDelayedScripts();
                interactionEvents.forEach(event => {
                    document.removeEventListener(event, handleInteraction);
                });
            }
        };
        
        interactionEvents.forEach(event => {
            document.addEventListener(event, handleInteraction, { passive: true, once: true });
        });
        
        // Fallback: load after 3 seconds
        setTimeout(() => {
            if (!userInteracted) {
                loadDelayedScripts();
            }
        }, 3000);
    }
    
    /**
     * Optimize CSS
     */
    optimizeCSS() {
        // Remove unused CSS (simplified approach)
        this.removeUnusedCSS();
        
        // Critical CSS handling
        this.handleCriticalCSS();
        
        // Optimize CSS loading
        this.optimizeCSSLoading();
    }
    
    /**
     * Remove unused CSS (basic implementation)
     */
    removeUnusedCSS() {
        // This is a simplified version - in production you'd use tools like PurgeCSS
        const unusedSelectors = [
            '.unused-class',
            '.hidden-feature'
        ];
        
        document.querySelectorAll('style').forEach(styleSheet => {
            if (styleSheet.sheet) {
                const rules = Array.from(styleSheet.sheet.cssRules);
                rules.forEach((rule, index) => {
                    if (rule.selectorText) {
                        const isUnused = unusedSelectors.some(selector => 
                            rule.selectorText.includes(selector)
                        );
                        if (isUnused) {
                            try {
                                styleSheet.sheet.deleteRule(index);
                            } catch (e) {
                                // Rule might be protected
                                console.warn('Could not remove unused CSS rule:', rule.selectorText);
                            }
                        }
                    }
                });
            }
        });
    }
    
    /**
     * Handle critical CSS
     */
    handleCriticalCSS() {
        // Mark non-critical stylesheets for lazy loading
        const nonCriticalSheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        nonCriticalSheets.forEach(sheet => {
            if (!sheet.href.includes('critical') && !sheet.href.includes('inline')) {
                // Convert to preload then switch to stylesheet
                sheet.setAttribute('rel', 'preload');
                sheet.setAttribute('as', 'style');
                sheet.setAttribute('onload', 'this.onload=null;this.rel="stylesheet"');
            }
        });
    }
    
    /**
     * Optimize CSS loading
     */
    optimizeCSSLoading() {
        // Add media queries to non-critical CSS
        const mediaQueries = {
            'print.css': 'print',
            'mobile.css': '(max-width: 768px)',
            'desktop.css': '(min-width: 769px)'
        };
        
        Object.entries(mediaQueries).forEach(([filename, media]) => {
            const sheet = document.querySelector(`link[href*="${filename}"]`);
            if (sheet && !sheet.hasAttribute('media')) {
                sheet.setAttribute('media', media);
            }
        });
    }
    
    /**
     * Optimize third-party performance
     */
    optimizeThirdParty() {
        // Add resource hints for third-party domains
        const thirdPartyDomains = [
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            'https://api.emailjs.com',
            'https://cdnjs.cloudflare.com'
        ];
        
        thirdPartyDomains.forEach(domain => {
            if (!document.querySelector(`link[href="${domain}"]`)) {
                const link = document.createElement('link');
                link.rel = 'dns-prefetch';
                link.href = domain;
                document.head.appendChild(link);
            }
        });
        
        // Implement facade loading for heavy third-party widgets
        this.implementFacadeLoading();
    }
    
    /**
     * Implement facade loading for heavy widgets
     */
    implementFacadeLoading() {
        // Example: YouTube embed facade
        document.querySelectorAll('.youtube-facade').forEach(facade => {
            facade.addEventListener('click', function() {
                const videoId = this.dataset.videoId;
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                iframe.width = this.offsetWidth;
                iframe.height = this.offsetHeight;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                
                this.parentNode.replaceChild(iframe, this);
            });
        });
    }
    
    /**
     * Optimize accessibility
     */
    optimizeAccessibility() {
        // Add missing alt texts
        this.addMissingAltTexts();
        
        // Improve focus management
        this.improveFocusManagement();
        
        // Add ARIA labels
        this.addARIALabels();
        
        // Ensure proper heading hierarchy
        this.checkHeadingHierarchy();
        
        // Improve color contrast
        this.improveColorContrast();
        
        console.log('Accessibility optimizations applied');
    }
    
    /**
     * Add missing alt texts
     */
    addMissingAltTexts() {
        document.querySelectorAll('img:not([alt])').forEach(img => {
            // Generate alt text based on src or context
            let altText = '';
            const src = img.getAttribute('src') || '';
            
            if (src.includes('profile')) {
                altText = 'プロフィール写真';
            } else if (src.includes('work') || src.includes('project')) {
                altText = '作品画像';
            } else if (src.includes('skill') || src.includes('icon')) {
                altText = 'スキルアイコン';
            } else {
                altText = '画像';
            }
            
            img.setAttribute('alt', altText);
        });
    }
    
    /**
     * Improve focus management
     */
    improveFocusManagement() {
        // Add focus indicators
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            if (!element.style.outline) {
                element.addEventListener('focus', function() {
                    this.style.outline = '2px solid #667eea';
                    this.style.outlineOffset = '2px';
                });
                
                element.addEventListener('blur', function() {
                    this.style.outline = '';
                    this.style.outlineOffset = '';
                });
            }
        });
        
        // Skip links for keyboard navigation - Disabled
        // this.addSkipLinks();
        
        // Remove any existing skip links
        const existingSkipLinks = document.querySelector('.skip-links');
        if (existingSkipLinks) {
            existingSkipLinks.remove();
        }
    }
    
    /**
     * Add skip links
     */
    addSkipLinks() {
        if (!document.querySelector('.skip-links')) {
            const skipLinks = document.createElement('div');
            skipLinks.className = 'skip-links';
            skipLinks.innerHTML = `
                <a href="#main" class="skip-link">メインコンテンツへスキップ</a>
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                .skip-links {
                    position: absolute;
                    top: -40px;
                    left: 6px;
                    z-index: 1000;
                }
                .skip-link {
                    position: absolute;
                    top: -40px;
                    left: 6px;
                    background: #000;
                    color: #fff;
                    padding: 8px;
                    text-decoration: none;
                    z-index: 100;
                }
                .skip-link:focus {
                    top: 6px;
                }
            `;
            
            document.head.appendChild(style);
            document.body.insertBefore(skipLinks, document.body.firstChild);
            
            // Add click handlers for smooth scrolling
            skipLinks.querySelectorAll('.skip-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const target = document.querySelector(targetId);
                    
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Focus the target for screen readers
                        target.setAttribute('tabindex', '-1');
                        target.focus();
                        
                        console.log('Skip link activated:', targetId);
                    } else {
                        console.warn('Skip link target not found:', targetId);
                    }
                });
            });
        }
    }
    
    /**
     * Add ARIA labels
     */
    addARIALabels() {
        // Add labels to buttons without text
        document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(button => {
            const text = button.textContent.trim();
            if (!text) {
                const icon = button.querySelector('i, svg');
                if (icon) {
                    const iconClass = icon.className || '';
                    if (iconClass.includes('menu') || iconClass.includes('hamburger')) {
                        button.setAttribute('aria-label', 'メニューを開く');
                    } else if (iconClass.includes('close')) {
                        button.setAttribute('aria-label', '閉じる');
                    } else if (iconClass.includes('search')) {
                        button.setAttribute('aria-label', '検索');
                    } else {
                        button.setAttribute('aria-label', 'ボタン');
                    }
                }
            }
        });
        
        // Add labels to form inputs
        document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label && input.placeholder) {
                input.setAttribute('aria-label', input.placeholder);
            }
        });
    }
    
    /**
     * Check heading hierarchy
     */
    checkHeadingHierarchy() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let currentLevel = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.substring(1));
            
            if (level > currentLevel + 1) {
                console.warn(`Heading hierarchy issue: ${heading.tagName} follows H${currentLevel}`);
                // Could automatically fix by changing tag name
                // heading.outerHTML = heading.outerHTML.replace(heading.tagName, `H${currentLevel + 1}`);
            }
            
            currentLevel = level;
        });
    }
    
    /**
     * Improve color contrast (basic check)
     */
    improveColorContrast() {
        // This is a simplified check - full implementation would require color analysis
        const lowContrastElements = document.querySelectorAll('.low-contrast, .muted, .subtle');
        
        lowContrastElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const color = computedStyle.color;
            const backgroundColor = computedStyle.backgroundColor;
            
            // Simple heuristic - if colors are similar, add warning
            if (color.includes('rgb') && backgroundColor.includes('rgb')) {
                console.warn('Potential contrast issue detected:', element);
                element.setAttribute('data-contrast-warning', 'true');
            }
        });
    }
    
    /**
     * Optimize best practices
     */
    optimizeBestPractices() {
        // HTTPS enforcement
        this.enforceHTTPS();
        
        // Remove console logs in production
        this.removeConsoleLogs();
        
        // Add security headers
        this.addSecurityHeaders();
        
        // Optimize event listeners
        this.optimizeEventListeners();
        
        console.log('Best practices optimizations applied');
    }
    
    /**
     * Enforce HTTPS
     */
    enforceHTTPS() {
        if (location.protocol === 'http:' && location.hostname !== 'localhost') {
            // In production, redirect to HTTPS
            location.replace(`https:${location.href.substring(location.protocol.length)}`);
        }
        
        // Update any remaining HTTP links
        document.querySelectorAll('a[href^="http:"], img[src^="http:"], script[src^="http:"]').forEach(element => {
            const attr = element.tagName === 'A' ? 'href' : 'src';
            const url = element.getAttribute(attr);
            if (url && url.startsWith('http:')) {
                element.setAttribute(attr, url.replace('http:', 'https:'));
            }
        });
    }
    
    /**
     * Remove console logs in production
     */
    removeConsoleLogs() {
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            // Override console methods in production
            const noop = () => {};
            console.log = noop;
            console.warn = noop;
            console.error = (...args) => {
                // Keep errors for important debugging
                if (args[0] && args[0].includes('Critical')) {
                    console.error.apply(console, args);
                }
            };
        }
    }
    
    /**
     * Add security headers (meta tags)
     */
    addSecurityHeaders() {
        const headers = [
            { name: 'X-Content-Type-Options', content: 'nosniff' },
            // X-Frame-Options must be set via HTTP header, not meta tag
            { name: 'X-XSS-Protection', content: '1; mode=block' },
            { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
        ];
        
        headers.forEach(header => {
            if (!document.querySelector(`meta[http-equiv="${header.name}"]`)) {
                const meta = document.createElement('meta');
                meta.setAttribute('http-equiv', header.name);
                meta.setAttribute('content', header.content);
                document.head.appendChild(meta);
            }
        });
    }
    
    /**
     * Optimize event listeners
     */
    optimizeEventListeners() {
        // Use passive listeners where possible
        const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
        
        // Override addEventListener to add passive option
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (passiveEvents.includes(type) && typeof options !== 'object') {
                options = { passive: true };
            }
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
    
    /**
     * Optimize SEO
     */
    optimizeSEO() {
        // Add missing meta tags
        this.addMissingMetaTags();
        
        // Optimize structured data
        this.addStructuredData();
        
        // Improve internal linking
        this.improveInternalLinking();
        
        // Optimize images for SEO
        this.optimizeImagesForSEO();
        
        console.log('SEO optimizations applied');
    }
    
    /**
     * Add missing meta tags
     */
    addMissingMetaTags() {
        const metaTags = [
            { name: 'robots', content: 'index, follow' },
            { name: 'author', content: 'SHADOWKRR' },
            { name: 'keywords', content: 'フリーランス, エンジニア, Web開発, モバイル開発' },
            { property: 'og:site_name', content: 'SHADOWKRR Portfolio' },
            { property: 'og:locale', content: 'ja_JP' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:site', content: '@shadowkrr' }
        ];
        
        metaTags.forEach(tag => {
            const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`;
            if (!document.querySelector(selector)) {
                const meta = document.createElement('meta');
                if (tag.name) meta.setAttribute('name', tag.name);
                if (tag.property) meta.setAttribute('property', tag.property);
                meta.setAttribute('content', tag.content);
                document.head.appendChild(meta);
            }
        });
    }
    
    /**
     * Add structured data
     */
    addStructuredData() {
        if (!document.querySelector('script[type="application/ld+json"]')) {
            const structuredData = {
                '@context': 'https://schema.org',
                '@type': 'Person',
                'name': 'SHADOWKRR',
                'jobTitle': 'フリーランスエンジニア',
                'description': 'Web開発とモバイルアプリ開発を専門とするフリーランスエンジニア',
                'url': window.location.origin,
                'sameAs': [
                    'https://github.com/shadowkrr',
                    'https://twitter.com/shadowkrr'
                ],
                'knowsAbout': [
                    'Web開発',
                    'モバイル開発',
                    'JavaScript',
                    'React',
                    'Node.js',
                    'Python'
                ]
            };
            
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
        }
    }
    
    /**
     * Improve internal linking
     */
    improveInternalLinking() {
        // Add rel attributes to external links
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            const url = new URL(link.href);
            if (url.hostname !== window.location.hostname) {
                if (!link.hasAttribute('rel')) {
                    link.setAttribute('rel', 'noopener noreferrer');
                }
                // Add target="_blank" to external links if not already present
                if (!link.hasAttribute('target')) {
                    link.setAttribute('target', '_blank');
                }
            }
        });
        
        // Add breadcrumb navigation - Disabled for portfolio site
        // this.addBreadcrumbs();
        
        // Remove any existing breadcrumbs
        const existingBreadcrumbs = document.querySelector('.breadcrumbs');
        if (existingBreadcrumbs) {
            existingBreadcrumbs.remove();
        }
    }
    
    /**
     * Add breadcrumbs
     */
    addBreadcrumbs() {
        if (!document.querySelector('.breadcrumbs') && window.location.pathname !== '/') {
            const breadcrumbs = document.createElement('nav');
            breadcrumbs.className = 'breadcrumbs';
            breadcrumbs.setAttribute('aria-label', 'パンくずナビゲーション');
            
            const pathSegments = window.location.pathname.split('/').filter(segment => segment);
            let currentPath = '';
            
            const breadcrumbList = document.createElement('ol');
            
            // Home link
            const homeItem = document.createElement('li');
            homeItem.innerHTML = '<a href="/">ホーム</a>';
            breadcrumbList.appendChild(homeItem);
            
            // Path segments
            pathSegments.forEach((segment, index) => {
                currentPath += `/${segment}`;
                const item = document.createElement('li');
                
                if (index === pathSegments.length - 1) {
                    // Current page
                    item.textContent = segment.charAt(0).toUpperCase() + segment.slice(1);
                    item.setAttribute('aria-current', 'page');
                } else {
                    item.innerHTML = `<a href="${currentPath}">${segment}</a>`;
                }
                
                breadcrumbList.appendChild(item);
            });
            
            breadcrumbs.appendChild(breadcrumbList);
            
            // Insert after header or at top of main content
            const main = document.querySelector('main') || document.body;
            main.insertBefore(breadcrumbs, main.firstChild);
        }
    }
    
    /**
     * Optimize images for SEO
     */
    optimizeImagesForSEO() {
        document.querySelectorAll('img').forEach(img => {
            // Ensure all images have proper file names in src
            const src = img.getAttribute('src');
            if (src && (src.includes('untitled') || src.includes('image'))) {
                console.warn('Image has non-descriptive filename:', src);
            }
            
            // Add title attributes if missing and alt exists
            if (img.hasAttribute('alt') && !img.hasAttribute('title')) {
                img.setAttribute('title', img.getAttribute('alt'));
            }
        });
    }
    
    /**
     * Optimize PWA features
     */
    optimizePWA() {
        // Ensure service worker is registered
        this.ensureServiceWorkerRegistration();
        
        // Check manifest completeness
        this.checkManifestCompleteness();
        
        // Optimize caching strategy
        this.optimizeCachingStrategy();
        
        // Ensure offline functionality
        this.ensureOfflineFunctionality();
        
        console.log('PWA optimizations applied');
    }
    
    /**
     * Ensure service worker is registered
     */
    ensureServiceWorkerRegistration() {
        if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('Service Worker registered from optimizer:', registration);
            }).catch(error => {
                console.error('Service Worker registration failed from optimizer:', error);
            });
        }
    }
    
    /**
     * Check manifest completeness
     */
    checkManifestCompleteness() {
        fetch('manifest.json')
            .then(response => response.json())
            .then(manifest => {
                const requiredFields = ['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color', 'icons'];
                const missing = requiredFields.filter(field => !manifest[field]);
                
                if (missing.length > 0) {
                    console.warn('Manifest missing required fields:', missing);
                }
                
                // Check icon sizes
                const requiredIconSizes = ['192x192', '512x512'];
                const availableSizes = manifest.icons ? manifest.icons.map(icon => icon.sizes) : [];
                const missingIcons = requiredIconSizes.filter(size => !availableSizes.includes(size));
                
                if (missingIcons.length > 0) {
                    console.warn('Manifest missing required icon sizes:', missingIcons);
                }
            })
            .catch(error => {
                console.error('Could not fetch manifest:', error);
            });
    }
    
    /**
     * Optimize caching strategy
     */
    optimizeCachingStrategy() {
        // Send cache optimization message to service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'OPTIMIZE_CACHE'
            });
        }
    }
    
    /**
     * Ensure offline functionality
     */
    ensureOfflineFunctionality() {
        // Test offline functionality
        if (!navigator.onLine) {
            console.log('Testing offline functionality...');
            
            // Test critical resource availability
            const criticalResources = ['/', '/manifest.json', '/offline.html'];
            
            criticalResources.forEach(resource => {
                caches.match(resource).then(response => {
                    if (!response) {
                        console.warn(`Critical resource not cached: ${resource}`);
                    }
                });
            });
        }
    }
    
    /**
     * Setup performance monitoring
     */
    setupMonitoring() {
        // Core Web Vitals monitoring
        this.monitorCoreWebVitals();
        
        // Resource loading monitoring
        this.monitorResourceLoading();
        
        // Error monitoring
        this.monitorErrors();
        
        console.log('Performance monitoring setup complete');
    }
    
    /**
     * Monitor Core Web Vitals
     */
    monitorCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeLCP();
        
        // First Input Delay (FID)
        this.observeFID();
        
        // Cumulative Layout Shift (CLS)
        this.observeCLS();
    }
    
    /**
     * Observe Largest Contentful Paint
     */
    observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.performance.lcp = lastEntry.startTime;
                console.log('LCP:', lastEntry.startTime);
                
                // Track in analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'timing_complete', {
                        name: 'LCP',
                        value: Math.round(lastEntry.startTime)
                    });
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
            console.warn('LCP observation not supported:', error);
        }
    }
    
    /**
     * Observe First Input Delay
     */
    observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    this.metrics.performance.fid = entry.processingStart - entry.startTime;
                    console.log('FID:', entry.processingStart - entry.startTime);
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'timing_complete', {
                            name: 'FID',
                            value: Math.round(entry.processingStart - entry.startTime)
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (error) {
            console.warn('FID observation not supported:', error);
        }
    }
    
    /**
     * Observe Cumulative Layout Shift
     */
    observeCLS() {
        try {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.metrics.performance.cls = clsValue;
                console.log('CLS:', clsValue);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'timing_complete', {
                        name: 'CLS',
                        value: Math.round(clsValue * 1000)
                    });
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('CLS observation not supported:', error);
        }
    }
    
    /**
     * Monitor resource loading
     */
    monitorResourceLoading() {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                // Log slow resources
                if (entry.duration > 1000) {
                    console.warn('Slow resource loading:', entry.name, entry.duration + 'ms');
                }
                
                // Track failed resources
                if (entry.transferSize === 0 && entry.decodedBodySize === 0) {
                    console.error('Failed to load resource:', entry.name);
                }
            });
        });
        
        observer.observe({ entryTypes: ['resource'] });
    }
    
    /**
     * Monitor errors
     */
    monitorErrors() {
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            
            // Track in analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: event.error.message,
                    fatal: false
                });
            }
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: 'Unhandled Promise Rejection: ' + event.reason,
                    fatal: false
                });
            }
        });
    }
    
    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
    }
    
    /**
     * Export metrics for analysis
     */
    exportMetrics() {
        const metrics = this.getMetrics();
        const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lighthouse-metrics-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Auto-initialize
if (typeof window !== 'undefined' && !window.__TEST_ENV__) {
    document.addEventListener('DOMContentLoaded', () => {
        window.lighthouseOptimizer = new LighthouseOptimizer();
        
        // Expose debug methods
        window.debugLighthouse = {
            getMetrics: () => window.lighthouseOptimizer.getMetrics(),
            exportMetrics: () => window.lighthouseOptimizer.exportMetrics()
        };
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LighthouseOptimizer;
}