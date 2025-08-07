// Emergency loader fix - ensures loading screen is hidden even if other scripts fail
(function() {
    'use strict';
    
    console.log('Loader fix script started');
    
    // Fallback loader hide function
    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader && !loader.classList.contains('hidden')) {
            console.log('Fallback: Hiding loader');
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
        }
    }
    
    // Multiple fallback mechanisms
    let loaderHidden = false;
    
    function safeHideLoader() {
        if (!loaderHidden) {
            hideLoader();
            loaderHidden = true;
        }
    }
    
    // Primary: DOMContentLoaded + window.load
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded');
        
        window.addEventListener('load', function() {
            console.log('Window loaded - setting timeout');
            setTimeout(safeHideLoader, 1000);
        });
        
        // Fallback 1: If window.load takes too long
        setTimeout(function() {
            console.log('Fallback 1: 3 seconds timeout');
            safeHideLoader();
        }, 3000);
    });
    
    // Fallback 2: If DOMContentLoaded doesn't fire
    setTimeout(function() {
        console.log('Fallback 2: 5 seconds timeout');
        safeHideLoader();
    }, 5000);
    
    // Fallback 3: If any JavaScript error occurs
    window.addEventListener('error', function(e) {
        console.error('JavaScript error detected:', e.error);
        console.log('Fallback 3: Hiding loader due to error');
        setTimeout(safeHideLoader, 500);
    });
    
    // Fallback 4: User interaction
    document.addEventListener('click', function() {
        if (!loaderHidden) {
            console.log('Fallback 4: User clicked, hiding loader');
            safeHideLoader();
        }
    }, { once: true });
    
    // Check if loader should be hidden immediately (for refresh/back navigation)
    if (document.readyState === 'complete') {
        console.log('Document already complete');
        setTimeout(safeHideLoader, 100);
    }
})();