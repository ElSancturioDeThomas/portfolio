/**
 * Library Sidebar Navigation
 * Handles AJAX loading of sections and showing/hiding headers
 */

(function() {
    'use strict';

    function initLibrarySidebar() {
        const sidebarButtons = document.querySelectorAll('.library-sidebar-btn');
        const sections = document.querySelectorAll('.library-section');
        
        if (sidebarButtons.length === 0 || sections.length === 0) {
            return; // Exit if elements don't exist
        }

        // Function to update active button state
        function updateActiveButton(activeSection) {
            sidebarButtons.forEach(function(btn) {
                const btnSection = btn.getAttribute('data-section');
                if (btnSection === activeSection) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        // Function to show/hide sections and headers
        function updateSectionVisibility(activeSection) {
            sections.forEach(function(section) {
                const sectionId = section.getAttribute('data-section');
                const title = section.querySelector('.library-section-title');
                
                if (sectionId === activeSection) {
                    section.classList.add('active');
                    if (title) {
                        title.style.display = 'flex';
                    }
                } else {
                    section.classList.remove('active');
                    if (title) {
                        title.style.display = 'none';
                    }
                }
            });
        }

        // Function to fetch section data via AJAX
        function loadSection(sectionName) {
            // Show loading state
            const targetSection = document.querySelector(`[data-section="${sectionName}"]`);
            if (!targetSection) {
                console.warn('Library sidebar: Target section not found for', sectionName);
                return;
            }

            // Update button state immediately
            updateActiveButton(sectionName);
            
            // Update section visibility immediately
            updateSectionVisibility(sectionName);

            // Fetch fresh data from server
            const url = `/library/?section=${sectionName}`;
            
            fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest', // Identify as AJAX request
                },
                credentials: 'same-origin'
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // The response contains HTML in the 'html' field
                if (data.html) {
                    targetSection.innerHTML = data.html;
                    
                    // Ensure section is active
                    targetSection.classList.add('active');
                    
                    // Show header
                    const title = targetSection.querySelector('.library-section-title');
                    if (title) {
                        title.style.display = 'flex';
                    }
                }
                
                // Update URL without reloading
                const newUrl = `/library/?section=${sectionName}`;
                window.history.pushState({ section: sectionName }, '', newUrl);
            })
            .catch(function(error) {
                console.error('Error loading section:', error);
                // On error, still show the section (it may have cached content)
            });
        }

        // Handle button clicks
        sidebarButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetSection = button.getAttribute('data-section');
                
                if (!targetSection) {
                    return;
                }

                // Load the section via AJAX
                loadSection(targetSection);
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', function(event) {
            const urlParams = new URLSearchParams(window.location.search);
            const section = urlParams.get('section') || 'projects';
            updateActiveButton(section);
            updateSectionVisibility(section);
        });

        // Initialize based on current URL
        const urlParams = new URLSearchParams(window.location.search);
        const initialSection = urlParams.get('section') || 'projects';
        updateActiveButton(initialSection);
        updateSectionVisibility(initialSection);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLibrarySidebar);
    } else {
        initLibrarySidebar();
    }
})();
