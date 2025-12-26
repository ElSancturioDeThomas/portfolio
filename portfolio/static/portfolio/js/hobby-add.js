/**
 * Add Hobby Terminal Panel
 * Handles the add hobby terminal panel that slides from the left
 */

(function() {
    'use strict';

    function initHobbyAdd() {
        const addPanel = document.getElementById('hobby-add-panel');
        const addBtn = document.getElementById('hobbies-add-btn');
        const closeBtn = document.getElementById('hobby-add-close-btn');
        const hobbyForm = document.getElementById('hobby-add-form');
        const statusContainer = document.getElementById('hobby-add-status');
        const loadingDiv = document.getElementById('hobby-loading');
        const submittedDiv = document.getElementById('hobby-submitted');
        
        if (!addPanel || !addBtn) {
            console.warn('Hobby add: Panel or button not found');
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
        
        // Also listen for custom event from secret-login.js when user logs in
        window.addEventListener('hobby-auth-changed', checkAuthAndShowButton);
        
        // Check auth state on load and listen for changes
        checkAuthAndShowButton();
        
        // Listen for storage changes (when user logs in/out)
        window.addEventListener('storage', checkAuthAndShowButton);
        
        // Also check periodically in case sessionStorage was set in same window
        setInterval(checkAuthAndShowButton, 500);
        
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
                const firstInput = hobbyForm ? hobbyForm.querySelector('.hobby-input') : null;
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
        
        // Function to add new hobby row to table
        function addHobbyToTable(hobbyData) {
            const tableBody = document.querySelector('.hobbies-table-body');
            if (!tableBody) return;
            
            // Map social values to display text
            const socialDisplayMap = {
                'yes': 'Yes',
                'no': 'No',
                'maybe': 'Maybe'
            };
            
            // Create new row
            const newRow = document.createElement('div');
            newRow.className = 'hobbies-table-row';
            
            // Icon cell
            const iconCell = document.createElement('div');
            iconCell.className = 'hobbies-table-cell';
            iconCell.setAttribute('data-label', 'Icon');
            if (hobbyData.icon) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'hobby-icon';
                iconSpan.textContent = hobbyData.icon;
                iconCell.appendChild(iconSpan);
            } else {
                iconCell.textContent = '—';
            }
            
            // Hobby name cell
            const nameCell = document.createElement('div');
            nameCell.className = 'hobbies-table-cell';
            nameCell.setAttribute('data-label', 'Hobby');
            const nameStrong = document.createElement('strong');
            nameStrong.textContent = hobbyData.name;
            nameCell.appendChild(nameStrong);
            
            // Reason cell
            const reasonCell = document.createElement('div');
            reasonCell.className = 'hobbies-table-cell';
            reasonCell.setAttribute('data-label', 'Reason');
            reasonCell.textContent = hobbyData.reason || '—';
            
            // Category cell
            const categoryCell = document.createElement('div');
            categoryCell.className = 'hobbies-table-cell';
            categoryCell.setAttribute('data-label', 'Category');
            if (hobbyData.category) {
                const categorySpan = document.createElement('span');
                categorySpan.className = 'hobby-category';
                categorySpan.textContent = hobbyData.category;
                categoryCell.appendChild(categorySpan);
            } else {
                categoryCell.textContent = '—';
            }
            
            // Social cell
            const socialCell = document.createElement('div');
            socialCell.className = 'hobbies-table-cell';
            socialCell.setAttribute('data-label', 'Social');
            const socialBadge = document.createElement('span');
            socialBadge.className = `social-badge social-${hobbyData.social || 'maybe'}`;
            socialBadge.textContent = socialDisplayMap[hobbyData.social || 'maybe'] || 'Maybe';
            socialCell.appendChild(socialBadge);
            
            // Append all cells to row
            newRow.appendChild(iconCell);
            newRow.appendChild(nameCell);
            newRow.appendChild(reasonCell);
            newRow.appendChild(categoryCell);
            newRow.appendChild(socialCell);
            
            // Add animation class for smooth appearance
            newRow.style.opacity = '0';
            newRow.style.transform = 'translateY(-10px)';
            
            // Insert at the beginning of the table body
            tableBody.insertBefore(newRow, tableBody.firstChild);
            
            // Animate in
            setTimeout(() => {
                newRow.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                newRow.style.opacity = '1';
                newRow.style.transform = 'translateY(0)';
            }, 10);
        }
        
        // Handle form submission
        if (hobbyForm) {
            const submitBtn = hobbyForm.querySelector('.hobby-submit-btn');
            const nameInput = document.getElementById('hobby-name');
            const reasonInput = document.getElementById('hobby-reason');
            const categoryInput = document.getElementById('hobby-category');
            const iconInput = document.getElementById('hobby-icon');
            const socialInput = document.getElementById('hobby-social');
            
            hobbyForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const name = nameInput ? nameInput.value.trim() : '';
                const reason = reasonInput ? reasonInput.value.trim() : '';
                const category = categoryInput ? categoryInput.value.trim() : '';
                const icon = iconInput ? iconInput.value.trim() : '';
                const social = socialInput ? socialInput.value : 'maybe';
                
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
                    const response = await fetch('/api/hobbies/create/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({
                            name: name,
                            reason: reason,
                            category: category,
                            icon: icon,
                            social: social
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        submitSuccess = true;
                        
                        // Hide form and show status
                        if (hobbyForm) {
                            hobbyForm.style.display = 'none';
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
                                // Add new hobby to table dynamically
                                if (result.hobby) {
                                    addHobbyToTable(result.hobby);
                                }
                                
                                hobbyForm.reset();
                                if (hobbyForm) {
                                    hobbyForm.style.display = 'flex';
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
                        
                        // Clear password field equivalent (reason field)
                        if (reasonInput) {
                            reasonInput.value = '';
                        }
                        if (categoryInput) {
                            categoryInput.value = '';
                        }
                        if (iconInput) {
                            iconInput.value = '';
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
        document.addEventListener('DOMContentLoaded', initHobbyAdd);
    } else {
        initHobbyAdd();
    }
})();

