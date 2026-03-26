import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';

export function usePopulationLayers() {
    const showPopulationGrid = ref(false);
    const minPopulation = ref(0);
    const selectedThreshold = ref(0);
    let activePopup: maplibregl.Popup | null = null;

    const colorStops: [number, string][] = [
        [0,     '#3288bd'],
        [1000,  '#66c2a5'],
        [4000,  '#abdda4'],
        [8000,  '#e6f598'],
        [12000, '#fee08b'],
        [16000, '#fdae61'],
        [20000, '#f46d43'],
    ];

    function buildColorExpression(): maplibregl.ExpressionSpecification {
        const stops: any[] = [];
        colorStops.forEach(([val, color]) => stops.push(val, color));
        return ['interpolate', ['linear'], ['get', 'population'], ...stops];
    }

    function ensureLayers(map: MapLibreMap) {
        if (map.getSource('population-grid')) return;

        const tileUrl = TilesAPI.getPopulationGridTileUrlTemplate();
        map.addSource('population-grid', {
            type: 'vector',
            tiles: [tileUrl],
            maxzoom: 14,
        });

        map.addLayer({
            id: 'population-grid-fill',
            type: 'fill',
            source: 'population-grid',
            'source-layer': 'population_grid',
            layout: { visibility: 'none' },
            paint: {
                'fill-color': buildColorExpression(),
                'fill-opacity': 0.6,
            },
        });

        map.addLayer({
            id: 'population-grid-outline',
            type: 'line',
            source: 'population-grid',
            'source-layer': 'population_grid',
            layout: { visibility: 'none' },
            paint: { 'line-color': '#fff', 'line-width': 0.5, 'line-opacity': 0.4 },
        });

        map.addLayer({
            id: 'population-grid-labels',
            type: 'symbol',
            source: 'population-grid',
            'source-layer': 'population_grid',
            layout: {
                visibility: 'none',
                'text-field': ['to-string', ['get', 'population']],
                'text-size': 11,
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-allow-overlap': false,
            },
        });

        map.on('click', 'population-grid-fill', (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const total = props.population || 0;
            const male = props.male_population || 0;
            const female = props.female_population || 0;
            const youth = props.pop_youth || 0;
            const adult = props.pop_adult || 0;
            const senior = props.pop_senior || 0;
            const pctYouth   = total > 0 ? Math.round((youth  / total) * 100) : 0;
            const pctWorking = total > 0 ? Math.round((adult  / total) * 100) : 0;
            const pctSeniors = total > 0 ? Math.round((senior / total) * 100) : 0;

            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-family:system-ui,sans-serif;min-width:220px">
                        <h3 style="margin:0 0 12px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;color:#1e293b;font-size:16px">Grid Statistics</h3>
                        <div style="font-size:10px;color:#94a3b8;margin-bottom:8px">ID: ${props.grid_id || 'N/A'}</div>
                        <div style="margin-bottom:16px;padding:10px;border-radius:6px;border-left:3px solid #3288bd">
                            <div style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:4px">
                                ${Number(total).toLocaleString()} <span style="font-size:12px;font-weight:400;color:#64748b">Residents</span>
                            </div>
                            <div style="display:flex;gap:12px;font-size:13px;color:#475569">
                                <span>👨 ${Number(male).toLocaleString()}</span>
                                <span>👩 ${Number(female).toLocaleString()}</span>
                            </div>
                        </div>
                        <h4 style="margin:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8">Age Distribution</h4>
                        ${ageBar('Youth (0-14)',  youth,  pctYouth,   '#4ade80')}
                        ${ageBar('Adult (15-64)', adult,  pctWorking, '#60a5fa')}
                        ${ageBar('Senior (65+)',  senior, pctSeniors, '#f472b6')}
                    </div>
                `)
                .addTo(map);
        });

        map.on('mouseenter', 'population-grid-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'population-grid-fill', () => { map.getCanvas().style.cursor = ''; });
    }

    function ageBar(label: string, count: number, pct: number, color: string): string {
        return `
            <div style="margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;color:#334155">
                    <span>${label}</span>
                    <span style="font-weight:600">${Number(count).toLocaleString()} (${pct}%)</span>
                </div>
                <div style="background:#e2e8f0;height:6px;border-radius:3px;overflow:hidden">
                    <div style="width:${pct}%;background:${color};height:100%"></div>
                </div>
            </div>`;
    }

    function applyFilter(map: MapLibreMap) {
        if (!map.getLayer('population-grid-fill')) return;
        const threshold = minPopulation.value;
        if (threshold > 0) {
            map.setFilter('population-grid-fill',    ['>=', ['get', 'population'], threshold]);
            map.setFilter('population-grid-outline', ['>=', ['get', 'population'], threshold]);
            map.setFilter('population-grid-labels',  ['>=', ['get', 'population'], threshold]);
        } else {
            map.setFilter('population-grid-fill',    null);
            map.setFilter('population-grid-outline', null);
            map.setFilter('population-grid-labels',  null);
        }
    }

    function setVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        ['population-grid-fill', 'population-grid-outline', 'population-grid-labels'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', v);
        });
    }

    let mapRef: MapLibreMap | null = null;

    const togglePopulationGrid = (map: MapLibreMap | null, forceState?: boolean) => {
        if (!map) return;
        mapRef = map;
        if (forceState !== undefined) {
            showPopulationGrid.value = forceState;
        } else {
            showPopulationGrid.value = !showPopulationGrid.value;
        }
        ensureLayers(map);
        setVisibility(map, showPopulationGrid.value);
        if (showPopulationGrid.value) applyFilter(map);
    };

    const updatePopulationGridFilter = (threshold: number) => {
        minPopulation.value = threshold;
        if (showPopulationGrid.value && mapRef) applyFilter(mapRef);
    };

    const updateThreshold = (value: number) => {
        selectedThreshold.value = value;
        updatePopulationGridFilter(value);
    };

    return {
        showPopulationGrid,
        minPopulation,
        selectedThreshold,
        togglePopulationGrid,
        updatePopulationGridFilter,
        updateThreshold,
    };
}
