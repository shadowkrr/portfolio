/**
 * Simple FAQ Accordion Fallback
 * Provides basic accordion functionality if the main FAQ class fails
 */

(function() {
    'use strict';
    
    console.log('Simple FAQ script loaded');
    
    function initSimpleFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        console.log('Simple FAQ: Found', faqItems.length, 'items');
        
        faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) {
                console.warn(`Simple FAQ: Item ${index} missing elements`);
                return;
            }
            
            // Remove any existing event listeners to prevent duplicates
            const newQuestion = question.cloneNode(true);
            question.parentNode.replaceChild(newQuestion, question);
            
            newQuestion.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Simple FAQ: Clicked item ${index}`);
                
                const isExpanded = newQuestion.getAttribute('aria-expanded') === 'true';
                
                // Toggle state
                if (isExpanded) {
                    // Close
                    newQuestion.setAttribute('aria-expanded', 'false');
                    newQuestion.classList.remove('expanded');
                    item.classList.remove('expanded');
                    
                    answer.style.maxHeight = '0';
                    answer.style.opacity = '0';
                    answer.style.padding = '0 25px';
                    
                    const chevron = newQuestion.querySelector('.fas');
                    if (chevron) {
                        chevron.style.transform = 'rotate(0deg)';
                    }
                    
                    console.log('Simple FAQ: Closed item', index);
                } else {
                    // Open
                    newQuestion.setAttribute('aria-expanded', 'true');
                    newQuestion.classList.add('expanded');
                    item.classList.add('expanded');
                    
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.style.opacity = '1';
                    answer.style.padding = '25px';
                    
                    const chevron = newQuestion.querySelector('.fas');
                    if (chevron) {
                        chevron.style.transform = 'rotate(180deg)';
                    }
                    
                    console.log('Simple FAQ: Opened item', index, 'height:', answer.scrollHeight);
                }
            });
            
            // Initialize closed state
            newQuestion.setAttribute('aria-expanded', 'false');
            answer.style.maxHeight = '0';
            answer.style.opacity = '0';
            answer.style.padding = '0 25px';
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initSimpleFAQ, 2000); // Wait for main FAQ to try first
        });
    } else {
        setTimeout(initSimpleFAQ, 2000);
    }
    
    // Debug function
    window.debugSimpleFAQ = function() {
        console.log('Reinitializing simple FAQ');
        initSimpleFAQ();
    };
    
    // Export init function
    window.initSimpleFAQ = initSimpleFAQ;
})();