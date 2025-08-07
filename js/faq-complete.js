/**
 * Complete FAQ System - Filter + Accordion
 * Bulletproof implementation with both filtering and accordion functionality
 */

(function() {
    'use strict';
    
    console.log('🏁 Complete FAQ System Loading...');
    
    let faqItems = [];
    let categoryButtons = [];
    let currentCategory = 'all';
    
    function initCompleteFAQ() {
        console.log('🏁 Initializing Complete FAQ System');
        
        // Get all elements
        faqItems = Array.from(document.querySelectorAll('.faq-item'));
        categoryButtons = Array.from(document.querySelectorAll('.faq-category-btn'));
        
        console.log('🏁 Found', faqItems.length, 'FAQ items');
        console.log('🏁 Found', categoryButtons.length, 'category buttons');
        
        if (faqItems.length === 0 || categoryButtons.length === 0) {
            console.warn('🏁 FAQ elements not found, retrying...');
            setTimeout(initCompleteFAQ, 1000);
            return;
        }
        
        // Initialize category filtering
        initCategoryFiltering();
        
        // Initialize accordion functionality
        initAccordionFunctionality();
        
        // Show all items initially
        showCategory('all');
        
        console.log('🏁 Complete FAQ System initialized successfully');
    }
    
    function initCategoryFiltering() {
        console.log('🏁 Setting up category filtering');
        
        categoryButtons.forEach(function(button, index) {
            // Remove existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            categoryButtons[index] = newButton;
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const category = newButton.getAttribute('data-category');
                console.log('🏁 Category clicked:', category);
                
                // Update active state
                categoryButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                newButton.classList.add('active');
                
                // Show items for this category
                showCategory(category);
                
                currentCategory = category;
            });
            
            console.log('🏁 Category button', index, 'initialized');
        });
    }
    
    function showCategory(category) {
        console.log('🏁 Showing category:', category);
        
        let visibleCount = 0;
        
        faqItems.forEach(function(item, index) {
            const itemCategory = item.getAttribute('data-category');
            
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
                item.style.opacity = '1';
                visibleCount++;
            } else {
                item.style.display = 'none';
                item.style.opacity = '0';
            }
        });
        
        console.log('🏁 Showing', visibleCount, 'items for category:', category);
    }
    
    function initAccordionFunctionality() {
        console.log('🏁 Setting up accordion functionality');
        
        faqItems.forEach(function(item, index) {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) {
                console.warn('🏁 FAQ item', index, 'missing question or answer');
                return;
            }
            
            // Set initial state
            question.setAttribute('aria-expanded', 'false');
            answer.style.maxHeight = '0px';
            answer.style.opacity = '0';
            answer.style.padding = '0 25px';
            answer.style.overflow = 'hidden';
            answer.style.transition = 'all 0.4s ease';
            
            // Remove existing event listeners
            const newQuestion = question.cloneNode(true);
            question.parentNode.replaceChild(newQuestion, question);
            
            newQuestion.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🏁 FAQ question clicked:', index);
                
                const isExpanded = newQuestion.getAttribute('aria-expanded') === 'true';
                
                // Close all other items
                closeAllItems();
                
                if (!isExpanded) {
                    openItem(item, newQuestion, answer, index);
                }
            });
            
            console.log('🏁 FAQ accordion item', index, 'initialized');
        });
    }
    
    function closeAllItems() {
        faqItems.forEach(function(item) {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const chevron = question ? question.querySelector('.fas') : null;
            
            if (question && answer) {
                question.setAttribute('aria-expanded', 'false');
                question.classList.remove('expanded');
                item.classList.remove('expanded');
                
                answer.style.maxHeight = '0px';
                answer.style.opacity = '0';
                answer.style.padding = '0 25px';
                
                if (chevron) {
                    chevron.style.transform = 'rotate(0deg)';
                    chevron.style.transition = 'transform 0.3s ease';
                }
            }
        });
    }
    
    function openItem(item, question, answer, index) {
        console.log('🏁 Opening FAQ item:', index);
        
        question.setAttribute('aria-expanded', 'true');
        question.classList.add('expanded');
        item.classList.add('expanded');
        
        // Get natural height
        answer.style.maxHeight = 'none';
        const naturalHeight = answer.scrollHeight;
        answer.style.maxHeight = '0px';
        
        // Force reflow
        answer.offsetHeight;
        
        // Animate to natural height
        requestAnimationFrame(function() {
            answer.style.maxHeight = naturalHeight + 'px';
            answer.style.opacity = '1';
            answer.style.padding = '25px';
        });
        
        // Rotate chevron
        const chevron = question.querySelector('.fas');
        if (chevron) {
            chevron.style.transform = 'rotate(180deg)';
            chevron.style.transition = 'transform 0.3s ease';
        }
        
        console.log('🏁 FAQ item', index, 'opened with height:', naturalHeight + 'px');
    }
    
    // Initialize when ready
    function ready() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initCompleteFAQ, 500);
            });
        } else {
            setTimeout(initCompleteFAQ, 500);
        }
    }
    
    // Start initialization
    ready();
    
    // Also try after window load
    window.addEventListener('load', function() {
        setTimeout(initCompleteFAQ, 1000);
    });
    
    // Debug functions
    window.debugCompleteFAQ = function() {
        console.log('🏁 Debug: Reinitializing Complete FAQ');
        initCompleteFAQ();
    };
    
    window.faqShowCategory = function(category) {
        console.log('🏁 Debug: Showing category', category);
        showCategory(category);
    };
    
    window.faqTestAccordion = function() {
        console.log('🏁 Debug: Testing first accordion item');
        if (faqItems[0]) {
            const question = faqItems[0].querySelector('.faq-question');
            if (question) {
                question.click();
            }
        }
    };
    
    // Export main function
    window.initCompleteFAQ = initCompleteFAQ;
    
    console.log('🏁 Complete FAQ System script loaded');
    
})();