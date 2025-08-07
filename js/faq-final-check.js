/**
 * FAQ Final Check - Ensures FAQ functionality works regardless of other issues
 */

(function() {
    'use strict';
    
    console.log('🎯 FAQ Final Check Starting...');
    
    function finalFAQCheck() {
        const categoryButtons = document.querySelectorAll('.faq-category-btn');
        const faqItems = document.querySelectorAll('.faq-item');
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        console.log('🎯 Final Check:', {
            categoryButtons: categoryButtons.length,
            faqItems: faqItems.length,
            questions: faqQuestions.length
        });
        
        // Ensure category buttons work
        categoryButtons.forEach(function(btn) {
            if (!btn.onclick) {
                btn.onclick = function(e) {
                    e.preventDefault();
                    const category = btn.getAttribute('data-category');
                    
                    // Update active state
                    categoryButtons.forEach(function(b) {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    
                    // Filter items
                    faqItems.forEach(function(item) {
                        const itemCategory = item.getAttribute('data-category');
                        if (category === 'all' || itemCategory === category) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                    
                    console.log('🎯 Final Check: Category', category, 'activated');
                };
            }
        });
        
        // Ensure FAQ questions work
        faqQuestions.forEach(function(question, index) {
            if (!question.onclick) {
                const answer = question.nextElementSibling;
                if (answer) {
                    question.onclick = function(e) {
                        e.preventDefault();
                        
                        const isOpen = question.classList.contains('expanded');
                        
                        // Close all
                        faqQuestions.forEach(function(q) {
                            const a = q.nextElementSibling;
                            if (a) {
                                q.classList.remove('expanded');
                                q.setAttribute('aria-expanded', 'false');
                                a.style.maxHeight = '0px';
                                a.style.opacity = '0';
                                a.style.padding = '0 25px';
                                const chevron = q.querySelector('.fas');
                                if (chevron) chevron.style.transform = 'rotate(0deg)';
                            }
                        });
                        
                        // Open this one if it wasn't open
                        if (!isOpen) {
                            question.classList.add('expanded');
                            question.setAttribute('aria-expanded', 'true');
                            answer.style.maxHeight = '1000px';
                            answer.style.opacity = '1';
                            answer.style.padding = '25px';
                            const chevron = question.querySelector('.fas');
                            if (chevron) chevron.style.transform = 'rotate(180deg)';
                            
                            console.log('🎯 Final Check: Question', index, 'opened');
                        }
                    };
                }
            }
        });
        
        console.log('🎯 FAQ Final Check Complete - All functionality ensured');
    }
    
    // Run multiple times to ensure it works
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(finalFAQCheck, 2500);
        });
    } else {
        setTimeout(finalFAQCheck, 2500);
    }
    
    window.addEventListener('load', function() {
        setTimeout(finalFAQCheck, 3000);
    });
    
    // Export for manual testing
    window.finalFAQCheck = finalFAQCheck;
    
})();