/**
 * Countries Add Terminal Panel
 * Handles the add country terminal panel that slides from the left
 */

(function() {
    'use strict';

    function initCountriesAdd() {
        const addPanel = document.getElementById('country-add-panel');
        const addBtn = document.getElementById('countries-add-btn');
        const closeBtn = document.getElementById('country-add-close-btn');
        const countryForm = document.getElementById('country-add-form');
        const statusContainer = document.getElementById('country-add-status');
        const loadingDiv = document.getElementById('country-loading');
        const submittedDiv = document.getElementById('country-submitted');
        
        if (!addPanel || !addBtn) {
            console.warn('Country add: Panel or button not found');
            return;
        }
        
        // Check authentication state
        const SESSION_STORAGE_KEY = 'secret_login_verified';
        
        function checkAuthAndShowButton() {
            const isVerified = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
            if (isVerified && addBtn) {
                addBtn.style.display = 'flex';
            } else if (addBtn) {
                addBtn.style.display = 'none';
            }
        }
        
        // Check auth state on load and listen for changes
        checkAuthAndShowButton();
        
        // Listen for storage changes (when user logs in/out)
        window.addEventListener('storage', checkAuthAndShowButton);
        
        // Also check periodically in case sessionStorage was set in same window
        setInterval(checkAuthAndShowButton, 500);
        
        // Also listen for custom event from secret-login.js when user logs in
        window.addEventListener('hobby-auth-changed', checkAuthAndShowButton);
        
        function togglePanel() {
            const isActive = addPanel.classList.contains('active');
            if (isActive) {
                addPanel.classList.remove('active');
                // Change button back to +
                if (addBtn) {
                    addBtn.textContent = '+';
                }
            } else {
                addPanel.classList.add('active');
                // Change button to ×
                if (addBtn) {
                    addBtn.textContent = '×';
                }
                // Focus the first input when opening
                const firstInput = countryForm ? countryForm.querySelector('.country-input') : null;
                if (firstInput) {
                    setTimeout(() => {
                        firstInput.focus();
                    }, 300);
                }
            }
        }
        
        // Toggle panel on button click
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            togglePanel();
        });
        
        // Close panel on close button click
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                addPanel.classList.remove('active');
                // Change button back to +
                if (addBtn) {
                    addBtn.textContent = '+';
                }
            });
        }
        
        // Function to add new country to grid
        function addCountryToGrid(countryData) {
            let countriesGrid = document.querySelector('.countries-grid');
            
            // If grid doesn't exist, create it
            if (!countriesGrid) {
                const countriesSection = document.querySelector('.countries-section');
                if (!countriesSection) return;
                
                // Remove "no countries" message if it exists
                const noCountries = countriesSection.querySelector('.no-countries');
                if (noCountries) {
                    noCountries.remove();
                }
                
                // Create the grid
                countriesGrid = document.createElement('div');
                countriesGrid.className = 'countries-grid';
                countriesSection.appendChild(countriesGrid);
            }
            
            // Create new country card
            const newCard = document.createElement('div');
            newCard.className = 'country-card';
            
            // Flag emoji
            const flagSpan = document.createElement('span');
            flagSpan.className = 'country-flag';
            flagSpan.textContent = countryData.flag_emoji || '🏳️';
            
            // Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'country-tooltip';
            
            const tooltipName = document.createElement('div');
            tooltipName.className = 'country-tooltip-name';
            tooltipName.textContent = countryData.name;
            
            tooltip.appendChild(tooltipName);
            
            if (countryData.thoughts) {
                const tooltipThoughts = document.createElement('div');
                tooltipThoughts.className = 'country-tooltip-thoughts';
                tooltipThoughts.textContent = countryData.thoughts;
                tooltip.appendChild(tooltipThoughts);
            }
            
            newCard.appendChild(flagSpan);
            newCard.appendChild(tooltip);
            
            // Add animation class for smooth appearance
            newCard.style.opacity = '0';
            newCard.style.transform = 'scale(0.8)';
            
            // Insert at the beginning of the grid
            countriesGrid.insertBefore(newCard, countriesGrid.firstChild);
            
            // Animate in
            setTimeout(() => {
                newCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                newCard.style.opacity = '1';
                newCard.style.transform = 'scale(1)';
            }, 10);
        }
        
        // Handle form submission
        if (countryForm) {
            const submitBtn = countryForm.querySelector('.country-submit-btn');
            const nameInput = document.getElementById('country-name');
            const codeInput = document.getElementById('country-code');
            const flagInput = document.getElementById('country-flag');
            const thoughtsInput = document.getElementById('country-thoughts');
            
            countryForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const name = nameInput ? nameInput.value.trim() : '';
                const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
                const flag_emoji = flagInput ? flagInput.value.trim() : '';
                const thoughts = thoughtsInput ? thoughtsInput.value.trim() : '';
                
                if (!name) {
                    // Show error
                    if (submitBtn) {
                        submitBtn.classList.add('error-pulse');
                        setTimeout(() => {
                            submitBtn.classList.remove('error-pulse');
                        }, 1000);
                    }
                    return;
                }
                
                // Disable button during request
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Submitting...';
                }
                
                let submitSuccess = false;
                
                try {
                    const response = await fetch('/api/countries/create/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            name: name,
                            code: code,
                            flag_emoji: flag_emoji,
                            thoughts: thoughts
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        submitSuccess = true;
                        
                        // Hide form and show status
                        if (countryForm) {
                            countryForm.style.display = 'none';
                        }
                        if (statusContainer) {
                            statusContainer.style.display = 'flex';
                        }
                        // Ensure submitted is hidden before showing loading
                        if (submittedDiv) {
                            submittedDiv.style.display = 'none';
                        }
                        if (loadingDiv) {
                            loadingDiv.style.display = 'flex';
                        }
                        
                        // After 1.5 seconds, hide loading and show submitted
                        setTimeout(() => {
                            if (loadingDiv) {
                                loadingDiv.style.display = 'none';
                            }
                            if (submittedDiv) {
                                submittedDiv.style.display = 'flex';
                            }
                            
                            // After 2 more seconds, reset form and close panel
                            setTimeout(() => {
                                // Add new country to grid dynamically
                                if (result.country) {
                                    addCountryToGrid(result.country);
                                }
                                
                                countryForm.reset();
                                if (countryForm) {
                                    countryForm.style.display = 'flex';
                                }
                                if (statusContainer) {
                                    statusContainer.style.display = 'none';
                                }
                                addPanel.classList.remove('active');
                                // Change button back to +
                                if (addBtn) {
                                    addBtn.textContent = '+';
                                }
                            }, 2000);
                        }, 1500);
                    } else {
                        // Submission failed - show error
                        console.error('Submission failed:', result);
                        if (submitBtn) {
                            submitBtn.classList.add('error-pulse');
                            setTimeout(() => {
                                submitBtn.classList.remove('error-pulse');
                            }, 1000);
                        }
                        
                        // Clear form fields on error
                        if (codeInput) {
                            codeInput.value = '';
                        }
                        if (flagInput) {
                            flagInput.value = '';
                        }
                        if (thoughtsInput) {
                            thoughtsInput.value = '';
                        }
                        
                        // Refocus name input
                        setTimeout(() => {
                            if (nameInput) {
                                nameInput.focus();
                            }
                        }, 100);
                    }
                } catch (error) {
                    console.error('Submit error:', error);
                    // Show error
                    if (submitBtn) {
                        submitBtn.classList.add('error-pulse');
                        setTimeout(() => {
                            submitBtn.classList.remove('error-pulse');
                        }, 1000);
                    }
                } finally {
                    // Re-enable button only if submission failed
                    if (submitBtn && !submitSuccess) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Submit';
                    }
                }
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCountriesAdd);
    } else {
        initCountriesAdd();
    }
})();

