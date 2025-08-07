/**
 * FAQ Section Interactive Functionality
 * Handles accordion behavior, search, and category filtering
 */

class FAQ {
    constructor() {
        this.faqItems = null;
        this.searchInput = null;
        this.categoryButtons = null;
        this.noResults = null;
        this.allFAQs = [];
        
        this.init();
    }

    /**
     * Initialize FAQ functionality
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup FAQ elements and event listeners
     */
    setup() {
        // Get DOM elements
        this.faqItems = document.querySelectorAll('.faq-item');
        this.searchInput = document.getElementById('faq-search');
        this.categoryButtons = document.querySelectorAll('.faq-category-btn');
        this.noResults = document.querySelector('.faq-no-results');

        console.log('FAQ Setup:', {
            faqItems: this.faqItems.length,
            searchInput: !!this.searchInput,
            categoryButtons: this.categoryButtons.length,
            noResults: !!this.noResults
        });

        if (!this.faqItems.length) {
            console.warn('FAQ section not found');
            return;
        }

        // Store original FAQ data
        this.storeFAQData();

        // Setup event listeners
        this.setupAccordions();
        this.setupSearch();
        this.setupCategoryFilters();
        this.setupKeyboardNavigation();
    }

    /**
     * Store original FAQ data for filtering
     */
    storeFAQData() {
        this.allFAQs = Array.from(this.faqItems).map((item, index) => {
            const questionElement = item.querySelector('.faq-question h3');
            const answerElement = item.querySelector('.faq-answer p');
            
            if (!questionElement || !answerElement) {
                console.warn(`FAQ item ${index} missing question or answer element`);
                return null;
            }
            
            return {
                element: item,
                question: questionElement.textContent.toLowerCase(),
                answer: answerElement.textContent.toLowerCase(),
                category: item.getAttribute('data-category'),
                visible: true
            };
        }).filter(item => item !== null);
        
        console.log('Stored FAQ data for', this.allFAQs.length, 'items');
    }

    /**
     * Setup accordion functionality
     */
    setupAccordions() {
        console.log('Setting up accordions for', this.faqItems.length, 'items');
        
        this.faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (!question || !answer) {
                console.warn(`FAQ item ${index} missing question or answer element`);
                return;
            }

            question.addEventListener('click', (e) => {
                console.log('FAQ item clicked:', index);
                e.preventDefault();
                e.stopPropagation();
                this.toggleAccordion(item, question, answer);
            });
        });
    }

    /**
     * Toggle accordion item
     */
    toggleAccordion(item, question, answer) {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        console.log('Toggling accordion. Currently expanded:', isExpanded);

        if (isExpanded) {
            // Close
            console.log('Closing accordion');
            this.closeAccordion(question, answer);
        } else {
            // Close all other accordions first (optional)
            // this.closeAllAccordions();
            
            // Open this one
            console.log('Opening accordion');
            this.openAccordion(question, answer);
        }

        // Announce to screen readers
        this.announceToScreenReader(
            isExpanded ? 'FAQ collapsed' : 'FAQ expanded'
        );
    }

    /**
     * Open accordion
     */
    openAccordion(question, answer) {
        const item = question.closest('.faq-item');
        
        question.setAttribute('aria-expanded', 'true');
        question.classList.add('expanded');
        item.classList.add('expanded');
        
        // Set height for smooth animation
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
        answer.style.padding = '25px';
        
        // Rotate chevron
        const chevron = question.querySelector('.fas');
        if (chevron) {
            chevron.style.transform = 'rotate(180deg)';
        }
        
        console.log('Accordion opened:', {
            maxHeight: answer.style.maxHeight,
            opacity: answer.style.opacity,
            padding: answer.style.padding
        });
    }

    /**
     * Close accordion
     */
    closeAccordion(question, answer) {
        const item = question.closest('.faq-item');
        
        question.setAttribute('aria-expanded', 'false');
        question.classList.remove('expanded');
        item.classList.remove('expanded');
        
        // Reset height
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
        answer.style.padding = '0 25px';
        
        // Reset chevron
        const chevron = question.querySelector('.fas');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
        
        console.log('Accordion closed');
    }

    /**
     * Close all accordions
     */
    closeAllAccordions() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            this.closeAccordion(question, answer);
        });
    }

    /**
     * Setup search functionality
     */
    setupSearch() {
        if (!this.searchInput) return;

        let searchTimeout;

        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value.trim());
            }, 300);
        });

        // Clear search on escape
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.searchInput.value = '';
                this.performSearch('');
            }
        });
    }

    /**
     * Perform search
     */
    performSearch(query) {
        const searchTerm = query.toLowerCase();
        let hasVisibleItems = false;

        this.allFAQs.forEach(faq => {
            const matches = searchTerm === '' || 
                           faq.question.includes(searchTerm) || 
                           faq.answer.includes(searchTerm);

            faq.visible = matches;
            
            if (matches) {
                faq.element.style.display = 'block';
                hasVisibleItems = true;
                
                // Highlight search terms
                if (searchTerm) {
                    this.highlightSearchTerms(faq.element, searchTerm);
                } else {
                    this.removeHighlights(faq.element);
                }
            } else {
                faq.element.style.display = 'none';
                // Close if expanded
                const question = faq.element.querySelector('.faq-question');
                const answer = faq.element.querySelector('.faq-answer');
                this.closeAccordion(question, answer);
            }
        });

        // Show/hide no results message
        this.toggleNoResults(!hasVisibleItems);

        // Update category filter buttons
        this.updateCategoryButtons();

        // Announce to screen readers
        if (searchTerm) {
            const resultCount = this.allFAQs.filter(faq => faq.visible).length;
            this.announceToScreenReader(`${resultCount} FAQ items found`);
        }
    }

    /**
     * Highlight search terms in FAQ content
     */
    highlightSearchTerms(faqElement, searchTerm) {
        const question = faqElement.querySelector('.faq-question h3');
        const answer = faqElement.querySelector('.faq-answer p');

        [question, answer].forEach(element => {
            if (!element.getAttribute('data-original')) {
                element.setAttribute('data-original', element.innerHTML);
            }

            const originalText = element.getAttribute('data-original');
            const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
            const highlightedText = originalText.replace(regex, '<mark>$1</mark>');
            element.innerHTML = highlightedText;
        });
    }

    /**
     * Remove highlights from FAQ content
     */
    removeHighlights(faqElement) {
        const question = faqElement.querySelector('.faq-question h3');
        const answer = faqElement.querySelector('.faq-answer p');

        [question, answer].forEach(element => {
            const originalText = element.getAttribute('data-original');
            if (originalText) {
                element.innerHTML = originalText;
                element.removeAttribute('data-original');
            }
        });
    }

    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Setup category filtering
     */
    setupCategoryFilters() {
        if (!this.categoryButtons.length) return;

        this.categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                this.filterByCategory(category);
                this.setActiveCategory(button);
            });
        });
    }

    /**
     * Filter FAQs by category
     */
    filterByCategory(category) {
        let hasVisibleItems = false;

        this.allFAQs.forEach(faq => {
            const matches = category === 'all' || faq.category === category;
            
            faq.visible = matches;
            
            if (matches) {
                faq.element.style.display = 'block';
                hasVisibleItems = true;
            } else {
                faq.element.style.display = 'none';
                // Close if expanded
                const question = faq.element.querySelector('.faq-question');
                const answer = faq.element.querySelector('.faq-answer');
                this.closeAccordion(question, answer);
            }
        });

        // Show/hide no results message
        this.toggleNoResults(!hasVisibleItems);

        // Clear search when filtering by category
        if (this.searchInput && this.searchInput.value) {
            this.searchInput.value = '';
            this.removeAllHighlights();
        }

        // Announce to screen readers
        const categoryName = category === 'all' ? 'すべて' : 
                           category === 'service' ? 'サービス' :
                           category === 'technical' ? '技術' :
                           category === 'pricing' ? '料金' : 'サポート';
        
        const resultCount = this.allFAQs.filter(faq => faq.visible).length;
        this.announceToScreenReader(`${categoryName}カテゴリで${resultCount}件の質問が見つかりました`);
    }

    /**
     * Set active category button
     */
    setActiveCategory(activeButton) {
        this.categoryButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
        });
        
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');
    }

    /**
     * Update category button states based on visible items
     */
    updateCategoryButtons() {
        this.categoryButtons.forEach(button => {
            const category = button.getAttribute('data-category');
            
            if (category === 'all') {
                return; // Always keep 'all' enabled
            }

            const hasItemsInCategory = this.allFAQs.some(faq => 
                faq.visible && (category === 'all' || faq.category === category)
            );

            button.style.opacity = hasItemsInCategory ? '1' : '0.5';
            button.style.pointerEvents = hasItemsInCategory ? 'auto' : 'none';
        });
    }

    /**
     * Remove all highlights
     */
    removeAllHighlights() {
        this.faqItems.forEach(item => {
            this.removeHighlights(item);
        });
    }

    /**
     * Toggle no results message
     */
    toggleNoResults(show) {
        if (this.noResults) {
            this.noResults.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Enter/Space key for accordion toggles
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        });

        // Arrow key navigation for category buttons
        this.categoryButtons.forEach((button, index) => {
            button.addEventListener('keydown', (e) => {
                let targetIndex = index;
                
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetIndex = index > 0 ? index - 1 : this.categoryButtons.length - 1;
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        targetIndex = index < this.categoryButtons.length - 1 ? index + 1 : 0;
                        break;
                    case 'Home':
                        e.preventDefault();
                        targetIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        targetIndex = this.categoryButtons.length - 1;
                        break;
                }
                
                if (targetIndex !== index) {
                    this.categoryButtons[targetIndex].focus();
                }
            });
        });
    }

    /**
     * Announce to screen readers
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Expand all FAQs
     */
    expandAll() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (item.style.display !== 'none') {
                this.openAccordion(question, answer);
            }
        });
    }

    /**
     * Collapse all FAQs
     */
    collapseAll() {
        this.closeAllAccordions();
    }

    /**
     * Get FAQ statistics
     */
    getStats() {
        return {
            total: this.allFAQs.length,
            visible: this.allFAQs.filter(faq => faq.visible).length,
            categories: {
                service: this.allFAQs.filter(faq => faq.category === 'service').length,
                technical: this.allFAQs.filter(faq => faq.category === 'technical').length,
                pricing: this.allFAQs.filter(faq => faq.category === 'pricing').length,
                support: this.allFAQs.filter(faq => faq.category === 'support').length
            }
        };
    }
}

// Auto-initialize when DOM is ready
function initFAQ() {
    const faqSection = document.querySelector('#faq, .faq');
    console.log('FAQ Section found:', !!faqSection);
    
    if (faqSection) {
        console.log('Creating FAQ instance');
        window.faqManager = new FAQ();
    } else {
        console.warn('FAQ section not found (#faq or .faq)');
    }
}

// Multiple initialization strategies for reliability
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQ);
} else {
    initFAQ();
}

// Fallback initialization after window load
window.addEventListener('load', () => {
    if (!window.faqManager) {
        console.log('FAQ fallback initialization');
        setTimeout(initFAQ, 1000);
    }
});

// Debug helper - manually test FAQ opening
window.debugFAQ = function() {
    if (window.faqManager) {
        console.log('FAQ Manager exists');
        const firstItem = document.querySelector('.faq-item');
        const question = firstItem?.querySelector('.faq-question');
        const answer = firstItem?.querySelector('.faq-answer');
        
        console.log('First FAQ item:', {
            item: !!firstItem,
            question: !!question,
            answer: !!answer
        });
        
        if (question) {
            console.log('Manually clicking first FAQ');
            question.click();
        }
    } else {
        console.log('FAQ Manager not found');
        initFAQ();
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FAQ;
}