// ===== GLOBAL VARIABLES =====
let map;
let currentChapterId = null;
let pendingAnimation = null;
let videoObserver = null;
let imageObserver = null;

// ===== INTERSECTION OBSERVERS FOR PERFORMANCE =====
function initializeObservers() {
    // Video intersection observer for auto-play/pause
    if ('IntersectionObserver' in window) {
        videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(e => {
                        console.log('Autoplay prevented:', e);
                        const overlay = video.nextElementSibling;
                        if (overlay && overlay.classList.contains('video-overlay')) {
                            overlay.style.opacity = '1';
                        }
                    });
                } else {
                    video.pause();
                    if (video.currentTime > 0) {
                        video.currentTime = 0;
                    }
                }
            });
        }, { 
            threshold: 0.5,
            rootMargin: '50px'
        });
        
        // Image lazy loading observer
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
        }, {
            rootMargin: '100px'
        });
    }
}

// ===== ASSET PRELOADING =====
function preloadChapterAssets(chapterIndex) {
    if (!config?.chapters) return;
    
    const chapter = config.chapters[chapterIndex];
    if (!chapter) return;
    
    // Preload main chapter image
    if (chapter.image) {
        const img = new Image();
        img.src = chapter.image;
    }
    
    // Preload first few grid items
    if (chapter.gridContent && Array.isArray(chapter.gridContent)) {
        chapter.gridContent.slice(0, 3).forEach(item => {
            if (item.type === 'image' && item.src) {
                const img = new Image();
                img.src = item.src;
            }
        });
    }
}

// ===== DOM CREATION WITH LAZY LOADING =====
function createStoryElements() {
    const story = document.getElementById('story');
    const features = document.createElement('div');
    features.setAttribute('id', 'features');
    
    if (typeof config === 'undefined') {
        console.error("❌ CRITICAL ERROR: config.js is not loaded!");
        showError("Configuration file failed to load. Please refresh the page.");
        return;
    }

    if (config.title || config.subtitle || config.byline) {
        const header = document.createElement('div');
        header.setAttribute('id', 'header');
        
        if (config.title) {
            const titleText = document.createElement('h1');
            titleText.innerText = config.title;
            header.appendChild(titleText);
        }
        if (config.subtitle) {
            const subtitleText = document.createElement('h2');
            subtitleText.innerText = config.subtitle;
            header.appendChild(subtitleText);
        }
        if (config.byline) {
            const bylineText = document.createElement('p');
            bylineText.className = 'byline';
            bylineText.innerText = config.byline;
            header.appendChild(bylineText);
        }
        
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        header.appendChild(scrollIndicator);
        story.appendChild(header);
    }

    config.chapters.forEach((record, idx) => {
        const container = document.createElement('div');
        const chapter = document.createElement('div');
        
        if (record.id === 'evidence-grid') {
            if (record.title) {
                const title = document.createElement('h3');
                title.innerHTML = record.title;
                chapter.appendChild(title);
            }
            if (record.subtitle) {
                const subtitle = document.createElement('div');
                subtitle.className = 'subtitle';
                subtitle.innerHTML = record.subtitle;
                chapter.appendChild(subtitle);
            }
            const gridContainer = document.createElement('div');
            gridContainer.className = 'evidence-grid-container';
            gridContainer.id = 'evidence-grid-container';
            chapter.appendChild(gridContainer);
        } else if (record.alignment === 'full') {
            if (record.image) {
                const img = new Image();
                img.loading = 'lazy';
                // Use lazy loading with observer if available
                if (imageObserver) {
                    img.setAttribute('data-src', record.image);
                    imageObserver.observe(img);
                } else {
                    img.src = record.image;
                }
                container.appendChild(img);
            }
            const overlayContent = document.createElement('div');
            overlayContent.className = 'overlay-content';
            if (record.title) {
                const title = document.createElement('h3');
                title.innerHTML = record.title;
                overlayContent.appendChild(title);
            }
            if (record.description) {
                const desc = document.createElement('p');
                desc.innerHTML = record.description;
                overlayContent.appendChild(desc);
            }
            chapter.appendChild(overlayContent);
        } else {
            if (record.image) {
                const img = new Image();
                img.loading = 'lazy';
                // Use lazy loading with observer if available
                if (imageObserver) {
                    img.setAttribute('data-src', record.image);
                    imageObserver.observe(img);
                } else {
                    img.src = record.image;
                }
                container.appendChild(img);
            } else if (record.video) {
                const video = document.createElement('iframe');
                video.src = record.video;
                video.setAttribute('frameborder', '0');
                video.setAttribute('allow', 'autoplay; fullscreen');
                video.setAttribute('allowfullscreen', '');
                video.loading = 'lazy';
                container.appendChild(video);
            }
            if (record.subtitle) {
                const subtitle = document.createElement('div');
                subtitle.className = 'subtitle';
                subtitle.innerText = record.subtitle;
                chapter.appendChild(subtitle);
            }
            if (record.title) {
                const title = document.createElement('h3');
                title.innerHTML = record.title;
                chapter.appendChild(title);
            }
            if (record.description) {
                const descElement = document.createElement('p');
                descElement.innerHTML = record.description;
                chapter.appendChild(descElement);
            }
            if (record.quote) {
                const quote = document.createElement('blockquote');
                quote.innerHTML = record.quote;
                chapter.appendChild(quote);
            }
            if (record.source) {
                const source = document.createElement('div');
                source.className = 'source';
                source.innerHTML = record.source;
                chapter.appendChild(source);
            }
        }
        
        container.setAttribute('id', record.id);
        container.classList.add('step');
        if (idx === 0 && !config.title) { container.classList.add('active'); }
        container.appendChild(chapter);
        container.classList.add(alignments[record.alignment] || 'centered');
        if (record.hidden) { container.classList.add('hidden'); }
        features.appendChild(container);
        
        // Preload assets for next chapter
        if (idx < config.chapters.length - 1) {
            setTimeout(() => preloadChapterAssets(idx + 1), 1000);
        }
    });
    
    story.appendChild(features);
    
    if (config.footer) {
        const footer = document.createElement('div');
        footer.setAttribute('id', 'footer');
        const footerText = document.createElement('p');
        footerText.innerHTML = config.footer;
        footer.appendChild(footerText);
        story.appendChild(footer);
    }
}

// ===== ENHANCED EVIDENCE GRID MANAGEMENT =====
let evidenceGridCreated = false;
let gridLoadingBatch = false;

function buildEvidenceGrid(gridContent) {
    if (evidenceGridCreated || !gridContent) return;
    evidenceGridCreated = true;
    
    const gridContainer = document.getElementById('evidence-grid-container');
    if (!gridContainer) return;
    
    // Virtual scrolling implementation for large grids
    const visibleCount = appConfig?.performance?.evidenceGridVisibleItems || 6;
    const batchSize = 6;
    let currentIndex = 0;
    
    function createGridItem(item, index) {
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
            
            // Lazy load video
            if (index < visibleCount) {
                video.src = item.src;
            }
            
            // Add to observer if available
            if (videoObserver && index >= visibleCount) {
                videoObserver.observe(video);
            }
            
            const overlay = document.createElement('div');
            overlay.className = 'video-overlay';
            const playIcon = document.createElement('div');
            playIcon.className = 'play-icon';
            overlay.appendChild(playIcon);
            
            // Manual play handler
            overlay.addEventListener('click', () => {
                if (!video.src && video.getAttribute('data-src')) {
                    video.src = video.getAttribute('data-src');
                }
                video.play().then(() => {
                    overlay.style.opacity = '0';
                }).catch(e => console.error('Video play failed:', e));
            });
            
            if (typeof videoManager !== 'undefined') {
                videoManager.createVideoHandlers(video, itemDiv);
            }
            
            mediaContainer.appendChild(video);
            mediaContainer.appendChild(overlay);
        } else {
            const img = document.createElement('img');
            img.alt = item.description;
            img.loading = 'lazy';
            
            if (imageObserver && index >= visibleCount) {
                img.setAttribute('data-src', item.src);
                imageObserver.observe(img);
            } else {
                img.src = item.src;
            }
            
            mediaContainer.appendChild(img);
        }
        
        const caption = document.createElement('div');
        caption.className = 'evidence-caption';
        caption.innerHTML = `<div class="date">${item.date}</div><div class="description">${item.description}</div>`;
        
        itemDiv.appendChild(mediaContainer);
        itemDiv.appendChild(caption);
        gridContainer.appendChild(itemDiv);
        
        // Stagger animations
        const delay = index < visibleCount ? 0 : 
            (index - visibleCount) * (appConfig?.performance?.evidenceGridItemDelay || 150);
        
        if (index < visibleCount) {
            requestAnimationFrame(() => { itemDiv.classList.add('visible'); });
        } else {
            setTimeout(() => { 
                requestAnimationFrame(() => { itemDiv.classList.add('visible'); }); 
            }, delay + 500);
        }
        
        return itemDiv;
    }
    
    function loadBatch() {
        if (gridLoadingBatch) return;
        gridLoadingBatch = true;
        
        const endIndex = Math.min(currentIndex + batchSize, gridContent.length);
        
        for (let i = currentIndex; i < endIndex; i++) {
            createGridItem(gridContent[i], i);
        }
        currentIndex = endIndex;
        gridLoadingBatch = false;
        
        // Load more if needed
        if (currentIndex < gridContent.length) {
            if (window.requestIdleCallback) {
                requestIdleCallback(() => loadBatch(), { timeout: 1000 });
            } else {
                setTimeout(() => loadBatch(), 100);
            }
        }
    }
    
    // Start loading
    loadBatch();
}

function cleanupEvidenceGrid() {
    const videos = document.querySelectorAll('.evidence-grid-container video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
        if (videoObserver) {
            videoObserver.unobserve(video);
        }
    });
}

// ===== GEOJSON LOADER WITH RETRY =====
async function loadGeoJSONWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (e) {
            console.warn(`Attempt ${i + 1} failed for ${url}:`, e);
            if (i === maxRetries - 1) {
                console.error(`Failed to load GeoJSON after ${maxRetries} attempts: ${url}`);
                return null;
            }
            // Exponential backoff
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        }
    }
}

// ===== MAP INITIALIZATION =====
function initializeMap() {
    if (typeof mapboxgl === 'undefined') {
        console.error("❌ Mapbox GL JS is not loaded!");
        showError("Map library failed to load. Please check your internet connection.");
        return null;
    }

    mapboxgl.accessToken = config.accessToken;
    
    // Mobile-specific settings
    const isMobile = utils.isMobile();
    
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
            // Performance optimizations
            antialias: !isMobile,
            preserveDrawingBuffer: false,
            refreshExpiredTiles: false,
            maxTileCacheSize: isMobile ? 50 : 100,
            trackResize: true
        });
        
        // Set zoom limits on mobile
        if (isMobile) {
            map.setMaxZoom(16);
            map.setMinZoom(3);
        }
        
        if (config.inset && !isMobile) {
            map.on('load', function() {
                try {
                    map.addControl(new GlobeMinimap(config.insetOptions), config.insetPosition);
                } catch (e) { console.warn("Minimap failed to load", e); }
            });
        }
        return map;
    } catch (e) {
        console.error("❌ Error creating map:", e);
        showError("Failed to initialize map. Please refresh the page.");
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

// ===== ENHANCED DYNAMIC LAYER LOADER =====
async function loadDynamicLayers(map) {
    console.log("🔄 Scanning config.js for GeoJSON files...");
    
    for (const chapter of config.chapters) {
        if (chapter.geojsonUrl) {
            const rawInputs = Array.isArray(chapter.geojsonUrl) ? chapter.geojsonUrl : [chapter.geojsonUrl];
            
            for (let index = 0; index < rawInputs.length; index++) {
                const input = rawInputs[index];
                let url, specificColor, showFill, showLine, showPoint, labelField, specificOpacity, specificWidth;

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
                }

                const suffix = rawInputs.length > 1 ? `-${index}` : '';
                const sourceId = `src-${chapter.id}${suffix}`;
                const fillId = `layer-fill-${chapter.id}${suffix}`;
                const lineId = `layer-line-${chapter.id}${suffix}`;
                const pointId = `layer-circle-${chapter.id}${suffix}`;
                const labelId = `layer-symbol-${chapter.id}${suffix}`;

                // Load GeoJSON with retry
                if (!map.getSource(sourceId)) {
                    const geojsonData = await loadGeoJSONWithRetry(url);
                    if (geojsonData) {
                        try {
                            map.addSource(sourceId, { 
                                type: 'geojson', 
                                data: geojsonData,
                                generateId: true
                            });
                        } catch (e) {
                            console.error(`Failed to add source ${sourceId}:`, e);
                            continue;
                        }
                    } else {
                        console.error(`Skipping layer for ${chapter.id} due to failed GeoJSON load`);
                        continue;
                    }
                }

                // Add layers with error handling
                const addLayerSafely = (layerConfig) => {
                    try {
                        if (!map.getLayer(layerConfig.id)) {
                            map.addLayer(layerConfig);
                        }
                    } catch (e) {
                        console.error(`Failed to add layer ${layerConfig.id}:`, e);
                    }
                };

                // FILL
                addLayerSafely({
                    id: fillId,
                    type: 'fill',
                    source: sourceId,
                    layout: { 'visibility': 'none' },
                    paint: {
                        'fill-color': specificColor,
                        'fill-opacity': specificOpacity,
                        'fill-outline-color': '#000000'
                    }
                });

                // LINE
                addLayerSafely({
                    id: lineId,
                    type: 'line',
                    source: sourceId,
                    layout: {
                        'visibility': 'none',
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': specificColor,
                        'line-width': specificWidth,
                        'line-opacity': specificOpacity
                    }
                });

                // POINT
                addLayerSafely({
                    id: pointId,
                    type: 'circle',
                    source: sourceId,
                    layout: { 'visibility': 'none' },
                    paint: {
                        'circle-color': specificColor,
                        'circle-radius': 6,
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#ffffff',
                        'circle-opacity': specificOpacity
                    }
                });

                // LABEL
                if (labelField) {
                    addLayerSafely({
                        id: labelId,
                        type: 'symbol',
                        source: sourceId,
                        layout: {
                            'visibility': 'none',
                            'text-field': ['get', labelField],
                            'text-size': 13,
                            'text-offset': [0, 1],
                            'text-anchor': 'top',
                            'text-allow-overlap': false
                        },
                        paint: {
                            'text-color': '#000000',
                            'text-halo-color': '#ffffff',
                            'text-halo-width': 2,
                            'text-opacity': specificOpacity
                        }
                    });
                }

                // Setup Triggers
                if (!chapter.onChapterEnter) chapter.onChapterEnter = [];
                if (!chapter.onChapterExit) chapter.onChapterExit = [];
                
                const addTrigger = (id, isVisible, opacityVal) => {
                    if (isVisible) {
                        chapter.onChapterEnter.push({ layer: id, visibility: 'visible', opacity: opacityVal });
                        chapter.onChapterExit.push({ layer: id, visibility: 'none' });
                    }
                };

                addTrigger(fillId, showFill, specificOpacity > 0.6 ? 0.6 : specificOpacity);
                addTrigger(lineId, showLine, specificOpacity);
                addTrigger(pointId, showPoint, specificOpacity);
                if (labelField) addTrigger(labelId, true, 1);
            }
        }
    }
}

// ===== ENHANCED SCROLL HANDLING =====
function initializeScrollama(map, marker) {
    if (!map) return;
    
    const scroller = scrollama();
    const isMobile = utils.isMobile();
    
    // Debounced scroll handlers
    const debouncedStepEnter = utils.debounce(handleStepEnter, 100);
    const debouncedStepExit = utils.debounce(handleStepExit, 100);
    
    function handleStepEnter(response) {
        // Cancel any pending animations
        if (pendingAnimation) {
            map.stop();
            pendingAnimation = null;
        }
        
        const current_chapter = config.chapters.findIndex(chap => chap.id === response.element.id);
        const chapter = config.chapters[current_chapter];
        
        if (!chapter) return;
        
        currentChapterId = response.element.id;
        response.element.classList.add('active');
        
        // Preload next chapter assets
        if (current_chapter < config.chapters.length - 1) {
            preloadChapterAssets(current_chapter + 1);
        }
        
        const currentCenter = map.getCenter();
        const newCenter = chapter.location.center;
        
        const isMoving = utils.hasLocationChanged(currentCenter, newCenter) || 
                       Math.abs(map.getZoom() - chapter.location.zoom) > 0.1;
        
        const triggerLayers = () => {
            // Double-check we're still on the same chapter
            if (currentChapterId !== response.element.id) return;
            
            if (chapter.onChapterEnter && chapter.onChapterEnter.length > 0) {
                chapter.onChapterEnter.forEach(setLayerOpacity);
            }
            if (chapter.id === 'evidence-grid') {
                buildEvidenceGrid(chapter.gridContent);
                if (typeof videoManager !== 'undefined') {
                    videoManager.resetVideos();
                }
            }
        };

        if (isMoving) {
            // Adjust animation duration based on device
            const duration = isMobile ? 1000 : 2000;
            const animationOptions = {
                ...chapter.location,
                duration: duration,
                essential: true
            };
            
            pendingAnimation = response.element.id;
            
            map[chapter.mapAnimation || 'flyTo'](animationOptions);
            
            map.once('moveend', () => {
                // Check if we're still on the same chapter after animation
                const activeStep = document.querySelector('.step.active');
                if (activeStep && activeStep.id === response.element.id) {
                    triggerLayers();
                }
                if (pendingAnimation === response.element.id) {
                    pendingAnimation = null;
                }
            });
        } else {
            triggerLayers();
        }
        
        if (marker) {
            marker.setLngLat(chapter.location.center);
        }
        
        if (chapter.rotateAnimation) {
            map.once('moveend', () => {
                if (currentChapterId === response.element.id) {
                    const rotateNumber = map.getBearing();
                    map.rotateTo(rotateNumber + 180, { 
                        duration: 30000, 
                        easing: t => t 
                    });
                }
            });
        }
        
        // Update progress bar
        const progress = ((current_chapter + 1) / config.chapters.length) * 100;
        const progressBar = document.getElementById('progress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }
    
    function handleStepExit(response) {
        const chapter = config.chapters.find(chap => chap.id === response.element.id);
        response.element.classList.remove('active');
        
        if (chapter) {
            if (chapter.id === 'evidence-grid') {
                cleanupEvidenceGrid();
                if (typeof videoManager !== 'undefined') {
                    videoManager.cleanupVideos();
                }
            }
            if (chapter.onChapterExit && chapter.onChapterExit.length > 0) {
                chapter.onChapterExit.forEach(setLayerOpacity);
            }
        }
    }
    
    map.on("load", async function() {
        console.log("🗺️ Map loaded successfully!");
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden');
        
        // Load hardcoded West Bank layer with retry
        try {
            const wbData = await loadGeoJSONWithRetry('./assets/WB.geojson');
            if (wbData) {
                map.addSource('west-bank-source', {
                    type: 'geojson',
                    data: wbData
                });
                
                map.addLayer({
                    id: 'west-bank-layer',
                    type: 'fill',
                    source: 'west-bank-source',
                    layout: { 'visibility': 'none' },
                    paint: {
                        'fill-color': '#e74c3c',
                        'fill-opacity': 0.6,
                        'fill-outline-color': '#000000'
                    }
                });
                
                map.on('sourcedata', function(e) {
                    if (e.sourceId === 'west-bank-source' && e.isSourceLoaded) {
                        const f = map.querySourceFeatures('west-bank-source');
                        if(f && f.length > 0) console.log(`✅ WB GeoJSON loaded: ${f.length} features.`);
                    }
                });
            }
        } catch (e) {
            console.error("Failed to load West Bank layer:", e);
        }

        // Load dynamic layers
        await loadDynamicLayers(map);
        
        // Add 3D terrain only on desktop and if enabled
        if (config.use3dTerrain && !isMobile) {
            try {
                map.addSource('mapbox-dem', { 
                    'type': 'raster-dem', 
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1', 
                    'tileSize': 512, 
                    'maxzoom': 14 
                });
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            } catch(e) { 
                console.warn("Terrain failed to load", e); 
            }
        }
        
        // Setup scrollama
        scroller.setup({ 
            step: '.step', 
            offset: utils.isMobile() ? 
                (appConfig?.mobile?.scrollOffset || 0.7) : 
                (appConfig?.mobile?.desktopScrollOffset || 0.5),
            progress: true, 
            debug: false 
        })
        .onStepEnter(debouncedStepEnter)
        .onStepExit(debouncedStepExit);
        
        // Handle resize events
        window.addEventListener('resize', utils.debounce(() => {
            scroller.resize();
        }, 250));
    });

    map.on('error', function(e) {
        console.error("Mapbox Error:", e);
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
        
        // Show user-friendly error message for common issues
        if (e.error && e.error.status === 401) {
            showError("Map authentication failed. Please check your access token.");
        }
    });
}

// ===== HELPER FUNCTIONS =====
function getLayerPaintType(layer) {
    try {
        if (map && map.getLayer && map.getLayer(layer)) {
            const layerType = map.getLayer(layer).type;
            return layerTypes[layerType] || [];
        }
        return [];
    } catch (e) {
        console.warn('Layer not found:', layer);
        return [];
    }
}

function setLayerOpacity(layer) {
    if (!map || !map.getLayer) { return; }
    if (!map.getLayer(layer.layer)) { return; }
    
    try {
        if (layer.hasOwnProperty('visibility')) {
            map.setLayoutProperty(layer.layer, 'visibility', layer.visibility);
            return; 
        }
        
        if (layer.hasOwnProperty('opacity')) {
            const paintProps = getLayerPaintType(layer.layer);
            if (paintProps.length === 0) return;
            
            paintProps.forEach(function(prop) {
                if (layer.duration) {
                    map.setPaintProperty(layer.layer, prop + "-transition", { duration: layer.duration });
                }
                map.setPaintProperty(layer.layer, prop, layer.opacity);
            });
        }
    } catch (e) {
        console.warn('Error setting layer:', layer.layer, e);
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        font-family: sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => errorDiv.remove(), 500);
    }, 5000);
}

// ===== APPLICATION INITIALIZATION =====
function initializeApp() {
    console.log("🚀 Initializing Enhanced Scrollytelling App...");
    
    // Initialize observers if supported
    initializeObservers();
    
    // Force hide loader after timeout
    const loaderTimeout = setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && !loader.classList.contains('hidden')) {
            console.warn("⚠️ Loader forced hidden by timeout");
            loader.classList.add('hidden');
        }
    }, 5000);

    try {
        // Check for required dependencies
        if (typeof config === 'undefined') {
            throw new Error("Configuration not loaded");
        }
        
        if (typeof mapboxgl === 'undefined') {
            throw new Error("Mapbox GL not loaded");
        }
        
        // Create story elements
        createStoryElements();
        
        // Initialize map
        const mapInstance = initializeMap();
        
        if(mapInstance) {
            const marker = initializeMarker(mapInstance);
            initializeScrollama(mapInstance, marker);
            
            // Clear timeout if map loads successfully
            mapInstance.on('load', () => {
                clearTimeout(loaderTimeout);
            });
        } else {
            throw new Error("Map initialization failed");
        }
    } catch (e) {
        console.error("🔥 CRITICAL INIT ERROR:", e);
        clearTimeout(loaderTimeout);
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
        showError(`Initialization failed: ${e.message}. Please refresh the page.`);
    }
}