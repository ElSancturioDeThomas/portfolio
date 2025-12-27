/**
 * Mobile Menu Toggle
 * Handles the mobile navigation menu open/close functionality
 * Also handles responsive navigation visibility based on viewport width
 */

(function() {
    'use strict';

    // Breakpoint threshold
    const MOBILE_BREAKPOINT = 768;

    // Navigation elements
    let menuToggle;
    let menuOverlay;
    let mobileNavLinks;
    let navContainer;
    let mobileNavTab;

    // Run immediately and also on DOMContentLoaded to catch early and late loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initNavigation();
        });
    } else {
        // DOM is already loaded, run immediately
        initNavigation();
    }

    /**
     * Initialize all navigation functionality
     */
    function initNavigation() {
        // Get navigation elements
        menuToggle = document.querySelector('.mobile-nav-tab');
        menuOverlay = document.querySelector('.mobile-menu-overlay');
        mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        navContainer = document.querySelector('.nav-container-desktop');
        mobileNavTab = document.querySelector('.mobile-nav-tab');

        // Clear any cached state - ensure clean start
        if (navContainer) {
            navContainer.style.display = '';
            navContainer.style.visibility = '';
            navContainer.style.opacity = '';
        }

        // Initialize responsive navigation
        handleResponsiveNavigation();

        // Listen for window resize events
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // Clear inline styles on resize to let CSS handle it
                if (navContainer) {
                    navContainer.style.display = '';
                }
                handleResponsiveNavigation();
            }, 100); // Debounce resize events
        });

        // Initialize mobile menu toggle if elements exist
        if (menuToggle && menuOverlay) {
            initMobileMenuToggle();
        }
    }

    /**
     * Handle responsive navigation visibility based on viewport width
     */
    function handleResponsiveNavigation() {
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        if (viewportWidth <= MOBILE_BREAKPOINT) {
            // Mobile view: Hide regular nav, show mobile tab
            showMobileNavigation();
        } else {
            // Desktop view: Show regular nav, hide mobile tab
            showDesktopNavigation();
        }
    }

    /**
     * Show mobile navigation (hide nav-container-desktop, show mobile tab)
     */
    function showMobileNavigation() {
        // Remove desktop-view class from nav-container-desktop
        if (navContainer) {
            navContainer.classList.remove('desktop-view');
            // Remove any inline styles that might interfere
            navContainer.style.display = '';
        }

        // Ensure mobile menu overlay is closed when switching to mobile
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
        }
    }

    /**
     * Show desktop navigation (show nav-container-desktop, hide mobile tab)
     */
    function showDesktopNavigation() {
        // Add desktop-view class to nav-container-desktop
        if (navContainer) {
            navContainer.classList.add('desktop-view');
            // Remove any inline styles that might interfere - let CSS handle it
            navContainer.style.display = '';
        }

        // Ensure mobile menu overlay is closed when switching to desktop
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
        }
    }

    /**
     * Initialize mobile menu toggle functionality
     */
    function initMobileMenuToggle() {
        if (!menuToggle || !menuOverlay) {
            return; // Mobile menu elements not found
        }

        // Toggle menu on button click
        menuToggle.addEventListener('click', function() {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when clicking on overlay (outside menu content)
        menuOverlay.addEventListener('click', function(e) {
            if (e.target === menuOverlay) {
                closeMenu();
            }
        });

        // Close menu when clicking on a mobile nav link
        if (mobileNavLinks && mobileNavLinks.length > 0) {
            mobileNavLinks.forEach(function(link) {
                link.addEventListener('click', function() {
                    closeMenu();
                });
            });
        }

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    /**
     * Open the mobile menu
     */
    function openMenu() {
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'true');
        }
        if (menuOverlay) {
            menuOverlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden'; // Prevent body scroll when menu is open
    }

    /**
     * Close the mobile menu
     */
    function closeMenu() {
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
        document.body.style.overflow = ''; // Restore body scroll
    }
})();

