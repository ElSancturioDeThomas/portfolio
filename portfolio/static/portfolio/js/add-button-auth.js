/**
 * Add Button Authentication Visibility
 * Controls visibility of all add buttons based on authentication state
 * This script runs on all pages to ensure buttons are hidden when logged out
 */

(function() {
    'use strict';

    const SESSION_STORAGE_KEY = 'secret_login_verified';
    
    function checkAuthAndUpdateButtons() {
        const isVerified = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
        
        // Get all add buttons with the .add-button class (new style)
        // These buttons are only rendered by Django if user.is_authenticated is true
        const allAddButtons = document.querySelectorAll('.add-button');
        
        allAddButtons.forEach(function(button) {
            // If button exists in DOM, Django rendered it (user is authenticated server-side)
            // But we also need to check client-side auth state
            if (isVerified) {
                // User is verified - show the button
                button.style.display = 'flex';
            } else {
                // User is not verified - hide the button immediately
                button.style.display = 'none';
            }
        });
        
        // Also handle old-style buttons if they exist
        const oldHobbiesBtn = document.getElementById('hobbies-add-btn');
        const oldCountriesBtn = document.getElementById('countries-add-btn');
        
        if (oldHobbiesBtn) {
            oldHobbiesBtn.style.display = isVerified ? 'flex' : 'none';
        }
        if (oldCountriesBtn) {
            oldCountriesBtn.style.display = isVerified ? 'flex' : 'none';
        }
    }
    
    function initAddButtonVisibility() {
        // Check immediately - don't wait for DOMContentLoaded if DOM is already ready
        checkAuthAndUpdateButtons();
        
        // Also check when DOM is fully loaded (in case buttons are added dynamically)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkAuthAndUpdateButtons);
        }
        
        // Listen for storage changes (when user logs in/out in another tab)
        window.addEventListener('storage', checkAuthAndUpdateButtons);
        
        // Listen for custom auth events from secret-login.js
        window.addEventListener('secret-login-verified', checkAuthAndUpdateButtons);
        window.addEventListener('secret-login-logout', checkAuthAndUpdateButtons);
        
        // Check periodically in case sessionStorage was set in same window
        // Use a shorter interval for more responsive updates
        setInterval(checkAuthAndUpdateButtons, 200);
    }

    // Run immediately - don't wait for DOMContentLoaded
    // This ensures buttons are hidden as soon as possible
    checkAuthAndUpdateButtons();
    
    // Also initialize full event listeners
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAddButtonVisibility);
    } else {
        initAddButtonVisibility();
    }
})();

