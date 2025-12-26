/**
 * Countries Carousel
 * Handles infinite auto-scrolling carousel for country flags from right to left
 */

(function() {
    'use strict';

    function initCountriesCarousel() {
        const carousel = document.querySelector('.countries-track');
        if (!carousel) return;
        
        const countryCards = carousel.querySelectorAll('.country-card');
        if (countryCards.length === 0) return;
        
        const cardWidth = countryCards[0].offsetWidth;
        const gap = 24; // 1.5rem gap in pixels
        const scrollSpeed = 0.5; // pixels per frame (adjust for speed)
        let currentPosition = 0;
        let animationId = null;
        
        // Calculate the width of one set of cards (we have 3 sets total)
        const totalCards = countryCards.length;
        const cardsPerSet = totalCards / 3;
        const singleSetWidth = (cardWidth + gap) * cardsPerSet;
        
        // Ensure we have valid sets for seamless loop
        if (cardsPerSet === 0 || !Number.isInteger(cardsPerSet)) return;
        
        function animate() {
            // Move from right to left (decrease position)
            currentPosition -= scrollSpeed;
            
            // Reset position seamlessly when we've scrolled exactly one set width
            // Since currentPosition is negative, check if it's less than or equal to -singleSetWidth
            if (currentPosition <= -singleSetWidth) {
                // Reset to 0 without visible jump since the duplicate set is identical
                // This creates seamless infinite loop
                currentPosition = 0;
            }
            
            carousel.style.transform = `translateX(${currentPosition}px)`;
            carousel.style.transition = 'none'; // Disable transition for smooth animation
            animationId = requestAnimationFrame(animate);
        }
        
        // Pause on hover
        const carouselContainer = carousel.closest('.countries-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', function() {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            });
            
            carouselContainer.addEventListener('mouseleave', function() {
                if (!animationId) {
                    animate();
                }
            });
        }
        
        // Start animation
        animate();
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // Recalculate measurements
                const newCardWidth = countryCards[0].offsetWidth;
                const newCardsPerSet = totalCards / 2;
                const newSingleSetWidth = (newCardWidth + gap) * newCardsPerSet;
                
                // Adjust current position proportionally if card size changed
                if (newCardWidth !== cardWidth && singleSetWidth > 0) {
                    currentPosition = (currentPosition / singleSetWidth) * newSingleSetWidth;
                } else {
                    // Reset to 0 if measurements changed significantly
                    currentPosition = 0;
                }
                
                // Restart animation
                animate();
            }, 250);
        });
    }
    
    // Make function available globally
    window.initCountriesCarousel = initCountriesCarousel;
    
    // Auto-initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initCountriesCarousel();
    });
})();
