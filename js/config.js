var config = {
    
    style: 'mapbox://styles/pigeonpillar/cmhxtqton001s01r0e22aaql9',
    accessToken: 'pk.eyJ1IjoicGlnZW9ucGlsbGFyIiwiYSI6ImNtaHhtbzVvNzAyMXQydnM5Zjl3ODc5Z3EifQ.pYMzqOG5H640PXTMlLxkMQ',
    showMarkers: true,
    markerColor: '#e74c3c',
    inset: true,
    insetOptions: {
        globe: true,
        markerColor: '#c0392b',
        width: 150,
        height: 150
    },
    insetPosition: 'bottom-right',
    theme: 'light',
    use3dTerrain: false,
    auto: false,
    projection: 'mercator',
    
    title: 'Under Fire',
    subtitle: 'Paramedics in the West Bank Face Systematic Attacks',
    byline: 'An Interactive Platform by Physicians for Human Rights - Israel',
    
    footer: `
        <div class="credits">
            <div>
                <strong>Documentation:</strong> Physicians for Human Rights - Israel
            </div>
            <div>
                <strong>PHR 2025</strong>
            </div>
            <div>
                <strong>Research:</strong> Address: 
            </div>
        </div>
        <p style="margin-top: 2rem; color: #666;">
            This interactive platform documents testimonies from the Beita, Aqraba and Usareen to the south of Nablus.
            <br>
            <a href="" target="_blank"></a>
            <a href="https://phr.org.il" target="_blank">phr.org.il</a>
        </p>
    `,
    
    chapters: [
        {
            id: 'intro-beita',
            alignment: 'full',
            hidden: false,
            title: 'Inside the Field of Fire',
            image: './assets/01.png',
            description: 'In the villages of South Nablus, including Beita, Aqraba, Al-Sawyeh, Majdal Bani Fadil and Osarin, ambulance crews move through checkpoints, roadblocks, tear gas and live fire to reach the patients.',
            location: { center: [35.2769, 32.1544], zoom: 10, pitch: 0, bearing: 0, speed: 0.5 },
           
        },

        {
            id: 'context-overview',
            alignment: 'center',
            hidden: false,
            subtitle: 'Field Research',
            title: 'Where Rescue Becomes Risk',
            image: './assets/02.JPG',
            description: `Testimonies gathered since October 2023 show a clear pattern. Responders are no longer navigating only the aftermath of violence. They are being pulled into its center. What should be routine medical missions now unfold in uncertainty, with each call carrying the possibility of obstruction, assault or delay.`,
            source: 'Source: PHR-Israel, November 2025',
            location: { center: [35.2769, 32.1544], zoom: 12, pitch: 45, bearing: 20, speed: 0.8 },

        },
        
         {
            id: 'west-bank-context01',
            alignment: 'left',
            hidden: false,
            subtitle: 'oct. 2023 - may. 2024',
            title: '480 attacks',
            description: `According to the World Health Organization, 480 attacks on healthcare took place in the West Bank between October 7, 2023 and May 28, 2024. These attacks led to 16 deaths and 95 injuries and affected 54 health facilities, 20 mobile clinics and 319 ambulances.`,
            source: 'Source: World Health Organization, Statement 2024',
            location: { 
                center: [35.25, 31.95], 
                zoom: 7.5, 
                pitch: 0, 
                bearing: 0, 
                speed: 0.7 
            },
            mapAnimation: 'flyTo',
            onChapterEnter: [
                { layer: 'west-bank-layer', visibility: 'visible' }
            ],
            onChapterExit: [
                { layer: 'west-bank-layer', visibility: 'none' }
            ]
        },

         {
            id: 'west-bank-context02',
            alignment: 'left',
            hidden: false,
            subtitle: 'april. 2024 - dec. 2024',
            title: '694 attacks',
            description: `Additionally, the West Bank saw 694 attacks on healthcare between April and December 2024, causing 26 deaths and 121 injuries and impacting 62 health facilities, 22 mobile clinics and 475 ambulances.`,
            source: 'Source: Humanitarian Situation Update No. 264, UN OCHA Feb. 2025',
            location: { 
                center: [35.25, 31.95], 
                zoom: 7.5, 
                pitch: 0, 
                bearing: 0, 
                speed: 0.7 
            },
            mapAnimation: 'flyTo',
            onChapterEnter: [
                { layer: 'west-bank-layer', visibility: 'visible' }
            ],
            onChapterExit: [
                { layer: 'west-bank-layer', visibility: 'none' }
            ]
        },

        {
    id: 'nablus intro',
    alignment: 'left',
    title: 'Two-thirds',
    hidden: false,
    subtitle: 'Nablus Governorate',
    description: `Nablus accounted for 68 percent of all recorded attacks on healthcare between 2022 and 2023. Additional areas impacted included Hebron, Jericho, Jenin, Bethlehem and Jerusalem.`,
    source: 'Source: World Health Organization, News 2023',
    
    // --- ADVANCED CONFIGURATION ---
    geojsonUrl: [
        // File 1: Governorates (Polygons)
        { 
            url: './assets/governorates.geojson',
            color: 'rgba(201, 41, 41, 0.53)',  // Blue fill
            showFill: false,    // Yes, fill it
            showLine: false,    // Yes, outline it
            showPoint: true,   // No dots!


            // --- MOVED CALLOUT SETTINGS HERE ---
            labelField: 'name',      // Attribute name for the village
            labelColor: '#000000',   // Black text usually looks best on polygons
            opacity: 0.6,
            labelSize: 11,
            callout: true            // Activates the white box style
            // -----------------------------------
            
        },
        
        // File 2: Lines/Roads (LineStrings)
        { 
            url: './assets/linesgov.geojson',
            color: 'rgba(255, 0, 0, 0.83)',  // Red lines
            opacity: 0.6,      // Controls transparency (0.0 to 1.0)
            lineWidth: 3,      // Thicker lines look better (Default is 2)
            showFill: false,   // CRITICAL: No fill = No artifacts
            showLine: true,    // Yes, show line
            showPoint: false   // CRITICAL: No points = No "series of dots"
        }
    ],
    // ------------------------------

    location: { center: [35.301675255000134, 32.15], zoom: 9, pitch: 0, bearing: 0, speed: 0.8 },
    mapAnimation: 'flyTo'
},

 {
    id: 'nablus',
    alignment: 'left',
    title: 'Checkpoints & Obstruction',
    hidden: false,
    subtitle: 'Nablus Governorate',
    description: `Nablus governorate has 128 movement obstacles, including 32 occasionally staffed checkpoints and 9 constantly staffed checkpoints around Nablus city`,
    source: 'Source: OCHA, News 2023',
    
    // --- ADVANCED CONFIGURATION ---
    geojsonUrl: [
        // File 1: Governorates (Polygons)
        { 
            url: './assets/nablus-checkpoints.geojson',
            color: 'rgba(255, 115, 0, 1)',  // Blue fill
            showFill: false,    // Yes, fill it
            showLine: false,    // Yes, outline it
            showPoint: true,   // No dots!
        

            // --- MOVED CALLOUT SETTINGS HERE ---
            labelField: 'name',      // Attribute name for the village
            labelColor: '#000000',   // Black text usually looks best on polygons
            opacity: 0.4,
            labelSize: 9,
            // Activates the white box style
            // -----------------------------------
        },
        
        // File 2: Lines/Roads (LineStrings)
        { 
            url: './assets/nablus_bounds.geojson',
            color: 'rgba(255, 0, 0, 0.83)',  // Red lines
            opacity: 0.6,      // Controls transparency (0.0 to 1.0)
            lineWidth: 3,      // Thicker lines look better (Default is 2)
            showFill: false,   // CRITICAL: No fill = No artifacts
            showLine: true,    // Yes, show line
            showPoint: false   // CRITICAL: No points = No "series of dots"
        }
    ],
    // ------------------------------

    location: { center: [35.301675255000134, 32.15], zoom: 11, pitch: 0, bearing: 0, speed: 0.8 },
    mapAnimation: 'flyTo'
      },
{
    id: 'beita_aqraba',
    alignment: 'left',
    title: 'Beita, Aqraba and Usarin',
    hidden: false,
    subtitle: 'Southern Nablus Area',
    description: `We documented attacks targeting paramedics and ambulance crews in the villages of Beita, Aqraba and Usarin, south of Nablus City. During field research, we interviewed ambulance drivers and paramedics and joined them as they returned to the sites of earlier violations.`,
    source: 'Source: PHR - Israel',
    location: { center: [35.2812, 32.1623], zoom: 11.5, pitch: 60, bearing: 45, speed: 0.8 },
    mapAnimation: 'flyTo',
    
    // --- ADVANCED CONFIGURATION ---
    geojsonUrl: [
        // File 1: Checkpoints (Just Dots, No Labels)
        { 
            url: './assets/nablus-checkpoints.geojson',
            color: 'rgba(101, 95, 95, 0.35)', 
            showFill: false,    
            showLine: false,    
            showPoint: true    
        },
        
        // File 2: Villages (Polygons WITH Callout Labels)
        { 
            url: './assets/villages.geojson',
            color: 'rgba(255, 0, 0, 0.83)',
            opacity: 0.3,      
            lineWidth: 3,      
            showFill: true,   
            showLine: false,    
            showPoint: false,
            
            // --- MOVED CALLOUT SETTINGS HERE ---
            labelField: 'VNAME',      // Attribute name for the village
            labelColor: '#000000',   // Black text usually looks best on polygons
            labelSize: 11,
            callout: true            // Activates the white box style
            // -----------------------------------
        }
    ],
},

        {
            id: 'evidence-grid',
            alignment: 'full',
            hidden: false,
            title: 'Documented Evidence',
            subtitle: 'A pattern of systematic violations',
            location: {
                center: [35.2769, 32.1544],
                zoom: 11,
                pitch: 0,
                bearing: 0,
                speed: 0.8
            },
            
            gridContent: [
                {
                    type: 'video',
                    src: './assets/IMG 8965.mp4',
                    date: 'Nov 15, 2025',
                    description: 'Heavy military presence on major roads',
                    layout: 'span-2-col'
                },
                {
                    type: 'image',
                    src: './assets/011.jpg',
                    date: 'Jan 28, 2023',
                    description: 'Ambulance blocked at Huwara checkpoint.'
                },

                {
                    type: 'image',
                    src: './assets/06.jpg',
                    date: 'April 20, 2024',
                    description: 'An on-duty ambulance driver, Mohammad Musa Awadallah was shot during Israeli settlers attack on Al-Sawyeh'
                },

                {
                    type: 'image',
                    src: './assets/03.jpg',
                    date: 'July 4, 2025',
                    description: 'Ambulance headlight damaged during an attack by Israeli settlers in Beita.'
                },
                {
                    type: 'image',
                    src: './assets/009.jpg',
                    date: 'Jan 17, 2025',
                    description: 'A tear-gas canister fired by Israeli occupation forces lands beside an ambulance in Beita, obstructing emergency medical access.'
                },
                {
                    type: 'image',
                    src: './assets/008.jpg',
                    date: 'April 13, 2025',
                    description: 'Medical workers detained during emergency response.'
                },
                {
                    type: 'video',
                    src: './assets/013.mp4',
                    date: 'Nov 15, 2025',
                    description: 'Video testimony from paramedic Rana. A. S.'
                },
                {
                    type: 'image',
                    src: './assets/012.jpg',
                    date: 'June 13, 2025',
                    description: 'Military gates obstruction of medical route.'
                },
            ]
        },

        // testimony-Rana01 - First testimony chapter (with video intro)
{
    id: 'testimony-Rana01',
    alignment: 'left',
    hidden: false,
    subtitle: 'Testimony #1',
    title: 'Rana A. S., Paramedic',
    image: '', // Video replaces this
    quote: `"I hadn't even stepped out of the ambulance. They assaulted us while we were still inside the vehicle, and then detained me."`,
    description: `On November 22, 2024, Israeli occupation forces assaulted members of an ambulance crew belonging to the Aqraba Municipality and arrested Rana while they were providing coverage during clashes in the village of Osarin, south of Nablus.`,
    source: 'Interview conducted by PHRI, November 20, 2025',
    location: { center: [35.310094, 32.125524], zoom: 16, pitch: 60, bearing: 45, speed: 0.8 },
    mapAnimation: 'flyTo',
    
    // Video intro
    videoIntro: {
        enabled: true,
        path: './assets/rana.mp4'
    },
    
    onChapterEnter: [
        { layer: 'incident-1-marker', visibility: 'visible' },
        { layer: 'ambulance-route-1', visibility: 'visible' }
    ]
    // NO onChapterExit - handled by code with force-hide
},

// testimony-Rana02 - Second testimony chapter (continuation)
{
    id: 'testimony-Rana02',
    alignment: 'left',
    hidden: false,
    subtitle: 'Testimony #1 (Continued)',
    title: 'Rana A. S., Paramedic',
    image: '',
    quote: `"They tried to make up any reasons or accuse me with anything regardless of the fact I was a paramedic in my official uniform."`,
    description: `The Israeli occupation forces detained Rana for five hours, subjecting her to both verbal and physical assault. At the Huwara military camp, she was interrogated and compelled to unlock her phone.`,
    source: 'Interview conducted by PHRI, November 20, 2025',
    location: { center: [35.276064, 32.171868], zoom: 11.5, pitch: 70, bearing: 85, speed: 0.5 },
    mapAnimation: 'flyTo',
    
    onChapterEnter: [
        { layer: 'incident-1-marker', visibility: 'visible' },
        { layer: 'ambulance-route-1', visibility: 'visible' }
    ]
    // NO onChapterExit - handled by code with force-hide
},
         

       {
    id: 'testimony-rana03',
    alignment: 'full',
    hidden: false,
    subtitle: 'Testimony #1 (Continued)',
    title: 'Rana A. S., Paramedic',
    fullscreenVideo: './assets/rana02.mp4',
    quote: `"There are no red lines left. Women, children, the elderly, olive trees, holy sites and mosques are no longer spared. In the center of our village, they have burned the mosques multiple times and sprayed hate speech across the walls."`,
    description: `Rana’s account of events following 2023`,
    source: 'Interview conducted by PHRI, November 20, 2025',
    location: { center: [35.2745, 32.1567], zoom: 16, pitch: 45, bearing: -20, speed: 0.8 },
    mapAnimation: 'flyTo'
},

        {
            id: 'Detentions',
            alignment: 'center',
            hidden: false,
            subtitle: 'Findings on detentions, obstruction and assaults',
            title: 'Detentions and Attacks on Medical Staff',
            image: '',
            description: `At least 172 healthcare workers were detained or arrested during their shifts, as were 25 patients receiving care. About one in five attacks involved the search of facilities, ambulances or medical personnel. The most common pattern, accounting for 77 percent of cases, was the obstruction of healthcare delivery.`,
            source: 'World Health Organization, 2024',
            location: { center: [35.2769, 32.1544], zoom: 12, pitch: 0, bearing: 0, speed: 0.8 },
            mapAnimation: 'flyTo',
            onChapterEnter: [
                { layer: 'heatmap-attacks', opacity: 0.7, duration: 2000 },
                { layer: 'all-incidents', opacity: 1, duration: 2000 }
            ],
            onChapterExit: [ { layer: 'heatmap-attacks', opacity: 0, duration: 1000 } ]
        },
        {
            id: 'legal-framework',
            alignment: 'center',
            hidden: false,
            subtitle: 'Legal Analysis',
            title: 'Violations of International Law',
            description: `Under International Humanitarian Law, medical personnel and vehicles are specially protected. The Geneva Conventions explicitly prohibit attacks on medical units and establish the duty to respect and protect medical personnel.`,
            location: { center: [35.2769, 32.1544], zoom: 11, pitch: 0, bearing: 0, speed: 0.5 },
            mapAnimation: 'flyTo'
        },
        {
            id: 'testimony-khaled',
            alignment: 'right',
            hidden: false,
            subtitle: 'Testimony #3',
            title: 'Khaled S., Emergency Coordinator',
            quote: `"We're forced to choose between risking attack on direct routes or delays that cost lives."`,
            description: `Khaled's testimony reveals how systematic attacks have forced medical services to adapt, ultimately compromising their ability to provide timely care.`,
            location: { center: [35.2790, 32.1580], zoom: 13, pitch: 30, bearing: 10, speed: 0.8 },
            mapAnimation: 'flyTo',
            onChapterEnter: [ { layer: 'alternative-routes', opacity: 0.8, duration: 2000 } ],
            onChapterExit: [ { layer: 'alternative-routes', opacity: 0, duration: 1000 } ]
        },
        {
            id: 'international-response',
            alignment: 'center',
            hidden: false,
            subtitle: 'International Response',
            title: 'Calls for Accountability',
            description: `"The systematic targeting of medical personnel... may amount to war crimes."<br><br>— UN Special Rapporteur on the Right to Health, December 2023`,
            location: { center: [35.2769, 32.1544], zoom: 10, pitch: 0, bearing: 0, speed: 0.5 },
            mapAnimation: 'flyTo'
        },
        {
            id: 'conclusion',
            alignment: 'full',
            hidden: false,
            title: 'The Human Cost',
            image: './assets/memorial.jpg',
            description: `Each attack, each delay, represents not just a violation of law, but a life at risk, a family torn apart.`,
            location: { center: [35.2769, 32.1544], zoom: 9, pitch: 0, bearing: 0, speed: 0.3 },
            mapAnimation: 'flyTo',
            onChapterEnter: [ { layer: 'satellite', opacity: 0.5, duration: 3000 } ]
        },
        {
            id: 'call-to-action',
            alignment: 'center',
            hidden: false,
            title: 'Demand Justice',
            description: `
                <strong>What You Can Do:</strong>
                <br><br>
                • Share this investigation to raise awareness
                • Contact your representatives to demand action
                • Support organizations documenting these violations
                <br><br>
                <a href="https://phr.org.il/en" target="_blank" style="
                    display: inline-block;
                    padding: 12px 24px;
                    background: #e74c3c;
                    color: white;
                    border-radius: 4px;
                    text-decoration: none;
                    margin-top: 1rem;
                ">Learn More & Take Action</a>
            `,
            location: { center: [35.2769, 32.1544], zoom: 10, pitch: 0, bearing: 0, speed: 0.5 },
            mapAnimation: 'flyTo'
        }
    ]
};