import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import { API_CONFIG } from '@/api/config';

export function useAnalysisGrid() {
    const showAnalysisGrid = ref(false);
    let activePopup: maplibregl.Popup | null = null;

    const tileUrl = `${API_CONFIG.MARTIN_BASE_URL}/barbershop_density/{z}/{x}/{y}`;

    // Color stops for density score — maps to MapLibre interpolate expression values
    const colorStops: [number, string][] = [
        [0,    '#3288bd'],
        [250,  '#66c2a5'],
        [500,  '#abdda4'],
        [750,  '#e6f598'],
        [1000, '#fee08b'],
        [1500, '#fdae61'],
        [2000, '#f46d43'],
    ];

    function buildColorExpression(): maplibregl.ExpressionSpecification {
        const stops: any[] = [];
        colorStops.forEach(([val, color]) => stops.push(val, color));
        return ['interpolate', ['linear'], ['get', 'men_per_shop'], ...stops];
    }

    function ensureLayers(map: MapLibreMap) {
        if (map.getSource('analysis-grid')) return;

        map.addSource('analysis-grid', {
            type: 'vector',
            tiles: [tileUrl],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'analysis-grid-fill',
            type: 'fill',
            source: 'analysis-grid',
            'source-layer': 'barbershop_density',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': buildColorExpression(),
                'fill-opacity': 0.6,
            },
        });

        map.addLayer({
            id: 'analysis-grid-outline',
            type: 'line',
            source: 'analysis-grid',
            'source-layer': 'barbershop_density',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#fff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.addLayer({
            id: 'analysis-grid-labels',
            type: 'symbol',
            source: 'analysis-grid',
            'source-layer': 'barbershop_density',
            layout: {
                visibility: 'none',
                'text-field': ['concat', ['to-string', ['get', 'barbershop_count']], ' ✂'],
                'text-size': 11,
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-allow-overlap': false,
            },
            filter: ['>', ['get', 'barbershop_count'], 0],
        });

        map.on('click', 'analysis-grid-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const densityScore = props.men_per_shop || 0;
            const malePopulation = props.male_population || 0;
            const barbershopCount = props.barbershop_count || 0;

            let marketStatus = 'Saturated', statusEmoji = '❄️';
            if (densityScore >= 4000)      { marketStatus = 'Very High Opportunity'; statusEmoji = '🔥'; }
            else if (densityScore >= 3000) { marketStatus = 'High Opportunity';      statusEmoji = '🔴'; }
            else if (densityScore >= 2000) { marketStatus = 'Good Opportunity';      statusEmoji = '🟠'; }
            else if (densityScore >= 1500) { marketStatus = 'Moderate';              statusEmoji = '🟡'; }
            else if (densityScore >= 1000) { marketStatus = 'Balanced';              statusEmoji = '🟢'; }
            else if (densityScore >= 500)  { marketStatus = 'Competitive';           statusEmoji = '🔵'; }

            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-family:system-ui,sans-serif;min-width:220px">
                        <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;color:#1e293b;font-size:16px">Market Analysis</h3>
                        <div style="margin-bottom:16px;padding:10px;border-radius:6px;border-left:3px solid #888">
                            <div style="font-size:14px;font-weight:600;margin-bottom:4px">${statusEmoji} ${marketStatus}</div>
                            <div style="font-size:20px;font-weight:700;color:#0f172a">
                                ${Number(densityScore).toFixed(0)} <span style="font-size:12px;font-weight:400;color:#64748b">men/shop</span>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                            <div style="background:#f8fafc;padding:8px;border-radius:6px">
                                <div style="font-size:11px;color:#64748b;margin-bottom:4px">Male Population</div>
                                <div style="font-size:16px;font-weight:600">👨 ${Number(malePopulation).toLocaleString()}</div>
                            </div>
                            <div style="background:#f8fafc;padding:8px;border-radius:6px">
                                <div style="font-size:11px;color:#64748b;margin-bottom:4px">Barbershops</div>
                                <div style="font-size:16px;font-weight:600">✂️ ${barbershopCount}</div>
                            </div>
                        </div>
                    </div>
                `)
                .addTo(map);
        });

        map.on('mouseenter', 'analysis-grid-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'analysis-grid-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function setVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['analysis-grid-fill', 'analysis-grid-outline', 'analysis-grid-labels'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    const toggleAnalysisGrid = (map: MapLibreMap | null) => {
        if (!map) return;
        showAnalysisGrid.value = !showAnalysisGrid.value;
        ensureLayers(map);
        setVisibility(map, showAnalysisGrid.value);
    };

    return {
        showAnalysisGrid,
        toggleAnalysisGrid,
    };
}
