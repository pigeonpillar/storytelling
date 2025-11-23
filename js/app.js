// ===== GLOBAL VARIABLES =====
let map; 

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
                img.src = record.image;
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
                img.src = record.image;
                container.appendChild(img);
            } else if (record.video) {
                const video = document.createElement('iframe');
                video.src = record.video;
                video.setAttribute('frameborder', '0');
                video.setAttribute('allow', 'autoplay; fullscreen');
                video.setAttribute('allowfullscreen', '');
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
            
            if (typeof videoManager !== 'undefined') {
                videoManager.createVideoHandlers(video, itemDiv);
            }
            
            mediaContainer.appendChild(video);
            mediaContainer.appendChild(overlay);
        } else {
            const img = document.createElement('img');
            img.src = item.src; 
            img.alt = item.description;
            img.loading = 'lazy';
            mediaContainer.appendChild(img);
        }
        
        const caption = document.createElement('div');
        caption.className = 'evidence-caption';
        caption.innerHTML = `<div class="date">${item.date}</div><div class="description">${item.description}</div>`;
        
        itemDiv.appendChild(mediaContainer);
        itemDiv.appendChild(caption);
        gridContainer.appendChild(itemDiv);

        if (index < appConfig.performance.evidenceGridVisibleItems) {
            requestAnimationFrame(() => { itemDiv.classList.add('visible'); });
        } else {
            setTimeout(() => { 
                requestAnimationFrame(() => { itemDiv.classList.add('visible'); }); 
            }, (index - appConfig.performance.evidenceGridVisibleItems) * appConfig.performance.evidenceGridItemDelay + 500);
        }
    });
}

// ===== MAP INITIALIZATION =====
function initializeMap() {
    if (typeof mapboxgl === 'undefined') {
        console.error("❌ Mapbox GL JS is not loaded!");
        alert("Mapbox Library failed to load. Check your internet connection.");
        return null;
    }

    mapboxgl.accessToken = config.accessToken;
    
    try {
        map = new mapboxgl.Map({
            container: 'map', 
            style: config.style,
            center: config.chapters[0].location.center,
            zoom: config.chapters[0].location.zoom,
            bearing: config.chapters[0].location.bearing,
            pitch: config.chapters[0].location.pitch,
            interactive: false, 
            projection: config.projection
        });
        
        if (config.inset) {
            map.on('load', function() {
                try {
                    map.addControl(new GlobeMinimap(config.insetOptions), config.insetPosition);
                } catch (e) { console.warn("Minimap failed to load", e); }
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

// ===== DYNAMIC LAYER LOADER (UPDATED WITH OPACITY & LINE STYLING) =====
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
                    specificOpacity = 1.0; // Default opacity
                    specificWidth = 2;     // Default line width
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

                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, { type: 'geojson', data: url });
                }

                // FILL
                if (!map.getLayer(fillId)) {
                    map.addLayer({
                        id: fillId, type: 'fill', source: sourceId,
                        layout: { 'visibility': 'none' },
                        paint: {
                            'fill-color': specificColor, 
                            'fill-opacity': specificOpacity,
                            'fill-outline-color': '#000000'
                        }
                    });
                }

                // LINE (Updated for better styling)
                if (!map.getLayer(lineId)) {
                    map.addLayer({
                        id: lineId, type: 'line', source: sourceId,
                        layout: { 
                            'visibility': 'none',
                            'line-join': 'round', // Makes corners smooth
                            'line-cap': 'round'   // Makes ends round
                        },
                        paint: {
                            'line-color': specificColor,
                            'line-width': specificWidth,
                            'line-opacity': specificOpacity
                        }
                    });
                }

                // POINT
                if (!map.getLayer(pointId)) {
                    map.addLayer({
                        id: pointId, type: 'circle', source: sourceId,
                        layout: { 'visibility': 'none' },
                        paint: {
                            'circle-color': specificColor,
                            'circle-radius': 6,
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#ffffff',
                            'circle-opacity': specificOpacity
                        }
                    });
                }

                // LABEL
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
                        paint: {
                            'text-color': '#000000',
                            'text-halo-color': '#ffffff',
                            'text-halo-width': 2,
                            'text-opacity': specificOpacity
                        }
                    });
                }

                // Setup Triggers using specific opacity
                if (!chapter.onChapterEnter) chapter.onChapterEnter = [];
                if (!chapter.onChapterExit) chapter.onChapterExit = [];
                
                const addTrigger = (id, isVisible, opacityVal) => {
                    if (isVisible) {
                        chapter.onChapterEnter.push({ layer: id, visibility: 'visible', opacity: opacityVal });
                        chapter.onChapterExit.push({ layer: id, visibility: 'none' });
                    }
                };

                // Fill opacity usually looks better slightly lower than line/point opacity
                addTrigger(fillId, showFill, specificOpacity > 0.6 ? 0.6 : specificOpacity);
                addTrigger(lineId, showLine, specificOpacity);
                addTrigger(pointId, showPoint, specificOpacity);
                if (labelField) addTrigger(labelId, true, 1);
            });
        }
    });
    console.log("✅ Smart Dynamic layers configured.");
}

// ===== SCROLL HANDLING =====
function initializeScrollama(map, marker) {
    if (!map) return;
    const scroller = scrollama();
    
    map.on("load", function() {
        console.log("🗺️ Map loaded successfully!");
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden');
        
        // EXISTING: HARDCODED WEST BANK
        map.addSource('west-bank-source', {
            type: 'geojson',
            data: './assets/WB.geojson' 
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

        // DYNAMIC LOADER
        loadDynamicLayers(map);
        
        map.on('sourcedata', function(e) {
            if (e.sourceId === 'west-bank-source' && e.isSourceLoaded) {
                const f = map.querySourceFeatures('west-bank-layer');
                if(f.length > 0) console.log(`✅ WB GeoJSON loaded: ${f.length} features.`);
            }
        });
        
        if (config.use3dTerrain) {
            try {
                map.addSource('mapbox-dem', { 
                    'type': 'raster-dem', 
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1', 
                    'tileSize': 512, 
                    'maxzoom': 14 
                });
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            } catch(e) { console.warn("Terrain failed", e); }
        }
        
        scroller.setup({ 
            step: '.step', 
            offset: utils.isMobile() ? appConfig.mobile.scrollOffset : appConfig.mobile.desktopScrollOffset,
            progress: true, 
            debug: false 
        })
        .onStepEnter(utils.throttle(async (response) => {
            const current_chapter = config.chapters.findIndex(chap => chap.id === response.element.id);
            const chapter = config.chapters[current_chapter];
            
            response.element.classList.add('active');
            
            const currentCenter = map.getCenter();
            const newCenter = chapter.location.center;
            
            if (utils.hasLocationChanged(currentCenter, newCenter) || map.getZoom() !== chapter.location.zoom) {
                map[chapter.mapAnimation || 'flyTo'](chapter.location);
            }
            
            if (marker) { marker.setLngLat(chapter.location.center); }
            
            if (chapter.onChapterEnter && chapter.onChapterEnter.length > 0) { 
                chapter.onChapterEnter.forEach(setLayerOpacity); 
            }
            
            if (chapter.id === 'evidence-grid') { 
                buildEvidenceGrid(chapter.gridContent); 
                if (typeof videoManager !== 'undefined') {
                    videoManager.resetVideos(); 
                }
            }
            
            if (chapter.rotateAnimation) {
                map.once('moveend', () => {
                    const rotateNumber = map.getBearing();
                    map.rotateTo(rotateNumber + 180, { duration: 30000, easing: t => t });
                });
            }
            
            const progress = ((current_chapter + 1) / config.chapters.length) * 100;
            document.getElementById('progress').style.width = progress + '%';
        }, appConfig.performance.scrollThrottle))
        
        .onStepExit(response => {
            const chapter = config.chapters.find(chap => chap.id === response.element.id);
            response.element.classList.remove('active');
            
            if (chapter && chapter.id === 'evidence-grid') {
                if (typeof videoManager !== 'undefined') {
                    videoManager.cleanupVideos();
                }
            }
            if (chapter && chapter.onChapterExit && chapter.onChapterExit.length > 0) { 
                chapter.onChapterExit.forEach(setLayerOpacity); 
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

// ===== APPLICATION INITIALIZATION =====
function initializeApp() {
    console.log("🚀 Initializing App...");
    
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && !loader.classList.contains('hidden')) {
            console.warn("⚠️ Loader forced hidden by timeout (Map didn't load in time)");
            loader.classList.add('hidden');
        }
    }, 3000);

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