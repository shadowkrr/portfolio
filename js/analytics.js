/**
 * Google Analytics 4 Implementation with Comprehensive Event Tracking
 * 
 * Features:
 * - Privacy-compliant GA4 implementation
 * - Comprehensive event tracking for user interactions
 * - Cookie consent integration
 * - Custom dimensions support
 * - Error handling and fallback
 * - Performance monitoring
 * - Japanese and international audience support
 */

class PortfolioAnalytics {
    constructor(options = {}) {
        // Configuration
        this.config = {
            measurementId: options.measurementId || 'G-XXXXXXXXXX', // Replace with actual GA4 ID
            dataLayerName: options.dataLayerName || 'dataLayer',
            consentMode: true,
            anonymizeIp: true,
            sendPageView: true,
            cookieFlags: 'SameSite=None; Secure',
            customDimensions: {
                user_language: 'custom_dimension_1',
                theme_preference: 'custom_dimension_2',
                user_engagement_score: 'custom_dimension_3',
                device_category: 'custom_dimension_4'
            }
        };
        
        // State management
        this.consentGiven = false;
        this.initialized = false;
        this.eventQueue = [];
        
        // Event tracking configuration
        this.eventConfig = {
            // Navigation events
            navigation: {
                section_change: 'navigate_section',
                menu_toggle: 'menu_interaction',
                logo_click: 'brand_interaction'
            },
            // User interface events
            ui: {
                theme_toggle: 'theme_change',
                filter_change: 'content_filter',
                scroll_interaction: 'scroll_engagement',
                back_to_top: 'navigation_assistance'
            },
            // Content engagement
            engagement: {
                project_view: 'view_item',
                project_click: 'select_item',
                external_link: 'click_external_link',
                social_click: 'social_interaction',
                resume_action: 'file_download'
            },
            // Contact form events
            contact: {
                form_start: 'begin_checkout', // Using ecommerce event for funnel analysis
                form_submit: 'purchase',
                form_success: 'purchase_success',
                form_error: 'purchase_error'
            },
            // Performance and technical
            technical: {
                page_load_time: 'page_timing',
                error_occurred: 'exception',
                search_performed: 'search'
            }
        };
        
        this.init();
    }
    
    /**
     * Initialize Google Analytics 4
     */
    init() {
        // Check for consent first
        this.checkInitialConsent();
        
        // Initialize consent mode
        this.initializeConsentMode();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTracking());
        } else {
            this.setupTracking();
        }
    }
    
    /**
     * Check for existing consent
     */
    checkInitialConsent() {
        const consent = localStorage.getItem('ga_consent');
        if (consent) {
            try {
                const consentData = JSON.parse(consent);
                this.consentGiven = consentData.analytics === true;
            } catch (error) {
                console.warn('Error parsing consent data:', error);
            }
        }
    }
    
    /**
     * Initialize Google Consent Mode v2
     */
    initializeConsentMode() {
        // Initialize dataLayer
        window[this.config.dataLayerName] = window[this.config.dataLayerName] || [];
        
        // Define gtag function
        window.gtag = window.gtag || function() {
            window[this.config.dataLayerName].push(arguments);
        };
        
        // Set consent defaults
        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': this.consentGiven ? 'granted' : 'denied',
            'functionality_storage': 'granted',
            'personalization_storage': 'denied',
            'security_storage': 'granted',
            'wait_for_update': 500
        });
        
        // Configure GA4
        gtag('config', this.config.measurementId, {
            'anonymize_ip': this.config.anonymizeIp,
            'send_page_view': this.config.sendPageView,
            'cookie_flags': this.config.cookieFlags,
            'custom_map': this.config.customDimensions
        });
        
        this.initialized = true;
        
        // Process queued events if consent is given
        if (this.consentGiven) {
            this.processEventQueue();
        }
    }
    
    /**
     * Update consent settings
     */
    updateConsent(consentSettings) {
        this.consentGiven = consentSettings.analytics === true;
        
        // Update consent mode
        gtag('consent', 'update', {
            'analytics_storage': consentSettings.analytics ? 'granted' : 'denied',
            'ad_storage': consentSettings.marketing ? 'granted' : 'denied',
            'personalization_storage': consentSettings.preferences ? 'granted' : 'denied'
        });
        
        // Store consent
        localStorage.setItem('ga_consent', JSON.stringify(consentSettings));
        
        // Process queued events if consent is now given
        if (this.consentGiven && this.eventQueue.length > 0) {
            this.processEventQueue();
        }
        
        // Track consent change
        this.trackEvent('consent_update', {
            'analytics_consent': consentSettings.analytics,
            'marketing_consent': consentSettings.marketing,
            'preferences_consent': consentSettings.preferences
        });
    }
    
    /**
     * Process queued events
     */
    processEventQueue() {
        while (this.eventQueue.length > 0) {
            const eventData = this.eventQueue.shift();
            this.sendEvent(eventData.eventName, eventData.parameters);
        }
    }
    
    /**
     * Setup event tracking for all portfolio interactions
     */
    setupTracking() {
        this.trackPageView();
        this.setupNavigationTracking();
        this.setupUIInteractionTracking();
        this.setupContentEngagementTracking();
        this.setupContactFormTracking();
        this.setupPerformanceTracking();
        this.setupCustomDimensions();
        
        console.log('Portfolio Analytics initialized successfully');
    }
    
    /**
     * Track page view with custom parameters
     */
    trackPageView() {
        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_language: document.documentElement.lang || 'ja',
            content_group1: 'Portfolio',
            content_group2: this.getCurrentSection()
        };
        
        this.trackEvent('page_view', pageData);
    }
    
    /**
     * Setup navigation event tracking
     */
    setupNavigationTracking() {
        // Navigation link clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const section = link.getAttribute('href').replace('#', '');
                this.trackEvent(this.eventConfig.navigation.section_change, {
                    'destination_section': section,
                    'navigation_method': 'menu_click'
                });
            });
        });
        
        // Logo clicks
        document.querySelectorAll('.nav-logo, .logo-text').forEach(logo => {
            logo.addEventListener('click', () => {
                this.trackEvent(this.eventConfig.navigation.logo_click, {
                    'element_location': 'header',
                    'interaction_type': 'brand_engagement'
                });
            });
        });
        
        // Hamburger menu interactions
        const hamburger = document.getElementById('hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                this.trackEvent(this.eventConfig.navigation.menu_toggle, {
                    'menu_state': isExpanded ? 'closed' : 'opened',
                    'device_type': window.innerWidth < 768 ? 'mobile' : 'desktop'
                });
            });
        }
    }
    
    /**
     * Setup UI interaction tracking
     */
    setupUIInteractionTracking() {
        // Dark mode toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
                this.trackEvent(this.eventConfig.ui.theme_toggle, {
                    'theme_preference': newTheme,
                    'user_interaction': 'theme_switch'
                });
            });
        }
        
        // Work filter interactions
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.trackEvent(this.eventConfig.ui.filter_change, {
                    'filter_type': filter,
                    'content_category': 'portfolio_works',
                    'search_term': filter
                });
            });
        });
        
        // Back to top button
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            backToTop.addEventListener('click', () => {
                this.trackEvent(this.eventConfig.ui.back_to_top, {
                    'scroll_position': window.pageYOffset,
                    'page_height': document.documentElement.scrollHeight
                });
            });
        }
        
        // Scroll depth tracking
        this.setupScrollTracking();
    }
    
    /**
     * Setup content engagement tracking
     */
    setupContentEngagementTracking() {
        // Project card interactions
        document.querySelectorAll('.work-card').forEach(card => {
            const title = card.querySelector('.work-title')?.textContent || 'Unknown';
            const category = card.getAttribute('data-category') || 'unknown';
            
            // Track project views (when card flips or becomes visible)
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.trackEvent(this.eventConfig.engagement.project_view, {
                            'item_id': title.toLowerCase().replace(/\s+/g, '_'),
                            'item_name': title,
                            'item_category': category,
                            'content_type': 'portfolio_project'
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.7 });
            
            observer.observe(card);
            
            // Track project link clicks
            const projectLink = card.querySelector('.work-link');
            if (projectLink) {
                projectLink.addEventListener('click', (e) => {
                    const url = projectLink.getAttribute('href');
                    this.trackEvent(this.eventConfig.engagement.project_click, {
                        'item_id': title.toLowerCase().replace(/\s+/g, '_'),
                        'item_name': title,
                        'item_category': category,
                        'outbound_url': url,
                        'link_type': 'project_external'
                    });
                });
            }
        });
        
        // Social media link tracking
        document.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('click', () => {
                const url = link.getAttribute('href');
                const platform = this.getSocialPlatform(url);
                this.trackEvent(this.eventConfig.engagement.social_click, {
                    'social_network': platform,
                    'link_url': url,
                    'link_location': 'contact_section'
                });
            });
        });
        
        // External link tracking
        document.querySelectorAll('a[target="_blank"]:not(.social-link):not(.work-link)').forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent(this.eventConfig.engagement.external_link, {
                    'link_url': link.getAttribute('href'),
                    'link_text': link.textContent.trim(),
                    'link_location': this.getElementSection(link)
                });
            });
        });
    }
    
    /**
     * Setup contact form tracking
     */
    setupContactFormTracking() {
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;
        
        let formStarted = false;
        
        // Track form start (first input interaction)
        contactForm.querySelectorAll('input, textarea').forEach(input => {
            const startHandler = () => {
                if (!formStarted) {
                    formStarted = true;
                    this.trackEvent(this.eventConfig.contact.form_start, {
                        'form_name': 'contact_form',
                        'form_location': 'contact_section'
                    });
                    input.removeEventListener('focus', startHandler);
                }
            };
            input.addEventListener('focus', startHandler);
        });
        
        // Track form submission attempts
        contactForm.addEventListener('submit', (e) => {
            this.trackEvent(this.eventConfig.contact.form_submit, {
                'form_name': 'contact_form',
                'submission_method': 'form_submit',
                'form_fields_completed': this.getCompletedFieldsCount(contactForm)
            });
        });
        
        // Listen for form success/error events (these would be dispatched by contact-form.js)
        document.addEventListener('contactFormSuccess', () => {
            this.trackEvent(this.eventConfig.contact.form_success, {
                'form_name': 'contact_form',
                'conversion': true,
                'value': 1 // Assign value for conversion tracking
            });
        });
        
        document.addEventListener('contactFormError', (event) => {
            this.trackEvent(this.eventConfig.contact.form_error, {
                'form_name': 'contact_form',
                'error_type': event.detail?.error || 'unknown',
                'error_message': event.detail?.message || 'Form submission failed'
            });
        });
    }
    
    /**
     * Setup performance tracking
     */
    setupPerformanceTracking() {
        // Page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    this.trackEvent(this.eventConfig.technical.page_load_time, {
                        'page_load_time': Math.round(perfData.loadEventEnd - perfData.fetchStart),
                        'dom_content_loaded_time': Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                        'first_paint_time': Math.round(perfData.responseStart - perfData.fetchStart)
                    });
                }
            }, 1000);
        });
        
        // Error tracking
        window.addEventListener('error', (event) => {
            this.trackEvent(this.eventConfig.technical.error_occurred, {
                'description': event.message,
                'filename': event.filename,
                'line_number': event.lineno,
                'fatal': false
            });
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackEvent(this.eventConfig.technical.error_occurred, {
                'description': event.reason?.message || 'Unhandled promise rejection',
                'fatal': false,
                'error_type': 'promise_rejection'
            });
        });
    }
    
    /**
     * Setup scroll depth tracking
     */
    setupScrollTracking() {
        let scrollDepths = [25, 50, 75, 90];
        let trackedDepths = new Set();
        
        window.addEventListener('scroll', this.throttle(() => {
            const scrollPercent = Math.round((window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
            
            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !trackedDepths.has(depth)) {
                    trackedDepths.add(depth);
                    this.trackEvent(this.eventConfig.ui.scroll_interaction, {
                        'scroll_depth': depth,
                        'page_location': window.location.href,
                        'current_section': this.getCurrentSection()
                    });
                }
            });
        }, 1000));
    }
    
    /**
     * Setup custom dimensions
     */
    setupCustomDimensions() {
        const customData = {};
        
        // User language
        customData[this.config.customDimensions.user_language] = navigator.language || 'unknown';
        
        // Theme preference
        customData[this.config.customDimensions.theme_preference] = 
            localStorage.getItem('theme') || 'light';
        
        // Device category
        customData[this.config.customDimensions.device_category] = 
            window.innerWidth < 768 ? 'mobile' : 
            window.innerWidth < 1024 ? 'tablet' : 'desktop';
        
        // Send custom dimensions
        gtag('config', this.config.measurementId, {
            'custom_map': customData
        });
    }
    
    /**
     * Track custom event
     */
    trackEvent(eventName, parameters = {}) {
        if (!this.initialized) {
            console.warn('Analytics not initialized');
            return;
        }
        
        // Add common parameters
        const eventData = {
            ...parameters,
            'timestamp': new Date().toISOString(),
            'user_agent': navigator.userAgent,
            'viewport_size': `${window.innerWidth}x${window.innerHeight}`
        };
        
        if (this.consentGiven) {
            this.sendEvent(eventName, eventData);
        } else {
            // Queue event for later if consent not given
            this.eventQueue.push({ eventName, parameters: eventData });
        }
    }
    
    /**
     * Send event to GA4
     */
    sendEvent(eventName, parameters) {
        try {
            gtag('event', eventName, parameters);
            console.log(`Analytics event tracked: ${eventName}`, parameters);
        } catch (error) {
            console.error('Error sending analytics event:', error);
        }
    }
    
    /**
     * Utility functions
     */
    
    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = 'home';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.id;
            }
        });
        
        return currentSection;
    }
    
    getSocialPlatform(url) {
        if (url.includes('twitter.com')) return 'Twitter';
        if (url.includes('github.com')) return 'GitHub';
        if (url.includes('linkedin.com')) return 'LinkedIn';
        if (url.includes('hateblo.jp')) return 'Hatena Blog';
        return 'Other';
    }
    
    getElementSection(element) {
        let parent = element.closest('section[id]');
        return parent ? parent.id : 'unknown';
    }
    
    getCompletedFieldsCount(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let completed = 0;
        inputs.forEach(input => {
            if (input.value.trim()) completed++;
        });
        return completed;
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    /**
     * Enhanced E-commerce tracking for portfolio projects
     */
    trackProjectInteraction(projectData, action = 'view_item') {
        const ecommerceData = {
            'currency': 'USD',
            'value': 1.0, // Assign value for engagement scoring
            'items': [{
                'item_id': projectData.id,
                'item_name': projectData.name,
                'item_category': projectData.category,
                'item_brand': 'SHADOWKRR Portfolio',
                'quantity': 1
            }]
        };
        
        this.trackEvent(action, ecommerceData);
    }
    
    /**
     * Track conversion goals
     */
    trackConversion(conversionName, value = 1) {
        this.trackEvent('conversion', {
            'conversion_name': conversionName,
            'conversion_value': value,
            'currency': 'USD'
        });
    }
}

// Initialize analytics when script loads
let portfolioAnalytics;

// Wait for cookie consent script to be available
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with placeholder measurement ID - replace with actual GA4 property ID
    portfolioAnalytics = new PortfolioAnalytics({
        measurementId: 'G-XXXXXXXXXX' // Replace with your actual GA4 measurement ID
    });
    
    // Make analytics available globally for cookie consent integration
    window.portfolioAnalytics = portfolioAnalytics;
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioAnalytics;
}