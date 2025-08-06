/**
 * Cookie Consent Banner Implementation
 * GDPR/CCPA Compliant Cookie Management System
 * 
 * Features:
 * - GDPR Article 7 compliant (clear consent, withdraw option)
 * - CCPA compliant (opt-out mechanism)
 * - Granular cookie categories
 * - Japanese/English multilingual support
 * - Dark mode compatible
 * - Accessible UI
 * - Integration with Google Analytics
 * - Local storage for consent preferences
 * - Consent analytics tracking
 */

class CookieConsentManager {
    constructor(options = {}) {
        this.config = {
            // Cookie settings
            cookieName: 'portfolio_cookie_consent',
            cookieDuration: 365, // days
            cookieVersion: '1.0',
            
            // UI settings
            position: options.position || 'bottom',
            theme: options.theme || 'auto', // auto, light, dark
            showBrandingLink: options.showBrandingLink !== false,
            
            // Compliance settings
            respectDoNotTrack: options.respectDoNotTrack !== false,
            autoDecline: options.autoDecline !== false,
            
            // Language settings
            language: options.language || this.detectLanguage(),
            
            // Integration settings
            analyticsIntegration: options.analyticsIntegration !== false,
            
            // Cookie categories
            categories: {
                necessary: {
                    enabled: true,
                    readonly: true
                },
                analytics: {
                    enabled: false,
                    readonly: false
                },
                marketing: {
                    enabled: false,
                    readonly: false
                },
                preferences: {
                    enabled: false,
                    readonly: false
                },
                functional: {
                    enabled: false,
                    readonly: false
                }
            }
        };
        
        // State management
        this.consentGiven = false;
        this.bannerVisible = false;
        this.currentConsent = null;
        
        // DOM elements
        this.banner = null;
        this.modal = null;
        
        // Event handlers
        this.eventHandlers = new Map();
        
        this.init();
    }
    
    /**
     * Initialize the cookie consent manager
     */
    init() {
        // Check for existing consent
        this.loadExistingConsent();
        
        // Check Do Not Track
        if (this.config.respectDoNotTrack && this.isDoNotTrackEnabled()) {
            this.handleDoNotTrack();
            return;
        }
        
        // Check if consent is needed
        if (!this.isConsentRequired()) {
            return;
        }
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
        
        console.log('Cookie Consent Manager initialized');
    }
    
    /**
     * Load existing consent from storage
     */
    loadExistingConsent() {
        try {
            const stored = localStorage.getItem(this.config.cookieName);
            if (stored) {
                this.currentConsent = JSON.parse(stored);
                
                // Check version compatibility
                if (this.currentConsent.version !== this.config.cookieVersion) {
                    this.resetConsent();
                    return;
                }
                
                // Update config with stored preferences
                Object.keys(this.currentConsent.categories).forEach(category => {
                    if (this.config.categories[category]) {
                        this.config.categories[category].enabled = 
                            this.currentConsent.categories[category];
                    }
                });
                
                this.consentGiven = true;
                this.applyConsent();
            }
        } catch (error) {
            console.error('Error loading consent preferences:', error);
            this.resetConsent();
        }
    }
    
    /**
     * Check if consent is required
     */
    isConsentRequired() {
        // Skip if consent already given and valid
        if (this.consentGiven && this.currentConsent) {
            const consentAge = Date.now() - this.currentConsent.timestamp;
            const maxAge = this.config.cookieDuration * 24 * 60 * 60 * 1000;
            
            if (consentAge < maxAge) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if Do Not Track is enabled
     */
    isDoNotTrackEnabled() {
        return navigator.doNotTrack === '1' || 
               window.doNotTrack === '1' || 
               navigator.msDoNotTrack === '1';
    }
    
    /**
     * Handle Do Not Track preference
     */
    handleDoNotTrack() {
        console.log('Do Not Track detected - respecting user preference');
        
        // Set minimal consent (necessary cookies only)
        this.setConsent({
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
            functional: false
        }, 'donottrack');
    }
    
    /**
     * Setup the consent UI
     */
    setupUI() {
        this.createBanner();
        this.createModal();
        this.setupEventListeners();
        this.showBanner();
        
        // Apply theme
        this.applyTheme();
        
        // Track banner view
        this.trackConsentEvent('banner_shown');
    }
    
    /**
     * Create the consent banner
     */
    createBanner() {
        const texts = this.getTexts();
        
        this.banner = document.createElement('div');
        this.banner.className = `cookie-consent-banner cookie-consent-${this.config.position}`;
        this.banner.setAttribute('role', 'banner');
        this.banner.setAttribute('aria-label', texts.banner.title);
        
        this.banner.innerHTML = `
            <div class="cookie-consent-container">
                <div class="cookie-consent-content">
                    <div class="cookie-consent-icon">
                        <i class="fas fa-cookie-bite" aria-hidden="true"></i>
                    </div>
                    <div class="cookie-consent-text">
                        <h3 class="cookie-consent-title">${texts.banner.title}</h3>
                        <p class="cookie-consent-message">
                            ${texts.banner.message}
                            <a href="#" class="cookie-consent-link" data-action="show-details">
                                ${texts.banner.learnMore}
                            </a>
                        </p>
                    </div>
                </div>
                <div class="cookie-consent-actions">
                    <button class="cookie-consent-btn cookie-consent-btn-settings" data-action="show-settings" aria-label="${texts.buttons.settings}">
                        <i class="fas fa-cog" aria-hidden="true"></i>
                        ${texts.buttons.settings}
                    </button>
                    <button class="cookie-consent-btn cookie-consent-btn-decline" data-action="decline-all">
                        ${texts.buttons.decline}
                    </button>
                    <button class="cookie-consent-btn cookie-consent-btn-accept" data-action="accept-all">
                        ${texts.buttons.acceptAll}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.banner);
    }
    
    /**
     * Create the settings modal
     */
    createModal() {
        const texts = this.getTexts();
        
        this.modal = document.createElement('div');
        this.modal.className = 'cookie-consent-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-labelledby', 'cookie-modal-title');
        
        this.modal.innerHTML = `
            <div class="cookie-consent-modal-backdrop" data-action="close-modal"></div>
            <div class="cookie-consent-modal-content">
                <div class="cookie-consent-modal-header">
                    <h2 id="cookie-modal-title">${texts.modal.title}</h2>
                    <button class="cookie-consent-close" data-action="close-modal" aria-label="${texts.buttons.close}">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="cookie-consent-modal-body">
                    <p class="cookie-consent-description">${texts.modal.description}</p>
                    
                    <div class="cookie-consent-categories">
                        ${this.generateCategoryHTML(texts)}
                    </div>
                    
                    <div class="cookie-consent-info">
                        <h3>${texts.modal.infoTitle}</h3>
                        <p>${texts.modal.infoText}</p>
                        <div class="cookie-consent-links">
                            <a href="privacy-policy.html" target="_blank" rel="noopener">
                                ${texts.links.privacy}
                                <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                            </a>
                            <a href="#contact" data-action="close-modal">
                                ${texts.links.contact}
                            </a>
                        </div>
                    </div>
                </div>
                <div class="cookie-consent-modal-footer">
                    <button class="cookie-consent-btn cookie-consent-btn-secondary" data-action="decline-all">
                        ${texts.buttons.decline}
                    </button>
                    <button class="cookie-consent-btn cookie-consent-btn-secondary" data-action="accept-selected">
                        ${texts.buttons.saveSettings}
                    </button>
                    <button class="cookie-consent-btn cookie-consent-btn-primary" data-action="accept-all">
                        ${texts.buttons.acceptAll}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
    }
    
    /**
     * Generate category HTML
     */
    generateCategoryHTML(texts) {
        return Object.keys(this.config.categories).map(categoryKey => {
            const category = this.config.categories[categoryKey];
            const categoryTexts = texts.categories[categoryKey];
            const isDisabled = category.readonly ? 'disabled' : '';
            const isChecked = category.enabled ? 'checked' : '';
            
            return `
                <div class="cookie-consent-category">
                    <div class="cookie-consent-category-header">
                        <div class="cookie-consent-toggle">
                            <input 
                                type="checkbox" 
                                id="cookie-${categoryKey}" 
                                class="cookie-consent-checkbox"
                                data-category="${categoryKey}"
                                ${isChecked}
                                ${isDisabled}
                                aria-describedby="cookie-${categoryKey}-desc"
                            >
                            <label for="cookie-${categoryKey}" class="cookie-consent-toggle-label">
                                <span class="cookie-consent-toggle-switch"></span>
                            </label>
                        </div>
                        <div class="cookie-consent-category-info">
                            <h4>${categoryTexts.title}</h4>
                            <p id="cookie-${categoryKey}-desc">${categoryTexts.description}</p>
                        </div>
                    </div>
                    ${categoryTexts.details ? `
                        <div class="cookie-consent-category-details">
                            <button class="cookie-consent-details-toggle" data-category="${categoryKey}" aria-expanded="false">
                                ${texts.buttons.showDetails}
                                <i class="fas fa-chevron-down" aria-hidden="true"></i>
                            </button>
                            <div class="cookie-consent-details-content">
                                ${categoryTexts.details}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Banner and modal click handlers
        const clickHandler = (e) => {
            const action = e.target.closest('[data-action]')?.getAttribute('data-action');
            if (action) {
                this.handleAction(action, e);
            }
        };
        
        this.banner.addEventListener('click', clickHandler);
        this.modal.addEventListener('click', clickHandler);
        
        // Category toggle handlers
        this.modal.addEventListener('change', (e) => {
            if (e.target.classList.contains('cookie-consent-checkbox')) {
                this.handleCategoryToggle(e);
            }
        });
        
        // Details toggle handlers
        this.modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('cookie-consent-details-toggle')) {
                this.toggleCategoryDetails(e);
            }
        });
        
        // Keyboard handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.hideModal();
            }
        });
        
        // Theme change listener
        if (this.config.theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => this.applyTheme());
        }
        
        // Store handlers for cleanup
        this.eventHandlers.set('click', clickHandler);
    }
    
    /**
     * Handle user actions
     */
    handleAction(action, event) {
        switch (action) {
            case 'accept-all':
                this.acceptAll();
                break;
            case 'decline-all':
                this.declineAll();
                break;
            case 'accept-selected':
                this.acceptSelected();
                break;
            case 'show-settings':
                this.showModal();
                break;
            case 'show-details':
                event.preventDefault();
                this.showModal();
                break;
            case 'close-modal':
                this.hideModal();
                break;
        }
    }
    
    /**
     * Handle category toggle
     */
    handleCategoryToggle(event) {
        const category = event.target.getAttribute('data-category');
        const isEnabled = event.target.checked;
        
        if (this.config.categories[category] && !this.config.categories[category].readonly) {
            this.config.categories[category].enabled = isEnabled;
            
            this.trackConsentEvent('category_toggled', {
                category: category,
                enabled: isEnabled
            });
        }
    }
    
    /**
     * Toggle category details
     */
    toggleCategoryDetails(event) {
        const button = event.target;
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const content = button.nextElementSibling;
        const icon = button.querySelector('i');
        
        button.setAttribute('aria-expanded', !isExpanded);
        content.style.display = isExpanded ? 'none' : 'block';
        icon.className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
    
    /**
     * Accept all cookies
     */
    acceptAll() {
        const consent = {};
        Object.keys(this.config.categories).forEach(category => {
            consent[category] = true;
        });
        
        this.setConsent(consent, 'accept_all');
        this.hideBanner();
        this.hideModal();
    }
    
    /**
     * Decline all optional cookies
     */
    declineAll() {
        const consent = {};
        Object.keys(this.config.categories).forEach(category => {
            consent[category] = this.config.categories[category].readonly;
        });
        
        this.setConsent(consent, 'decline_all');
        this.hideBanner();
        this.hideModal();
    }
    
    /**
     * Accept selected cookies
     */
    acceptSelected() {
        const consent = {};
        Object.keys(this.config.categories).forEach(category => {
            consent[category] = this.config.categories[category].enabled;
        });
        
        this.setConsent(consent, 'accept_selected');
        this.hideModal();
        this.hideBanner();
    }
    
    /**
     * Set consent preferences
     */
    setConsent(categories, method = 'manual') {
        const consentData = {
            version: this.config.cookieVersion,
            timestamp: Date.now(),
            method: method,
            categories: categories,
            language: this.config.language,
            userAgent: navigator.userAgent.substring(0, 100) // Truncated for privacy
        };
        
        // Save to storage
        try {
            localStorage.setItem(this.config.cookieName, JSON.stringify(consentData));
        } catch (error) {
            console.error('Error saving consent:', error);
        }
        
        // Update state
        this.currentConsent = consentData;
        this.consentGiven = true;
        
        // Update config
        Object.keys(categories).forEach(category => {
            if (this.config.categories[category]) {
                this.config.categories[category].enabled = categories[category];
            }
        });
        
        // Apply consent
        this.applyConsent();
        
        // Track consent
        this.trackConsentEvent('consent_given', {
            method: method,
            categories: categories
        });
        
        // Dispatch event for integrations
        this.dispatchConsentEvent('consent_updated', consentData);
    }
    
    /**
     * Apply consent settings
     */
    applyConsent() {
        // Integrate with Google Analytics
        if (this.config.analyticsIntegration && window.portfolioAnalytics) {
            window.portfolioAnalytics.updateConsent({
                analytics: this.config.categories.analytics.enabled,
                marketing: this.config.categories.marketing.enabled,
                preferences: this.config.categories.preferences.enabled
            });
        }
        
        // Other integrations can be added here
        console.log('Consent applied:', this.config.categories);
    }
    
    /**
     * Show consent banner
     */
    showBanner() {
        if (!this.banner || this.bannerVisible) return;
        
        this.banner.classList.add('show');
        this.bannerVisible = true;
        
        // Focus management for accessibility
        setTimeout(() => {
            const firstButton = this.banner.querySelector('button');
            if (firstButton) {
                firstButton.focus();
            }
        }, 100);
    }
    
    /**
     * Hide consent banner
     */
    hideBanner() {
        if (!this.banner || !this.bannerVisible) return;
        
        this.banner.classList.remove('show');
        this.bannerVisible = false;
        
        setTimeout(() => {
            this.banner.remove();
        }, 300);
    }
    
    /**
     * Show settings modal
     */
    showModal() {
        if (!this.modal) return;
        
        this.modal.classList.add('show');
        document.body.classList.add('cookie-consent-modal-open');
        
        // Focus management
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input, button');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
    
    /**
     * Hide settings modal
     */
    hideModal() {
        if (!this.modal) return;
        
        this.modal.classList.remove('show');
        document.body.classList.remove('cookie-consent-modal-open');
    }
    
    /**
     * Apply theme
     */
    applyTheme() {
        const isDark = this.config.theme === 'dark' || 
                      (this.config.theme === 'auto' && this.isDarkMode());
        
        document.body.classList.toggle('cookie-consent-dark', isDark);
    }
    
    /**
     * Check if dark mode is preferred
     */
    isDarkMode() {
        return document.body.classList.contains('dark-mode') ||
               window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    /**
     * Detect user language
     */
    detectLanguage() {
        const htmlLang = document.documentElement.lang;
        const browserLang = navigator.language || navigator.userLanguage;
        
        if (htmlLang && htmlLang.startsWith('ja')) return 'ja';
        if (browserLang && browserLang.startsWith('ja')) return 'ja';
        
        return 'en';
    }
    
    /**
     * Get localized texts
     */
    getTexts() {
        const texts = {
            en: {
                banner: {
                    title: 'We Use Cookies',
                    message: 'This website uses cookies to enhance your browsing experience and provide personalized content.',
                    learnMore: 'Learn more'
                },
                modal: {
                    title: 'Cookie Preferences',
                    description: 'We use cookies to improve your experience on our site. You can choose which types of cookies to allow.',
                    infoTitle: 'Additional Information',
                    infoText: 'You can change your preferences at any time by clicking the cookie settings button. Your data is processed in accordance with our privacy policy.'
                },
                buttons: {
                    acceptAll: 'Accept All',
                    decline: 'Decline All',
                    settings: 'Settings',
                    saveSettings: 'Save Settings',
                    close: 'Close',
                    showDetails: 'Show Details'
                },
                links: {
                    privacy: 'Privacy Policy',
                    contact: 'Contact Us'
                },
                categories: {
                    necessary: {
                        title: 'Necessary Cookies',
                        description: 'Essential for the website to function properly.',
                        details: 'These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.'
                    },
                    analytics: {
                        title: 'Analytics Cookies',
                        description: 'Help us understand how visitors interact with our website.',
                        details: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.'
                    },
                    marketing: {
                        title: 'Marketing Cookies',
                        description: 'Used to track visitors across websites for advertising.',
                        details: 'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.'
                    },
                    preferences: {
                        title: 'Preference Cookies',
                        description: 'Remember your preferences and settings.',
                        details: 'These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have added to our pages.'
                    },
                    functional: {
                        title: 'Functional Cookies',
                        description: 'Enable advanced website features and functionality.',
                        details: 'These cookies are used to enhance the functionality of the website but are non-essential to its use. However, without these cookies, certain functionality may become unavailable.'
                    }
                }
            },
            ja: {
                banner: {
                    title: 'クッキーを使用しています',
                    message: 'このウェブサイトでは、閲覧体験を向上させ、パーソナライズされたコンテンツを提供するためにクッキーを使用しています。',
                    learnMore: '詳細を見る'
                },
                modal: {
                    title: 'クッキー設定',
                    description: 'サイトの体験を向上させるためにクッキーを使用しています。許可するクッキーの種類を選択できます。',
                    infoTitle: '追加情報',
                    infoText: 'クッキー設定ボタンをクリックすることで、いつでも設定を変更できます。お客様のデータは当社のプライバシーポリシーに従って処理されます。'
                },
                buttons: {
                    acceptAll: 'すべて同意',
                    decline: 'すべて拒否',
                    settings: '設定',
                    saveSettings: '設定を保存',
                    close: '閉じる',
                    showDetails: '詳細を表示'
                },
                links: {
                    privacy: 'プライバシーポリシー',
                    contact: 'お問い合わせ'
                },
                categories: {
                    necessary: {
                        title: '必須クッキー',
                        description: 'ウェブサイトが正常に機能するために必要です。',
                        details: 'これらのクッキーはウェブサイトの機能に必要であり、当システムでは無効にすることができません。通常、プライバシー設定、ログイン、フォームへの入力など、サービスの要求に相当する操作に応答して設定されます。'
                    },
                    analytics: {
                        title: '分析クッキー',
                        description: '訪問者がウェブサイトとどのように相互作用するかを理解するのに役立ちます。',
                        details: 'これらのクッキーにより、訪問数とトラフィックソースをカウントして、サイトのパフォーマンスを測定・改善できます。どのページが最も人気があり、最も人気がないかを知り、訪問者がサイト内をどのように移動するかを確認するのに役立ちます。'
                    },
                    marketing: {
                        title: 'マーケティングクッキー',
                        description: '広告のためにウェブサイト間で訪問者を追跡するために使用されます。',
                        details: 'これらのクッキーは、広告パートナーによってサイトを通じて設定される場合があります。これらの会社は、お客様の興味のプロフィールを構築し、他のサイトで関連する広告を表示するために使用する場合があります。'
                    },
                    preferences: {
                        title: '設定クッキー',
                        description: 'お客様の設定や好みを記憶します。',
                        details: 'これらのクッキーにより、ウェブサイトは拡張機能とパーソナライゼーションを提供できます。当社または当社のページに追加したサービスを提供するサードパーティプロバイダーによって設定される場合があります。'
                    },
                    functional: {
                        title: '機能的クッキー',
                        description: '高度なウェブサイト機能を有効にします。',
                        details: 'これらのクッキーは、ウェブサイトの機能を向上させるために使用されますが、その使用に必須ではありません。ただし、これらのクッキーがないと、特定の機能が利用できなくなる場合があります。'
                    }
                }
            }
        };
        
        return texts[this.config.language] || texts.en;
    }
    
    /**
     * Track consent events
     */
    trackConsentEvent(eventName, data = {}) {
        // Track with analytics if available and consent given
        if (window.portfolioAnalytics && this.config.categories.analytics.enabled) {
            window.portfolioAnalytics.trackEvent('cookie_consent_' + eventName, {
                ...data,
                consent_version: this.config.cookieVersion,
                language: this.config.language
            });
        }
        
        console.log(`Cookie consent event: ${eventName}`, data);
    }
    
    /**
     * Dispatch consent events for other scripts
     */
    dispatchConsentEvent(eventName, data) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true,
            cancelable: false
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Reset all consent data
     */
    resetConsent() {
        localStorage.removeItem(this.config.cookieName);
        this.currentConsent = null;
        this.consentGiven = false;
        
        // Reset categories to defaults
        Object.keys(this.config.categories).forEach(category => {
            this.config.categories[category].enabled = 
                this.config.categories[category].readonly;
        });
    }
    
    /**
     * Public API methods
     */
    
    /**
     * Get current consent status
     */
    getConsent() {
        return this.currentConsent;
    }
    
    /**
     * Check if specific category is consented
     */
    hasConsent(category) {
        return this.config.categories[category]?.enabled || false;
    }
    
    /**
     * Show consent banner again
     */
    showConsentBanner() {
        if (this.banner) {
            this.showBanner();
        } else {
            this.setupUI();
        }
    }
    
    /**
     * Show settings modal programmatically
     */
    showSettings() {
        if (!this.modal) {
            this.createModal();
        }
        this.showModal();
    }
    
    /**
     * Update consent for specific category
     */
    updateCategoryConsent(category, enabled) {
        if (this.config.categories[category] && !this.config.categories[category].readonly) {
            this.config.categories[category].enabled = enabled;
            
            if (this.consentGiven) {
                const consent = {};
                Object.keys(this.config.categories).forEach(cat => {
                    consent[cat] = this.config.categories[cat].enabled;
                });
                
                this.setConsent(consent, 'api_update');
            }
        }
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        // Remove event listeners
        this.eventHandlers.forEach((handler, event) => {
            document.removeEventListener(event, handler);
        });
        
        // Remove DOM elements
        if (this.banner) {
            this.banner.remove();
        }
        if (this.modal) {
            this.modal.remove();
        }
        
        // Clean body classes
        document.body.classList.remove('cookie-consent-modal-open', 'cookie-consent-dark');
        
        console.log('Cookie Consent Manager destroyed');
    }
}

// Initialize cookie consent when script loads
let cookieConsentManager;

document.addEventListener('DOMContentLoaded', () => {
    cookieConsentManager = new CookieConsentManager({
        theme: 'auto',
        respectDoNotTrack: true,
        analyticsIntegration: true
    });
    
    // Make available globally
    window.cookieConsentManager = cookieConsentManager;
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieConsentManager;
}