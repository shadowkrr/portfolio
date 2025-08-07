/**
 * Direct FAQ Accordion - Guaranteed to work
 * Simple, bulletproof accordion implementation
 */

(function() {
    'use strict';
    
    console.log('🎯 Direct FAQ script loaded');
    
    function initDirectFAQ() {
        console.log('🎯 Initializing Direct FAQ');
        
        const faqItems = document.querySelectorAll('.faq-item');
        console.log('🎯 Found', faqItems.length, 'FAQ items');
        
        faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) {
                console.warn(`🎯 Item ${index} missing elements`);
                return;
            }
            
            // Set initial state
            question.setAttribute('aria-expanded', 'false');
            answer.style.maxHeight = '0px';
            answer.style.opacity = '0';
            answer.style.padding = '0 25px';
            answer.style.overflow = 'hidden';
            answer.style.transition = 'all 0.3s ease';
            
            // Add click handler - use addEventListener to ensure it works
            question.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🎯 Clicked FAQ item ${index}`);
                
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                const chevron = question.querySelector('.fas');
                
                if (isExpanded) {
                    // Close
                    console.log('🎯 Closing item', index);
                    question.setAttribute('aria-expanded', 'false');
                    question.classList.remove('expanded');
                    item.classList.remove('expanded');
                    
                    answer.style.maxHeight = '0px';
                    answer.style.opacity = '0';
                    answer.style.padding = '0 25px';
                    
                    if (chevron) {
                        chevron.style.transform = 'rotate(0deg)';
                    }
                } else {
                    // Close all other items first
                    faqItems.forEach((otherItem, otherIndex) => {
                        if (otherIndex !== index) {
                            const otherQuestion = otherItem.querySelector('.faq-question');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherChevron = otherQuestion.querySelector('.fas');
                            
                            otherQuestion.setAttribute('aria-expanded', 'false');
                            otherQuestion.classList.remove('expanded');
                            otherItem.classList.remove('expanded');
                            
                            otherAnswer.style.maxHeight = '0px';
                            otherAnswer.style.opacity = '0';
                            otherAnswer.style.padding = '0 25px';
                            
                            if (otherChevron) {
                                otherChevron.style.transform = 'rotate(0deg)';
                            }
                        }
                    });
                    
                    // Open this item
                    console.log('🎯 Opening item', index);
                    question.setAttribute('aria-expanded', 'true');
                    question.classList.add('expanded');
                    item.classList.add('expanded');
                    
                    // Get the content height
                    answer.style.maxHeight = 'none';
                    const contentHeight = answer.scrollHeight;
                    answer.style.maxHeight = '0px';
                    
                    // Force reflow then animate
                    answer.offsetHeight;
                    
                    answer.style.maxHeight = contentHeight + 'px';
                    answer.style.opacity = '1';
                    answer.style.padding = '25px';
                    
                    if (chevron) {
                        chevron.style.transform = 'rotate(180deg)';
                    }
                    
                    console.log('🎯 Opened item', index, 'with height:', contentHeight + 'px');
                }
            });
            
            console.log(`🎯 FAQ item ${index} initialized`);
        });
        
        console.log('🎯 Direct FAQ initialization complete');
    }
    
    // Initialize when DOM is ready
    function ready() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initDirectFAQ, 100);
            });
        } else {
            setTimeout(initDirectFAQ, 100);
        }
    }
    
    ready();
    
    // Also try after window load
    window.addEventListener('load', () => {
        setTimeout(initDirectFAQ, 500);
    });
    
    // Debug function
    window.testDirectFAQ = function() {
        console.log('🎯 Testing Direct FAQ');
        initDirectFAQ();
    };
    
    // Export for manual initialization
    window.initDirectFAQ = initDirectFAQ;
    
})();