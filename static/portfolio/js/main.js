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
        
        // Home link scroll-to-top functionality
        initHomeLinkScroll();
        
        // Note: Add button visibility is handled by add-button-auth.js
        // which is loaded on all pages via base.html
    });

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

