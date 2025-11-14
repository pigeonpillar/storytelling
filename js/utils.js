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

// ===== VIDEO MANAGEMENT =====
const videoManager = {
    loadVideoWhenNeeded: (video, src) => {
        if (!video.src && src) {
            video.src = src;
            video.load();
            
            // Enhanced error handling
            video.addEventListener('error', function() {
                console.warn('Video failed to load:', src);
                const overlay = video.parentElement.querySelector('.video-overlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #666; font-size: 0.9rem; text-align: center;';
                errorDiv.textContent = 'Video unavailable';
                video.parentElement.appendChild(errorDiv);
            });
        }
    },

    createVideoHandlers: (video, itemDiv) => {
        const handleVideoStart = () => {
            const videoSrc = video.getAttribute('data-src');
            videoManager.loadVideoWhenNeeded(video, videoSrc);
            setTimeout(() => {
                video.play().catch(e => { console.log('Video play failed:', e); }); 
            }, appConfig.performance.videoLoadDelay);
        };

        const handleVideoStop = () => {
            video.pause(); 
            video.currentTime = 0; 
        };

        const handleVideoClick = () => {
            const videoSrc = video.getAttribute('data-src');
            videoManager.loadVideoWhenNeeded(video, videoSrc);
            setTimeout(() => {
                if (video.paused) { 
                    video.play().catch(e => { console.log('Video play failed:', e); }); 
                } else { 
                    video.pause(); 
                } 
            }, 50);
        };

        // Event listeners
        itemDiv.addEventListener('mouseenter', handleVideoStart);
        itemDiv.addEventListener('mouseleave', handleVideoStop);
        itemDiv.addEventListener('touchstart', handleVideoStart);
        itemDiv.addEventListener('touchend', handleVideoStop);
        itemDiv.addEventListener('click', handleVideoClick);
    },

    cleanupVideos: () => {
        const videos = document.querySelectorAll('#evidence-grid video');
        videos.forEach(v => { 
            v.pause(); 
            v.currentTime = 0;
            if (v.src && v.src !== '') {
                v.removeAttribute('src');
                v.load();
            }
        });
    }
};