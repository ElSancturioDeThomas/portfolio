/**
 * Main Initialization
 * Coordinates all JavaScript modules for the home page
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // All modules are self-initializing, but we can add coordination here if needed
        // The individual modules handle their own DOMContentLoaded listeners
        console.log('Portfolio page initialized');
        
        // Navbar animation state management
        initNavbarAnimation();
        
        // Home link scroll-to-top functionality
        initHomeLinkScroll();
        
        // Note: Add button visibility is handled by add-button-auth.js
        // which is loaded on all pages via base.html
    });

    /**
     * Navbar Animation State Management
     * Prevents navbar animation from replaying after first visit
     */
    function initNavbarAnimation() {
        const body = document.body;
        const isHomePage = body.classList.contains('home-page');
        
        if (!isHomePage) {
            return; // Only handle on home page
        }

        const NAVBAR_ANIMATION_KEY = 'navbarAnimationSeen';
        const hasSeenAnimation = sessionStorage.getItem(NAVBAR_ANIMATION_KEY) === 'true';
        
        if (hasSeenAnimation) {
            // Animation has been seen before - skip it
            body.classList.add('navbar-animated');
        } else {
            // First time - let animation play, then mark as seen
            // Animation duration: 0.6s + delay: 0.5s = 1.1s total
            // Add small buffer to ensure animation completes
            setTimeout(function() {
                sessionStorage.setItem(NAVBAR_ANIMATION_KEY, 'true');
                body.classList.add('navbar-animated');
            }, 1200); // Wait for animation to complete (1.1s + 0.1s buffer)
        }
    }

    /**
     * Home Link Scroll to Top
     * If user is on home page and clicks home link, scroll to top instead of navigating
     */
    function initHomeLinkScroll() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/' || currentPath === '';
        
        if (!isHomePage) {
            return; // Only handle on home page
        }
        
        navLinks.forEach(function(link) {
            const href = link.getAttribute('href');
            
            // Check if this link points to the home page
            // Django's {% url 'index' %} generates "/" as the href
            const pointsToHome = href === '/' || href === '';
            
            if (pointsToHome) {
                link.addEventListener('click', function(e) {
                    // Prevent default navigation
                    e.preventDefault();
                    
                    // Smooth scroll to top
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }
        });
    }

    // Note: Add button visibility is now handled by add-button-auth.js
    // which is loaded on all pages via base.html
})();

