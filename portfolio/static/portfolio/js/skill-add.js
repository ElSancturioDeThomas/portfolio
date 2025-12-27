/**
 * Add Skill Popup Panel
 * Handles the add skill popup that appears in the center of the screen
 */

(function() {
    'use strict';

    function initSkillAdd() {
        const addPanel = document.getElementById('skill-add-panel');
        const addBtn = document.getElementById('skills-add-btn');
        const closeBtn = document.getElementById('skill-add-close-btn');
        const skillForm = document.getElementById('skill-add-form');
        const statusContainer = document.getElementById('skill-add-status');
        const loadingDiv = document.getElementById('skill-loading');
        const submittedDiv = document.getElementById('skill-submitted');
        
        if (!addPanel || !addBtn) {
            console.warn('Skill add: Panel or button not found');
            return;
        }
        
        // Note: Button visibility is now handled by add-button-auth.js
        
        function togglePanel() {
            const isActive = addPanel.classList.contains('active');
            const icon = addBtn ? addBtn.querySelector('i') : null;
            
            if (isActive) {
                addPanel.classList.remove('active');
                // Change icon back to plus
                if (icon) {
                    icon.className = 'fas fa-plus';
                }
            } else {
                addPanel.classList.add('active');
                // Change icon to times
                if (icon) {
                    icon.className = 'fas fa-times';
                }
                // Focus the first input when opening
                const firstInput = skillForm ? skillForm.querySelector('.skill-input') : null;
                if (firstInput) {
                    setTimeout(() => {
                        firstInput.focus();
                    }, 300);
                }
            }
        }
        
        // Toggle panel when button is clicked
        if (addBtn) {
            addBtn.addEventListener('click', function(e) {
                e.preventDefault();
                togglePanel();
            });
        }
        
        // Close panel when close button is clicked
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                addPanel.classList.remove('active');
                const icon = addBtn ? addBtn.querySelector('i') : null;
                if (icon) {
                    icon.className = 'fas fa-plus';
                }
            });
        }
        
        // Close panel when clicking outside
        addPanel.addEventListener('click', function(e) {
            if (e.target === addPanel) {
                addPanel.classList.remove('active');
                const icon = addBtn ? addBtn.querySelector('i') : null;
                if (icon) {
                    icon.className = 'fas fa-plus';
                }
            }
        });
        
        // Prevent clicks inside the content from closing the panel
        const content = addPanel.querySelector('.skill-add-content');
        if (content) {
            content.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        // Handle form submission
        if (skillForm) {
            skillForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(skillForm);
                
                // Show loading state
                if (statusContainer) {
                    statusContainer.style.display = 'block';
                }
                if (loadingDiv) {
                    loadingDiv.style.display = 'block';
                }
                if (submittedDiv) {
                    submittedDiv.style.display = 'none';
                }
                
                // Get CSRF token
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                                 document.cookie.match(/csrftoken=([^;]+)/)?.[1];
                
                // Submit via AJAX
                fetch('/api/skills/create/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.get('name'),
                        description: formData.get('description'),
                        category: formData.get('category'),
                    }),
                    credentials: 'same-origin'
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    if (data.success) {
                        // Show success state
                        if (loadingDiv) {
                            loadingDiv.style.display = 'none';
                        }
                        if (submittedDiv) {
                            submittedDiv.style.display = 'block';
                        }
                        
                        // Reset form
                        skillForm.reset();
                        
                        // Close panel and reload page after a delay
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        // Show error
                        alert('Error: ' + (data.error || 'Failed to create skill'));
                        if (statusContainer) {
                            statusContainer.style.display = 'none';
                        }
                    }
                })
                .catch(function(error) {
                    console.error('Error:', error);
                    alert('An error occurred while submitting the form.');
                    if (statusContainer) {
                        statusContainer.style.display = 'none';
                    }
                });
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSkillAdd);
    } else {
        initSkillAdd();
    }
})();

