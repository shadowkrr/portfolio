/**
 * Loading Enhancement Script
 * Provides advanced loading experiences including skeleton screens,
 * progressive image loading, and improved content fade-ins
 */

class LoadingEnhancement {
    constructor(config = {}) {
        this.config = {
            skeletonDuration: config.skeletonDuration || 2000,
            progressBarSpeed: config.progressBarSpeed || 50,
            fadeInDuration: config.fadeInDuration || 600,
            imageLoadTimeout: config.imageLoadTimeout || 10000,
            enableProgressiveLoading: config.enableProgressiveLoading !== false,
            enableSkeletons: config.enableSkeletons !== false,
            ...config
        };

        this.loadingState = {
            progress: 0,
            loadedImages: 0,
            totalImages: 0,
            contentLoaded: false
        };

        this.observers = new Map();
        this.loadingElements = new Set();
    }

    /**
     * Initialize the loading enhancement system
     */
    init() {
        this.setupProgressBar();
        this.setupSkeletonScreens();
        this.setupProgressiveImageLoading();
        this.setupContentFadeIn();
        this.setupLoadingStates();
        this.bindEvents();
    }

    /**
     * Setup loading progress bar
     */
    setupProgressBar() {
        // Create progress bar if it doesn't exist
        if (!document.querySelector('.loading-progress-bar')) {
            const progressBar = document.createElement('div');
            progressBar.className = 'loading-progress-bar';
            progressBar.innerHTML = `
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" data-progress="0"></div>
                </div>
                <div class="progress-bar-text">
                    <span class="progress-percentage">0%</span>
                    <span class="progress-status">読み込み中...</span>
                </div>
            `;
            
            // Insert after the existing loader
            const loader = document.getElementById('loader');
            if (loader) {
                loader.appendChild(progressBar);
            }
        }
    }

    /**
     * Update loading progress
     */
    updateProgress(progress, status = '') {
        this.loadingState.progress = Math.max(0, Math.min(100, progress));
        
        const progressFill = document.querySelector('.progress-bar-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        const progressStatus = document.querySelector('.progress-status');
        
        if (progressFill) {
            progressFill.style.width = `${this.loadingState.progress}%`;
            progressFill.setAttribute('data-progress', this.loadingState.progress);
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(this.loadingState.progress)}%`;
        }
        
        if (progressStatus && status) {
            progressStatus.textContent = status;
        }
    }

    /**
     * Setup skeleton screens for different content types
     */
    setupSkeletonScreens() {
        if (!this.config.enableSkeletons) return;

        // Define skeleton templates
        const skeletonTemplates = {
            'blog-post-card': this.createBlogPostSkeleton(),
            'work-card': this.createWorkCardSkeleton(),
            'skill-item': this.createSkillItemSkeleton(),
            'section-content': this.createSectionSkeleton()
        };

        // Apply skeletons to designated areas
        document.querySelectorAll('[data-skeleton]').forEach(element => {
            const skeletonType = element.getAttribute('data-skeleton');
            if (skeletonTemplates[skeletonType]) {
                this.showSkeleton(element, skeletonTemplates[skeletonType]);
            }
        });

        // Auto-detect content areas that need skeletons
        this.autoDetectSkeletonAreas();
    }

    /**
     * Create blog post skeleton template
     */
    createBlogPostSkeleton() {
        return `
            <div class="skeleton-blog-post">
                <div class="skeleton-meta">
                    <div class="skeleton-line skeleton-date"></div>
                    <div class="skeleton-line skeleton-category"></div>
                </div>
                <div class="skeleton-title skeleton-line-large"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line skeleton-line-short"></div>
                </div>
                <div class="skeleton-action skeleton-line skeleton-button"></div>
            </div>
        `;
    }

    /**
     * Create work card skeleton template
     */
    createWorkCardSkeleton() {
        return `
            <div class="skeleton-work-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-overlay">
                    <div class="skeleton-icon"></div>
                </div>
            </div>
        `;
    }

    /**
     * Create skill item skeleton template
     */
    createSkillItemSkeleton() {
        return `
            <div class="skeleton-skill-item">
                <div class="skeleton-skill-icon"></div>
                <div class="skeleton-skill-name"></div>
            </div>
        `;
    }

    /**
     * Create section skeleton template
     */
    createSectionSkeleton() {
        return `
            <div class="skeleton-section">
                <div class="skeleton-header">
                    <div class="skeleton-title skeleton-line-large"></div>
                    <div class="skeleton-subtitle skeleton-line-medium"></div>
                </div>
                <div class="skeleton-grid">
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                </div>
            </div>
        `;
    }

    /**
     * Show skeleton for an element
     */
    showSkeleton(element, skeletonTemplate) {
        const skeletonWrapper = document.createElement('div');
        skeletonWrapper.className = 'skeleton-wrapper';
        skeletonWrapper.innerHTML = skeletonTemplate;
        
        // Store original content
        element.setAttribute('data-original-content', element.innerHTML);
        element.innerHTML = '';
        element.appendChild(skeletonWrapper);
        element.classList.add('skeleton-loading');
        
        // Auto-hide skeleton after duration
        setTimeout(() => {
            this.hideSkeleton(element);
        }, this.config.skeletonDuration);
    }

    /**
     * Hide skeleton and restore content
     */
    hideSkeleton(element) {
        const originalContent = element.getAttribute('data-original-content');
        if (originalContent) {
            element.innerHTML = originalContent;
            element.removeAttribute('data-original-content');
        }
        element.classList.remove('skeleton-loading');
        element.classList.add('skeleton-loaded');
    }

    /**
     * Auto-detect areas that need skeletons
     */
    autoDetectSkeletonAreas() {
        // Blog posts container
        const blogContainer = document.getElementById('blog-posts');
        if (blogContainer && !blogContainer.hasChildNodes()) {
            this.showBlogSkeleton(blogContainer);
        }

        // Works grid
        const worksGrid = document.querySelector('.works-grid');
        if (worksGrid) {
            worksGrid.querySelectorAll('.work-card').forEach(card => {
                if (!card.querySelector('img').complete) {
                    this.showSkeleton(card, this.createWorkCardSkeleton());
                }
            });
        }
    }

    /**
     * Show skeleton for blog posts
     */
    showBlogSkeleton(container) {
        const skeletonPosts = Array(3).fill(null).map(() => 
            this.createBlogPostSkeleton()
        ).join('');

        container.innerHTML = `
            <div class="blog-posts-skeleton">
                ${skeletonPosts}
            </div>
        `;
        container.classList.add('skeleton-loading');
    }

    /**
     * Setup progressive image loading
     */
    setupProgressiveImageLoading() {
        if (!this.config.enableProgressiveLoading) return;

        // Count total images
        const images = document.querySelectorAll('img[data-src], img[src]');
        this.loadingState.totalImages = images.length;

        // Setup intersection observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.setupLazyLoading();
        }

        // Setup image load tracking
        this.setupImageLoadTracking();
    }

    /**
     * Setup lazy loading with intersection observer
     */
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        this.observers.set('images', imageObserver);
    }

    /**
     * Load individual image with enhanced loading states
     */
    loadImage(img) {
        const dataSrc = img.getAttribute('data-src');
        if (!dataSrc) return;

        // Add loading class
        img.classList.add('image-loading');
        
        // Create placeholder if needed
        if (!img.src || img.src === '') {
            img.src = this.createImagePlaceholder(img);
        }

        // Preload the actual image
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Apply progressive loading effect
            img.src = dataSrc;
            img.classList.remove('image-loading');
            img.classList.add('image-loaded');
            
            // Remove data-src attribute
            img.removeAttribute('data-src');
            
            // Update progress
            this.loadingState.loadedImages++;
            this.updateImageLoadProgress();
        };

        imageLoader.onerror = () => {
            img.classList.remove('image-loading');
            img.classList.add('image-error');
            
            // Show error placeholder
            img.src = this.createErrorPlaceholder(img);
            
            this.loadingState.loadedImages++;
            this.updateImageLoadProgress();
        };

        // Set timeout for slow loading images
        const loadTimeout = setTimeout(() => {
            if (img.classList.contains('image-loading')) {
                img.classList.add('image-slow');
            }
        }, this.config.imageLoadTimeout);

        imageLoader.src = dataSrc;
    }

    /**
     * Create image placeholder
     */
    createImagePlaceholder(img) {
        const width = img.getAttribute('width') || 300;
        const height = img.getAttribute('height') || 200;
        
        return `data:image/svg+xml;charset=UTF-8,<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="14" font-family="Arial">Loading...</text></svg>`;
    }

    /**
     * Create error placeholder
     */
    createErrorPlaceholder(img) {
        const width = img.getAttribute('width') || 300;
        const height = img.getAttribute('height') || 200;
        
        return `data:image/svg+xml;charset=UTF-8,<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="%23ffebee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23f44336" font-size="12" font-family="Arial">画像を読み込めませんでした</text></svg>`;
    }

    /**
     * Update image load progress
     */
    updateImageLoadProgress() {
        if (this.loadingState.totalImages > 0) {
            const imageProgress = (this.loadingState.loadedImages / this.loadingState.totalImages) * 50; // Images contribute 50% to total progress
            this.updateProgress(50 + imageProgress, '画像を読み込み中...');
        }
    }

    /**
     * Setup image load tracking for existing images
     */
    setupImageLoadTracking() {
        document.querySelectorAll('img[src]').forEach(img => {
            if (img.complete) {
                this.loadingState.loadedImages++;
            } else {
                img.addEventListener('load', () => {
                    this.loadingState.loadedImages++;
                    this.updateImageLoadProgress();
                });
                
                img.addEventListener('error', () => {
                    this.loadingState.loadedImages++;
                    this.updateImageLoadProgress();
                });
            }
        });
    }

    /**
     * Setup enhanced content fade-in animations
     */
    setupContentFadeIn() {
        // Create intersection observer for fade-in animations
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    this.triggerFadeIn(element);
                    fadeInObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px 0px'
        });

        // Observe elements that need fade-in animation
        document.querySelectorAll('[data-fade-in], .section, .work-card, .skill-item').forEach(element => {
            element.classList.add('fade-in-ready');
            fadeInObserver.observe(element);
        });

        this.observers.set('fadeIn', fadeInObserver);
    }

    /**
     * Trigger fade-in animation with staggered timing
     */
    triggerFadeIn(element) {
        const delay = element.getAttribute('data-fade-delay') || 0;
        const duration = element.getAttribute('data-fade-duration') || this.config.fadeInDuration;
        
        setTimeout(() => {
            element.classList.add('fade-in-active');
            element.style.animationDuration = `${duration}ms`;
        }, parseInt(delay));
    }

    /**
     * Setup loading states for different content areas
     */
    setupLoadingStates() {
        // Add loading states to key sections
        const keyAreas = [
            { selector: '#works .works-grid', name: 'works' },
            { selector: '#skills .skills-container', name: 'skills' },
            { selector: '#blog #blog-posts', name: 'blog' },
            { selector: '#about .about-content', name: 'about' }
        ];

        keyAreas.forEach(area => {
            const element = document.querySelector(area.selector);
            if (element) {
                this.addLoadingState(element, area.name);
            }
        });
    }

    /**
     * Add loading state to element
     */
    addLoadingState(element, name) {
        element.classList.add('content-loading');
        element.setAttribute('data-loading-area', name);
        this.loadingElements.add(element);

        // Remove loading state after content is ready
        setTimeout(() => {
            this.removeLoadingState(element);
        }, this.config.skeletonDuration);
    }

    /**
     * Remove loading state from element
     */
    removeLoadingState(element) {
        element.classList.remove('content-loading');
        element.classList.add('content-loaded');
        this.loadingElements.delete(element);
    }

    /**
     * Bind events
     */
    bindEvents() {
        // Window load event
        window.addEventListener('load', () => {
            this.handleWindowLoad();
        });

        // Content loaded event
        document.addEventListener('DOMContentLoaded', () => {
            this.handleDOMContentLoaded();
        });

        // Blog integration events
        window.addEventListener('blogPostsLoaded', () => {
            this.handleBlogPostsLoaded();
        });

        // Custom loading complete event
        window.addEventListener('loadingComplete', () => {
            this.handleLoadingComplete();
        });
    }

    /**
     * Handle window load event
     */
    handleWindowLoad() {
        // Final progress update
        this.updateProgress(100, '読み込み完了！');

        // Delay before hiding loader
        setTimeout(() => {
            this.hideLoader();
        }, 500);
    }

    /**
     * Handle DOM content loaded
     */
    handleDOMContentLoaded() {
        this.updateProgress(25, 'コンテンツを準備中...');
        this.loadingState.contentLoaded = true;
    }

    /**
     * Handle blog posts loaded
     */
    handleBlogPostsLoaded() {
        const blogContainer = document.getElementById('blog-posts');
        if (blogContainer && blogContainer.classList.contains('skeleton-loading')) {
            blogContainer.classList.remove('skeleton-loading');
            blogContainer.classList.add('skeleton-loaded');
        }
        this.updateProgress(75, 'ブログ記事を読み込み中...');
    }

    /**
     * Handle loading complete
     */
    handleLoadingComplete() {
        // Remove all loading states
        this.loadingElements.forEach(element => {
            this.removeLoadingState(element);
        });

        // Clean up observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
    }

    /**
     * Hide loader with enhanced animation
     */
    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('loader-fadeout');
            
            setTimeout(() => {
                loader.classList.add('hidden');
                
                // Trigger content reveal animations
                document.dispatchEvent(new CustomEvent('loaderHidden'));
                
                // Clean up
                setTimeout(() => {
                    if (loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                }, 1000);
            }, 500);
        }
    }

    /**
     * Manually trigger loading completion
     */
    completeLoading() {
        this.handleLoadingComplete();
        this.hideLoader();
    }

    /**
     * Get current loading progress
     */
    getProgress() {
        return {
            progress: this.loadingState.progress,
            loadedImages: this.loadingState.loadedImages,
            totalImages: this.loadingState.totalImages,
            contentLoaded: this.loadingState.contentLoaded
        };
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const loadingEnhancement = new LoadingEnhancement({
        skeletonDuration: 2500,
        fadeInDuration: 800,
        enableProgressiveLoading: true,
        enableSkeletons: true
    });
    
    loadingEnhancement.init();
    
    // Make instance globally available
    window.loadingEnhancement = loadingEnhancement;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingEnhancement;
}