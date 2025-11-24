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
                    date: 'Oct 22, 2023',
                    description: 'Direct fire on clearly marked medical vehicle.',
                    layout: 'span-2-col'
                },
                {
                    type: 'video',
                    src: './assets/IMG 9100.mp4',
                    date: 'Oct 15, 2023',
                    description: 'Ambulance blocked at Huwara checkpoint.'
                },
                {
                    type: 'image',
                    src: './assets/03.jpg',
                    date: 'Nov 8, 2023',
                    description: 'Damage to ambulance windshield after attack.'
                },
                {
                    type: 'image',
                    src: './assets/evidence-3.png',
                    date: 'Nov 3, 2023',
                    description: 'Medical workers detained during emergency response.'
                },
                {
                    type: 'video',
                    src: './assets/IMG 9039.mp4',
                    date: 'Nov 15, 2023',
                    description: 'Video testimony from driver Ahmad M.'
                },
                {
                    type: 'image',
                    src: './assets/CETW6636.JPG',
                    date: 'Nov 12, 2023',
                    description: 'Checkpoint obstruction of medical route.'
                },
            ]
        },


        {
            id: 'testimony-ahmad',
            alignment: 'right',
            hidden: false,
            subtitle: 'Testimony #1',
            title: 'Ahmad M., Ambulance Driver',
            image: './assets/ambulance-damage.jpg',
            quote: `"We had our sirens on, lights flashing... they opened fire directly at the vehicle."`,
            description: `On November 15, 2023, Ahmad's clearly marked ambulance came under direct fire at an Israeli checkpoint.`,
            source: 'Interview conducted by PHRI, November 20, 2023',
            location: { center: [35.2812, 32.1623], zoom: 16, pitch: 60, bearing: 45, speed: 0.8 },
            mapAnimation: 'flyTo',
            onChapterEnter: [
                { layer: 'incident-1-marker', opacity: 1, duration: 1000 },
                { layer: 'ambulance-route-1', opacity: 1, duration: 2000 }
            ],
            onChapterExit: [ { layer: 'incident-1-marker', opacity: 0, duration: 500 } ]
        },
        {
            id: 'testimony-fatima',
            alignment: 'left',
            hidden: false,
            subtitle: 'Testimony #2',
            title: 'Fatima R., Paramedic',
            video: './assets/IMG_9041.MOV',
            quote: `"We waited 47 minutes while we could see the patient's vitals dropping. By the time we reached the hospital, it was too late."`,
            description: `Fatima's account from October 22, 2023, describes how checkpoint delays directly resulted in preventable deaths.`,
            source: 'Video testimony recorded by B\'Tselem, October 28, 2023',
            location: { center: [35.2745, 32.1567], zoom: 16, pitch: 45, bearing: -20, speed: 0.8 },
            mapAnimation: 'flyTo',
            onChapterEnter: [
                { layer: 'incident-2-marker', opacity: 1, duration: 1000 },
                { layer: 'checkpoint-delay-radius', opacity: 0.5, duration: 2000 }
            ],
            onChapterExit: [ { layer: 'incident-2-marker', opacity: 0, duration: 500 } ]
        },
        {
            id: 'pattern-analysis',
            alignment: 'center',
            hidden: false,
            subtitle: 'Spatial Analysis',
            title: 'Systematic Targeting Pattern',
            image: './assets/pattern-map.jpg',
            description: `Our spatial analysis reveals a clear pattern: 87% of documented attacks on medical vehicles occurred within 500 meters of Israeli checkpoints or military positions.`,
            source: 'Data compiled from PHRI, B\'Tselem, and UN OCHA reports, 2023',
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