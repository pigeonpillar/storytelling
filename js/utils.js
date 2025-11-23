// ===== APPLICATION CONFIGURATION =====
const appConfig = {
    performance: {
        scrollThrottle: 100,
        videoLoadDelay: 100,
        mapAnimationTolerance: 0.001,
        evidenceGridVisibleItems: 6,
        evidenceGridItemDelay: 150
    },
    mobile: {
        breakpoint: 768,
        scrollOffset: 0.7,
        desktopScrollOffset: 0.5
    },
    animation: {
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        duration: {
            short: 300,
            medium: 600,
            long: 1000
        }
    }
};

// ===== UTILITY FUNCTIONS =====
const utils = {
    isMobile: () => window.innerWidth <= appConfig.mobile.breakpoint,
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    hasLocationChanged: (currentCenter, newCenter, tolerance = appConfig.performance.mapAnimationTolerance) => {
        return Math.abs(currentCenter.lng - newCenter[0]) > tolerance || 
               Math.abs(currentCenter.lat - newCenter[1]) > tolerance;
    }
};

// ===== MAPBOX CONFIGURATION =====
const layerTypes = {
    'fill': ['fill-opacity'], 
    'line': ['line-opacity'],
    'circle': ['circle-opacity', 'circle-stroke-opacity'],
    'symbol': ['icon-opacity', 'text-opacity'], 
    'raster': ['raster-opacity'],
    'fill-extrusion': ['fill-extrusion-opacity'], 
    'heatmap': ['heatmap-opacity']
};

const alignments = {
    'left': 'lefty', 
    'center': 'centered',
    'right': 'righty', 
    'full': 'fully'
};

// ===== VIDEO MANAGEMENT (Fixed Black Screen Issue) =====
const videoManager = {
    createVideoHandlers: (video, itemDiv) => {
        const handleVideoStart = () => {
            setTimeout(() => {
                video.play().catch(e => { /* Ignore autoplay errors */ }); 
                const overlay = itemDiv.querySelector('.video-overlay');
                if (overlay) overlay.style.opacity = '0';
            }, 50);
        };

        const handleVideoStop = () => {
            video.pause(); 
            const overlay = itemDiv.querySelector('.video-overlay');
            if (overlay) overlay.style.opacity = '1';
        };

        const handleVideoClick = () => {
            if (video.paused) handleVideoStart();
            else handleVideoStop();
        };

        itemDiv.addEventListener('mouseenter', handleVideoStart);
        itemDiv.addEventListener('mouseleave', handleVideoStop);
        itemDiv.addEventListener('touchstart', (e) => {
            if(video.paused) handleVideoStart();
            else handleVideoStop();
        }, {passive: true});
    },

    // --- HARD RESET FUNCTION ---
    resetVideos: () => {
        const videos = document.querySelectorAll('#evidence-grid video');
        videos.forEach(v => {
            // 1. Get the source URL we saved in data-src
            const src = v.getAttribute('data-src');
            
            if (src) {
                // 2. Temporarily clear source to force browser reset
                //    This is the key to fixing the black screen!
                if(v.src !== src || v.readyState === 0) {
                    v.src = src;
                    v.load(); // Forces browser to download the thumbnail again
                }
            }

            // 3. Ensure it starts at the beginning
            v.currentTime = 0;
            
            // 4. Ensure the play button overlay is visible
            const overlay = v.parentElement.querySelector('.video-overlay');
            if (overlay) overlay.style.opacity = '1';
        });
    },

    cleanupVideos: () => {
        const videos = document.querySelectorAll('#evidence-grid video');
        videos.forEach(v => { 
            v.pause(); 
            // We do NOT remove the src here, to try and keep the image visible
        });
    }
};