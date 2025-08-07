/**
 * Blog Integration Script
 * Fetches and displays latest blog posts from RSS feed
 */

class BlogIntegration {
    constructor(config = {}) {
        this.config = {
            feedUrl: 'http://shadowkrr.hateblo.jp/rss',
            maxPosts: config.maxPosts || 6,
            containerId: config.containerId || 'blog-posts',
            corsProxy: config.corsProxy || 'https://api.allorigins.win/get?url=',
            cacheDuration: config.cacheDuration || 3600000, // 1 hour
            enableCategoryFilter: config.enableCategoryFilter !== false,
            enablePreview: config.enablePreview !== false,
            ...config
        };

        this.cache = {
            key: 'blog-posts-cache',
            timestampKey: 'blog-posts-timestamp'
        };

        this.state = {
            posts: [],
            filteredPosts: [],
            categories: new Set(),
            activeCategory: 'all',
            isLoading: false
        };
    }

    /**
     * Initialize the blog integration
     */
    async init() {
        try {
            const container = document.getElementById(this.config.containerId);
            if (!container) {
                console.warn(`Blog container element #${this.config.containerId} not found`);
                return;
            }

            // Show loading state with skeleton
            this.showLoadingState(container);

            // Initialize loading enhancement integration
            if (window.loadingEnhancement) {
                window.loadingEnhancement.updateProgress(10, 'ブログ記事を準備中...');
            }

            // Try to get cached posts first
            const cachedPosts = this.getCachedPosts();
            if (cachedPosts && cachedPosts.length > 0) {
                this.state.posts = cachedPosts;
                this.extractCategories();
                this.renderBlogInterface(container);
                // Fetch new posts in background
                this.fetchAndUpdatePosts(container, true);
                return;
            }

            // Fetch posts if no cache
            await this.fetchAndUpdatePosts(container);

        } catch (error) {
            console.error('Blog integration initialization failed:', error);
            this.showErrorState(container);
        }
    }

    /**
     * Fetch posts and update the UI
     */
    async fetchAndUpdatePosts(container, isBackground = false) {
        try {
            this.state.isLoading = true;
            
            if (window.loadingEnhancement && !isBackground) {
                window.loadingEnhancement.updateProgress(30, 'RSS フィードを取得中...');
            }

            const posts = await this.fetchPosts();
            
            if (posts && posts.length > 0) {
                this.state.posts = posts;
                this.extractCategories();
                this.cachePosts(posts);
                
                if (window.loadingEnhancement && !isBackground) {
                    window.loadingEnhancement.updateProgress(70, 'ブログ記事を整理中...');
                }
                
                this.renderBlogInterface(container);
                
                // Dispatch event for loading enhancement
                window.dispatchEvent(new CustomEvent('blogPostsLoaded'));
                
            } else {
                this.showEmptyState(container);
            }
        } catch (error) {
            console.error('Failed to fetch blog posts:', error);
            // If we have cached posts, keep showing them
            if (this.state.posts.length === 0) {
                this.showErrorState(container);
            } else if (!isBackground) {
                // Show error notification but keep existing content
                this.showErrorNotification('新しい記事の取得に失敗しました。キャッシュされた記事を表示しています。');
            }
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Fetch posts from RSS feed
     */
    async fetchPosts() {
        try {
            const proxyUrl = `${this.config.corsProxy}${encodeURIComponent(this.config.feedUrl)}`;
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const xmlText = data.contents;

            return this.parseRSS(xmlText);
        } catch (error) {
            console.error('Error fetching RSS feed:', error);
            throw error;
        }
    }

    /**
     * Parse RSS XML content
     */
    parseRSS(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');

            const posts = [];
            for (let i = 0; i < Math.min(items.length, this.config.maxPosts); i++) {
                const item = items[i];
                
                const post = {
                    title: this.getTextContent(item, 'title'),
                    link: this.getTextContent(item, 'link'),
                    description: this.getTextContent(item, 'description'),
                    pubDate: this.getTextContent(item, 'pubDate'),
                    category: this.getTextContent(item, 'category'),
                    id: this.generateId(this.getTextContent(item, 'link'))
                };

                // Clean and format description
                post.description = this.cleanDescription(post.description);
                post.excerpt = this.createExcerpt(post.description);
                post.formattedDate = this.formatDate(post.pubDate);

                posts.push(post);
            }

            return posts;
        } catch (error) {
            console.error('Error parsing RSS:', error);
            throw error;
        }
    }

    /**
     * Get text content from XML element
     */
    getTextContent(item, tagName) {
        const element = item.querySelector(tagName);
        return element ? element.textContent.trim() : '';
    }

    /**
     * Clean HTML from description
     */
    cleanDescription(description) {
        // Remove HTML tags
        const cleaned = description.replace(/<[^>]*>/g, '');
        // Decode HTML entities
        const div = document.createElement('div');
        div.innerHTML = cleaned;
        return div.textContent || div.innerText || '';
    }

    /**
     * Create excerpt from description
     */
    createExcerpt(description, maxLength = 150) {
        if (description.length <= maxLength) {
            return description;
        }
        return description.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
    }

    /**
     * Format publication date
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    /**
     * Generate unique ID for post
     */
    generateId(link) {
        return btoa(link).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    }

    /**
     * Extract categories from posts
     */
    extractCategories() {
        this.state.categories.clear();
        this.state.posts.forEach(post => {
            if (post.category && post.category.trim()) {
                this.state.categories.add(post.category.trim());
            }
        });
    }

    /**
     * Filter posts by category
     */
    filterPosts(category = 'all') {
        this.state.activeCategory = category;
        
        if (category === 'all') {
            this.state.filteredPosts = this.state.posts.slice();
        } else {
            this.state.filteredPosts = this.state.posts.filter(post => 
                post.category && post.category.trim() === category
            );
        }

        // Re-render posts with animation
        this.renderPosts();
    }

    /**
     * Render the complete blog interface
     */
    renderBlogInterface(container) {
        // Filter posts for initial display
        this.filterPosts(this.state.activeCategory);
        
        const categoryFilterHtml = this.config.enableCategoryFilter && this.state.categories.size > 0 
            ? this.renderCategoryFilter() 
            : '';

        container.innerHTML = `
            ${categoryFilterHtml}
            <div class="blog-posts-container">
                ${this.renderPostsGrid()}
            </div>
            ${this.renderFooter()}
        `;

        // Bind category filter events
        if (this.config.enableCategoryFilter) {
            this.bindCategoryFilterEvents(container);
        }

        // Re-initialize AOS for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    /**
     * Render category filter
     */
    renderCategoryFilter() {
        const categories = Array.from(this.state.categories).sort();
        
        return `
            <div class="blog-category-filter" data-aos="fade-up">
                <div class="category-filter-header">
                    <h4>カテゴリーで絞り込み</h4>
                </div>
                <div class="category-filter-buttons" role="group" aria-label="ブログカテゴリーフィルター">
                    <button class="category-filter-btn ${this.state.activeCategory === 'all' ? 'active' : ''}" 
                            data-category="all" 
                            aria-pressed="${this.state.activeCategory === 'all'}">
                        <i class="fas fa-th"></i> すべて
                        <span class="category-count">${this.state.posts.length}</span>
                    </button>
                    ${categories.map(category => `
                        <button class="category-filter-btn ${this.state.activeCategory === category ? 'active' : ''}" 
                                data-category="${category}"
                                aria-pressed="${this.state.activeCategory === category}">
                            <i class="fas fa-tag"></i> ${category}
                            <span class="category-count">${this.state.posts.filter(p => p.category === category).length}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render posts grid
     */
    renderPostsGrid() {
        if (this.state.filteredPosts.length === 0) {
            return this.renderNoPostsMessage();
        }

        const postsHtml = this.state.filteredPosts.map((post, index) => `
            <article class="blog-post-card" data-aos="fade-up" data-aos-delay="${index * 100}" data-category="${post.category || ''}">
                <div class="blog-post-content">
                    <div class="blog-post-meta">
                        <time datetime="${post.pubDate}" class="blog-post-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${post.formattedDate}
                        </time>
                        ${post.category ? `
                            <span class="blog-post-category" data-category="${post.category}">
                                <i class="fas fa-tag"></i>
                                ${post.category}
                            </span>
                        ` : ''}
                    </div>
                    <h3 class="blog-post-title">
                        <a href="${post.link}" target="_blank" rel="noopener noreferrer" title="${post.title}">
                            ${post.title}
                        </a>
                    </h3>
                    <p class="blog-post-excerpt">${post.excerpt}</p>
                    <div class="blog-post-actions">
                        <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="blog-post-link">
                            続きを読む <i class="fas fa-external-link-alt"></i>
                        </a>
                        ${this.config.enablePreview ? `
                            <button class="blog-post-preview-btn" data-post-id="${post.id}" title="プレビューを表示">
                                <i class="fas fa-eye"></i> プレビュー
                            </button>
                        ` : ''}
                    </div>
                </div>
            </article>
        `).join('');

        return `
            <div class="blog-posts-grid" id="blog-posts-grid">
                ${postsHtml}
            </div>
        `;
    }

    /**
     * Render no posts message
     */
    renderNoPostsMessage() {
        return `
            <div class="blog-no-posts" data-aos="fade-up">
                <div class="no-posts-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>該当する記事が見つかりませんでした</h3>
                <p>「${this.state.activeCategory}」カテゴリーの記事は現在ありません。</p>
                <button class="btn btn-primary category-filter-btn" data-category="all">
                    <i class="fas fa-th"></i> すべての記事を表示
                </button>
            </div>
        `;
    }

    /**
     * Render footer
     */
    renderFooter() {
        return `
            <div class="blog-posts-footer">
                <div class="blog-stats">
                    <span class="blog-stat">
                        <i class="fas fa-newspaper"></i>
                        ${this.state.posts.length} 記事
                    </span>
                    <span class="blog-stat">
                        <i class="fas fa-tags"></i>
                        ${this.state.categories.size} カテゴリー
                    </span>
                    ${this.state.activeCategory !== 'all' ? `
                        <span class="blog-stat active-filter">
                            <i class="fas fa-filter"></i>
                            「${this.state.activeCategory}」で絞り込み中 (${this.state.filteredPosts.length} 件)
                        </span>
                    ` : ''}
                </div>
                <div class="blog-actions">
                    <a href="${this.config.feedUrl.replace('/rss', '')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                        <i class="fas fa-blog"></i> ブログをもっと見る
                    </a>
                    <button class="btn btn-secondary" onclick="blogIntegration.refresh()" ${this.state.isLoading ? 'disabled' : ''}>
                        <i class="fas fa-sync-alt ${this.state.isLoading ? 'fa-spin' : ''}"></i> 
                        ${this.state.isLoading ? '更新中...' : '記事を更新'}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Bind category filter events
     */
    bindCategoryFilterEvents(container) {
        const filterButtons = container.querySelectorAll('.category-filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const category = button.getAttribute('data-category');
                
                // Update active state
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                
                // Filter and re-render posts
                this.filterPosts(category);
                
                // Update posts container
                const postsContainer = container.querySelector('.blog-posts-container');
                if (postsContainer) {
                    postsContainer.innerHTML = this.renderPostsGrid();
                    
                    // Update footer
                    const footer = container.querySelector('.blog-posts-footer');
                    if (footer) {
                        footer.outerHTML = this.renderFooter();
                    }
                    
                    // Re-initialize AOS
                    if (typeof AOS !== 'undefined') {
                        AOS.refresh();
                    }
                }
                
                // Announce to screen readers
                this.announceFilterChange(category);
            });
        });
    }

    /**
     * Render posts in the container (legacy method for compatibility)
     */
    renderPosts() {
        // This method is called by the new interface rendering
        // Implementation moved to renderPostsGrid()
    }

    /**
     * Announce filter change to screen readers
     */
    announceFilterChange(category) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        
        const count = this.state.filteredPosts.length;
        const message = category === 'all' 
            ? `すべての記事を表示しています。${count} 件見つかりました。`
            : `「${category}」カテゴリーで絞り込みました。${count} 件見つかりました。`;
            
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Show error notification
     */
    showErrorNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'blog-error-notification';
        notification.innerHTML = `
            <div class="error-notification-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button class="error-notification-close" aria-label="通知を閉じる">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.parentNode.removeChild(notification);
                }, 300);
            }
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.error-notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    /**
     * Show loading state
     */
    showLoadingState(container) {
        // Use skeleton screen from loading enhancement if available
        if (window.loadingEnhancement && window.loadingEnhancement.config.enableSkeletons) {
            window.loadingEnhancement.showBlogSkeleton(container);
        } else {
            container.innerHTML = `
                <div class="blog-loading">
                    <div class="loading-spinner"></div>
                    <p>最新記事を読み込み中...</p>
                </div>
            `;
        }
    }

    /**
     * Show error state
     */
    showErrorState(container) {
        container.innerHTML = `
            <div class="blog-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>記事の読み込みに失敗しました</h3>
                <p>ブログの最新記事を取得できませんでした。しばらく後にもう一度お試しください。</p>
                <a href="${this.config.feedUrl.replace('/rss', '')}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    <i class="fas fa-external-link-alt"></i> ブログサイトを直接見る
                </a>
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmptyState(container) {
        container.innerHTML = `
            <div class="blog-empty">
                <div class="empty-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <h3>記事が見つかりませんでした</h3>
                <p>現在表示できる記事がありません。</p>
                <a href="${this.config.feedUrl.replace('/rss', '')}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    <i class="fas fa-external-link-alt"></i> ブログサイトを見る
                </a>
            </div>
        `;
    }

    /**
     * Cache posts to localStorage
     */
    cachePosts(posts) {
        try {
            localStorage.setItem(this.cache.key, JSON.stringify(posts));
            localStorage.setItem(this.cache.timestampKey, Date.now().toString());
        } catch (error) {
            console.warn('Failed to cache blog posts:', error);
        }
    }

    /**
     * Get cached posts from localStorage
     */
    getCachedPosts() {
        try {
            const timestamp = localStorage.getItem(this.cache.timestampKey);
            if (!timestamp) {
                return null;
            }

            const age = Date.now() - parseInt(timestamp);
            if (age > this.config.cacheDuration) {
                // Cache expired
                localStorage.removeItem(this.cache.key);
                localStorage.removeItem(this.cache.timestampKey);
                return null;
            }

            const cached = localStorage.getItem(this.cache.key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.warn('Failed to get cached blog posts:', error);
            return null;
        }
    }

    /**
     * Manually refresh posts
     */
    async refresh() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            return;
        }

        if (this.state.isLoading) {
            return; // Prevent multiple simultaneous refreshes
        }

        // Clear cache
        localStorage.removeItem(this.cache.key);
        localStorage.removeItem(this.cache.timestampKey);

        // Show loading state
        this.showLoadingState(container);

        // Fetch new posts
        await this.fetchAndUpdatePosts(container);
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Get available categories
     */
    getCategories() {
        return Array.from(this.state.categories);
    }

    /**
     * Get filtered posts
     */
    getFilteredPosts() {
        return [...this.state.filteredPosts];
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const blogContainer = document.getElementById('blog-posts');
    if (blogContainer) {
        const blogIntegration = new BlogIntegration({
            maxPosts: 6,
            containerId: 'blog-posts',
            enableCategoryFilter: true,
            enablePreview: false, // Can be enabled later when preview functionality is implemented
            cacheDuration: 1800000 // 30 minutes
        });
        
        blogIntegration.init();
        
        // Make instance globally available for manual refresh
        window.blogIntegration = blogIntegration;
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogIntegration;
}