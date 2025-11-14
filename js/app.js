// ===== DOM CREATION =====
function createStoryElements() {
    const story = document.getElementById('story');
    const features = document.createElement('div');
    features.setAttribute('id', 'features');
    
    // Create header if config has title/subtitle/byline
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

    // Create chapters
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
    
    // Create footer if config has footer
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
            video.preload = 'none';
            video.setAttribute('data-src', item.src);
            
            const overlay = document.createElement('div');
            overlay.className = 'video-overlay';
            const playIcon = document.createElement('div');
            playIcon.className = 'play-icon';
            overlay.appendChild(playIcon);
            
            videoManager.createVideoHandlers(video, itemDiv);
            
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

        // Optimized DOM updates with batch processing
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
    mapboxgl.accessToken = config.accessToken;
    
    const map = new mapboxgl.Map({
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
            map.addControl(new GlobeMinimap(config.insetOptions), config.insetPosition);
        });
    }
    
    return map;
}

function initializeMarker(map) {
    if (config.showMarkers) {
        const marker = new mapboxgl.Marker({ color: config.markerColor });
        marker.setLngLat(config.chapters[0].location.center).addTo(map);
        return marker;
    }
    return null;
}

// ===== SCROLL HANDLING =====
function initializeScrollama(map, marker) {
    const scroller = scrollama();
    
    map.on("load", function() {
        setTimeout(() => { document.getElementById('loader').classList.add('hidden'); }, 500);
        
        if (config.use3dTerrain) {
            map.addSource('mapbox-dem', { 
                'type': 'raster-dem', 
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1', 
                'tileSize': 512, 
                'maxzoom': 14 
            });
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            map.addLayer({ 
                'id': 'sky', 
                'type': 'sky', 
                'paint': { 
                    'sky-type': 'atmosphere', 
                    'sky-atmosphere-sun': [0.0, 0.0], 
                    'sky-atmosphere-sun-intensity': 15 
                } 
            });
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
            
            // Only animate map if location actually changed
            const currentCenter = map.getCenter();
            const newCenter = chapter.location.center;
            const centerChanged = utils.hasLocationChanged(currentCenter, newCenter);
            
            if (centerChanged || map.getZoom() !== chapter.location.zoom) {
                map[chapter.mapAnimation || 'flyTo'](chapter.location);
            }
            
            if (marker) { marker.setLngLat(chapter.location.center); }
            if (chapter.onChapterEnter && chapter.onChapterEnter.length > 0) { 
                chapter.onChapterEnter.forEach(setLayerOpacity); 
            }
            if (chapter.id === 'evidence-grid') { 
                buildEvidenceGrid(chapter.gridContent); 
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
                videoManager.cleanupVideos();
            }
            if (chapter && chapter.onChapterExit && chapter.onChapterExit.length > 0) { 
                chapter.onChapterExit.forEach(setLayerOpacity); 
            }
        });
    });
}

// ===== APPLICATION INITIALIZATION =====
function initializeApp() {
    createStoryElements();
    const map = initializeMap();
    const marker = initializeMarker(map);
    initializeScrollama(map, marker);
}