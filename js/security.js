/**
 * Security Enhancements Module
 * 
 * This module provides client-side security enhancements for the portfolio website
 * Features:
 * - Content Security Policy (CSP) implementation
 * - XSS protection utilities
 * - Input sanitization
 * - Security headers validation
 * - Clickjacking protection
 */

class SecurityManager {
    constructor() {
        this.init();
    }
    
    /**
     * Initialize security features
     */
    init() {
        this.setupCSP();
        this.setupXSSProtection();
        this.setupClickjackProtection();
        this.setupInputSanitization();
        this.monitorSecurityViolations();
        console.log('Security Manager initialized');
    }
    
    /**
     * Set up Content Security Policy
     */
    setupCSP() {
        // Check if CSP is already set by server
        if (!this.hasServerCSP()) {
            // Client-side CSP as fallback (not as secure as server-side)
            const cspMeta = document.createElement('meta');
            cspMeta.httpEquiv = 'Content-Security-Policy';
            cspMeta.content = this.generateCSPPolicy();
            document.head.appendChild(cspMeta);
            
            console.log('Client-side CSP applied (consider implementing server-side CSP for better security)');
        }
    }
    
    /**
     * Generate CSP policy string
     */
    generateCSPPolicy() {
        const policy = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com",
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
            "img-src 'self' data: https: http:",
            "connect-src 'self' https://api.emailjs.com https://www.google-analytics.com https://analytics.google.com https://api.allorigins.win https://cdnjs.cloudflare.com",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests"
        ];
        
        return policy.join('; ');
    }
    
    /**
     * Check if server has already set CSP
     */
    hasServerCSP() {
        const metas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
        return metas.length > 0;
    }
    
    /**
     * Set up input sanitization
     */
    setupInputSanitization() {
        console.log('Input sanitization setup complete');
    }
    
    /**
     * Set up XSS protection measures
     */
    setupXSSProtection() {
        // Monitor for potential XSS attempts
        this.setupDOMMonitoring();
        
        // Sanitize any dynamic content
        this.sanitizeDynamicContent();
        
        // Set up input event listeners for real-time sanitization
        this.setupInputSanitizers();
    }
    
    /**
     * Set up DOM monitoring for suspicious changes
     */
    setupDOMMonitoring() {
        // Monitor for script injection attempts
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.checkForSuspiciousContent(node);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Check for suspicious content in DOM nodes
     */
    checkForSuspiciousContent(element) {
        // Check for script tags
        if (element.tagName === 'SCRIPT' && !this.isAllowedScript(element)) {
            console.warn('Suspicious script detected and removed:', element);
            element.remove();
            return;
        }
        
        // Check for inline event handlers
        const suspiciousAttributes = ['onclick', 'onload', 'onmouseover', 'onerror'];
        suspiciousAttributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
                console.warn(`Suspicious ${attr} attribute detected and removed:`, element);
                element.removeAttribute(attr);
            }
        });
        
        // Check for javascript: URLs
        const links = element.querySelectorAll('a[href], area[href]');
        links.forEach(link => {
            if (link.href && link.href.toLowerCase().startsWith('javascript:')) {
                console.warn('Javascript URL detected and sanitized:', link);
                link.href = '#';
            }
        });
    }
    
    /**
     * Check if script is from an allowed source
     */
    isAllowedScript(script) {
        const allowedSources = [
            'cdnjs.cloudflare.com',
            'unpkg.com',
            'cdn.jsdelivr.net',
            'www.googletagmanager.com'
        ];
        
        if (script.src) {
            // Allow external CDN scripts
            const isExternalAllowed = allowedSources.some(source => script.src.includes(source));
            
            // Allow local scripts from our js/ directory
            const isLocalScript = script.src.includes('js/') || script.src.startsWith('./js/') || script.src.startsWith('../js/');
            
            return isExternalAllowed || isLocalScript;
        }
        
        // Check if it's an inline script we created or FAQ related
        return script.textContent.includes('Portfolio site initialized') ||
               script.textContent.includes('ContactFormHandler') ||
               script.textContent.includes('SecurityManager') ||
               script.textContent.includes('FAQ') ||
               script.textContent.includes('Ultimate FAQ fix') ||
               script.textContent.includes('Complete FAQ') ||
               script.textContent.includes('Translation fix') ||
               script.textContent.includes('ABSOLUTE FINAL FAQ FIX') ||
               script.textContent.includes('absoluteFAQFix') ||
               script.textContent.includes('⚡') ||
               script.textContent.includes('🏁') ||
               script.textContent.includes('🔧') ||
               script.textContent.includes('🚀');
    }
    
    /**
     * Sanitize existing dynamic content
     */
    sanitizeDynamicContent() {
        // Sanitize any user-generated content or dynamic elements
        const dynamicElements = document.querySelectorAll('[data-dynamic]');
        dynamicElements.forEach(element => {
            element.innerHTML = this.sanitizeHTML(element.innerHTML);
        });
    }
    
    /**
     * Set up input sanitizers
     */
    setupInputSanitizers() {
        // Add event listeners to all input fields
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = this.sanitizeInput(e.target.value);
            });
            
            input.addEventListener('paste', (e) => {
                setTimeout(() => {
                    e.target.value = this.sanitizeInput(e.target.value);
                }, 0);
            });
        });
    }
    
    /**
     * Sanitize input text
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove potentially dangerous characters and patterns
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
            .replace(/javascript:/gi, '') // Remove javascript: protocols
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .replace(/&lt;script/gi, '') // Remove encoded script tags
            .replace(/&lt;iframe/gi, '') // Remove encoded iframe tags
            .trim();
    }
    
    /**
     * Sanitize HTML content
     */
    sanitizeHTML(html) {
        if (typeof html !== 'string') return html;
        
        const temp = document.createElement('div');
        temp.textContent = html; // This will escape all HTML
        return temp.innerHTML;
    }
    
    /**
     * Set up clickjacking protection
     */
    setupClickjackProtection() {
        // Prevent the page from being embedded in frames
        if (window.top !== window.self) {
            // If we're in a frame, check if it's legitimate
            try {
                // Try to access parent window (will throw if cross-origin)
                const parentHost = window.parent.location.hostname;
                const allowedHosts = [
                    'shadowkrr.github.io',
                    'localhost',
                    '127.0.0.1'
                ];
                
                if (!allowedHosts.includes(parentHost)) {
                    console.warn('Potential clickjacking attempt detected');
                    window.top.location.href = window.self.location.href;
                }
            } catch (e) {
                // Cross-origin frame - redirect to break out
                console.warn('Cross-origin frame detected, breaking out');
                window.top.location.href = window.self.location.href;
            }
        }
    }
    
    /**
     * Monitor for CSP violations
     */
    monitorSecurityViolations() {
        document.addEventListener('securitypolicyviolation', (e) => {
            console.warn('CSP Violation:', {
                blockedURI: e.blockedURI,
                violatedDirective: e.violatedDirective,
                originalPolicy: e.originalPolicy,
                sourceFile: e.sourceFile,
                lineNumber: e.lineNumber
            });
            
            // In production, you might want to send this to your analytics
            // or security monitoring service
        });
    }
    
    /**
     * Validate external resources
     */
    validateExternalResources() {
        const scripts = document.querySelectorAll('script[src]');
        const links = document.querySelectorAll('link[href]');
        
        [...scripts, ...links].forEach(element => {
            const url = element.src || element.href;
            if (url && !this.isTrustedDomain(url)) {
                console.warn('Untrusted external resource detected:', url);
            }
        });
    }
    
    /**
     * Check if domain is trusted
     */
    isTrustedDomain(url) {
        const trustedDomains = [
            'cdnjs.cloudflare.com',
            'unpkg.com',
            'cdn.jsdelivr.net',
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'www.googletagmanager.com',
            'www.google-analytics.com',
            'api.emailjs.com'
        ];
        
        try {
            const urlObj = new URL(url);
            return trustedDomains.includes(urlObj.hostname);
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Generate security report
     */
    generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            cspEnabled: this.hasServerCSP() || document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            httpsEnabled: location.protocol === 'https:',
            mixedContent: this.checkForMixedContent(),
            externalResources: this.getExternalResources(),
            securityHeaders: this.checkSecurityHeaders()
        };
        
        console.log('Security Report:', report);
        return report;
    }
    
    /**
     * Check for mixed content
     */
    checkForMixedContent() {
        if (location.protocol !== 'https:') return false;
        
        const httpResources = [];
        const scripts = document.querySelectorAll('script[src]');
        const links = document.querySelectorAll('link[href]');
        const images = document.querySelectorAll('img[src]');
        
        [...scripts, ...links, ...images].forEach(element => {
            const url = element.src || element.href;
            if (url && url.startsWith('http://')) {
                httpResources.push(url);
            }
        });
        
        return httpResources;
    }
    
    /**
     * Get list of external resources
     */
    getExternalResources() {
        const external = [];
        const scripts = document.querySelectorAll('script[src]');
        const links = document.querySelectorAll('link[href]');
        
        [...scripts, ...links].forEach(element => {
            const url = element.src || element.href;
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                try {
                    const urlObj = new URL(url);
                    if (urlObj.hostname !== location.hostname) {
                        external.push({
                            url: url,
                            type: element.tagName.toLowerCase(),
                            trusted: this.isTrustedDomain(url)
                        });
                    }
                } catch (e) {
                    // Invalid URL
                }
            }
        });
        
        return external;
    }
    
    /**
     * Check security headers (client-side detection)
     */
    checkSecurityHeaders() {
        // Note: Some headers can't be read from client-side JavaScript
        // This is limited to what we can detect
        return {
            csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            frameOptions: window.self === window.top, // Indirect check
            httpsRedirect: location.protocol === 'https:'
        };
    }
}

// Initialize security manager
const securityManager = new SecurityManager();

// Export for external use
if (typeof window !== 'undefined') {
    window.SecurityManager = SecurityManager;
    window.securityManager = securityManager;
}

// Development helper - generate security report
if (typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    setTimeout(() => {
        securityManager.generateSecurityReport();
    }, 2000);
}