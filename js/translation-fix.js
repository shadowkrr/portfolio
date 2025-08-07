/**
 * Translation Fix - Emergency fallback for i18n issues
 * Applies Japanese translations directly if i18n system fails
 */

(function() {
    'use strict';
    
    // Japanese translations (fallback)
    const fallbackTranslations = {
        // Navigation
        'navigation.home': 'Home',
        'navigation.works': 'Works',
        'navigation.about': 'About',
        'navigation.skills': 'Skills',
        'navigation.blog': 'Blog',
        'navigation.faq': 'FAQ',
        'navigation.contact': 'Contact',
        
        // Buttons
        'buttons.toggleDarkMode': 'ダークモード切替',
        'buttons.toggleNavigation': 'ナビゲーション切替',
        'buttons.backToTop': 'トップへ戻る',
        
        // Loader
        'loader.text': 'Loading...',
        
        // Hero Section
        'hero.greeting': "Hello, I'm",
        'hero.name': 'SHADOWKRR',
        'hero.viewWork': 'View My Work',
        'hero.getInTouch': 'Get In Touch',
        'hero.scrollDown': 'Scroll Down',
        
        // Works Section
        'works.title': 'My Works',
        'works.subtitle': 'プログラムや制作物の一覧です',
        'works.filter.all': 'All',
        'works.filter.web': 'Web',
        'works.filter.app': 'App',
        'works.filter.other': 'Other',
        'works.projects.shachibook.title': 'しゃちぶっく',
        'works.projects.shachibook.category': 'iOS App / Web',
        'works.projects.shachibook.description': 'TEAM SHACHIの最新情報を一括管理できるアプリ',
        'works.projects.shachibook.caseStudy': 'Case Study',
        'works.projects.shachibook.liveDemo': 'Live Demo',
        'works.projects.github.title': 'Github',
        'works.projects.github.category': 'Open Source',
        'works.projects.github.description': 'オープンソースプロジェクトと開発活動',
        'works.projects.github.caseStudy': 'Case Study',
        'works.projects.github.viewProfile': 'View Profile',
        'works.projects.blog.title': '雑記まみむメモ',
        'works.projects.blog.category': 'Blog',
        'works.projects.blog.description': '技術ブログと日常の記録',
        'works.projects.blog.caseStudy': 'Case Study',
        'works.projects.blog.readBlog': 'Read Blog',
        
        // About Section
        'about.title': 'About Me',
        'about.subtitle': 'フリーランスエンジニア',
        'about.profile.title': 'Profile',
        'about.profile.description': '高校生の頃からプログラミングを学び始め、主にWeb系のお仕事を中心にフリーランスで活動しています。開発言語はPHPが多いですが、最近はSPAのVue.js(フロント)とGO(サーバ)でお仕事しています。',
        'about.whatIDo.title': 'What I Do',
        'about.stats.projects': 'Projects Completed',
        'about.stats.experience': 'Years Experience',
        'about.stats.coffee': 'Cups of Coffee',
        
        // Skills Section
        'skills.title': 'Technical Skills',
        'skills.subtitle': '技術スタック',
        'skills.categories.frontend': 'Frontend',
        'skills.categories.backend': 'Backend',
        'skills.categories.mobile': 'Mobile & Others',
        
        // Blog Section
        'blog.title': 'Latest Blog Posts',
        'blog.subtitle': '最新の技術記事',
        
        // FAQ Section
        'faq.title': 'Frequently Asked Questions',
        'faq.subtitle': 'よくある質問',
        'faq.search': '質問を検索...',
        'faq.categories.all': 'すべて',
        'faq.categories.service': 'サービス',
        'faq.categories.technical': '技術',
        'faq.categories.pricing': '料金',
        'faq.categories.support': 'サポート',
        'faq.questions.services.question': 'どのような開発サービスを提供していますか？',
        'faq.questions.services.answer': 'Webアプリケーション開発、モバイルアプリ開発（iOS/Android）、システム設計・構築、UI/UXデザイン、技術コンサルティングなど幅広く対応しています。フルスタック開発から特定技術領域に特化したサポートまで、お客様のニーズに合わせて柔軟に対応いたします。',
        'faq.questions.techStack.question': '使用している主な技術スタックを教えてください',
        'faq.questions.pricing.question': '料金体系はどのようになっていますか？',
        'faq.questions.pricing.answer': 'プロジェクトの規模・期間・技術要件により個別にお見積もりをいたします。時間単価での契約や固定価格での請負開発の両方に対応しています。まずはお気軽にご相談ください。無料でのご相談・お見積もりを承っております。',
        'faq.questions.timeline.question': '開発期間はどの程度かかりますか？',
        'faq.questions.support.question': '納品後のサポートは提供されますか？',
        'faq.questions.migration.question': '既存システムとの連携や移行は可能ですか？',
        'faq.questions.migration.answer': 'はい、可能です。レガシーシステムのモダン化、データベース移行、API連携、段階的なシステム移行など、様々なパターンに対応した経験があります。まずは現在のシステム構成をお聞かせいただき、最適な移行計画をご提案いたします。',
        'faq.questions.remote.question': 'リモート開発での対応は可能ですか？',
        'faq.questions.remote.answer': 'はい、完全リモートでの開発に対応しています。Slack、Zoom、GitHub、Figmaなどのツールを活用して、効率的なコミュニケーションと開発進行管理を行います。定期的な進捗報告と、必要に応じてオンラインミーティングを設定いたします。',
        'faq.questions.smallProjects.question': '小規模な修正や相談だけでも依頼できますか？',
        'faq.questions.smallProjects.answer': 'もちろんです。数時間で完了する小さな修正から、技術相談のみでも対応いたします。お気軽にご相談ください。規模に関係なく、丁寧にサポートさせていただきます。',
        'faq.questions.emergency.question': '緊急時の対応は可能ですか？',
        'faq.questions.emergency.answer': 'システム障害などの緊急事態には、可能な限り迅速に対応いたします。保守契約をいただいているお客様には、緊急時専用の連絡先をお知らせし、優先的にサポートいたします。',
        'faq.questions.security.question': 'セキュリティ対策はどのように行っていますか？',
        'faq.questions.testing.question': 'テストやデバッグはどのように行っていますか？',
        'faq.questions.testing.answer': '品質保証のため、以下のテスト戦略を実施しています：ユニットテスト、統合テスト、E2Eテストの自動化、クロスブラウザテスト、モバイルデバイステスト、パフォーマンステスト。またコードレビューとCI/CDパイプラインによる継続的な品質管理を行っています。',
        'faq.questions.communication.question': 'プロジェクト進行中のコミュニケーション方法は？',
        'faq.questions.communication.answer': '定期的な進捗報告（週次レポート）、Slack/ChatWorkでのリアルタイムコミュニケーション、必要に応じたオンラインミーティング（Zoom/Google Meet）、GitHub/GitLabでのコードレビュー、プロジェクト管理ツール（Trello/Notion）での透明な進捗管理を行います。',
        'faq.noResults.title': '該当する質問が見つかりませんでした',
        'faq.noResults.description': 'お探しの情報が見つからない場合は、お気軽にお問い合わせください。',
        'faq.noResults.contactButton': 'お問い合わせ',
        
        // Contact Section
        'contact.title': 'Get In Touch',
        'contact.subtitle': 'お気軽にお問い合わせください',
        'contact.email': 'Email',
        'contact.location': 'Location',
        'contact.locationValue': 'Japan',
        'contact.form.name': 'Your Name',
        'contact.form.email': 'Your Email',
        'contact.form.subject': 'Subject',
        'contact.form.message': 'Your Message',
        'contact.form.send': 'Send Message',
        
        // Footer
        'footer.copyright': '© 2024 SHADOWKRR. All Rights Reserved.',
        'footer.credit': 'Designed with love and modern web technologies',
        'footer.privacy': 'プライバシーポリシー / Privacy Policy'
    };
    
    function applyFallbackTranslations() {
        console.log('Applying fallback translations');
        
        // Apply translations to elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (fallbackTranslations[key]) {
                // Check if it contains HTML content
                if (element.innerHTML.includes('<span')) {
                    // For titles with nested spans, only update the text nodes
                    const span = element.querySelector('.title-accent');
                    if (span && key.includes('title')) {
                        // Keep the span and update surrounding text
                        if (key === 'skills.title') {
                            element.innerHTML = '<span class="title-accent">Technical</span> Skills';
                        } else if (key === 'about.title') {
                            element.innerHTML = '<span class="title-accent">About</span> Me';
                        } else if (key === 'works.title') {
                            element.innerHTML = '<span class="title-accent">My</span> Works';
                        } else if (key === 'contact.title') {
                            element.innerHTML = '<span class="title-accent">Get In</span> Touch';
                        } else if (key === 'faq.title') {
                            element.innerHTML = '<span class="title-accent">Frequently Asked</span> Questions';
                        } else if (key === 'blog.title') {
                            element.innerHTML = '<span class="title-accent">Latest</span> Blog Posts';
                        }
                    } else {
                        element.textContent = fallbackTranslations[key];
                    }
                } else {
                    element.textContent = fallbackTranslations[key];
                }
            }
        });
        
        // Apply translations to placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (fallbackTranslations[key]) {
                element.placeholder = fallbackTranslations[key];
            }
        });
        
        // Apply translations to aria-labels
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            if (fallbackTranslations[key]) {
                element.setAttribute('aria-label', fallbackTranslations[key]);
            }
        });
        
        // Apply translations to titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (fallbackTranslations[key]) {
                element.setAttribute('title', fallbackTranslations[key]);
            }
        });
        
        // Apply translations to HTML content
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            if (fallbackTranslations[key]) {
                element.innerHTML = fallbackTranslations[key];
            }
        });
    }
    
    function checkAndFixTranslations() {
        // Check if translations are working
        const skillsTitle = document.querySelector('[data-i18n="skills.categories.frontend"]');
        if (skillsTitle && skillsTitle.textContent === 'skills.categories.frontend') {
            console.log('Translation keys detected, applying fallback');
            applyFallbackTranslations();
        }
    }
    
    // Check translations when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(checkAndFixTranslations, 1000);
        });
    } else {
        setTimeout(checkAndFixTranslations, 1000);
    }
    
    // Also check after window load
    window.addEventListener('load', () => {
        setTimeout(checkAndFixTranslations, 2000);
    });
    
    // Export for debugging
    window.translationFix = {
        apply: applyFallbackTranslations,
        check: checkAndFixTranslations
    };
})();