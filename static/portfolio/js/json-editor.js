/**
 * JSON Editor Panel
 * Handles the JSON editor panel that expands from the right edge
 * Similar to the admin access panel
 */

(function() {
    'use strict';

    const jsonPanel = document.getElementById('json-editor-panel');
    const jsonContent = document.getElementById('json-content');
    const loadJsonBtn = document.getElementById('hobbies-load-json-btn');
    const closeBtn = document.getElementById('json-editor-close-btn');
    
    if (!jsonPanel || !loadJsonBtn) return;
    
    let isOpen = false;
    
    // Fetch and display JSON
    async function loadJson() {
        try {
            jsonContent.innerHTML = '<code>Loading...</code>';
            
            const response = await fetch('/api/hobbies/');
            if (!response.ok) {
                throw new Error('Failed to fetch hobbies');
            }
            
            const data = await response.json();
            const formattedJson = JSON.stringify(data, null, 2);
            
            // Basic syntax highlighting
            const highlighted = highlightJson(formattedJson);
            jsonContent.innerHTML = `<code>${highlighted}</code>`;
        } catch (error) {
            jsonContent.innerHTML = `<code style="color: #ff1744;">Error: ${error.message}</code>`;
        }
    }
    
    // Basic JSON syntax highlighting
    function highlightJson(json) {
        return json
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return `<span class="${cls}">${match}</span>`;
            });
    }
    
    // Disable mouse wheel scrolling in terminal - only allow scrollbar dragging
    // Wheel events should scroll the main page instead
    function setupWheelPrevention() {
        const jsonEditorBody = document.querySelector('.json-editor-body');
        if (jsonEditorBody && !jsonEditorBody.dataset.wheelPrevented) {
            jsonEditorBody.dataset.wheelPrevented = 'true';
            jsonEditorBody.addEventListener('wheel', (e) => {
                // Check if user is hovering over the scrollbar
                const scrollbarWidth = 16;
                const rect = jsonEditorBody.getBoundingClientRect();
                const isOverScrollbar = (e.clientX > rect.right - scrollbarWidth);
                
                // Only prevent if NOT over scrollbar (allow scrollbar dragging)
                if (!isOverScrollbar) {
                    // Prevent terminal from scrolling
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Apply scroll to main window instead
                    window.scrollBy({
                        top: e.deltaY,
                        left: e.deltaX,
                        behavior: 'auto'
                    });
                }
            }, { passive: false });
        }
    }
    
    // Open panel
    function openPanel() {
        if (!isOpen) {
            isOpen = true;
            jsonPanel.classList.add('active');
            const hobbiesSection = jsonPanel.closest('.hobbies-section');
            if (hobbiesSection) {
                hobbiesSection.classList.add('json-editor-active');
            }
            loadJsonBtn.textContent = 'Close JSON';
            loadJson();
            // Setup wheel prevention after panel is open
            setTimeout(setupWheelPrevention, 100);
        }
    }
    
    // Close panel
    function closePanel() {
        if (isOpen) {
            isOpen = false;
            jsonPanel.classList.remove('active');
            const hobbiesSection = jsonPanel.closest('.hobbies-section');
            if (hobbiesSection) {
                hobbiesSection.classList.remove('json-editor-active');
            }
            loadJsonBtn.textContent = 'Load JSON';
        }
    }
    
    // Event listeners
    loadJsonBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isOpen) {
            closePanel();
        } else {
            openPanel();
        }
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closePanel();
        });
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closePanel();
        }
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (isOpen && !jsonPanel.contains(e.target) && !loadJsonBtn.contains(e.target)) {
            closePanel();
        }
    });
    
})();

