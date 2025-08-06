// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Hide loader after page load
    window.addEventListener('load', function() {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            loader.classList.add('hidden');
        }, 1000);
    });

    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: false,
        mirror: true
    });

    // Custom Cursor
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

        // Cursor hover effects
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

    // Particle Background Configuration
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

    // Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference
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

    // Navbar Scroll Effect
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

    // Smooth Scrolling for Navigation Links
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

            // Close mobile menu if open
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Active Link Highlighting
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

    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Typing Animation
    if (typeof Typed !== 'undefined') {
        new Typed('.typing-subtitle', {
            strings: [
                'Full Stack Developer',
                'Freelance Engineer',
                'Web Application Specialist',
                'Mobile App Developer',
                'Open Source Contributor'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true
        });
    }

    // Counter Animation for Stats
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

    // Intersection Observer for Counter Animation
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

    // Skill Progress Animation
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

    // Work Filter Functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workCards = document.querySelectorAll('.work-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
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

    // Contact Form Handler - Now handled by contact-form.js
    // The contact form functionality has been moved to a dedicated module

    // Back to Top Button
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

    // Parallax Effect for Hero Section
    const heroSection = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-gradient');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }
    });

    // Add smooth reveal animation to elements
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

    // Add hover effect to buttons
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

    // Keyboard Navigation Support
    function setupKeyboardNavigation() {
        // Handle hamburger menu keyboard navigation
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

        // Handle work card keyboard navigation
        const workCards = document.querySelectorAll('.work-card');
        workCards.forEach(card => {
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Simulate click on the work link inside the card
                    const workLink = this.querySelector('.work-link');
                    if (workLink) {
                        workLink.click();
                    }
                }
            });
        });

        // Handle filter buttons keyboard navigation with arrow keys
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

        // Update aria-pressed attributes for filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Reset all buttons
                filterButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
                // Set current button as pressed
                this.setAttribute('aria-pressed', 'true');
            });
        });

        // Skip link functionality
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

        // Escape key handling for mobile menu
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

        // Announce dynamic content changes for screen readers
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

        // Add announcement for filter changes
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filterType = this.textContent.trim();
                announceToScreenReader(`Filtering projects by ${filterType}`);
            });
        });

        // Dark mode toggle keyboard support
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

    // Initialize keyboard navigation
    setupKeyboardNavigation();

    // Mobile UX Optimizations
    function setupMobileUX() {
        // Touch device detection
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
            
            // Work card touch interactions
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
                    
                    // If it's a tap (short duration, small movement)
                    if (touchDuration < 300 && touchDistanceX < 10 && touchDistanceY < 10) {
                        e.preventDefault();
                        
                        // Toggle card flip
                        if (this.classList.contains('flipped')) {
                            // If already flipped, navigate to link
                            const workLink = this.querySelector('.work-link');
                            if (workLink) {
                                window.open(workLink.href, '_blank', 'noopener,noreferrer');
                            }
                        } else {
                            // Flip the card
                            this.classList.add('flipped');
                            
                            // Remove flip from other cards
                            workCards.forEach(otherCard => {
                                if (otherCard !== this) {
                                    otherCard.classList.remove('flipped');
                                }
                            });
                        }
                    }
                }, { passive: false });
            });
            
            // Add swipe indicators to work cards
            workCards.forEach(card => {
                if (!card.querySelector('.swipe-indicator')) {
                    const indicator = document.createElement('div');
                    indicator.className = 'swipe-indicator';
                    indicator.textContent = 'Tap to flip';
                    card.appendChild(indicator);
                }
            });
            
            // Improved form focus for mobile
            const formInputs = document.querySelectorAll('.form-control');
            formInputs.forEach(input => {
                input.addEventListener('focus', function() {
                    // Scroll input into view on focus
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
        
        // Viewport height fix for mobile browsers
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 500);
        });
        
        // Improved scroll behavior for mobile
        let ticking = false;
        let lastScrollY = 0;
        
        function updateScrollDirection() {
            const scrollY = window.pageYOffset;
            const navbar = document.getElementById('navbar');
            
            if (navbar) {
                if (scrollY > lastScrollY && scrollY > 100) {
                    // Scrolling down
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
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
        
        // Touch-friendly theme toggle
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
                
                // Trigger theme change
                this.click();
            }, { passive: false });
        }
        
        // Improve mobile navigation
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu && isTouchDevice) {
            // Close menu when clicking outside
            document.addEventListener('touchstart', function(e) {
                if (navMenu.classList.contains('active') && 
                    !navMenu.contains(e.target) && 
                    !hamburger.contains(e.target)) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close menu when clicking a nav link
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('touchend', function() {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                });
            });
        }
        
        // Performance optimizations for mobile
        if (isTouchDevice) {
            // Disable particles on mobile for better performance
            const particlesContainer = document.getElementById('particles-js');
            if (particlesContainer && window.innerWidth < 768) {
                particlesContainer.style.display = 'none';
            }
            
            // Reduce AOS animations on mobile
            AOS.refresh({
                duration: 600,
                easing: 'ease-out',
                once: true,
                mirror: false
            });
        }
    }
    
    // Initialize mobile UX
    setupMobileUX();

    // Initialize everything
    console.log('Portfolio site initialized successfully!');
});

// Add ripple effect styles dynamically
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