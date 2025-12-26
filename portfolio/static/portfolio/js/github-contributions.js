/**
 * GitHub Contributions Graph
 * Adds month labels to the contribution graph
 */

(function() {
    'use strict';

    const WEEK_WIDTH = 16; // 12px day + 4px gap
    const DAY_LABELS_WIDTH = 30; // Width of one label column
    const TOTAL_LABELS_WIDTH = DAY_LABELS_WIDTH * 2; // Both left and right labels
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function initContributionsGraph() {
        const graph = document.querySelector('.contribution-graph');
        const monthsContainer = document.querySelector('.contribution-months');
        const graphInner = document.querySelector('.contribution-graph-inner');
        
        if (!graph || !monthsContainer || !graphInner) return;

        const weeks = graph.querySelectorAll('.week');
        if (weeks.length === 0) return;

        // Get the wrapper and container widths
        const wrapper = document.querySelector('.contribution-graph-wrapper');
        const container = document.querySelector('.contributions-container');
        
        // Calculate available width for the graph
        let availableWidth = 0;
        if (wrapper) {
            availableWidth = wrapper.offsetWidth - TOTAL_LABELS_WIDTH - 16; // Subtract both day labels (left + right) and gaps
        }
        
        // Calculate the base graph width (weeks * week width)
        const baseGraphWidth = weeks.length * WEEK_WIDTH;
        
        // If available width is larger than base width, calculate spacing to fill
        if (availableWidth > baseGraphWidth && availableWidth > 0) {
            // Calculate gap needed to fill the space
            const totalGapNeeded = availableWidth - (weeks.length * 12); // 12px per week (day width)
            const gapPerWeek = totalGapNeeded / (weeks.length - 1);
            const adjustedGap = Math.max(4, Math.min(gapPerWeek, 8)); // Clamp between 4px and 8px
            
            // Apply adjusted gap
            graph.style.gap = adjustedGap + 'px';
        }
        
        // Set months container width to match wrapper width
        if (wrapper) {
            const wrapperWidth = wrapper.offsetWidth;
            monthsContainer.style.width = (wrapperWidth - 30) + 'px'; // Account for left padding
        } else {
            // Fallback to calculated width
            monthsContainer.style.width = (baseGraphWidth + TOTAL_LABELS_WIDTH) + 'px';
        }

        // Calculate month positions from week indices
        // GitHub contributions show last ~53 weeks (approximately 1 year)
        const monthPositions = [];
        let currentMonth = -1;
        let monthStartIndex = 0;

        weeks.forEach((week, weekIndex) => {
            // Get date from first day in the week
            const firstDay = week.querySelector('.day');
            if (!firstDay) return;
            
            const dateStr = firstDay.getAttribute('data-date');
            if (!dateStr) return;
            
            const date = new Date(dateStr);
            const month = date.getMonth();
            
            if (month !== currentMonth) {
                if (currentMonth !== -1) {
                    monthPositions.push({
                        month: currentMonth,
                        start: monthStartIndex,
                        end: weekIndex
                    });
                }
                currentMonth = month;
                monthStartIndex = weekIndex;
            }
        });

        // Add final month
        if (currentMonth !== -1) {
            monthPositions.push({
                month: currentMonth,
                start: monthStartIndex,
                end: weeks.length - 1
            });
        }

        // Get the actual gap used (after potential adjustment)
        const computedGap = parseFloat(getComputedStyle(graph).gap) || 4;
        const dayWidth = 12;
        const weekWidth = dayWidth + computedGap;
        
        // Create month labels
        monthPositions.forEach((pos, index) => {
            const monthLabel = document.createElement('span');
            monthLabel.textContent = MONTH_NAMES[pos.month];
            
            // Calculate center position of month relative to the graph (accounting for day labels offset)
            // Position is: day labels width + gap + (week index * week width) + (half week width for center)
            const monthWeekIndex = pos.start + (pos.end - pos.start) / 2;
            const monthCenter = DAY_LABELS_WIDTH + 8 + (monthWeekIndex * weekWidth) + (dayWidth / 2);
            monthLabel.style.left = monthCenter + 'px';
            monthLabel.style.transform = 'translateX(-50%)';
            
            // Prevent overlap with previous label
            if (index > 0) {
                const prevPos = monthPositions[index - 1];
                const prevWeekIndex = prevPos.start + (prevPos.end - prevPos.start) / 2;
                const prevCenter = DAY_LABELS_WIDTH + 8 + (prevWeekIndex * weekWidth) + (dayWidth / 2);
                const prevWidth = MONTH_NAMES[prevPos.month].length * 6;
                const minSpacing = prevWidth / 2 + 10;
                
                if (monthCenter - prevCenter < minSpacing) {
                    monthLabel.style.left = (prevCenter + minSpacing) + 'px';
                }
            }
            
            monthsContainer.appendChild(monthLabel);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContributionsGraph);
    } else {
        initContributionsGraph();
    }
})();
