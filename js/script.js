/**
 * Platial Atlas Landing Page JavaScript
 * Features: Parallax.js integration, smooth navigation, form handling, and responsive interactions
 */

(function() {
    'use strict';

    // ===== VARIABLES =====
    let ticking = false;
    let parallaxInstance = null;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Disable parallax on mobile devices for performance
    const isMobile = window.innerWidth < 769;

    // ===== DOM ELEMENTS =====
    const navbar = document.getElementById('mainNav');
    const scene = document.getElementById('scene');

    // ===== UTILITY FUNCTIONS =====
    
    /**
     * Throttle function for performance optimization
     */
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    /**
     * Request animation frame throttling for smooth scrolling effects
     */
    function requestTick(callback) {
        if (!ticking) {
            requestAnimationFrame(callback);
            ticking = true;
        }
    }

    // ===== PARALLAX INITIALIZATION =====
    
    function initParallax() {
        if (scene && !prefersReducedMotion && !isMobile) {
            parallaxInstance = new Parallax(scene, {
                calibrateX: false,
                calibrateY: true,
                invertX: false,
                invertY: false,
                pointerEvents: false,
                precision: 1
            });
            
            console.log('Parallax initialized successfully');
        } else {
            console.log('Parallax not initialized:', {
                scene: !!scene,
                prefersReducedMotion,
                isMobile
            });
        }
    }

    // ===== POLLEN PARTICLES INITIALIZATION =====
    
    function initParticles() {
        const particlesContainer = document.querySelector('.particles-container');
        
        if (!particlesContainer || isMobile || prefersReducedMotion) {
            return;
        }

        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random horizontal starting position
            const startX = Math.random() * 100;
            particle.style.left = startX + '%';
            
            // Random horizontal drift amount
            const driftX = (Math.random() - 0.5) * 200; // -100px to +100px drift
            particle.style.setProperty('--random-x', driftX + 'px');
            
            // Random animation duration (8-15 seconds)
            const duration = 8 + Math.random() * 7;
            particle.style.animationDuration = duration + 's';
            
            // Random delay before starting
            const delay = Math.random() * 2;
            particle.style.animationDelay = delay + 's';
            
            // Random size variation (2-5px)
            const size = 2 + Math.random() * 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Add to container
            particlesContainer.appendChild(particle);
            
            // Remove particle after animation completes
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, (duration + delay) * 1000);
        }

        // Create initial particles
        for (let i = 0; i < 15; i++) {
            setTimeout(() => createParticle(), Math.random() * 5000);
        }

        // Continuously create new particles
        setInterval(() => {
            if (particlesContainer.children.length < 20) {
                createParticle();
            }
        }, 800);
    }

    // ===== NAVBAR SCROLL EFFECT =====
    
    function updateNavbar() {
        const scrolled = window.pageYOffset;
        
        if (scrolled > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ===== SMOOTH SCROLLING =====
    
    function initSmoothScrolling() {
        // Handle navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 70; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
    
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        document.querySelectorAll('.methodology-card, .card, .fade-in-up').forEach(el => {
            observer.observe(el);
        });
    }

    // ===== FORM HANDLING =====
    
    function initFormHandling() {
        // Form handling code can be added here for future forms
    }

    /**
     * Show notification to user
     */
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-close';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.addEventListener('click', () => notification.remove());
        notification.appendChild(closeBtn);
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // ===== LAZY LOADING FOR IMAGES =====
    
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // ===== KEYBOARD NAVIGATION =====
    
    function initKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // Skip navigation with 'S' key
            if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                const aboutSection = document.querySelector('#about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // ===== PERFORMANCE MONITORING =====
    
    function initPerformanceMonitoring() {
        // Monitor scroll performance
        let scrollCount = 0;
        let scrollStartTime = Date.now();
        
        window.addEventListener('scroll', throttle(() => {
            scrollCount++;
            
            // Log performance every 100 scroll events
            if (scrollCount % 100 === 0) {
                const scrollTime = Date.now() - scrollStartTime;
                console.log(`Scroll performance: ${scrollCount} events in ${scrollTime}ms`);
            }
        }, 16)); // ~60fps
    }

    // ===== MAIN SCROLL HANDLER =====
    
    function handleScroll() {
        requestTick(() => {
            updateNavbar();
        });
    }

    // ===== RESIZE HANDLER =====
    
    function handleResize() {
        // Handle responsive changes on resize
        const newIsMobile = window.innerWidth < 769;
        
        // Reinitialize parallax if needed
        if (parallaxInstance && newIsMobile) {
            parallaxInstance.destroy();
            parallaxInstance = null;
        } else if (!parallaxInstance && !newIsMobile && !prefersReducedMotion) {
            initParallax();
        }
    }

    // ===== EVENT LISTENERS =====
    
    function initEventListeners() {
        // Scroll events
        window.addEventListener('scroll', throttle(handleScroll, 16), { passive: true });
        
        // Resize events
        window.addEventListener('resize', throttle(handleResize, 100));
        
        // Load event
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });
    }

    // ===== INITIALIZATION =====
    
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        console.log('Initializing Platial Atlas website...');
        
        try {
            initEventListeners();
            initParallax();
            initParticles();
            initSmoothScrolling();
            initScrollAnimations();
            initFormHandling();
            initLazyLoading();
            initKeyboardNavigation();
            
            // Only enable performance monitoring in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                initPerformanceMonitoring();
            }
            
            console.log('Platial Atlas website initialized successfully');
        } catch (error) {
            console.error('Error initializing website:', error);
        }
    }

    // ===== ERROR HANDLING =====
    
    window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
    });

    // ===== START APPLICATION =====
    
    init();

})();
