import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import MetroAPI from '@/api/metro';

const METRO_STOP_COLORS: Record<string, string> = {
    M1: '#EE3124',
    M2: '#0054A6',
    M3: '#00A651',
    M4: '#FFD700',
};

export const METRO_LINES = ['M1', 'M2', 'M3', 'M4'];

export function useMetroStops() {
    const showMetroStops = ref(false);
    const activeStopLines = ref<string[]>(['M1', 'M2', 'M3', 'M4']);

    let activePopup: maplibregl.Popup | null = null;
    let cachedGeoJSON: GeoJSON.FeatureCollection | null = null;

    function filteredGeoJSON(): GeoJSON.FeatureCollection {
        if (!cachedGeoJSON) return { type: 'FeatureCollection', features: [] };
        return {
            type: 'FeatureCollection',
            features: cachedGeoJSON.features.filter(
                f => activeStopLines.value.includes(f.properties?.line)
            ),
        };
    }

    function updateSource(map: MapLibreMap) {
        const source = map.getSource('metro-stops') as maplibregl.GeoJSONSource | undefined;
        if (source) source.setData(filteredGeoJSON());
    }

    async function ensureLayer(map: MapLibreMap) {
        if (!cachedGeoJSON) {
            cachedGeoJSON = await MetroAPI.getMetroStops() as GeoJSON.FeatureCollection;
        }

        if (!map.getSource('metro-stops')) {
            const data = filteredGeoJSON();
            map.addSource('metro-stops', {
                type: 'geojson',
                data,
            });

            map.addLayer({
                id: 'metro-stops-layer',
                type: 'circle',
                source: 'metro-stops',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': 7,
                    'circle-color': [
                        'match', ['get', 'line'],
                        'M1', METRO_STOP_COLORS.M1!,
                        'M2', METRO_STOP_COLORS.M2!,
                        'M3', METRO_STOP_COLORS.M3!,
                        'M4', METRO_STOP_COLORS.M4!,
                        '#f39c12',
                    ],
                    'circle-stroke-color': '#fff',
                    'circle-stroke-width': 2,
                },
            });

            map.on('click', 'metro-stops-layer', (e) => {
                const props = e.features?.[0]?.properties ?? {};
                const color = METRO_STOP_COLORS[props.line] || '#f39c12';
                activePopup?.remove();
                activePopup = new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <div style="font-family:system-ui;min-width:180px">
                            <h3 style="margin:0 0 4px 0;color:${color}">${props.line}</h3>
                            <p style="margin:0;font-size:0.9rem;font-weight:600">${props.stop_name}</p>
                            <small style="color:#718096">Stop ID: ${props.stop_id}</small>
                        </div>
                    `)
                    .addTo(map);
            });
            map.on('mouseenter', 'metro-stops-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'metro-stops-layer', () => { map.getCanvas().style.cursor = ''; });
        } else {
            updateSource(map);
        }
    }

    const toggleMetroStops = async (map: MapLibreMap | null) => {
        if (!map) return;
        showMetroStops.value = !showMetroStops.value;
        try {
            await ensureLayer(map);
        } catch (e) {
            // Revert toggle so UI state stays consistent with actual layer state
            showMetroStops.value = !showMetroStops.value;
            console.error('[MetroStops] Failed to load stops:', e);
            return;
        }
        const layer = map.getLayer('metro-stops-layer');
        if (layer) {
            map.setLayoutProperty('metro-stops-layer', 'visibility', showMetroStops.value ? 'visible' : 'none');
        }
    };

    const toggleStopLine = async (lineId: string, map: MapLibreMap | null) => {
        if (!map) return;
        if (activeStopLines.value.includes(lineId)) {
            activeStopLines.value = activeStopLines.value.filter(id => id !== lineId);
        } else {
            activeStopLines.value.push(lineId);
        }
        if (showMetroStops.value) {
            try {
                await ensureLayer(map);
            } catch (e) {
                console.error('[MetroStops] Failed to update stop line filter:', e);
            }
        }
    };

    return {
        showMetroStops,
        activeStopLines,
        METRO_LINES,
        toggleMetroStops,
        toggleStopLine,
    };
}
