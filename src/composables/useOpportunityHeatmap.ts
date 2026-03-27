import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';

export type HeatmapCategory = 'barbershop' | 'gym';

export function useOpportunityHeatmap() {
    const showOpportunityHeatmap = ref(false);
    const activeCategory = ref<HeatmapCategory>('barbershop');
    let activePopup: maplibregl.Popup | null = null;
    let legendContainer: HTMLElement | null = null;

    // Diverging ramp: dark blue (low) → yellow (mid) → dark red (high)
    const scoreColorExpression: maplibregl.ExpressionSpecification = [
        'interpolate', ['linear'], ['get', 'score'],
        0,   '#313695',
        50,  '#ffffbf',
        100, '#a50026',
    ];

    function buildLegendElement(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'opportunity-legend maplibregl-ctrl';
        div.innerHTML = `
            <div class="opp-legend-title">Opportunity Score</div>
            <div class="opp-legend-gradient"></div>
            <div class="opp-legend-labels">
                <span>Low</span><span>Med</span><span>High</span>
            </div>
        `;
        return div;
    }

    function ensureLayer(map: MapLibreMap) {
        if (map.getSource('opportunity-heatmap')) return;

        const tileUrl = TilesAPI.getOpportunityHeatmapTileUrlTemplate();
        map.addSource('opportunity-heatmap', {
            type: 'vector',
            tiles: [tileUrl],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'opportunity-heatmap-layer',
            type: 'fill',
            source: 'opportunity-heatmap',
            'source-layer': 'opportunity_heatmap',
            layout: { visibility: 'none' },
            filter: ['==', ['get', 'category'], activeCategory.value],
            paint: {
                'fill-color': scoreColorExpression,
                'fill-opacity': 0.7,
            },
        });

        map.on('click', 'opportunity-heatmap-layer', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const cat = props.category ?? '';
            const score = Number(props.score ?? 0);
            activePopup?.remove();
            activePopup = new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-family:system-ui,sans-serif;min-width:180px">
                        <div style="font-weight:700;margin-bottom:8px;font-size:15px">
                            <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle">${cat === 'barbershop' ? 'content_cut' : 'fitness_center'}</span> ${cat === 'barbershop' ? 'Barbershop' : 'Gym'} Zone
                        </div>
                        <div style="display:flex;flex-direction:column;gap:4px;font-size:13px">
                            <div><span style="color:#64748b">Category:</span> <strong>${cat}</strong></div>
                            <div><span style="color:#64748b">Opportunity score:</span> <strong>${score.toFixed(1)}/100</strong></div>
                        </div>
                        <div style="margin-top:10px;height:8px;border-radius:4px;background:linear-gradient(to right,#313695,#ffffbf,#a50026)"></div>
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:2px">
                            <span>Low</span><span>Medium</span><span>High</span>
                        </div>
                    </div>
                `)
                .addTo(map);
        });

        map.on('mouseenter', 'opportunity-heatmap-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'opportunity-heatmap-layer', () => { map.getCanvas().style.cursor = ''; });
    }

    const toggleOpportunityHeatmap = (map: MapLibreMap | null) => {
        if (!map) return;
        showOpportunityHeatmap.value = !showOpportunityHeatmap.value;

        if (showOpportunityHeatmap.value) {
            ensureLayer(map);
            map.setLayoutProperty('opportunity-heatmap-layer', 'visibility', 'visible');
            if (!legendContainer) {
                legendContainer = buildLegendElement();
                map.getContainer().appendChild(legendContainer);
            }
        } else {
            if (map.getLayer('opportunity-heatmap-layer')) {
                map.setLayoutProperty('opportunity-heatmap-layer', 'visibility', 'none');
            }
            legendContainer?.remove();
            legendContainer = null;
        }
    };

    const setHeatmapCategory = (category: HeatmapCategory, map: MapLibreMap | null) => {
        if (activeCategory.value === category) return;
        activeCategory.value = category;
        if (map && map.getLayer('opportunity-heatmap-layer')) {
            map.setFilter('opportunity-heatmap-layer', ['==', ['get', 'category'], category]);
        }
    };

    return {
        showOpportunityHeatmap,
        activeCategory,
        toggleOpportunityHeatmap,
        setHeatmapCategory,
    };
}
