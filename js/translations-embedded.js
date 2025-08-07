/**
 * Embedded Translations - Solves CORS issues with local JSON files
 * Contains both Japanese and English translations
 */

window.embeddedTranslations = {
    ja: {
        "meta": {
            "title": "フリーランスエンジニア shadowkrr ポートフォリオ",
            "description": "フリーランスエンジニア shadowkrrのポートフォリオサイトです！",
            "ogTitle": "フリーランスエンジニア shadowkrr ポートフォリオ",
            "ogDescription": "フリーランスエンジニア shadowkrrのポートフォリオサイトです！"
        },
        "buttons": {
            "toggleDarkMode": "ダークモード切替",
            "toggleNavigation": "ナビゲーション切替",
            "backToTop": "トップへ戻る"
        },
        "navigation": {
            "home": "Home",
            "works": "Works",
            "about": "About",
            "skills": "Skills",
            "blog": "Blog",
            "faq": "FAQ",
            "contact": "Contact"
        },
        "loader": {
            "text": "Loading..."
        },
        "hero": {
            "greeting": "Hello, I'm",
            "name": "SHADOWKRR",
            "subtitles": [
                "フリーランスエンジニア",
                "フルスタック開発者",
                "Web & アプリ開発者",
                "UI/UX デザイナー"
            ],
            "viewWork": "View My Work",
            "getInTouch": "Get In Touch",
            "scrollDown": "Scroll Down"
        },
        "works": {
            "title": "My Works",
            "subtitle": "プログラムや制作物の一覧です",
            "filter": {
                "all": "All",
                "web": "Web",
                "app": "App",
                "other": "Other"
            },
            "projects": {
                "shachibook": {
                    "title": "しゃちぶっく",
                    "category": "iOS App / Web",
                    "description": "TEAM SHACHIの最新情報を一括管理できるアプリ",
                    "tags": ["Swift", "iOS", "Responsive"],
                    "caseStudy": "Case Study",
                    "liveDemo": "Live Demo"
                },
                "github": {
                    "title": "Github",
                    "category": "Open Source",
                    "description": "オープンソースプロジェクトと開発活動",
                    "tags": ["Various", "OSS"],
                    "caseStudy": "Case Study",
                    "viewProfile": "View Profile"
                },
                "blog": {
                    "title": "雑記まみむメモ",
                    "category": "Blog",
                    "description": "技術ブログと日常の記録",
                    "tags": ["Blog", "Writing"],
                    "caseStudy": "Case Study",
                    "readBlog": "Read Blog"
                }
            }
        },
        "about": {
            "title": "About Me",
            "subtitle": "フリーランスエンジニア",
            "profile": {
                "title": "Profile",
                "description": "高校生の頃からプログラミングを学び始め、主にWeb系のお仕事を中心にフリーランスで活動しています。開発言語はPHPが多いですが、最近はSPAのVue.js(フロント)とGO(サーバ)でお仕事しています。"
            },
            "whatIDo": {
                "title": "What I Do",
                "items": [
                    "フルスタックWeb開発",
                    "モバイルアプリ開発 (iOS/Android)",
                    "UI/UXデザイン",
                    "システムアーキテクチャ設計"
                ]
            },
            "stats": {
                "projects": "Projects Completed",
                "experience": "Years Experience",
                "coffee": "Cups of Coffee"
            }
        },
        "skills": {
            "title": "Technical Skills",
            "subtitle": "技術スタック",
            "categories": {
                "frontend": "Frontend",
                "backend": "Backend",
                "mobile": "Mobile & Others"
            },
            "proficiency": "proficiency"
        },
        "blog": {
            "title": "Latest Blog Posts",
            "subtitle": "最新の技術記事"
        },
        "faq": {
            "title": "Frequently Asked Questions",
            "subtitle": "よくある質問",
            "search": "質問を検索...",
            "categories": {
                "all": "すべて",
                "service": "サービス",
                "technical": "技術",
                "pricing": "料金",
                "support": "サポート"
            },
            "questions": {
                "services": {
                    "question": "どのような開発サービスを提供していますか？",
                    "answer": "Webアプリケーション開発、モバイルアプリ開発（iOS/Android）、システム設計・構築、UI/UXデザイン、技術コンサルティングなど幅広く対応しています。フルスタック開発から特定技術領域に特化したサポートまで、お客様のニーズに合わせて柔軟に対応いたします。"
                },
                "techStack": {
                    "question": "使用している主な技術スタックを教えてください",
                    "answer": "<strong>フロントエンド:</strong> React, Vue.js, TypeScript, HTML5/CSS3<br><strong>バックエンド:</strong> PHP, Node.js, Go, Python<br><strong>モバイル:</strong> Swift (iOS), Kotlin (Android), React Native<br><strong>インフラ:</strong> AWS, Docker, GitHub Actions<br>プロジェクトの要件に応じて最適な技術を選定いたします。"
                },
                "pricing": {
                    "question": "料金体系はどのようになっていますか？",
                    "answer": "プロジェクトの規模・期間・技術要件により個別にお見積もりをいたします。時間単価での契約や固定価格での請負開発の両方に対応しています。まずはお気軽にご相談ください。無料でのご相談・お見積もりを承っております。"
                },
                "timeline": {
                    "question": "開発期間はどの程度かかりますか？",
                    "answer": "プロジェクトの規模や複雑さによって大きく異なりますが、以下が目安となります：<br><strong>簡単なWebサイト:</strong> 1-2週間<br><strong>中規模Webアプリ:</strong> 1-3ヶ月<br><strong>モバイルアプリ:</strong> 2-4ヶ月<br><strong>大規模システム:</strong> 4ヶ月以上<br>詳細は要件定義の段階で正確なスケジュールをご提示いたします。"
                },
                "support": {
                    "question": "納品後のサポートは提供されますか？",
                    "answer": "はい。納品後も以下のサポートを提供しています：<br>- バグ修正対応（納品後1ヶ月間無料）<br>- 運用保守サポート（月額契約）<br>- 機能追加・改修対応<br>- 技術的な質問対応<br>長期的な関係を大切にしており、継続的なサポートを心がけています。"
                },
                "migration": {
                    "question": "既存システムとの連携や移行は可能ですか？",
                    "answer": "はい、可能です。レガシーシステムのモダン化、データベース移行、API連携、段階的なシステム移行など、様々なパターンに対応した経験があります。まずは現在のシステム構成をお聞かせいただき、最適な移行計画をご提案いたします。"
                },
                "remote": {
                    "question": "リモート開発での対応は可能ですか？",
                    "answer": "はい、完全リモートでの開発に対応しています。Slack、Zoom、GitHub、Figmaなどのツールを活用して、効率的なコミュニケーションと開発進行管理を行います。定期的な進捗報告と、必要に応じてオンラインミーティングを設定いたします。"
                },
                "smallProjects": {
                    "question": "小規模な修正や相談だけでも依頼できますか？",
                    "answer": "もちろんです。数時間で完了する小さな修正から、技術相談のみでも対応いたします。お気軽にご相談ください。規模に関係なく、丁寧にサポートさせていただきます。"
                },
                "emergency": {
                    "question": "緊急時の対応は可能ですか？",
                    "answer": "システム障害などの緊急事態には、可能な限り迅速に対応いたします。保守契約をいただいているお客様には、緊急時専用の連絡先をお知らせし、優先的にサポートいたします。"
                },
                "security": {
                    "question": "セキュリティ対策はどのように行っていますか？",
                    "answer": "開発段階から以下のセキュリティ対策を実施しています：<br>- セキュアコーディングの実践<br>- 定期的な脆弱性スキャン<br>- HTTPS/SSL証明書の設定<br>- データの暗号化<br>- アクセス制御の実装<br>- 定期的なセキュリティアップデート<br>お客様の機密情報の取り扱いには細心の注意を払っています。"
                },
                "testing": {
                    "question": "テストやデバッグはどのように行っていますか？",
                    "answer": "品質保証のため、以下のテスト戦略を実施しています：ユニットテスト、統合テスト、E2Eテストの自動化、クロスブラウザテスト、モバイルデバイステスト、パフォーマンステスト。またコードレビューとCI/CDパイプラインによる継続的な品質管理を行っています。"
                },
                "communication": {
                    "question": "プロジェクト進行中のコミュニケーション方法は？",
                    "answer": "定期的な進捗報告（週次レポート）、Slack/ChatWorkでのリアルタイムコミュニケーション、必要に応じたオンラインミーティング（Zoom/Google Meet）、GitHub/GitLabでのコードレビュー、プロジェクト管理ツール（Trello/Notion）での透明な進捗管理を行います。"
                }
            },
            "noResults": {
                "title": "該当する質問が見つかりませんでした",
                "description": "お探しの情報が見つからない場合は、お気軽にお問い合わせください。",
                "contactButton": "お問い合わせ"
            }
        },
        "contact": {
            "title": "Get In Touch",
            "subtitle": "お気軽にお問い合わせください",
            "email": "Email",
            "location": "Location",
            "locationValue": "Japan",
            "form": {
                "name": "Your Name",
                "email": "Your Email",
                "subject": "Subject",
                "message": "Your Message",
                "send": "Send Message"
            }
        },
        "footer": {
            "copyright": "© 2024 SHADOWKRR. All Rights Reserved.",
            "credit": "Designed with love and modern web technologies",
            "privacy": "プライバシーポリシー / Privacy Policy"
        },
        "common": {
            "loading": "読み込み中...",
            "error": "エラーが発生しました",
            "tryAgain": "再試行",
            "close": "閉じる",
            "open": "開く",
            "next": "次へ",
            "previous": "前へ"
        }
    },
    en: {
        // English translations can be added here if needed
        // For now, fallback to Japanese
    }
};

console.log('📚 Embedded translations loaded');

// Auto-initialize the translation system with embedded data
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Applying embedded translations');
    
    setTimeout(function() {
        if (window.embeddedTranslations && window.embeddedTranslations.ja) {
            const translations = window.embeddedTranslations.ja;
            
            // Apply translations to all elements with data-i18n
            document.querySelectorAll('[data-i18n]').forEach(function(element) {
                const key = element.getAttribute('data-i18n');
                const value = getNestedValue(translations, key);
                
                if (value) {
                    if (element.innerHTML.includes('<span')) {
                        // Handle title elements with nested spans
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
                        } else {
                            element.textContent = value;
                        }
                    } else {
                        element.textContent = value;
                    }
                }
            });
            
            // Apply HTML translations
            document.querySelectorAll('[data-i18n-html]').forEach(function(element) {
                const key = element.getAttribute('data-i18n-html');
                const value = getNestedValue(translations, key);
                
                if (value) {
                    element.innerHTML = value;
                }
            });
            
            // Apply placeholder translations
            document.querySelectorAll('[data-i18n-placeholder]').forEach(function(element) {
                const key = element.getAttribute('data-i18n-placeholder');
                const value = getNestedValue(translations, key);
                
                if (value) {
                    element.placeholder = value;
                }
            });
            
            console.log('📚 Embedded translations applied successfully');
        }
    }, 100);
});

// Helper function to get nested object values by key path
function getNestedValue(obj, key) {
    return key.split('.').reduce(function(current, prop) {
        return current && current[prop] ? current[prop] : null;
    }, obj);
}