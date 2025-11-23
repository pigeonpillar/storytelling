// ===== GLOBAL VARIABLES =====
let map;
let currentChapterId = null;
let pendingAnimation = null;
let videoObserver = null;
let imageObserver = null;

// ===== INTERSECTION OBSERVERS (Performance) =====
function initializeObservers() {
    if ('IntersectionObserver' in window) {
        // Video Observer (Auto play/pause)
        videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(e => {
                        // Silent fail for autoplay policies
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
        
        // Image Observer (Lazy loading)
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
            if (record.image) {
                const img = new Image();
                if (imageObserver) {
                    img.setAttribute('data-src', record.image);
                } else {
                    img.src = record.image;
                }
                container.appendChild(img);
            }
            const overlay = document.createElement('div');
            overlay.className = 'overlay-content';
            if (record.title) {
                const t = document.createElement('h3');
                t.innerHTML = record.title;
                overlay.appendChild(t);
            }
            if (record.description) {
                const d = document.createElement('p');
                d.innerHTML = record.description;
                overlay.appendChild(d);
            }
            chapter.appendChild(overlay);
        } else {
            if (record.image) {
                const img = new Image();
                if (imageObserver) {
                    img.setAttribute('data-src', record.image);
                } else {
                    img.src = record.image;
                }
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
            
            // VIDEO FIXES
            video.preload = 'metadata'; 
            video.setAttribute('data-src', item.src);
            video.src = item.src; 
            
            const overlay = document.createElement('div');
            overlay.className = 'video-overlay';
            const playIcon = document.createElement('div');
            playIcon.className = 'play-icon';
            overlay.appendChild(playIcon);
            
            // Add to observer for auto-play
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
            
            if (imageObserver) {
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

        // Staggered animation
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
    
    // Performance Mode Logic
    const mode = config.performanceMode || 'auto';
    
    // Safe check for utils.isHighEndDevice in case it's missing
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
            
            // Optimization Settings
            antialias: useHighQuality,
            preserveDrawingBuffer: false,
            maxTileCacheSize: useHighQuality ? 150 : 50
        });
        
        // Limit max zoom on low-end devices to save memory
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

// ===== DYNAMIC LAYER LOADER (FIXED: Using Mapbox Native Loading) =====
function loadDynamicLayers(map) {
    console.log("🔄 Scanning config.js for GeoJSON files...");
    
    config.chapters.forEach(chapter => {
        if (chapter.geojsonUrl) {
            const rawInputs = Array.isArray(chapter.geojsonUrl) ? chapter.geojsonUrl : [chapter.geojsonUrl];
            
            rawInputs.forEach((input, index) => {
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
                
                // IDs
                const fillId = `layer-fill-${chapter.id}${suffix}`;
                const lineId = `layer-line-${chapter.id}${suffix}`;
                const pointId = `layer-circle-${chapter.id}${suffix}`;
                const labelId = `layer-symbol-${chapter.id}${suffix}`;

                // 1. Add Source (Mapbox native loading - much safer!)
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, { type: 'geojson', data: url });
                }

                // 2. Setup Layers
                // Fill
                if (!map.getLayer(fillId)) {
                    map.addLayer({
                        id: fillId, type: 'fill', source: sourceId,
                        layout: { 'visibility': 'none' },
                        paint: { 'fill-color': specificColor, 'fill-opacity': specificOpacity, 'fill-outline-color': '#000000' }
                    });
                }
                // Line
                if (!map.getLayer(lineId)) {
                    map.addLayer({
                        id: lineId, type: 'line', source: sourceId,
                        layout: { 'visibility': 'none', 'line-join': 'round', 'line-cap': 'round' },
                        paint: { 'line-color': specificColor, 'line-width': specificWidth, 'line-opacity': specificOpacity }
                    });
                }
                // Point
                if (!map.getLayer(pointId)) {
                    map.addLayer({
                        id: pointId, type: 'circle', source: sourceId,
                        layout: { 'visibility': 'none' },
                        paint: { 'circle-color': specificColor, 'circle-radius': 6, 'circle-stroke-width': 1, 'circle-stroke-color': '#fff', 'circle-opacity': specificOpacity }
                    });
                }
                // Label
                if (labelField && !map.getLayer(labelId)) {
                    map.addLayer({
                        id: labelId, type: 'symbol', source: sourceId,
                        layout: {
                            'visibility': 'none',
                            'text-field': ['get', labelField],
                            'text-size': 13,
                            'text-offset': [0, 1],
                            'text-anchor': 'top',
                            'text-allow-overlap': false
                        },
                        paint: { 'text-color': '#000000', 'text-halo-color': '#fff', 'text-halo-width': 2, 'text-opacity': specificOpacity }
                    });
                }

                // 3. Setup Triggers
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
                if (labelField) addTrigger(labelId, true, 1);
            });
        }
    });
}

// ===== SCROLL HANDLING =====
function initializeScrollama(map, marker) {
    if (!map) return;
    const scroller = scrollama();
    
    // --- LOAD MAP ---
    map.on("load", function() {
        console.log("🗺️ Map loaded successfully!");
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden');
        
        // 1. HARDCODED WEST BANK (Kept for compatibility)
        map.addSource('west-bank-source', { type: 'geojson', data: './assets/WB.geojson' });
        map.addLayer({
            id: 'west-bank-layer', type: 'fill', source: 'west-bank-source',
            layout: { 'visibility': 'none' },
            paint: { 'fill-color': '#e74c3c', 'fill-opacity': 0.6, 'fill-outline-color': '#000000' }
        });

        // 2. LOAD DYNAMIC LAYERS
        loadDynamicLayers(map);
        
        // 3. 3D TERRAIN (Respects Performance Mode)
        const mode = config.performanceMode || 'auto';
        const isHighEnd = (typeof utils.isHighEndDevice === 'function') ? utils.isHighEndDevice() : !utils.isMobile();
        const useHighQuality = mode === 'high' || (mode === 'auto' && isHighEnd);

        if (config.use3dTerrain && useHighQuality) {
            try {
                map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            } catch(e) { console.warn("Terrain failed", e); }
        }
        
        // 4. SETUP SCROLLAMA
        scroller.setup({ 
            step: '.step', 
            offset: utils.isMobile() ? appConfig.mobile.scrollOffset : appConfig.mobile.desktopScrollOffset,
            progress: true, debug: false 
        })
        .onStepEnter(async (response) => {
            // Cleanup old state
            if (pendingAnimation) { map.stop(); pendingAnimation = null; }

            const current_chapter = config.chapters.findIndex(chap => chap.id === response.element.id);
            const chapter = config.chapters[current_chapter];
            if (!chapter) return;

            currentChapterId = response.element.id;
            response.element.classList.add('active');
            
            // Movement Logic
            const currentCenter = map.getCenter();
            const newCenter = chapter.location.center;
            const isMoving = utils.hasLocationChanged(currentCenter, newCenter) || Math.abs(map.getZoom() - chapter.location.zoom) > 0.1;
            
            const triggerLayers = () => {
                if (currentChapterId !== response.element.id) return; // User scrolled away
                
                if (chapter.onChapterEnter) chapter.onChapterEnter.forEach(setLayerOpacity);
                if (chapter.id === 'evidence-grid') {
                    buildEvidenceGrid(chapter.gridContent);
                    if (typeof videoManager !== 'undefined') videoManager.resetVideos();
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
            
            // Update Progress
            const progress = ((current_chapter + 1) / config.chapters.length) * 100;
            document.getElementById('progress').style.width = progress + '%';
        })
        .onStepExit(response => {
            const chapter = config.chapters.find(chap => chap.id === response.element.id);
            response.element.classList.remove('active');
            if (chapter) {
                if (chapter.id === 'evidence-grid') {
                    cleanupEvidenceGrid();
                    if (typeof videoManager !== 'undefined') videoManager.cleanupVideos();
                }
                if (chapter.onChapterExit) chapter.onChapterExit.forEach(setLayerOpacity);
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
    } catch (e) { console.warn(e); }
}

// ===== APPLICATION INITIALIZATION =====
function initializeApp() {
    console.log("🚀 Initializing App...");
    initializeObservers(); // Start Observers
    
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && !loader.classList.contains('hidden')) loader.classList.add('hidden');
    }, 5000); // Failsafe

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