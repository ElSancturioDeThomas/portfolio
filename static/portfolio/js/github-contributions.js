/**
 * GitHub Contributions Graph
 * Adds month labels to the contribution graph
 * Uses flexbox layout for proper spacing across all screen sizes
 */

(function() {
    'use strict';

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function initContributionsGraph() {
        const graph = document.querySelector('.contribution-graph');
        const monthsContainer = document.querySelector('.contribution-months');
        
        if (!graph || !monthsContainer) return;

        const weeks = graph.querySelectorAll('.week');
        if (weeks.length === 0) return;

        // Clear any existing month labels
        monthsContainer.innerHTML = '';

        // Calculate month positions from week data
        const monthsInOrder = [];
        let currentMonth = -1;

        weeks.forEach((week, weekIndex) => {
            const firstDayInWeek = week.querySelector('.day');
            if (!firstDayInWeek) return;
            
            const dateStr = firstDayInWeek.getAttribute('data-date');
            if (!dateStr) return;
            
            const date = new Date(dateStr);
            const month = date.getMonth();
            
            if (month !== currentMonth) {
                monthsInOrder.push({
                    month: month,
                    weekIndex: weekIndex
                });
                currentMonth = month;
            }
        });

        // Create month labels - they will be spaced by flexbox justify-content: space-between
        monthsInOrder.forEach((pos) => {
            const monthLabel = document.createElement('span');
            monthLabel.textContent = MONTH_NAMES[pos.month];
            monthsContainer.appendChild(monthLabel);
        });
    }

    // Initialize when DOM is ready, and also on resize for responsive
    function init() {
        // Small delay to ensure layout is complete
        setTimeout(initContributionsGraph, 100);
    }
    
    // Debounce resize handler
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initContributionsGraph, 250);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Re-initialize on window resize for responsive behavior
    window.addEventListener('resize', handleResize);
})();
