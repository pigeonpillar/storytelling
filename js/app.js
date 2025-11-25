// ===== GLOBAL VARIABLES =====
let map;
let currentChapterId = null;
let previousChapterId = null;
let pendingAnimation = null;
let videoObserver = null;
let imageObserver = null;

// ===== ROUTE ANIMATION STATE =====
let routeAnimationFrame = null;
let routeCoordinatesCache = null;
let routeIsAnimating = false;
let routeDataReady = false;

// ===== RANA LAYER IDS (centralized) =====
const RANA_LAYERS = ['incident-1-marker', 'incident-1-marker-pulse', 'ambulance-route-1'];
const RANA_CHAPTERS = ['testimony-Rana01', 'testimony-Rana02'];

function isRanaChapter(chapterId) {
    return RANA_CHAPTERS.includes(chapterId);
}

function showRanaLayers() {
    RANA_LAYERS.forEach(layerId => {
        try {
            if (map && map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
            }
        } catch (e) { console.warn('Could not show layer:', layerId, e); }
    });
    console.log('✅ Rana layers shown');
}

function hideRanaLayers() {
    stopRouteAnimation();
    RANA_LAYERS.forEach(layerId => {
        try {
            if (map && map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'none');
            }
        } catch (e) { console.warn('Could not hide layer:', layerId, e); }
    });
    console.log('🚫 Rana layers hidden');
}

// ===== INTERSECTION OBSERVERS =====
function initializeObservers() {
    if ('IntersectionObserver' in window) {
        videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(e => {
                        const overlay = video.nextElementSibling;
                        if (overlay && overlay.classList.contains('video-overlay')) {
                            overlay.style.opacity = '1';
                        }
                    });
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.5, rootMargin: '50px' });
        
        imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src && !img.src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, { rootMargin: '200px' });
    }
}

// ===== VIDEO INTRO HANDLER =====
const videoIntroManager = {
    playedVideos: new Set(),
    
    createVideoIntro: (container, videoPath, chapterId) => {
        const videoIntro = document.createElement('div');
        videoIntro.className = 'testimony-video-intro';
        
        const video = document.createElement('video');
        video.src = videoPath;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        
        const overlay = document.createElement('div');
        overlay.className = 'testimony-video-overlay';
        
        const playButton = document.createElement('div');
        playButton.className = 'testimony-play-button';
        
        overlay.appendChild(playButton);
        videoIntro.appendChild(video);
        videoIntro.appendChild(overlay);
        
        const unmuteBtn = document.createElement('button');
        unmuteBtn.className = 'testimony-unmute-btn';
        unmuteBtn.innerHTML = '🔇';
        unmuteBtn.style.display = 'none';
        videoIntro.appendChild(unmuteBtn);
        
        container.appendChild(videoIntro);
        
        overlay.addEventListener('click', () => {
            video.muted = false;
            video.play();
            overlay.classList.add('hidden');
            unmuteBtn.style.display = 'none';
        });
        
        unmuteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            unmuteBtn.innerHTML = video.muted ? '🔇' : '🔊';
        });
        
        video.addEventListener('ended', () => {
            videoIntroManager.transitionToCard(videoIntro, container, chapterId);
        });
        
        video.addEventListener('playing', () => {
            overlay.classList.add('hidden');
            if (video.muted) {
                unmuteBtn.style.display = 'block';
            }
        });
        
        return { videoIntro, video };
    },
    
    transitionToCard: (videoIntro, container, chapterId) => {
        console.log('🎬 Video ended, transitioning to card for:', chapterId);
        
        videoIntro.classList.add('hidden');
        
        const content = container.querySelector('.testimony-content');
        if (content) {
            setTimeout(() => {
                content.classList.add('visible');
                
                if (!content.querySelector('.replay-video-btn')) {
                    const replayBtn = document.createElement('button');
                    replayBtn.className = 'replay-video-btn';
                    replayBtn.innerHTML = '↻ Replay Video';
                    replayBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const video = container.querySelector('video');
                        if (video) {
                            videoIntro.classList.remove('hidden');
                            content.classList.remove('visible');
                            video.currentTime = 0;
                            video.muted = false;
                            video.play();
                            
                            const overlay = videoIntro.querySelector('.testimony-video-overlay');
                            if (overlay) overlay.classList.add('hidden');
                        }
                    });
                    
                    content.insertBefore(replayBtn, content.firstChild);
                }
            }, 500);
        }
        
        videoIntroManager.playedVideos.add(chapterId);
    },
    
    tryAutoplay: (video) => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Autoplay prevented, showing play button');
            });
        }
    },
    
    hasPlayedVideo: (chapterId) => {
        return videoIntroManager.playedVideos.has(chapterId);
    }
};

// ===== ASSET PRELOADING =====
function preloadChapterAssets(chapterIndex) {
    if (!config?.chapters) return;
    const chapter = config.chapters[chapterIndex];
    if (!chapter) return;
    if (chapter.image) { const img = new Image(); img.src = chapter.image; }
    if (chapter.gridContent && Array.isArray(chapter.gridContent)) {
        chapter.gridContent.slice(0, 4).forEach(item => {
            if (item.type === 'image' && item.src) { const img = new Image(); img.src = item.src; }
        });
    }
}

// ===== DOM CREATION =====
function createStoryElements() {
    const story = document.getElementById('story');
    const features = document.createElement('div');
    features.setAttribute('id', 'features');
    
    if (typeof config === 'undefined') {
        console.error("❌ CRITICAL ERROR: config.js is not loaded!");
        return;
    }

    if (config.title || config.subtitle || config.byline) {
        const header = document.createElement('div');
        header.setAttribute('id', 'header');
        if (config.title) {
            const h1 = document.createElement('h1');
            h1.innerText = config.title;
            header.appendChild(h1);
        }
        if (config.subtitle) {
            const h2 = document.createElement('h2');
            h2.innerText = config.subtitle;
            header.appendChild(h2);
        }
        if (config.byline) {
            const p = document.createElement('p');
            p.className = 'byline';
            p.innerText = config.byline;
            header.appendChild(p);
        }
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        header.appendChild(indicator);
        story.appendChild(header);
    }

    config.chapters.forEach((record, idx) => {
        const container = document.createElement('div');
        const chapter = document.createElement('div');
        
        if (record.id === 'evidence-grid') {
            if (record.title) {
                const t = document.createElement('h3');
                t.innerHTML = record.title;
                chapter.appendChild(t);
            }
            if (record.subtitle) {
                const s = document.createElement('div');
                s.className = 'subtitle';
                s.innerHTML = record.subtitle;
                chapter.appendChild(s);
            }
            const grid = document.createElement('div');
            grid.className = 'evidence-grid-container';
            grid.id = 'evidence-grid-container';
            chapter.appendChild(grid);
        } else if (record.alignment === 'full') {
            if (record.fullscreenVideo) {
                // Fullscreen video chapter
                const videoContainer = document.createElement('div');
                videoContainer.className = 'fullscreen-video-container';
                
                const video = document.createElement('video');
                video.src = record.fullscreenVideo;
                video.muted = true;
                video.loop = false; // NO LOOP - video plays once then shows text
                video.playsInline = true;
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');
                video.preload = 'auto';
                video.className = 'fullscreen-video';
                
                const muteBtn = document.createElement('button');
                muteBtn.className = 'fullscreen-mute-btn';
                muteBtn.innerHTML = '🔇';
                
                muteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    video.muted = !video.muted;
                    muteBtn.innerHTML = video.muted ? '🔇' : '🔊';
                });
                
                videoContainer.appendChild(video);
                videoContainer.appendChild(muteBtn);
                container.appendChild(videoContainer);
                
                // Store reference on CONTAINER for autoplay control
                container._fullscreenVideo = video;
                container._fullscreenOverlay = null; // Will be set after overlay is created
            } else if (record.image) {
                const img = new Image();
                if (imageObserver) { img.setAttribute('data-src', record.image); imageObserver.observe(img); } 
                else { img.src = record.image; }
                container.appendChild(img);
            }
            
            const overlay = document.createElement('div');
            overlay.className = 'overlay-content';
            if (record.subtitle) {
                const s = document.createElement('div');
                s.className = 'subtitle';
                s.innerText = record.subtitle;
                overlay.appendChild(s);
            }
            if (record.title) {
                const t = document.createElement('h3');
                t.innerHTML = record.title;
                overlay.appendChild(t);
            }
            if (record.quote) {
                const q = document.createElement('blockquote');
                q.innerHTML = record.quote;
                overlay.appendChild(q);
            }
            if (record.description) {
                const d = document.createElement('p');
                d.innerHTML = record.description;
                overlay.appendChild(d);
            }
            if (record.source) {
                const src = document.createElement('div');
                src.className = 'source';
                src.innerHTML = record.source;
                overlay.appendChild(src);
            }
            chapter.appendChild(overlay);
            
            // Store overlay reference for fullscreen video fade
            if (record.fullscreenVideo) {
                container._fullscreenOverlay = overlay;
            }
        } else {
            const hasVideoIntro = record.videoIntro && record.videoIntro.enabled;
            
            if (hasVideoIntro) {
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'testimony-content';
                
                if (record.subtitle) {
                    const s = document.createElement('div');
                    s.className = 'subtitle';
                    s.innerText = record.subtitle;
                    contentWrapper.appendChild(s);
                }
                if (record.title) {
                    const t = document.createElement('h3');
                    t.innerHTML = record.title;
                    contentWrapper.appendChild(t);
                }
                if (record.description) {
                    const d = document.createElement('p');
                    d.innerHTML = record.description;
                    contentWrapper.appendChild(d);
                }
                if (record.quote) {
                    const q = document.createElement('blockquote');
                    q.innerHTML = record.quote;
                    contentWrapper.appendChild(q);
                }
                if (record.source) {
                    const src = document.createElement('div');
                    src.className = 'source';
                    src.innerHTML = record.source;
                    contentWrapper.appendChild(src);
                }
                
                chapter.appendChild(contentWrapper);
                
                const { videoIntro, video } = videoIntroManager.createVideoIntro(
                    chapter, 
                    record.videoIntro.path,
                    record.id
                );
                
                chapter._videoIntro = video;
                chapter._chapterId = record.id;
            } else {
                if (record.image) {
                    const img = new Image();
                    if (imageObserver) { img.setAttribute('data-src', record.image); imageObserver.observe(img); } 
                    else { img.src = record.image; }
                    container.appendChild(img);
                } else if (record.video) {
                    const vid = document.createElement('iframe');
                    vid.src = record.video;
                    vid.setAttribute('frameborder', '0');
                    vid.setAttribute('allowfullscreen', '');
                    container.appendChild(vid);
                }
                if (record.subtitle) {
                    const s = document.createElement('div');
                    s.className = 'subtitle';
                    s.innerText = record.subtitle;
                    chapter.appendChild(s);
                }
                if (record.title) {
                    const t = document.createElement('h3');
                    t.innerHTML = record.title;
                    chapter.appendChild(t);
                }
                if (record.description) {
                    const d = document.createElement('p');
                    d.innerHTML = record.description;
                    chapter.appendChild(d);
                }
                if (record.quote) {
                    const q = document.createElement('blockquote');
                    q.innerHTML = record.quote;
                    chapter.appendChild(q);
                }
                if (record.source) {
                    const src = document.createElement('div');
                    src.className = 'source';
                    src.innerHTML = record.source;
                    chapter.appendChild(src);
                }
            }
        }
        
        container.setAttribute('id', record.id);
        container.classList.add('step');
        if (idx === 0 && !config.title) { container.classList.add('active'); }
        container.appendChild(chapter);
        container.classList.add(alignments[record.alignment] || 'centered');
        if (record.hidden) { container.classList.add('hidden'); }
        features.appendChild(container);
    });
    
    story.appendChild(features);
    
    if (config.footer) {
        const footer = document.createElement('div');
        footer.setAttribute('id', 'footer');
        const p = document.createElement('p');
        p.innerHTML = config.footer;
        footer.appendChild(p);
        story.appendChild(footer);
    }
}

// ===== EVIDENCE GRID MANAGEMENT =====
let evidenceGridCreated = false;

function buildEvidenceGrid(gridContent) {
    if (evidenceGridCreated || !gridContent) return;
    evidenceGridCreated = true;
    
    const gridContainer = document.getElementById('evidence-grid-container');
    if (!gridContainer) return;
    
    gridContent.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'evidence-item';
        if (item.layout) { itemDiv.classList.add(item.layout); }
        
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';
        
        if (item.type === 'video') {
            const video = document.createElement('video');
            video.muted = true;
            video.loop = true; 
            video.setAttribute('playsinline', '');
            video.preload = 'metadata'; 
            video.setAttribute('data-src', item.src);
            video.src = item.src; 
            
            const overlay = document.createElement('div');
            overlay.className = 'video-overlay';
            const playIcon = document.createElement('div');
            playIcon.className = 'play-icon';
            overlay.appendChild(playIcon);
            
            if (videoObserver) videoObserver.observe(video);
            
            if (typeof videoManager !== 'undefined') {
                videoManager.createVideoHandlers(video, itemDiv);
            }
            
            mediaContainer.appendChild(video);
            mediaContainer.appendChild(overlay);
        } else {
            const img = document.createElement('img');
            img.alt = item.description;
            img.loading = 'lazy';
            
            if (imageObserver) { img.setAttribute('data-src', item.src); imageObserver.observe(img); } 
            else { img.src = item.src; }
            mediaContainer.appendChild(img);
        }
        
        const caption = document.createElement('div');
        caption.className = 'evidence-caption';
        caption.innerHTML = `<div class="date">${item.date}</div><div class="description">${item.description}</div>`;
        
        itemDiv.appendChild(mediaContainer);
        itemDiv.appendChild(caption);
        gridContainer.appendChild(itemDiv);

        if (index < (appConfig.performance.evidenceGridVisibleItems || 6)) {
            requestAnimationFrame(() => { itemDiv.classList.add('visible'); });
        } else {
            setTimeout(() => { 
                requestAnimationFrame(() => { itemDiv.classList.add('visible'); }); 
            }, (index - 6) * 100 + 500);
        }
    });
}

function cleanupEvidenceGrid() {
    const videos = document.querySelectorAll('.evidence-grid-container video');
    videos.forEach(video => {
        video.pause();
        if (videoObserver) videoObserver.unobserve(video);
    });
}

// ===== MAP INITIALIZATION =====
function initializeMap() {
    if (typeof mapboxgl === 'undefined') {
        console.error("❌ Mapbox GL JS is not loaded!");
        return null;
    }

    mapboxgl.accessToken = config.accessToken;
    
    const mode = config.performanceMode || 'auto';
    const isHighEnd = (typeof utils.isHighEndDevice === 'function') ? utils.isHighEndDevice() : !utils.isMobile();
    const useHighQuality = mode === 'high' || (mode === 'auto' && isHighEnd);
    
    console.log(`⚙️ Performance Mode: ${mode} (High Quality: ${useHighQuality})`);

    try {
        map = new mapboxgl.Map({
            container: 'map', 
            style: config.style,
            center: config.chapters[0].location.center,
            zoom: config.chapters[0].location.zoom,
            bearing: config.chapters[0].location.bearing || 0,
            pitch: config.chapters[0].location.pitch || 0,
            interactive: false, 
            projection: config.projection,
            antialias: useHighQuality,
            preserveDrawingBuffer: false,
            maxTileCacheSize: useHighQuality ? 150 : 50
        });
        
        if (!useHighQuality) map.setMaxZoom(16);
        
        if (config.inset && useHighQuality) {
            map.on('load', function() {
                try {
                    map.addControl(new GlobeMinimap(config.insetOptions), config.insetPosition);
                } catch (e) { console.warn("Minimap failed", e); }
            });
        }
        return map;
    } catch (e) {
        console.error("❌ Error creating map:", e);
        return null;
    }
}

function initializeMarker(map) {
    if (!map) return null;
    if (config.showMarkers) {
        const marker = new mapboxgl.Marker({ color: config.markerColor });
        marker.setLngLat(config.chapters[0].location.center).addTo(map);
        return marker;
    }
    return null;
}

// ===== DYNAMIC LAYER LOADER =====
function loadDynamicLayers(map) {
    console.log("🔄 Scanning config.js for GeoJSON files...");
    
    config.chapters.forEach(chapter => {
        if (chapter.geojsonUrl) {
            const rawInputs = Array.isArray(chapter.geojsonUrl) ? chapter.geojsonUrl : [chapter.geojsonUrl];
            
            rawInputs.forEach((input, index) => {
                let url, specificColor, showFill, showLine, showPoint, labelField, specificOpacity, specificWidth;
                let isCallout = false;

                if (typeof input === 'string') {
                    url = input;
                    specificColor = chapter.layerColor || '#e74c3c';
                    specificOpacity = 1.0;
                    specificWidth = 2;
                    showFill = chapter.showFill !== false;
                    showLine = chapter.showLine !== false;
                    showPoint = chapter.showPoint !== false;
                    labelField = chapter.labelField;
                } else {
                    url = input.url;
                    specificColor = input.color || chapter.layerColor || '#e74c3c';
                    specificOpacity = input.hasOwnProperty('opacity') ? input.opacity : 1.0;
                    specificWidth = input.lineWidth || 2;
                    showFill = input.hasOwnProperty('showFill') ? input.showFill : (chapter.showFill !== false);
                    showLine = input.hasOwnProperty('showLine') ? input.showLine : (chapter.showLine !== false);
                    showPoint = input.hasOwnProperty('showPoint') ? input.showPoint : (chapter.showPoint !== false);
                    labelField = input.labelField || chapter.labelField;
                    isCallout = input.callout === true;
                }

                const suffix = rawInputs.length > 1 ? `-${index}` : ''; 
                const sourceId = `src-${chapter.id}${suffix}`;
                const fillId = `layer-fill-${chapter.id}${suffix}`;
                const lineId = `layer-line-${chapter.id}${suffix}`;
                const pointId = `layer-circle-${chapter.id}${suffix}`;
                const labelId = `layer-symbol-${chapter.id}${suffix}`;

                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, { type: 'geojson', data: url });
                }

                if (!map.getLayer(fillId)) {
                    map.addLayer({
                        id: fillId, type: 'fill', source: sourceId,
                        layout: { 'visibility': 'none' },
                        paint: { 'fill-color': specificColor, 'fill-opacity': specificOpacity, 'fill-outline-color': '#000000' }
                    });
                }

                if (!map.getLayer(lineId)) {
                    map.addLayer({
                        id: lineId, type: 'line', source: sourceId,
                        layout: { 'visibility': 'none', 'line-join': 'round', 'line-cap': 'round' },
                        paint: { 'line-color': specificColor, 'line-width': specificWidth, 'line-opacity': specificOpacity }
                    });
                }

                if (!map.getLayer(pointId)) {
                    map.addLayer({
                        id: pointId, type: 'circle', source: sourceId,
                        layout: { 'visibility': 'none' },
                        paint: { 'circle-color': specificColor, 'circle-radius': isCallout ? 5 : 6, 'circle-stroke-width': 1, 'circle-stroke-color': '#fff', 'circle-opacity': specificOpacity }
                    });
                }

                if (labelField && !map.getLayer(labelId)) {
                    const layoutConfig = {
                        'visibility': 'none',
                        'text-field': ['get', labelField],
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        'text-allow-overlap': false,
                        'text-ignore-placement': false,
                        'text-optional': true,
                        'text-padding': 100,
                        'symbol-spacing': 500,
                        'text-max-width': 8,
                        'text-size': [
                            'interpolate', ['linear'], ['zoom'],
                            12, 0,
                            13, input.labelSize || 13
                        ]
                    };
                    const paintConfig = {
                        'text-color': input.labelColor || '#000000',
                        'text-opacity': specificOpacity
                    };

                    if (isCallout) {
                        layoutConfig['text-offset'] = [0, -2.5];
                        layoutConfig['text-anchor'] = 'bottom';
                        paintConfig['text-halo-color'] = '#ffffff';
                        paintConfig['text-halo-width'] = 10;
                        paintConfig['text-halo-blur'] = 0;
                        layoutConfig['text-allow-overlap'] = true;
                        layoutConfig['text-ignore-placement'] = true;
                        layoutConfig['text-size'] = input.labelSize || 13;
                    } else {
                        layoutConfig['text-offset'] = [0, -1.5];
                        layoutConfig['text-anchor'] = 'bottom';
                        paintConfig['text-halo-color'] = '#ffffff';
                        paintConfig['text-halo-width'] = 2;
                    }

                    map.addLayer({
                        id: labelId, type: 'symbol', source: sourceId,
                        layout: layoutConfig,
                        paint: paintConfig
                    });
                    
                    map.moveLayer(labelId);
                }

                if (!chapter.onChapterEnter) chapter.onChapterEnter = [];
                if (!chapter.onChapterExit) chapter.onChapterExit = [];
                
                const addTrigger = (id, isVisible, op) => {
                    if (isVisible) {
                        chapter.onChapterEnter.push({ layer: id, visibility: 'visible', opacity: op });
                        chapter.onChapterExit.push({ layer: id, visibility: 'none' });
                    }
                };

                addTrigger(fillId, showFill, specificOpacity > 0.6 ? 0.6 : specificOpacity);
                addTrigger(lineId, showLine, specificOpacity);
                addTrigger(pointId, showPoint, specificOpacity);
                if (labelField) {
                    addTrigger(labelId, true, 1);
                }
            });
        }
    });
}

// ===== MAPBOX DIRECTIONS API =====
async function fetchRoute(startCoords, endCoords) {
    console.log('🚗 Fetching route from:', startCoords, 'to:', endCoords);
    const accessToken = config.accessToken;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?geometries=geojson&access_token=${accessToken}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            console.log('✅ Route found with', data.routes[0].geometry.coordinates.length, 'points');
            return data.routes[0].geometry;
        } else {
            console.warn('⚠️ No route found, using straight line');
            return { type: 'LineString', coordinates: [startCoords, endCoords] };
        }
    } catch (error) {
        console.error('❌ Error fetching route:', error);
        return { type: 'LineString', coordinates: [startCoords, endCoords] };
    }
}

// ===== ANIMATED ROUTE =====
function animateRoute(routeLayerId, loop = false) {
    if (routeIsAnimating) {
        console.log('⏭️ Route animation already running');
        return;
    }
    
    console.log('🎬 Starting route animation');
    stopRouteAnimation();
    
    if (!map || !map.getLayer(routeLayerId)) {
        console.error('❌ Map or layer not found:', routeLayerId);
        return;
    }
    
    const source = map.getSource('rana-route-source');
    if (!source) {
        console.error('❌ Source not found');
        return;
    }
    
    if (!routeDataReady || !routeCoordinatesCache || routeCoordinatesCache.length < 2) {
        console.warn('⏳ Route data not ready, retrying...');
        setTimeout(() => animateRoute(routeLayerId, loop), 500);
        return;
    }
    
    const fullRoute = routeCoordinatesCache;
    const totalPoints = fullRoute.length;
    
    routeIsAnimating = true;
    
    const animationDuration = 5000;
    let startTime = null;
    let lastPointCount = 0;
    
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    const drawRoute = (timestamp) => {
        if (!startTime) startTime = timestamp;
        
        const elapsed = timestamp - startTime;
        const rawProgress = Math.min(elapsed / animationDuration, 1);
        const easedProgress = easeInOutCubic(rawProgress);
        const pointsToShow = Math.max(2, Math.floor(totalPoints * easedProgress));
        
        if (pointsToShow !== lastPointCount) {
            lastPointCount = pointsToShow;
            try {
                source.setData({
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'LineString', coordinates: fullRoute.slice(0, pointsToShow) }
                });
            } catch (e) {
                console.error('❌ Error updating route:', e);
                stopRouteAnimation();
                return;
            }
        }
        
        if (rawProgress < 1) {
            routeAnimationFrame = requestAnimationFrame(drawRoute);
        } else {
            // Complete
            try {
                source.setData({
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'LineString', coordinates: fullRoute }
                });
            } catch (e) { /* ignore */ }
            
            if (loop) {
                // Pause then restart
                setTimeout(() => {
                    if (routeIsAnimating) {
                        lastPointCount = 0;
                        startTime = null;
                        routeAnimationFrame = requestAnimationFrame(drawRoute);
                    }
                }, 2000);
            } else {
                routeIsAnimating = false;
            }
        }
    };
    
    routeAnimationFrame = requestAnimationFrame(drawRoute);
}

function stopRouteAnimation() {
    if (routeAnimationFrame) {
        cancelAnimationFrame(routeAnimationFrame);
        routeAnimationFrame = null;
    }
    routeIsAnimating = false;
}

function resetRouteDisplay() {
    const source = map?.getSource('rana-route-source');
    if (source && routeCoordinatesCache && routeCoordinatesCache.length > 0) {
        try {
            source.setData({
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: [routeCoordinatesCache[0]] }
            });
        } catch (e) { /* ignore */ }
    }
}

// ===== SCROLL HANDLING =====
function initializeScrollama(map, marker) {
    if (!map) return;
    const scroller = scrollama();
    
    map.on("load", function() {
        console.log("🗺️ Map loaded successfully!");
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden');
        
        // West Bank layer
        map.addSource('west-bank-source', { type: 'geojson', data: './assets/WB.geojson' });
        map.addLayer({
            id: 'west-bank-layer', type: 'fill', source: 'west-bank-source',
            layout: { 'visibility': 'none' },
            paint: { 'fill-color': '#e74c3c', 'fill-opacity': 0.6, 'fill-outline-color': '#000000' }
        });

        // Rana route source
        map.addSource('rana-route-source', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
        });
        
        // Fetch route
        const startPoint = [35.310094, 32.125524];
        const endPoint = [35.276064, 32.171868];
        
        fetchRoute(startPoint, endPoint).then(routeGeometry => {
            if (routeGeometry.coordinates) {
                routeCoordinatesCache = routeGeometry.coordinates;
                routeDataReady = true;
                console.log('✅ Route cached:', routeCoordinatesCache.length, 'points');
            }
        });
        
        // Route line layer - STARTS HIDDEN
        map.addLayer({
            id: 'ambulance-route-1',
            type: 'line',
            source: 'rana-route-source',
            layout: { 'visibility': 'none', 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#e74c3c', 'line-width': 5, 'line-opacity': 1 }
        });
        
        // Markers source
        map.addSource('rana-markers-source', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { type: 'assault' }, geometry: { type: 'Point', coordinates: startPoint } },
                    { type: 'Feature', properties: { type: 'detention' }, geometry: { type: 'Point', coordinates: endPoint } }
                ]
            }
        });
        
        // Markers layer - STARTS HIDDEN
        map.addLayer({
            id: 'incident-1-marker',
            type: 'circle',
            source: 'rana-markers-source',
            layout: { 'visibility': 'none' },
            paint: {
                'circle-color': ['match', ['get', 'type'], 'assault', '#e74c3c', 'detention', '#c0392b', '#333'],
                'circle-radius': 10,
                'circle-stroke-width': 3,
                'circle-stroke-color': '#fff'
            }
        });
        
        // Pulse layer - STARTS HIDDEN
        map.addLayer({
            id: 'incident-1-marker-pulse',
            type: 'circle',
            source: 'rana-markers-source',
            layout: { 'visibility': 'none' },
            paint: {
                'circle-color': 'transparent',
                'circle-radius': 15,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#e74c3c',
                'circle-stroke-opacity': 0.5
            }
        });

        // Dynamic layers
        loadDynamicLayers(map);
        
        // 3D Terrain
        const mode = config.performanceMode || 'auto';
        const isHighEnd = (typeof utils.isHighEndDevice === 'function') ? utils.isHighEndDevice() : !utils.isMobile();
        const useHighQuality = mode === 'high' || (mode === 'auto' && isHighEnd);

        if (config.use3dTerrain && useHighQuality) {
            try {
                map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            } catch(e) { /* ignore */ }
        }
        
        // Scrollama setup
        scroller.setup({ 
            step: '.step', 
            offset: utils.isMobile() ? appConfig.mobile.scrollOffset : appConfig.mobile.desktopScrollOffset,
            progress: true, 
            debug: false 
        })
        .onStepEnter(async (response) => {
            if (pendingAnimation) { map.stop(); pendingAnimation = null; }

            const current_chapter = config.chapters.findIndex(chap => chap.id === response.element.id);
            const chapter = config.chapters[current_chapter];
            if (!chapter) return;

            // Store previous before updating current
            previousChapterId = currentChapterId;
            currentChapterId = response.element.id;
            response.element.classList.add('active');
            
            console.log('📍 ENTER:', currentChapterId, '| PREVIOUS:', previousChapterId);
            
            // Determine Rana state
            const nowInRana = isRanaChapter(currentChapterId);
            const wasInRana = isRanaChapter(previousChapterId);
            
            // SHOW Rana layers when entering Rana from non-Rana
            if (nowInRana && !wasInRana) {
                console.log('🚑 SHOWING Rana layers');
                showRanaLayers();
                resetRouteDisplay();
                setTimeout(() => animateRoute('ambulance-route-1', true), 300);
            }
            
            // HIDE Rana layers when leaving Rana to non-Rana
            if (!nowInRana && wasInRana) {
                console.log('🚑 HIDING Rana layers');
                hideRanaLayers();
            }
            
            // Prefetch
            const prefetchCount = config.prefetchDistance || 1;
            for(let i = 1; i <= prefetchCount; i++) {
                if(current_chapter + i < config.chapters.length) preloadChapterAssets(current_chapter + i);
            }
            
            // Movement
            const currentCenter = map.getCenter();
            const newCenter = chapter.location.center;
            const isMoving = utils.hasLocationChanged(currentCenter, newCenter) || Math.abs(map.getZoom() - chapter.location.zoom) > 0.1;
            
            const triggerLayers = () => {
                if (currentChapterId !== response.element.id) return;
                
                if (chapter.onChapterEnter) {
                    chapter.onChapterEnter.forEach(layerConfig => {
                        // Skip Rana layers - handled separately
                        if (RANA_LAYERS.includes(layerConfig.layer)) return;
                        setLayerOpacity(layerConfig);
                    });
                }
                
                // Video intro
                if (chapter.videoIntro && chapter.videoIntro.enabled && !videoIntroManager.hasPlayedVideo(chapter.id)) {
                    const chapterElement = response.element.querySelector('div');
                    const video = chapterElement._videoIntro;
                    if (video) videoIntroManager.tryAutoplay(video);
                }
                
                if (chapter.id === 'evidence-grid') {
                    buildEvidenceGrid(chapter.gridContent);
                    if (typeof videoManager !== 'undefined') videoManager.resetVideos();
                }
                
                // Fullscreen video - text appears at END
                if (chapter.fullscreenVideo) {
                    const video = response.element._fullscreenVideo;
                    const overlay = response.element._fullscreenOverlay;
                    
                    if (video) {
                        video.currentTime = 0;
                        
                        // Hide overlay initially (text hidden while video plays)
                        if (overlay) {
                            overlay.classList.add('hidden-initially');
                            overlay.classList.remove('show-with-bg');
                        }
                        
                        video.play().then(() => {
                            console.log('✅ Fullscreen video playing');
                        }).catch(e => {
                            console.log('⚠️ Fullscreen video autoplay prevented:', e);
                            // If autoplay fails, show overlay immediately
                            if (overlay) {
                                overlay.classList.remove('hidden-initially');
                                overlay.classList.add('show-with-bg');
                            }
                        });
                        
                        // Show overlay with black background when video ends
                        video.onended = () => {
                            console.log('🎬 Fullscreen video ended, showing text');
                            if (overlay) {
                                overlay.classList.remove('hidden-initially');
                                overlay.classList.add('show-with-bg');
                            }
                        };
                    }
                }
            };

            if (isMoving) {
                map[chapter.mapAnimation || 'flyTo'](chapter.location);
                map.once('moveend', () => {
                    const activeStep = document.querySelector('.step.active');
                    if (activeStep && activeStep.id === response.element.id) triggerLayers();
                });
            } else {
                triggerLayers();
            }
            
            if (marker) marker.setLngLat(chapter.location.center);
            
            if (chapter.rotateAnimation) {
                map.once('moveend', () => {
                    if (currentChapterId === response.element.id) {
                        map.rotateTo(map.getBearing() + 180, { duration: 30000, easing: t => t });
                    }
                });
            }
            
            const progress = ((current_chapter + 1) / config.chapters.length) * 100;
            document.getElementById('progress').style.width = progress + '%';
        })
        .onStepExit(response => {
            const chapter = config.chapters.find(chap => chap.id === response.element.id);
            response.element.classList.remove('active');
            
            if (!chapter) return;
            
            console.log('📤 EXIT:', chapter.id);
            
            if (chapter.id === 'evidence-grid') {
                cleanupEvidenceGrid();
                if (typeof videoManager !== 'undefined') videoManager.cleanupVideos();
            }
            
            // Video cleanup
            if (chapter.videoIntro && chapter.videoIntro.enabled) {
                const chapterElement = response.element.querySelector('div');
                const video = chapterElement._videoIntro;
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                    video.muted = true;
                }
            }
            
            // Fullscreen video cleanup
            if (chapter.fullscreenVideo) {
                const video = response.element._fullscreenVideo;
                const overlay = response.element._fullscreenOverlay;
                
                if (video) {
                    video.pause();
                    video.muted = true;
                    video.onended = null; // Remove listener
                }
                
                // Reset overlay for next time
                if (overlay) {
                    overlay.classList.remove('hidden-initially', 'show-with-bg');
                }
            }
            
            // Normal layer exit - skip Rana layers
            if (chapter.onChapterExit) {
                chapter.onChapterExit.forEach(layerConfig => {
                    if (RANA_LAYERS.includes(layerConfig.layer)) return;
                    setLayerOpacity(layerConfig);
                });
            }
        });
    });

    map.on('error', function(e) {
        console.error("Mapbox Error:", e);
        document.getElementById('loader').classList.add('hidden');
    });
}

// ===== HELPER FUNCTIONS =====
function getLayerPaintType(layer) {
    try {
        if (map && map.getLayer && map.getLayer(layer)) {
            const layerType = map.getLayer(layer).type;
            return layerTypes[layerType];
        }
        return [];
    } catch (e) { return []; }
}

function setLayerOpacity(layer) {
    if (!map || !map.getLayer) return;
    if (!map.getLayer(layer.layer)) return;
    
    try {
        if (layer.hasOwnProperty('visibility')) {
            map.setLayoutProperty(layer.layer, 'visibility', layer.visibility);
            return;
        }
        if (layer.hasOwnProperty('opacity')) {
            const paintProps = getLayerPaintType(layer.layer);
            paintProps.forEach(function(prop) {
                if (layer.duration) {
                    map.setPaintProperty(layer.layer, prop + "-transition", { duration: layer.duration });
                }
                map.setPaintProperty(layer.layer, prop, layer.opacity);
            });
        }
    } catch (e) { 
        console.error('❌ Error in setLayerOpacity:', e); 
    }
}

// ===== CLEANUP =====
function cleanup() {
    stopRouteAnimation();
    if (videoObserver) { videoObserver.disconnect(); videoObserver = null; }
    if (imageObserver) { imageObserver.disconnect(); imageObserver = null; }
    if (map) { map.remove(); map = null; }
}

window.addEventListener('beforeunload', cleanup);

// ===== INITIALIZATION =====
function initializeApp() {
    console.log("🚀 Initializing App...");
    initializeObservers();
    
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && !loader.classList.contains('hidden')) loader.classList.add('hidden');
    }, 5000);

    try {
        createStoryElements();
        initializeMap(); 
        
        if(map) {
            const marker = initializeMarker(map);
            initializeScrollama(map, marker);
        }
    } catch (e) {
        console.error("🔥 CRITICAL INIT ERROR:", e);
        document.getElementById('loader').classList.add('hidden');
    }
}