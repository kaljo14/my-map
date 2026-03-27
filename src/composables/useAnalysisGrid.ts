import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import { API_CONFIG } from '@/api/config';

export function useAnalysisGrid() {
    const showAnalysisGrid = ref(false);
    let activePopup: maplibregl.Popup | null = null;

    const tileUrl = `${API_CONFIG.MARTIN_BASE_URL}/barbershop_density/{z}/{x}/{y}`;

    // Color stops for density score — maps to MapLibre interpolate expression values.
    // Range matches popup thresholds (0 = saturated → 4000+ = very high opportunity).
    const colorStops: [number, string][] = [
        [0, '#3288bd'],
        [500, '#abdda4'],
        [1000, '#fee08b'],
        [1500, '#fdae61'],
        [2000, '#f46d43'],
        [3000, '#d53e4f'],
        [4000, '#9e0142'],
    ];

    function buildColorExpression(): maplibregl.ExpressionSpecification {
        const stops: any[] = [];
        colorStops.forEach(([val, color]) => stops.push(val, color));
        return ['interpolate', ['linear'], ['to-number', ['get', 'men_per_shop'], 0], ...stops];
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
                'text-field': ['to-string', ['get', 'barbershop_count']],
                'text-size': 11,
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-allow-overlap': false,
                'symbol-avoid-edges': true,
            },
            filter: ['>', ['get', 'barbershop_count'], 0],
        });

        map.on('click', 'analysis-grid-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const densityScore = props.men_per_shop || 0;
            const malePopulation = props.male_population || 0;
            const barbershopCount = props.barbershop_count || 0;

            let marketStatus = 'Saturated', statusColor = '#94a3b8';
            if (densityScore >= 4000) { marketStatus = 'Very High Opportunity'; statusColor = '#ef4444'; }
            else if (densityScore >= 3000) { marketStatus = 'High Opportunity'; statusColor = '#f97316'; }
            else if (densityScore >= 2000) { marketStatus = 'Good Opportunity'; statusColor = '#f59e0b'; }
            else if (densityScore >= 1500) { marketStatus = 'Moderate'; statusColor = '#eab308'; }
            else if (densityScore >= 1000) { marketStatus = 'Balanced'; statusColor = '#22c55e'; }
            else if (densityScore >= 500) { marketStatus = 'Competitive'; statusColor = '#3b82f6'; }
            const statusDot = `<span class="material-symbols-outlined" style="font-size:14px;color:${statusColor};vertical-align:middle">circle</span>`;

            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-family:system-ui,sans-serif;min-width:220px;color:#0f172a">
                        <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;color:#1e293b;font-size:16px">Market Analysis</h3>
                        <div style="margin-bottom:16px;padding:10px;border-radius:6px;border-left:3px solid #888;color:#0f172a">
                            <div style="font-size:14px;font-weight:600;margin-bottom:4px;color:#0f172a">${statusDot} ${marketStatus}</div>
                            <div style="font-size:20px;font-weight:700;color:#0f172a">
                                ${Number(densityScore).toFixed(0)} <span style="font-size:12px;font-weight:400;color:#64748b">men/shop</span>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                            <div style="background:#f8fafc;padding:8px;border-radius:6px">
                                <div style="font-size:11px;color:#64748b;margin-bottom:4px">Male Population</div>
                                <div style="font-size:16px;font-weight:600;color:#0f172a"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">man</span> ${Number(malePopulation).toLocaleString()}</div>
                            </div>
                            <div style="background:#f8fafc;padding:8px;border-radius:6px">
                                <div style="font-size:11px;color:#64748b;margin-bottom:4px">Barbershops</div>
                                <div style="font-size:16px;font-weight:600;color:#0f172a"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">content_cut</span> ${barbershopCount}</div>
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
