import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import MetroAPI from '@/api/metro';

const TRANSIT_STOP_COLORS: Record<string, string> = {
    bus: '#1565C0',
    tram: '#E65100',
    trolleybus: '#6A1B9A',
    other: '#757575',
};

const TRANSIT_STOP_LABELS: Record<string, string> = {
    bus: 'Bus',
    tram: 'Tram',
    trolleybus: 'Trolleybus',
    other: 'Other',
};

export const TRANSIT_TYPES = ['bus', 'tram', 'trolleybus'] as const;

export function useTransitStops() {
    const showTransitStops = ref(false);
    const activeTypes = ref<string[]>([...TRANSIT_TYPES]);

    let activePopup: maplibregl.Popup | null = null;
    let cachedGeoJSON: GeoJSON.FeatureCollection | null = null;

    function filteredGeoJSON(): GeoJSON.FeatureCollection {
        if (!cachedGeoJSON) return { type: 'FeatureCollection', features: [] };
        return {
            type: 'FeatureCollection',
            features: cachedGeoJSON.features.filter(
                f => activeTypes.value.includes(f.properties?.stop_type)
            ),
        };
    }

    function updateSource(map: MapLibreMap) {
        const source = map.getSource('transit-stops') as maplibregl.GeoJSONSource | undefined;
        if (source) source.setData(filteredGeoJSON());
    }

    async function ensureLayer(map: MapLibreMap) {
        if (!cachedGeoJSON) {
            cachedGeoJSON = await MetroAPI.getTransitStops() as GeoJSON.FeatureCollection;
        }

        if (!map.getSource('transit-stops')) {
            map.addSource('transit-stops', {
                type: 'geojson',
                data: filteredGeoJSON(),
            });

            map.addLayer({
                id: 'transit-stops-layer',
                type: 'circle',
                source: 'transit-stops',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': 4,
                    'circle-color': [
                        'match', ['get', 'stop_type'],
                        'bus', TRANSIT_STOP_COLORS.bus ?? '#757575',
                        'tram', TRANSIT_STOP_COLORS.tram ?? '#757575',
                        'trolleybus', TRANSIT_STOP_COLORS.trolleybus ?? '#757575',
                        TRANSIT_STOP_COLORS.other ?? '#757575',
                    ],
                    'circle-stroke-color': '#fff',
                    'circle-stroke-width': 1,
                    'circle-opacity': 0.85,
                },
            });

            map.on('click', 'transit-stops-layer', (e) => {
                const props = e.features?.[0]?.properties ?? {};
                const color = TRANSIT_STOP_COLORS[props.stop_type] || TRANSIT_STOP_COLORS.other;
                const typeLabel = TRANSIT_STOP_LABELS[props.stop_type] || 'Stop';
                activePopup?.remove();
                activePopup = new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <div style="font-family:system-ui;min-width:180px">
                            <h3 style="margin:0 0 4px 0;color:${color}">${typeLabel}</h3>
                            <p style="margin:0;font-size:0.9rem;font-weight:600">${props.stop_name}</p>
                            <small style="color:#718096">ID: ${props.stop_id}</small>
                        </div>
                    `)
                    .addTo(map);
            });
            map.on('mouseenter', 'transit-stops-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'transit-stops-layer', () => { map.getCanvas().style.cursor = ''; });
        } else {
            updateSource(map);
        }
    }

    const toggleTransitStops = async (map: MapLibreMap | null) => {
        if (!map) return;
        showTransitStops.value = !showTransitStops.value;
        try {
            await ensureLayer(map);
        } catch (e) {
            showTransitStops.value = !showTransitStops.value;
            console.error('[TransitStops] Failed to load stops:', e);
            return;
        }
        const layer = map.getLayer('transit-stops-layer');
        if (layer) {
            map.setLayoutProperty('transit-stops-layer', 'visibility', showTransitStops.value ? 'visible' : 'none');
        }
    };

    const toggleTransitType = async (typeId: string, map: MapLibreMap | null) => {
        if (!map) return;
        if (activeTypes.value.includes(typeId)) {
            activeTypes.value = activeTypes.value.filter(id => id !== typeId);
        } else {
            activeTypes.value.push(typeId);
        }
        if (showTransitStops.value) {
            try {
                await ensureLayer(map);
            } catch (e) {
                console.error('[TransitStops] Failed to update type filter:', e);
            }
        }
    };

    return {
        showTransitStops,
        activeTypes,
        TRANSIT_TYPES,
        TRANSIT_STOP_COLORS,
        TRANSIT_STOP_LABELS,
        toggleTransitStops,
        toggleTransitType,
    };
}
