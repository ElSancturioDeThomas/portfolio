/**
 * Scroll to Top Button
 * Provides smooth scroll to top functionality
 */

(function() {
    'use strict';

    let scrollToTopBtn = null;

    function initScrollToTop() {
        scrollToTopBtn = document.getElementById('scroll-to-top-btn');
        if (!scrollToTopBtn) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', handleScroll);
        scrollToTopBtn.addEventListener('click', scrollToTop);

        // Initial check
        handleScroll();
    }

    function handleScroll() {
        if (!scrollToTopBtn) return;

        // Get the total scrollable height
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate distance from bottom (show button when within 200px of bottom)
        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
        
        // Show button only when near the bottom (within 200px) and not at the very top
        if (distanceFromBottom < 200 && scrollTop > 100) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }

    function scrollToTop(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initScrollToTop);
})();

