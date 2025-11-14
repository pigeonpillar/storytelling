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
                <strong>Documentation:</strong> Physicians for Human Rights Israel
            </div>
            <div>
                <strong>PHR 2025</strong>
            </div>
            <div>
                <strong>Research:</strong> Ashraf Hamdan
            </div>
        </div>
        <p style="margin-top: 2rem; color: #666;">
            This investigation documents violations of international humanitarian law protecting medical personnel.
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
            title: 'Attacks on Ambulances in Beita',
            image: './assets/01.png',
            description: 'Since October 2023, medical workers in South Nablus have faced systematic attacks while attempting to provide emergency care.',
            location: { center: [35.2769, 32.1544], zoom: 10, pitch: 0, bearing: 0, speed: 0.5 },
            mapAnimation: 'flyTo',
            onChapterEnter: [ { layer: 'satellite', opacity: 0.3, duration: 2000 } ]
        },
        {
            id: 'context-overview',
            alignment: 'center',
            hidden: false,
            subtitle: 'Geographic Context',
            title: 'The Beita Region',
            image: './assets/02.JPG',
            description: `Beita, a Palestinian town in the northern West Bank, sits at the intersection of critical medical evacuation routes. The town's location, surrounded by Israeli checkpoints and settlements, creates a complex geography of restricted movement that directly impacts emergency medical services.`,
            source: 'Source: UN OCHA, November 2023',
            location: { center: [35.2769, 32.1544], zoom: 12, pitch: 45, bearing: 20, speed: 0.8 },
            mapAnimation: 'flyTo',
            onChapterEnter: [
                { layer: 'settlements-layer', opacity: 1, duration: 1500 },
                { layer: 'checkpoint-markers', opacity: 1, duration: 1500 }
            ],
            onChapterExit: [ { layer: 'settlements-layer', opacity: 0, duration: 1000 } ]
        },
        {
            id: 'medical-infrastructure',
            alignment: 'full',
            hidden: false,
            title: 'Critical Medical Infrastructure Under Threat',
            image: './assets/hospital-aerial.jpg',
            description: 'The region\'s medical facilities serve over 50,000 residents, with ambulance response times critical for survival.',
            location: { center: [35.2800, 32.1600], zoom: 14, pitch: 60, bearing: -45, speed: 0.5 },
            mapAnimation: 'flyTo'
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
            mapAnimation: 'flyTo',
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