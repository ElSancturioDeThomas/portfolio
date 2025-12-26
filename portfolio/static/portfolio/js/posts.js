/**
 * Posts Section - Load More Functionality
 * Handles expanding/collapsing additional posts
 */
(function() {
    'use strict';

    function initPosts() {
        const loadMoreBtn = document.getElementById('posts-load-more-btn');
        const postsGrid = document.getElementById('posts-grid');
        
        if (!loadMoreBtn || !postsGrid) {
            return; // Elements don't exist, exit early
        }

        const hiddenPosts = postsGrid.querySelectorAll('.post-card-hidden');
        
        if (hiddenPosts.length === 0) {
            // No hidden posts, hide the button
            const container = loadMoreBtn.closest('.posts-load-more-container');
            if (container) {
                container.style.display = 'none';
            }
            return;
        }

        let isExpanded = false;

        loadMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!isExpanded) {
                // Show all hidden posts
                hiddenPosts.forEach(function(post, index) {
                    // Remove the hidden class first to allow grid positioning
                    post.classList.remove('post-card-hidden');
                    
                    // Get natural height by temporarily making visible
                    post.style.visibility = 'hidden';
                    post.style.position = 'absolute';
                    post.style.opacity = '1';
                    post.style.transform = 'none';
                    post.style.maxHeight = 'none';
                    const naturalHeight = post.scrollHeight;
                    
                    // Reset and set initial animation state
                    post.style.position = '';
                    post.style.visibility = 'visible';
                    post.style.opacity = '0';
                    post.style.transform = 'translateY(-30px) scale(0.95)';
                    post.style.maxHeight = '0';
                    post.style.transition = 'opacity 0.5s ease, transform 0.5s ease, max-height 0.5s ease';
                    
                    // Trigger reflow
                    post.offsetHeight;
                    
                    // Stagger the slide-in animation
                    setTimeout(function() {
                        post.style.opacity = '1';
                        post.style.transform = 'translateY(0) scale(1)';
                        post.style.maxHeight = naturalHeight + 'px';
                        post.classList.add('showing');
                    }, index * 80);
                });
                
                loadMoreBtn.classList.add('expanded');
                const textSpan = loadMoreBtn.querySelector('.load-more-text');
                if (textSpan) {
                    textSpan.textContent = 'Less';
                }
                isExpanded = true;
            } else {
                // Hide posts again with slide-out animation
                hiddenPosts.forEach(function(post, index) {
                    post.classList.remove('showing');
                    const currentHeight = post.offsetHeight;
                    post.style.maxHeight = currentHeight + 'px';
                    
                    // Trigger reflow
                    post.offsetHeight;
                    
                    // Start collapse animation
                    post.style.opacity = '0';
                    post.style.transform = 'translateY(-30px) scale(0.95)';
                    post.style.maxHeight = '0';
                    
                    setTimeout(function() {
                        post.style.visibility = 'hidden';
                        post.classList.add('post-card-hidden');
                        post.style.maxHeight = '';
                    }, 500 + (index * 50));
                });
                
                loadMoreBtn.classList.remove('expanded');
                const textSpan = loadMoreBtn.querySelector('.load-more-text');
                if (textSpan) {
                    textSpan.textContent = 'More';
                }
                isExpanded = false;
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPosts);
    } else {
        initPosts();
    }
})();

