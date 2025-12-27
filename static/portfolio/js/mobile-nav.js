/**
 * Mobile Navigation Toggle
 * Handles the mobile navigation menu toggle functionality and responsive navigation switching
 */

(function() {
    'use strict';

    // Breakpoint for mobile/desktop switch
    const MOBILE_BREAKPOINT = 768;

    // Navigation elements
    let mainNavigation;
    let mobileNavigation;
    let mobileNavToggle;
    let mobileNavMenu;
    let mobileNavLinks;
    let mobileNavContainer;
    let mediaQuery;

    /**
     * Check if current viewport is mobile using multiple methods
     */
    function isMobileView() {
        // Use matchMedia for more reliable detection
        if (mediaQuery && mediaQuery.matches !== undefined) {
            return mediaQuery.matches;
        }
        
        // Fallback: check multiple viewport dimensions
        const viewportWidth = window.innerWidth || 
                             document.documentElement.clientWidth || 
                             document.body.clientWidth;
        
        return viewportWidth <= MOBILE_BREAKPOINT;
    }

    /**
     * Show/hide navigation based on viewport size
     */
    function handleResponsiveNavigation() {
        const isMobile = isMobileView();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        
        // Force update by removing and setting display style with !important
        if (mainNavigation) {
            if (isMobile) {
                mainNavigation.style.setProperty('display', 'none', 'important');
            } else {
                mainNavigation.style.setProperty('display', 'block', 'important');
            }
        }

        if (mobileNavigation) {
            if (isMobile) {
                mobileNavigation.style.setProperty('display', 'block', 'important');
            } else {
                mobileNavigation.style.setProperty('display', 'none', 'important');
            }
            
            // Close mobile menu when switching to desktop
            if (!isMobile && mobileNavMenu && mobileNavMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        }
    }

    /**
     * Close mobile menu
     */
    function closeMobileMenu() {
        if (mobileNavToggle) {
            mobileNavToggle.classList.remove('active');
        }
        if (mobileNavMenu) {
            mobileNavMenu.classList.remove('active');
        }
    }

    /**
     * Initialize navigation elements
     */
    function initNavigationElements() {
        mainNavigation = document.querySelector('.main-navigation');
        mobileNavigation = document.querySelector('.mobile-navigation');
        mobileNavToggle = document.getElementById('mobile-nav-toggle');
        mobileNavMenu = document.getElementById('mobile-nav-menu');
        mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavContainer = document.querySelector('.mobile-navigation');

        return {
            mainNavigation,
            mobileNavigation,
            mobileNavToggle,
            mobileNavMenu,
            mobileNavLinks,
            mobileNavContainer
        };
    }

    /**
     * Setup mobile menu toggle functionality
     */
    function setupMobileMenuToggle() {
        if (!mobileNavToggle || !mobileNavMenu) {
            return;
        }

        // Toggle menu on button click
        mobileNavToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileNavToggle.classList.toggle('active');
            mobileNavMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        if (mobileNavLinks && mobileNavLinks.length > 0) {
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', function() {
                    closeMobileMenu();
                });
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileNavContainer) return;
            
            const isClickInsideNav = mobileNavContainer.contains(event.target);
            const isToggleButton = mobileNavToggle.contains(event.target);
            
            if (!isClickInsideNav && !isToggleButton && mobileNavMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && mobileNavMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    /**
     * Initialize everything
     */
    function init() {
        // Initialize navigation elements first
        initNavigationElements();
        
        // Initialize media query listener
        if (window.matchMedia) {
            mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
            
            // Listen for media query changes (more reliable than resize)
            const handleMediaChange = function(e) {
                handleResponsiveNavigation();
            };
            
            // Use addListener for older browsers, addEventListener for modern
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleMediaChange);
            } else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleMediaChange);
            }
        }

        // Set initial state
        handleResponsiveNavigation();
        
        // Setup mobile menu toggle
        setupMobileMenuToggle();

        // Handle window resize (backup method)
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                handleResponsiveNavigation();
            }, 100); // Reduced debounce time for faster response
        });

        // Handle orientation change (for mobile devices)
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                handleResponsiveNavigation();
            }, 150); // Slightly longer delay for orientation change
        });

        // Also listen for visual viewport changes (for mobile browsers)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function() {
                handleResponsiveNavigation();
            });
        }
    }

    // Initialize immediately if DOM is ready, otherwise wait
    function startInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            // DOM already loaded, initialize immediately
            init();
        }
    }

    // Start initialization
    startInit();

    // Also run on window load as a fallback
    window.addEventListener('load', function() {
        // Re-initialize elements in case they weren't found earlier
        initNavigationElements();
        handleResponsiveNavigation();
    });

    // Expose function for manual triggering if needed
    window.handleResponsiveNavigation = handleResponsiveNavigation;
})();

