/**
 * Secret Login Panel
 * Handles the secret admin login panel with username/password authentication
 */

(function() {
    'use strict';

    function initSecretLogin() {
        const secretPanel = document.getElementById('secret-login-panel');
        const secretForm = document.getElementById('secret-login-form');
        const toggleButton = document.getElementById('secret-login-toggle');
        const closeButton = document.getElementById('secret-login-close-btn');
        const usernameInput = document.getElementById('secret-username');
        const passwordInput = document.getElementById('secret-password');
        const statusContainer = document.getElementById('secret-login-status');
        const loadingDiv = document.getElementById('secret-loading');
        const verifiedDiv = document.getElementById('secret-verified');
        
        if (!secretPanel || !toggleButton) {
            console.warn('Secret login: Panel or toggle button not found');
            return;
        }
        
        // Initialize input fields to empty strings
        if (usernameInput) {
            usernameInput.value = '';
        }
        if (passwordInput) {
            passwordInput.value = '';
        }
        
        // Check if user is already verified in this session
        const SESSION_STORAGE_KEY = 'secret_login_verified';
        
        function resetToFormState() {
            // Reset to login form state - remove inline styles to let CSS handle it
            if (secretForm) {
                secretForm.style.display = '';
            }
            if (statusContainer) {
                statusContainer.style.display = 'none';
            }
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
            if (verifiedDiv) {
                verifiedDiv.style.display = 'none';
            }
        }
        
        function showVerifiedState() {
            // Show verified state
            if (secretForm) {
                secretForm.style.display = 'none';
            }
            if (statusContainer) {
                statusContainer.style.display = 'flex';
            }
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
            if (verifiedDiv) {
                verifiedDiv.style.display = 'flex';
            }
        }
        
        function checkVerifiedState() {
            const isVerified = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
            if (isVerified) {
                showVerifiedState();
            } else {
                resetToFormState();
            }
        }
        
        function setVerifiedState() {
            sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
            // Dispatch event to notify other modules
            window.dispatchEvent(new CustomEvent('secret-login-verified'));
        }
        
        function clearVerifiedState() {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            // Dispatch event to notify other modules
            window.dispatchEvent(new CustomEvent('secret-login-logout'));
        }
        
        // Check verified state on page load
        checkVerifiedState();
        
        // Add logout functionality - double-click verified icon to logout
        if (verifiedDiv) {
            let clickTimeout;
            verifiedDiv.addEventListener('click', function(e) {
                clearTimeout(clickTimeout);
                clickTimeout = setTimeout(() => {
                    // Single click - do nothing
                }, 300);
            });
            
            verifiedDiv.addEventListener('dblclick', function(e) {
                e.preventDefault();
                e.stopPropagation();
                clearTimeout(clickTimeout);
                // Clear verified state
                clearVerifiedState();
                // Reset to login form
                resetToFormState();
                // Clear form fields
                if (usernameInput) {
                    usernameInput.value = '';
                }
                if (passwordInput) {
                    passwordInput.value = '';
                }
                // Reset login button state
                const loginBtn = secretForm ? secretForm.querySelector('.secret-login-btn') : null;
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                    loginBtn.classList.remove('error-pulse');
                }
            });
        }
        
        function togglePanel() {
            const isActive = secretPanel.classList.contains('active');
            if (isActive) {
                secretPanel.classList.remove('active');
                toggleButton.classList.remove('active');
            } else {
                secretPanel.classList.add('active');
                toggleButton.classList.add('active');
                // Check verified state when opening panel
                checkVerifiedState();
                // Focus the username input when opening (only if not verified)
                const isVerified = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
                if (!isVerified && usernameInput) {
                    setTimeout(() => {
                        usernameInput.focus();
                    }, 300);
                }
            }
        }
        
        // Toggle panel on button click
        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            togglePanel();
        });
        
        // Close panel on close button click
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                secretPanel.classList.remove('active');
                toggleButton.classList.remove('active');
            });
        }
        
        // Handle form submission with Django authentication
        if (secretForm) {
            const loginBtn = secretForm.querySelector('.secret-login-btn');
            
            secretForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const username = usernameInput ? usernameInput.value.trim() : '';
                const password = passwordInput ? passwordInput.value : '';
                
                if (!username || !password) {
                    // Show error
                    if (loginBtn) {
                        loginBtn.classList.add('error-pulse');
                        setTimeout(() => {
                            loginBtn.classList.remove('error-pulse');
                        }, 1000);
                    }
                    return;
                }
                
                // Disable button during request
                if (loginBtn) {
                    loginBtn.disabled = true;
                    loginBtn.textContent = 'Logging in...';
                }
                
                let loginSuccess = false;
                
                try {
                    const response = await fetch('/api/secret-login/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        loginSuccess = true;
                        // Store verified state in sessionStorage
                        setVerifiedState();
                        
                        // Login successful - hide form and show loading
                        if (secretForm) {
                            secretForm.style.display = 'none';
                        }
                        if (statusContainer) {
                            statusContainer.style.display = 'flex';
                        }
                        // Ensure verified is hidden before showing loading
                        if (verifiedDiv) {
                            verifiedDiv.style.display = 'none';
                        }
                        if (loadingDiv) {
                            loadingDiv.style.display = 'flex';
                        }
                        
                        // After 1.5 seconds, hide loading and show verified
                        setTimeout(() => {
                            if (loadingDiv) {
                                loadingDiv.style.display = 'none';
                            }
                            if (verifiedDiv) {
                                verifiedDiv.style.display = 'flex';
                            }
                        }, 1500);
                    } else {
                        // Login failed - show error
                        if (loginBtn) {
                            loginBtn.classList.add('error-pulse');
                            setTimeout(() => {
                                loginBtn.classList.remove('error-pulse');
                            }, 1000);
                        }
                        
                        // Clear password field
                        if (passwordInput) {
                            passwordInput.value = '';
                        }
                        
                        // Refocus username
                        setTimeout(() => {
                            if (usernameInput) {
                                usernameInput.focus();
                            }
                        }, 100);
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    // Show error
                    if (loginBtn) {
                        loginBtn.classList.add('error-pulse');
                        setTimeout(() => {
                            loginBtn.classList.remove('error-pulse');
                        }, 1000);
                    }
                } finally {
                    // Re-enable button only if login failed
                    if (loginBtn && !loginSuccess) {
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Login';
                    }
                }
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecretLogin);
    } else {
        initSecretLogin();
    }
})();
