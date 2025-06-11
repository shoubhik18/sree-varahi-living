/**
 * Premium Sticky Header Functionality
 * Professional sticky header that slides down when scrolling up
 * and hides when scrolling down past 100vh
 * 
 * Features:
 * - Smooth slide animations
 * - Performance optimized with throttling
 * - Responsive design support
 * - Cross-browser compatibility
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStickyHeader);
    } else {
        initStickyHeader();
    }
    
    function initStickyHeader() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return; // Exit if no navbar found
        
        let lastScrollTop = 0;
        let ticking = false;
        
        // Throttle scroll events for better performance using requestAnimationFrame
        function throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        }
        
        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const viewportHeight = window.innerHeight;
            
            // Only activate sticky behavior after scrolling past 100vh
            if (scrollTop > viewportHeight) {
                // Add sticky class if not already present
                if (!navbar.classList.contains('sticky')) {
                    navbar.classList.add('sticky');
                    // Small delay to ensure smooth transition
                    setTimeout(() => {
                        navbar.classList.add('sticky-visible');
                    }, 50);
                }
                
                // Determine scroll direction for show/hide behavior
                if (scrollTop > lastScrollTop && scrollTop > viewportHeight + 100) {
                    // Scrolling down - hide header
                    navbar.classList.remove('sticky-visible');
                    navbar.classList.add('sticky-hidden');
                } else if (scrollTop < lastScrollTop) {
                    // Scrolling up - show header
                    navbar.classList.remove('sticky-hidden');
                    navbar.classList.add('sticky-visible');
                }
            } else {
                // At top of page - remove all sticky classes
                navbar.classList.remove('sticky', 'sticky-hidden', 'sticky-visible');
            }
            
            // Update last scroll position (prevent negative values on mobile)
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(handleScroll);
                ticking = true;
            }
        }
        
        // Use optimized scroll listener
        const throttledScroll = throttle(requestTick, 16); // ~60fps
        window.addEventListener('scroll', throttledScroll, { passive: true });
        
        // Handle resize events (less frequent throttling)
        window.addEventListener('resize', throttle(handleScroll, 100));
        
        // Handle page visibility changes (performance optimization)
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Page is hidden, remove event listeners
                window.removeEventListener('scroll', throttledScroll);
            } else {
                // Page is visible, re-add event listeners
                window.addEventListener('scroll', throttledScroll, { passive: true });
                handleScroll(); // Check current position
            }
        });
    }
})(); 