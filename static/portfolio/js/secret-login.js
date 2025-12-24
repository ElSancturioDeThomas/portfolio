/**
 * Secret Login Panel
 * Handles the secret admin login panel that slides out from the right edge
 * Includes PIN input with segmented display and validation
 */

(function() {
    'use strict';

    const heroSection = document.querySelector('.hero-section');
    const secretPanel = document.getElementById('secret-login-panel');
    const secretForm = document.getElementById('secret-login-form');
    const pinContainer = document.getElementById('pin-container');
    
    if (!heroSection || !secretPanel) return;
    
    const HOVER_DELAY = 2000; // 2 seconds
    const EDGE_WIDTH = 50; // Right edge detection width in pixels
    const PIN_LENGTH = 6; // 6-digit PIN
    const CORRECT_PIN = '846627';
    
    let hoverTimer = null;
    let isHovering = false;
    let pinInput = null;
    
    // Initialize PIN segments
    function initPinSegments() {
        if (!pinContainer) return;
        pinContainer.innerHTML = '';
        
        // Create segments container
        const segmentsDiv = document.createElement('div');
        segmentsDiv.className = 'pin-input-container';
        segmentsDiv.style.position = 'relative';
        segmentsDiv.style.cursor = 'text';
        
        // Create the hidden input
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'secret-pin';
        input.name = 'pin';
        input.autocomplete = 'off';
        input.maxLength = PIN_LENGTH;
        input.inputMode = 'numeric';
        input.pattern = '[0-9]*';
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.border = 'none';
        input.style.background = 'transparent';
        input.style.cursor = 'text';
        input.style.zIndex = '10';
        input.style.fontSize = '16px'; // Prevent zoom on iOS
        
        // Create individual segments
        for (let i = 0; i < PIN_LENGTH; i += 1) {
            const segment = document.createElement('div');
            segment.className = 'pin-segment';
            segment.setAttribute('data-index', i);
            segmentsDiv.appendChild(segment);
        }
        
        pinContainer.appendChild(segmentsDiv);
        segmentsDiv.appendChild(input);
        
        // Store reference to input
        pinInput = input;
        
        // Show cursor on first segment initially
        const firstSegment = segmentsDiv.querySelector('.pin-segment');
        if (firstSegment) {
            firstSegment.classList.add('cursor');
        }
        
        // Focus the hidden input when clicking on segments container
        segmentsDiv.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            input.focus();
        });
        
        // Also focus when panel becomes active
        const observer = new MutationObserver(function(mutations) {
            if (secretPanel.classList.contains('active')) {
                setTimeout(() => {
                    input.focus();
                    updatePinSegments(); // Update to show cursor
                }, 200);
            }
        });
        observer.observe(secretPanel, { attributes: true, attributeFilter: ['class'] });
        
        // Attach input event listeners immediately
        input.addEventListener('input', function(e) {
            updatePinSegments();
        });
        
        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace') {
                e.preventDefault();
                input.value = input.value.slice(0, -1);
                updatePinSegments();
            }
            // Only allow numbers
            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text');
            const numbers = pasted.replace(/\D/g, '').slice(0, PIN_LENGTH);
            input.value = numbers;
            updatePinSegments();
        });
        
        input.addEventListener('focus', function() {
            updatePinSegments();
        });
    }
    
    // Update PIN segments based on input
    function updatePinSegments() {
        if (!pinInput) return;
        const pin = pinInput.value.replace(/\D/g, ''); // Only allow digits
        pinInput.value = pin; // Update input with cleaned value
        
        const segments = document.querySelectorAll('.pin-segment');
        
        segments.forEach((segment, index) => {
            // Remove all state classes first
            segment.classList.remove('filled', 'active', 'cursor');
            
            if (index < pin.length) {
                // Segment has a digit
                segment.textContent = pin[index];
                segment.classList.add('filled');
            } else if (index === pin.length) {
                // This is the next segment to be filled - show cursor
                segment.textContent = '';
                segment.classList.add('cursor');
            } else {
                // Empty segment
                segment.textContent = '';
            }
        });
    }
    
    function showPanel() {
        secretPanel.classList.add('active');
    }
    
    function hidePanel() {
        secretPanel.classList.remove('active');
    }
    
    function startHoverTimer() {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }
        hoverTimer = setTimeout(function() {
            if (isHovering) {
                showPanel();
            }
        }, HOVER_DELAY);
    }
    
    function cancelHoverTimer() {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
    }
    
    // Detect mouse position on hero section
    heroSection.addEventListener('mousemove', function(e) {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const sectionWidth = rect.width;
        
        // Check if mouse is in the right edge area
        if (x >= sectionWidth - EDGE_WIDTH && !secretPanel.classList.contains('active')) {
            if (!isHovering) {
                isHovering = true;
                startHoverTimer();
            }
        } else {
            if (isHovering && !secretPanel.matches(':hover')) {
                isHovering = false;
                cancelHoverTimer();
                hidePanel();
            }
        }
    });
    
    // Keep panel open when hovering over it
    secretPanel.addEventListener('mouseenter', function() {
        cancelHoverTimer();
        showPanel();
    });
    
    // Hide panel when mouse leaves
    secretPanel.addEventListener('mouseleave', function() {
        hidePanel();
    });
    
    // Initialize PIN segments and handle input
    if (pinContainer) {
        initPinSegments();
        
        // Initial update to show cursor after a brief delay
        setTimeout(function() {
            updatePinSegments();
        }, 150);
    }
    
    // Handle form submission with PIN validation
    if (secretForm) {
        const loginBtn = secretForm.querySelector('.secret-login-btn');
        
        secretForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const pinInputElement = document.getElementById('secret-pin');
            const enteredPin = pinInputElement.value;
            
            if (enteredPin === CORRECT_PIN) {
                // Correct PIN - redirect to admin
                window.location.href = '/admin';
            } else {
                // Wrong PIN - pulse red
                if (loginBtn) {
                    loginBtn.classList.add('error-pulse');
                    setTimeout(() => {
                        loginBtn.classList.remove('error-pulse');
                    }, 1000);
                }
                
                // Clear the PIN input
                pinInputElement.value = '';
                updatePinSegments();
                
                // Refocus input
                setTimeout(() => {
                    pinInputElement.focus();
                }, 100);
            }
        });
    }
})();

