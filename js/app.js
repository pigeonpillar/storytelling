// ===== GLOBAL VARIABLES =====
let map;
let currentChapterId = null;
let pendingAnimation = null;
let videoObserver = null;
let imageObserver = null;

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
            if (record.image) {
                const img = new Image();
                if (imageObserver) { img.setAttribute('data-src', record.image); imageObserver.observe(img); } 
                else { img.src = record.image; }
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

// ===== DYNAMIC LAYER LOADER (WITH DEBUG LOGGING) =====
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

                // 1. Add Source
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, { type: 'geojson', data: url });
                }

                // 2. Add Layers
                
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
                        paint: { 'circle-color': specificColor, 'circle-radius': isCallout ? 5 : 6, 'circle-stroke-width': 1, 'circle-stroke-color': '#fff', 'circle-opacity': specificOpacity }
                    });
                }

                // Label (WITH DEBUG LOGGING)
                if (labelField && !map.getLayer(labelId)) {
                    
                    const layoutConfig = {
                        'visibility': 'none',
                        'text-field': ['get', labelField],
                        'text-size': input.labelSize || 13,
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        
                        // --- VERY AGGRESSIVE COLLISION DETECTION ---
                        'text-allow-overlap': false,      // Don't overlap with other labels
                        'text-ignore-placement': false,   // Respect other symbols
                        'text-optional': true,            // Hide if no room (don't force)
                        'text-padding': 100,              // INCREASED from 50 to 100px - very large spacing
                        'symbol-spacing': 500,            // INCREASED from 250 to 500 - huge distance between labels
                        'text-max-width': 8,              // Reduced to wrap labels more aggressively
                        // Zoom-based visibility - only show at close zoom
                        'text-size': [
                            'interpolate', ['linear'], ['zoom'],
                            12, 0,                        // Invisible at zoom 12 and below
                            13, input.labelSize || 13     // Normal size at zoom 13+
                        ]
                        // -------------------------------------
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
                        
                        // Callouts are more important, so override to always show them
                        layoutConfig['text-allow-overlap'] = true;
                        layoutConfig['text-ignore-placement'] = true;
                        // Remove the zoom restriction for callouts
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
                    
                    // Move label layer to the top so it's always visible above polygons/lines/points
                    map.moveLayer(labelId);
                    
                    console.log('✅ Created label layer:', labelId, 'for field:', labelField, '(moved to top, very aggressive collision enabled)');
                }

                // 3. Add Triggers
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
                    console.log('🎯 Added label trigger for:', labelId, 'in chapter:', chapter.id);
                }
            });
        }
    });
}

// ===== SCROLL HANDLING =====
function initializeScrollama(map, marker) {
    if (!map) return;
    const scroller = scrollama();
    
    map.on("load", function() {
        console.log("🗺️ Map loaded successfully!");
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden');
        
        // 1. Hardcoded West Bank
        map.addSource('west-bank-source', { type: 'geojson', data: './assets/WB.geojson' });
        map.addLayer({
            id: 'west-bank-layer', type: 'fill', source: 'west-bank-source',
            layout: { 'visibility': 'none' },
            paint: { 'fill-color': '#e74c3c', 'fill-opacity': 0.6, 'fill-outline-color': '#000000' }
        });

        // 2. Dynamic Loader
        loadDynamicLayers(map);
        
        // 3. 3D Terrain
        const mode = config.performanceMode || 'auto';
        const isHighEnd = (typeof utils.isHighEndDevice === 'function') ? utils.isHighEndDevice() : !utils.isMobile();
        const useHighQuality = mode === 'high' || (mode === 'auto' && isHighEnd);

        if (config.use3dTerrain && useHighQuality) {
            try {
                map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            } catch(e) { console.warn("Terrain failed", e); }
        }
        
        // 4. Scrollama
        scroller.setup({ 
            step: '.step', 
            offset: utils.isMobile() ? appConfig.mobile.scrollOffset : appConfig.mobile.desktopScrollOffset,
            progress: true, debug: false 
        })
        .onStepEnter(async (response) => {
            if (pendingAnimation) { map.stop(); pendingAnimation = null; }

            const current_chapter = config.chapters.findIndex(chap => chap.id === response.element.id);
            const chapter = config.chapters[current_chapter];
            if (!chapter) return;

            currentChapterId = response.element.id;
            response.element.classList.add('active');
            
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
                    console.log('🚀 Triggering layers for chapter:', chapter.id);
                    chapter.onChapterEnter.forEach(setLayerOpacity);
                    
                    // After showing layers, ensure all label layers are on top
                    chapter.onChapterEnter.forEach(layerConfig => {
                        if (layerConfig.layer && layerConfig.layer.includes('layer-symbol-')) {
                            try {
                                map.moveLayer(layerConfig.layer);
                                console.log('📌 Moved label to top:', layerConfig.layer);
                            } catch (e) {
                                // Layer might not exist, ignore
                            }
                        }
                    });
                }
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
    console.log('🎨 setLayerOpacity called:', layer);
    
    if (!map || !map.getLayer) {
        console.warn('❌ Map not ready');
        return;
    }
    
    if (!map.getLayer(layer.layer)) {
        console.warn('❌ Layer not found:', layer.layer);
        return;
    }
    
    try {
        if (layer.hasOwnProperty('visibility')) {
            console.log('✅ Setting visibility:', layer.layer, '→', layer.visibility);
            map.setLayoutProperty(layer.layer, 'visibility', layer.visibility);
            return;
        }
        if (layer.hasOwnProperty('opacity')) {
            console.log('✅ Setting opacity:', layer.layer, '→', layer.opacity);
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

// ===== APPLICATION INITIALIZATION =====
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