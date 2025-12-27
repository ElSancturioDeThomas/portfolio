/**
 * Add Photo Popup Panel
 * Handles the add photo popup that appears in the center of the screen
 */

(function() {
    'use strict';

    function initPhotoAdd() {
        const addPanel = document.getElementById('photo-add-panel');
        const addBtn = document.getElementById('photos-add-btn');
        const closeBtn = document.getElementById('photo-add-close-btn');
        const photoForm = document.getElementById('photo-add-form');
        const statusContainer = document.getElementById('photo-add-status');
        const loadingDiv = document.getElementById('photo-loading');
        const submittedDiv = document.getElementById('photo-submitted');
        
        if (!addPanel || !addBtn) {
            console.warn('Photo add: Panel or button not found');
            return;
        }
        
        function togglePanel() {
            const isActive = addPanel.classList.contains('active');
            const icon = addBtn ? addBtn.querySelector('i') : null;
            
            if (isActive) {
                addPanel.classList.remove('active');
                if (icon) {
                    icon.className = 'fas fa-plus';
                }
            } else {
                addPanel.classList.add('active');
                if (icon) {
                    icon.className = 'fas fa-times';
                }
                const firstInput = photoForm ? photoForm.querySelector('.skill-input') : null;
                if (firstInput) {
                    setTimeout(() => {
                        firstInput.focus();
                    }, 300);
                }
            }
        }
        
        if (addBtn) {
            addBtn.addEventListener('click', function(e) {
                e.preventDefault();
                togglePanel();
            });
        }
        
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
        
        addPanel.addEventListener('click', function(e) {
            if (e.target === addPanel) {
                addPanel.classList.remove('active');
                const icon = addBtn ? addBtn.querySelector('i') : null;
                if (icon) {
                    icon.className = 'fas fa-plus';
                }
            }
        });
        
        const content = addPanel.querySelector('.skill-add-content');
        if (content) {
            content.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        if (photoForm) {
            photoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(photoForm);
                
                if (statusContainer) {
                    statusContainer.style.display = 'block';
                }
                if (loadingDiv) {
                    loadingDiv.style.display = 'block';
                }
                if (submittedDiv) {
                    submittedDiv.style.display = 'none';
                }
                
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                                 document.cookie.match(/csrftoken=([^;]+)/)?.[1];
                
                fetch('/api/photos/create/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken,
                    },
                    body: formData,
                    credentials: 'same-origin'
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    if (data.success) {
                        if (loadingDiv) {
                            loadingDiv.style.display = 'none';
                        }
                        if (submittedDiv) {
                            submittedDiv.style.display = 'block';
                        }
                        
                        photoForm.reset();
                        
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        alert('Error: ' + (data.error || 'Failed to create photo'));
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPhotoAdd);
    } else {
        initPhotoAdd();
    }
})();

