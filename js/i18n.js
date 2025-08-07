/**
 * i18n (Internationalization) Library
 * Vanilla JavaScript implementation for multi-language support
 */

class I18n {
    constructor() {
        this.currentLang = 'ja';
        this.translations = {};
        this.defaultLang = 'ja';
        this.supportedLanguages = ['ja', 'en'];
        this.fallbackTranslations = {};
        this.translationCache = new Map();
        
        // DOM elements that need translation
        this.translatableSelectors = [
            '[data-i18n]',
            '[data-i18n-html]',
            '[data-i18n-placeholder]',
            '[data-i18n-title]',
            '[data-i18n-alt]',
            '[data-i18n-aria-label]',
            '[data-i18n-list]'
        ];
        
        this.init();
    }
    
    /**
     * Initialize the i18n system
     */
    async init() {
        try {
            // Detect language from various sources
            this.currentLang = this.detectLanguage();
            
            // Load translations
            await this.loadTranslations();
            
            // Apply translations to the page (only if DOM is ready)
            if (document.readyState !== 'loading') {
                this.translatePage();
                this.setupEventListeners();
                this.updateDocumentLanguage();
            }
            
            console.log(`i18n initialized with language: ${this.currentLang}`);
        } catch (error) {
            console.error('Error initializing i18n:', error);
        }
    }
    
    /**
     * Detect user's preferred language
     */
    detectLanguage() {
        // Priority order:
        // 1. URL parameter (?lang=en)
        // 2. localStorage
        // 3. Browser language
        // 4. Default language
        
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        if (urlLang && this.supportedLanguages.includes(urlLang)) {
            this.saveLanguage(urlLang);
            return urlLang;
        }
        
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            return savedLang;
        }
        
        const browserLang = navigator.language.substring(0, 2);
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }
        
        return this.defaultLang;
    }
    
    /**
     * Load translation files with caching
     */
    async loadTranslations() {
        try {
            // Check cache first
            if (this.translationCache.has(this.currentLang)) {
                this.translations = this.translationCache.get(this.currentLang);
            } else {
                // Load current language
                const response = await fetch(`lang/${this.currentLang}.json`);
                if (response.ok) {
                    this.translations = await response.json();
                    // Cache the translations
                    this.translationCache.set(this.currentLang, this.translations);
                } else {
                    console.warn(`Failed to load translations for ${this.currentLang}:`, response.status);
                }
            }
            
            // Load fallback language if different from current
            if (this.currentLang !== this.defaultLang) {
                if (this.translationCache.has(this.defaultLang)) {
                    this.fallbackTranslations = this.translationCache.get(this.defaultLang);
                } else {
                    const fallbackResponse = await fetch(`lang/${this.defaultLang}.json`);
                    if (fallbackResponse.ok) {
                        this.fallbackTranslations = await fallbackResponse.json();
                        // Cache the fallback translations
                        this.translationCache.set(this.defaultLang, this.fallbackTranslations);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }
    
    /**
     * Get translated text by key
     */
    t(key, params = {}) {
        let translation = this.getNestedTranslation(key, this.translations);
        
        // Fallback to default language if translation not found
        if (!translation && this.currentLang !== this.defaultLang) {
            translation = this.getNestedTranslation(key, this.fallbackTranslations);
        }
        
        // Return key if no translation found
        if (!translation) {
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }
        
        // Replace parameters in translation
        return this.replacePlaceholders(translation, params);
    }
    
    /**
     * Get nested translation by dot notation key
     */
    getNestedTranslation(key, translations) {
        return key.split('.').reduce((obj, k) => obj && obj[k], translations);
    }
    
    /**
     * Replace placeholders in translation string
     */
    replacePlaceholders(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }
    
    /**
     * Translate entire page with performance optimization
     */
    translatePage() {
        // Use requestAnimationFrame for smooth UI updates
        requestAnimationFrame(() => {
            // Batch DOM queries for better performance
            const elementsToTranslate = new Map();
            
            this.translatableSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    elementsToTranslate.set(selector, elements);
                }
            });
            
            // Translate elements in batches
            for (const [selector, elements] of elementsToTranslate) {
                elements.forEach(element => {
                    this.translateElement(element);
                });
            }
            
            // Update navigation active states
            this.updateNavigationStates();
            
            // Update case study links
            this.updateCaseStudyLinks();
            
            // Fire custom event
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: this.currentLang }
            }));
        });
    }
    
    /**
     * Translate individual element
     */
    translateElement(element) {
        // Translate text content
        const textKey = element.getAttribute('data-i18n');
        if (textKey) {
            element.textContent = this.t(textKey);
        }
        
        // Translate HTML content (be careful with XSS)
        const htmlKey = element.getAttribute('data-i18n-html');
        if (htmlKey) {
            element.innerHTML = this.t(htmlKey);
        }
        
        // Translate placeholder
        const placeholderKey = element.getAttribute('data-i18n-placeholder');
        if (placeholderKey) {
            element.placeholder = this.t(placeholderKey);
        }
        
        // Translate title
        const titleKey = element.getAttribute('data-i18n-title');
        if (titleKey) {
            element.title = this.t(titleKey);
        }
        
        // Translate alt text
        const altKey = element.getAttribute('data-i18n-alt');
        if (altKey) {
            element.alt = this.t(altKey);
        }
        
        // Translate aria-label
        const ariaLabelKey = element.getAttribute('data-i18n-aria-label');
        if (ariaLabelKey) {
            element.setAttribute('aria-label', this.t(ariaLabelKey));
        }
        
        // Translate list items
        const listKey = element.getAttribute('data-i18n-list');
        if (listKey) {
            const items = this.t(listKey);
            if (Array.isArray(items)) {
                const listItems = element.querySelectorAll('li');
                items.forEach((item, index) => {
                    if (listItems[index]) {
                        const iconElement = listItems[index].querySelector('i');
                        listItems[index].innerHTML = '';
                        if (iconElement) {
                            listItems[index].appendChild(iconElement.cloneNode(true));
                        }
                        listItems[index].appendChild(document.createTextNode(' ' + item));
                    }
                });
            }
        }
    }
    
    /**
     * Change language
     */
    async changeLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.error(`Unsupported language: ${lang}`);
            return;
        }
        
        if (lang === this.currentLang) {
            return;
        }
        
        // Show loading state
        this.showLoadingState();
        
        this.currentLang = lang;
        this.saveLanguage(lang);
        
        // Load new translations
        await this.loadTranslations();
        
        // Update URL without page reload
        this.updateURL();
        
        // Translate page
        this.translatePage();
        
        // Update document language
        this.updateDocumentLanguage();
        
        // Update meta tags
        this.updateMetaTags();
        
        // Hide loading state
        this.hideLoadingState();
        
        console.log(`Language changed to: ${lang}`);
    }
    
    /**
     * Save language preference
     */
    saveLanguage(lang) {
        localStorage.setItem('preferred-language', lang);
    }
    
    /**
     * Update URL with language parameter
     */
    updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('lang', this.currentLang);
        window.history.replaceState(null, '', url);
    }
    
    /**
     * Update document language attributes
     */
    updateDocumentLanguage() {
        document.documentElement.lang = this.currentLang;
        document.documentElement.dir = this.isRTL() ? 'rtl' : 'ltr';
    }
    
    /**
     * Update meta tags for SEO
     */
    updateMetaTags() {
        // Update title
        const titleKey = 'meta.title';
        if (this.translations[titleKey] || this.fallbackTranslations[titleKey]) {
            document.title = this.t(titleKey);
        }
        
        // Update description
        const descriptionKey = 'meta.description';
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta && (this.translations[descriptionKey] || this.fallbackTranslations[descriptionKey])) {
            descriptionMeta.content = this.t(descriptionKey);
        }
        
        // Update OG tags
        const ogTitleMeta = document.querySelector('meta[property="og:title"]');
        if (ogTitleMeta) {
            ogTitleMeta.content = this.t('meta.ogTitle', { fallback: this.t('meta.title') });
        }
        
        const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
        if (ogDescriptionMeta) {
            ogDescriptionMeta.content = this.t('meta.ogDescription', { fallback: this.t('meta.description') });
        }
    }
    
    /**
     * Check if current language is RTL
     */
    isRTL() {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(this.currentLang);
    }
    
    /**
     * Setup event listeners for language switching
     */
    setupEventListeners() {
        // Language switcher buttons - click handler
        document.addEventListener('click', (e) => {
            const langButton = e.target.closest('[data-lang]');
            if (langButton) {
                e.preventDefault();
                const lang = langButton.getAttribute('data-lang');
                this.changeLanguage(lang);
            }
        });
        
        // Language switcher buttons - keyboard handler
        document.addEventListener('keydown', (e) => {
            const langButton = e.target.closest('[data-lang]');
            if (langButton && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                const lang = langButton.getAttribute('data-lang');
                this.changeLanguage(lang);
            }
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            const newLang = this.detectLanguage();
            if (newLang !== this.currentLang) {
                this.changeLanguage(newLang);
            }
        });
    }
    
    /**
     * Update navigation states
     */
    updateNavigationStates() {
        // Update active language button
        const langButtons = document.querySelectorAll('[data-lang]');
        langButtons.forEach(button => {
            const lang = button.getAttribute('data-lang');
            const isActive = lang === this.currentLang;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive.toString());
            
            // Update button titles for accessibility
            const langName = lang === 'ja' ? '日本語' : 'English';
            const statusText = isActive ? ' (current)' : '';
            button.title = `${langName}${statusText}`;
            button.setAttribute('aria-label', `Switch to ${langName}${statusText}`);
        });
    }
    
    /**
     * Show loading state during language change
     */
    showLoadingState() {
        const langSwitcher = document.querySelector('.language-switcher');
        if (langSwitcher) {
            langSwitcher.classList.add('loading');
        }
        
        // Disable language buttons
        const langButtons = document.querySelectorAll('[data-lang]');
        langButtons.forEach(button => {
            button.disabled = true;
        });
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        const langSwitcher = document.querySelector('.language-switcher');
        if (langSwitcher) {
            langSwitcher.classList.remove('loading');
        }
        
        // Enable language buttons
        const langButtons = document.querySelectorAll('[data-lang]');
        langButtons.forEach(button => {
            button.disabled = false;
        });
    }
    
    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
    
    /**
     * Format date according to current locale
     */
    formatDate(date, options = {}) {
        const locale = this.currentLang === 'ja' ? 'ja-JP' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    }
    
    /**
     * Format number according to current locale
     */
    formatNumber(number, options = {}) {
        const locale = this.currentLang === 'ja' ? 'ja-JP' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }
    
    /**
     * Update case study links to use appropriate language version
     */
    updateCaseStudyLinks() {
        const caseStudyLinks = document.querySelectorAll('[data-case-study]');
        
        caseStudyLinks.forEach(link => {
            const caseStudyType = link.getAttribute('data-case-study');
            const baseUrl = `case-study-${caseStudyType}`;
            const suffix = this.currentLang === 'en' ? '-en.html' : '.html';
            
            link.href = baseUrl + suffix;
            
            // Update aria-label if needed
            const currentLabel = link.getAttribute('aria-label') || '';
            if (currentLabel && this.currentLang === 'en') {
                // Convert Japanese case study names to English equivalents
                const nameMap = {
                    'しゃちぶっく': 'SHACHIBOOK',
                    'Github OSS': 'GitHub OSS',
                    'blog': 'Tech Blog'
                };
                
                let updatedLabel = currentLabel;
                Object.keys(nameMap).forEach(jp => {
                    updatedLabel = updatedLabel.replace(jp, nameMap[jp]);
                });
                
                link.setAttribute('aria-label', updatedLabel);
            }
        });
    }
}

// Initialize i18n immediately and also on DOM ready
let i18nInstance;

// Create instance immediately for other scripts to access
try {
    i18nInstance = new I18n();
    window.i18n = i18nInstance;
} catch (error) {
    console.error('Failed to initialize i18n immediately:', error);
}

// Re-initialize when DOM is ready to ensure proper DOM access
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!i18nInstance) {
            i18nInstance = new I18n();
            window.i18n = i18nInstance;
        } else {
            // Re-apply translations to ensure all elements are translated
            await i18nInstance.loadTranslations();
            i18nInstance.translatePage();
            i18nInstance.updateDocumentLanguage();
        }
    } catch (error) {
        console.error('Failed to initialize i18n on DOM ready:', error);
    }
});