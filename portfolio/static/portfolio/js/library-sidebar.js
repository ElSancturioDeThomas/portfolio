/**
 * Library Sidebar Navigation
 * Handles content switching between different sections (no scrolling)
 */

(function() {
    'use strict';

    function initLibrarySidebar() {
        const sidebarButtons = document.querySelectorAll('.library-sidebar-btn');
        const sections = document.querySelectorAll('.library-section');
        
        if (sidebarButtons.length === 0 || sections.length === 0) {
            return; // Exit if elements don't exist
        }

        // Content switching functionality
        sidebarButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetSection = button.getAttribute('data-section');
                
                if (!targetSection) {
                    return;
                }

                // Remove active class from all buttons
                sidebarButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });

                // Add active class to clicked button
                button.classList.add('active');

                // Hide all sections
                sections.forEach(function(section) {
                    section.classList.remove('active');
                    section.style.display = 'none';
                });

                // Show target section
                const targetElement = document.querySelector(`[data-section="${targetSection}"]`);
                if (targetElement && targetElement.classList.contains('library-section')) {
                    targetElement.style.display = 'block';
                    // Use setTimeout to trigger animation
                    setTimeout(function() {
                        targetElement.classList.add('active');
                    }, 10);
                }
            });
        });

        // Set default view to Projects if available
        const projectsSection = document.querySelector('[data-section="projects"]');
        if (projectsSection && projectsSection.classList.contains('library-section')) {
            // Ensure Projects section is visible by default
            projectsSection.style.display = 'block';
            projectsSection.classList.add('active');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLibrarySidebar);
    } else {
        initLibrarySidebar();
    }
})();
