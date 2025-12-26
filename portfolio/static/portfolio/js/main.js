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
})();

