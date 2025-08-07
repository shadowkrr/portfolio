# Claude Code Configuration

This file contains configuration and context for Claude Code to better understand and work with this portfolio project.

## Project Overview
This is a modern portfolio website project built with static HTML, CSS, and JavaScript. It features:
- Progressive Web App (PWA) capabilities
- Multi-language support (Japanese/English)
- Contact forms with EmailJS integration
- Modern responsive design
- Google Analytics integration
- Service Worker for offline functionality

## Development Commands
- Dev server: `python3 -m http.server 8080`
- Alternative dev server: `python3 -m http.server [port]`
- Build: No build process required (static HTML site)
- Test: Open browser to `http://localhost:8080`
- Lint: Manual code review (no automated linting configured)

## Project Structure
```
portfolio/
├── index.html              # Main portfolio page
├── case-study-*.html       # Case study pages (JP/EN versions)
├── privacy-policy.html     # Privacy policy page
├── offline.html           # Offline page for PWA
├── css/
│   ├── modern-style.css   # Main stylesheet
│   ├── critical.css       # Critical CSS for performance
│   └── photoswipe/        # PhotoSwipe gallery styles
├── js/
│   ├── modern-script.js   # Main JavaScript functionality
│   ├── analytics.js       # Google Analytics
│   ├── contact-form.js    # Contact form handling
│   ├── pwa.js            # PWA functionality
│   ├── i18n.js           # Internationalization
│   └── security.js       # Security features
├── img/
│   ├── icons/            # PWA icons
│   ├── works/            # Portfolio work images
│   └── skill/            # Skill icons
├── lang/
│   ├── en.json           # English translations
│   └── ja.json           # Japanese translations
├── manifest.json         # PWA manifest
└── sw.js                 # Service Worker
```

## Key Features
- Contact form integration with EmailJS
- Google Analytics 4 tracking
- Cookie consent management
- Offline functionality
- Image optimization and lazy loading
- Case studies with detailed project information

## Notes
- This is a static HTML site that doesn't require a build process
- The site is configured as a PWA with offline capabilities
- Multi-language support is implemented with client-side JavaScript
- Contact forms use EmailJS for email delivery
- All external dependencies are loaded from CDNs