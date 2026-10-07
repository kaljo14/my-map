import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';

export function usePedestrianNetwork() {
    const showPedestrianNetwork = ref(false);
    let activePopup: maplibregl.Popup | null = null;
    let legendContainer: HTMLElement | null = null;

    // Walk score: 0 → red, 50 → yellow, 100 → green
    const walkScoreColorExpression: maplibregl.ExpressionSpecification = [
        'interpolate', ['linear'], ['get', 'walk_score'],
        0,   '#d73027',
        50,  '#fee08b',
        100, '#1a9850',
    ];

    function buildLegendElement(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'walk-legend maplibregl-ctrl';
        div.innerHTML = `
            <div class="walk-legend-title">Walk Score</div>
            <div class="walk-legend-gradient"></div>
            <div class="walk-legend-labels">
                <span>Low</span><span>Med</span><span>High</span>
            </div>
        `;
        return div;
    }

    function ensureLayer(map: MapLibreMap) {
        if (map.getSource('pedestrian-network')) return;

        const tileUrl = TilesAPI.getOsmEdgesTileUrlTemplate();
        map.addSource('pedestrian-network', {
            type: 'vector',
            tiles: [tileUrl],
            minzoom: 12,
            maxzoom: 16,
        });

        map.addLayer({
            id: 'pedestrian-network-layer',
            type: 'line',
            source: 'pedestrian-network',
            'source-layer': 'osm_edges',
            layout: { visibility: 'none' },
            paint: {
                'line-color': walkScoreColorExpression,
                'line-width': 2,
                'line-opacity': 0.6,
            },
        });

        map.on('click', 'pedestrian-network-layer', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const score = Number(props.walk_score ?? 0);
            activePopup?.remove();
            activePopup = new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-family:system-ui,sans-serif;min-width:180px">
                        <div style="font-weight:700;margin-bottom:8px;font-size:15px">🚶 Pedestrian Street</div>
                        <div style="display:flex;flex-direction:column;gap:4px;font-size:13px">
                            <div><span style="color:#64748b">Type:</span> <strong>${props.highway ?? '—'}</strong></div>
                            <div><span style="color:#64748b">Walk score:</span> <strong>${score.toFixed(1)}/100</strong></div>
                        </div>
                        <div style="margin-top:10px;height:8px;border-radius:4px;background:linear-gradient(to right,#d73027,#fee08b,#1a9850)"></div>
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:2px">
                            <span>Low</span><span>Medium</span><span>High</span>
                        </div>
                    </div>
                `)
                .addTo(map);
        });

        map.on('mouseenter', 'pedestrian-network-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'pedestrian-network-layer', () => { map.getCanvas().style.cursor = ''; });
    }

    const togglePedestrianNetwork = (map: MapLibreMap | null) => {
        if (!map) return;
        showPedestrianNetwork.value = !showPedestrianNetwork.value;

        if (showPedestrianNetwork.value) {
            ensureLayer(map);
            map.setLayoutProperty('pedestrian-network-layer', 'visibility', 'visible');
            if (!legendContainer) {
                legendContainer = buildLegendElement();
                map.getContainer().appendChild(legendContainer);
            }
        } else {
            if (map.getLayer('pedestrian-network-layer')) {
                map.setLayoutProperty('pedestrian-network-layer', 'visibility', 'none');
            }
            legendContainer?.remove();
            legendContainer = null;
        }
    };

    return {
        showPedestrianNetwork,
        togglePedestrianNetwork,
    };
}
