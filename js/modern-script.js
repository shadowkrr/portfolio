document.addEventListener('DOMContentLoaded', function() {
    // Hide loader
    window.addEventListener('load', function() {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.classList.add('hidden');
                document.body.classList.add('loaded'); // Enable scrolling after loading
            }
        }, 1000);
    });

    // Initialize AOS safely
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: false,
            mirror: true
        });
    } else {
        console.warn('AOS library not loaded');
    }

    // Cursor
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (cursor && cursorFollower) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
            }, 100);
        });

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .filter-btn');
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(2)';
                cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });
            element.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }

    // Particles
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#667eea'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#667eea',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }

    // Dark mode
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check saved theme
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });

    // Navbar scroll
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Smooth scrolling
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }

            // Close mobile menu
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Active links
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Typing animation - will be initialized after i18n is loaded
    let typedInstance = null;
    
    function initTypingAnimation() {
        if (typeof Typed !== 'undefined' && window.i18n) {
            // Destroy existing instance if it exists
            if (typedInstance) {
                typedInstance.destroy();
            }
            
            const subtitles = window.i18n.t('hero.subtitles');
            if (Array.isArray(subtitles)) {
                typedInstance = new Typed('.typing-subtitle', {
                    strings: subtitles,
                    typeSpeed: 50,
                    backSpeed: 30,
                    backDelay: 2000,
                    loop: true
                });
            }
        }
    }
    
    // Listen for language changes to reinitialize typing animation
    window.addEventListener('languageChanged', initTypingAnimation);
    
    // Initialize typing animation after a short delay to ensure i18n is loaded
    setTimeout(initTypingAnimation, 500);

    // Counter animation
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const increment = target / speed;

        const updateCounter = () => {
            const current = +counter.innerText;
            
            if (current < target) {
                counter.innerText = Math.ceil(current + increment);
                setTimeout(updateCounter, 1);
            } else {
                counter.innerText = target;
            }
        };

        updateCounter();
    };

    // Counter observer
    const observerOptions = {
        threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Skill progress
    const skillCircles = document.querySelectorAll('.progress-ring-circle');
    
    const animateSkillProgress = (circle) => {
        const progress = circle.getAttribute('data-progress');
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 100);
    };

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillProgress(entry.target);
                skillObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    skillCircles.forEach(circle => {
        skillObserver.observe(circle);
    });

    // Work filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workCards = document.querySelectorAll('.work-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            workCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Contact form handled by contact-form.js

    // Back to top
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Parallax
    const heroSection = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-gradient');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });

    // Reveal animation
    const revealElements = document.querySelectorAll('.section-title, .section-subtitle, .work-card, .skill-item');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Button hover effect
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            const x = e.clientX - e.target.offsetLeft;
            const y = e.clientY - e.target.offsetTop;
            
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Keyboard navigation
    function setupKeyboardNavigation() {
        // Hamburger keyboard
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger) {
            hamburger.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    this.setAttribute('aria-expanded', !isExpanded);
                    navMenu.classList.toggle('active');
                    this.classList.toggle('active');
                }
            });
        }

        // Work card keyboard
        const workCards = document.querySelectorAll('.work-card');
        workCards.forEach(card => {
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Click work link
                    const workLink = this.querySelector('.work-link');
                    if (workLink) {
                        workLink.click();
                    }
                }
            });
        });

        // Filter button keyboard
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach((button, index) => {
            button.addEventListener('keydown', function(e) {
                let targetIndex = index;
                
                switch(e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        targetIndex = (index + 1) % filterButtons.length;
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetIndex = (index - 1 + filterButtons.length) % filterButtons.length;
                        break;
                    case 'Home':
                        e.preventDefault();
                        targetIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        targetIndex = filterButtons.length - 1;
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        button.click();
                        return;
                }
                
                if (targetIndex !== index) {
                    filterButtons[targetIndex].focus();
                }
            });
        });

        // Update aria-pressed
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Reset buttons
                filterButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
                // Set pressed
                this.setAttribute('aria-pressed', 'true');
            });
        });

        // Skip link
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    hamburger.focus();
                }
            }
        });

        // Screen reader announcements
        function announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }

        // Filter announcements
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filterType = this.textContent.trim();
                announceToScreenReader(`Filtering projects by ${filterType}`);
            });
        });

        // Dark mode keyboard
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }
    }

    // Init keyboard nav
    setupKeyboardNavigation();

    // Mobile UX
    function setupMobileUX() {
        // Touch detection
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
            
            // Touch interactions
            const workCards = document.querySelectorAll('.work-card');
            workCards.forEach(card => {
                let touchStartTime = 0;
                let touchStartX = 0;
                let touchStartY = 0;
                
                card.addEventListener('touchstart', function(e) {
                    touchStartTime = Date.now();
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }, { passive: true });
                
                card.addEventListener('touchend', function(e) {
                    const touchEndTime = Date.now();
                    const touchEndX = e.changedTouches[0].clientX;
                    const touchEndY = e.changedTouches[0].clientY;
                    
                    const touchDuration = touchEndTime - touchStartTime;
                    const touchDistanceX = Math.abs(touchEndX - touchStartX);
                    const touchDistanceY = Math.abs(touchEndY - touchStartY);
                    
                    // Tap detection
                    if (touchDuration < 300 && touchDistanceX < 10 && touchDistanceY < 10) {
                        e.preventDefault();
                        
                        // Toggle card flip
                        if (this.classList.contains('flipped')) {
                            // Navigate if flipped
                            const workLink = this.querySelector('.work-link');
                            if (workLink) {
                                window.open(workLink.href, '_blank', 'noopener,noreferrer');
                            }
                        } else {
                            // Flip card
                            this.classList.add('flipped');
                            
                            // Remove other flips
                            workCards.forEach(otherCard => {
                                if (otherCard !== this) {
                                    otherCard.classList.remove('flipped');
                                }
                            });
                        }
                    }
                }, { passive: false });
            });
            
            // Swipe indicators
            workCards.forEach(card => {
                if (!card.querySelector('.swipe-indicator')) {
                    const indicator = document.createElement('div');
                    indicator.className = 'swipe-indicator';
                    indicator.textContent = 'Tap to flip';
                    card.appendChild(indicator);
                }
            });
            
            // Form focus mobile
            const formInputs = document.querySelectorAll('.form-control');
            formInputs.forEach(input => {
                input.addEventListener('focus', function() {
                    // Scroll to input
                    setTimeout(() => {
                        this.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                        });
                    }, 300);
                });
            });
        }
        
        // Viewport height fix
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 500);
        });
        
        // Mobile scroll
        let ticking = false;
        let lastScrollY = 0;
        
        function updateScrollDirection() {
            const scrollY = window.pageYOffset;
            const navbar = document.getElementById('navbar');
            
            if (navbar) {
                if (scrollY > lastScrollY && scrollY > 100) {
                    // Down
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    // Up
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = scrollY;
            ticking = false;
        }
        
        function requestScrollUpdate() {
            if (!ticking) {
                requestAnimationFrame(updateScrollDirection);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
        
        // Touch theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle && isTouchDevice) {
            let tapTimeout;
            
            themeToggle.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.transform = 'scale(0.9)';
                
                tapTimeout = setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }, { passive: false });
            
            themeToggle.addEventListener('touchend', function(e) {
                e.preventDefault();
                clearTimeout(tapTimeout);
                this.style.transform = 'scale(1)';
                
                // Change theme
                this.click();
            }, { passive: false });
        }
        
        // Mobile nav
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu && isTouchDevice) {
            // Close menu outside
            document.addEventListener('touchstart', function(e) {
                if (navMenu.classList.contains('active') && 
                    !navMenu.contains(e.target) && 
                    !hamburger.contains(e.target)) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close menu nav link
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('touchend', function() {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                });
            });
        }
        
        // Mobile performance
        if (isTouchDevice) {
            // Disable particles mobile
            const particlesContainer = document.getElementById('particles-js');
            if (particlesContainer && window.innerWidth < 768) {
                particlesContainer.style.display = 'none';
            }
            
            // Reduce AOS mobile
            AOS.refresh({
                duration: 600,
                easing: 'ease-out',
                once: true,
                mirror: false
            });
        }
    }
    
    // Init mobile UX
    setupMobileUX();

    // Initialize
});

// Ripple styles
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: ripple-effect 0.6s ease-out;
    }
    
    @keyframes ripple-effect {
        from {
            width: 0;
            height: 0;
            opacity: 1;
        }
        to {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);