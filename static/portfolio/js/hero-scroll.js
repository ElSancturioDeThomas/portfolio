/**
 * Hero Section Scroll Animation
 * Handles the zoom out animation of hero text when scrolling
 */

(function() {
    'use strict';

    const heroHeader = document.querySelector('.hero-header');
    const heroSection = document.querySelector('.hero-section');
    
    if (!heroSection || !heroHeader) return;
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // Start animation when scrolling past 20% of hero section
        if (scrollPosition > heroSection.offsetHeight * 0.2) {
            heroHeader.classList.add('scrolled');
        } else {
            heroHeader.classList.remove('scrolled');
        }
    });
})();

