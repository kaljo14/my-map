import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';

const SOURCE_ID = 'pedestrian-sensors';
const CIRCLE_LAYER = 'pedestrian-sensors-circle';
const LABEL_LAYER = 'pedestrian-sensors-label';
const SOURCE_LAYER = 'pedestrian_sensors_tiles';

export function usePedestrianSensors() {
    const showPedestrianSensors = ref(false);
    let activePopup: maplibregl.Popup | null = null;

    function ensureLayers(map: MapLibreMap) {
        if (map.getSource(SOURCE_ID)) return;

        map.addSource(SOURCE_ID, {
            type: 'vector',
            tiles: [TilesAPI.getPedestrianSensorsTileUrlTemplate()],
            maxzoom: 22,
        });

        // Circle layer — radius & color driven by total_pedestrians
        map.addLayer({
            id: CIRCLE_LAYER,
            type: 'circle',
            source: SOURCE_ID,
            'source-layer': SOURCE_LAYER,
            layout: { visibility: 'none' },
            paint: {
                'circle-radius': [
                    'interpolate', ['linear'], ['get', 'total_pedestrians'],
                    0,      6,
                    50000,  12,
                    200000, 22,
                    500000, 34,
                ],
                'circle-color': [
                    'interpolate', ['linear'], ['get', 'total_pedestrians'],
                    0,      '#3288bd',
                    50000,  '#66c2a5',
                    150000, '#fee08b',
                    300000, '#f46d43',
                    500000, '#d53e4f',
                ],
                'circle-opacity': 0.85,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#ffffff',
            },
        });

        // Label layer — show device ID at higher zoom levels
        map.addLayer({
            id: LABEL_LAYER,
            type: 'symbol',
            source: SOURCE_ID,
            'source-layer': SOURCE_LAYER,
            layout: {
                visibility: 'none',
                'text-field': ['get', 'device_id'],
                'text-size': 11,
                'text-offset': [0, 1.8],
                'text-anchor': 'top',
            },
            paint: {
                'text-color': '#1e293b',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1.2,
            },
            minzoom: 15,
        });

        // Click popup
        map.on('click', CIRCLE_LAYER, (e) => {
            const feat = e.features?.[0];
            if (!feat) return;
            const p = feat.properties;
            const total = (p.total_pedestrians ?? 0).toLocaleString();
            const left = (p.total_left ?? 0).toLocaleString();
            const right = (p.total_right ?? 0).toLocaleString();
            const readings = (p.reading_count ?? 0).toLocaleString();

            activePopup?.remove();
            activePopup = new maplibregl.Popup({ maxWidth: '260px' })
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-family:system-ui,sans-serif;min-width:180px;color:#0f172a">
                        <h3 style="margin:0 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;font-size:15px;color:#1e293b">
                            <span class="material-symbols-outlined" style="font-size:15px;vertical-align:middle;margin-right:4px">directions_walk</span>
                            Sensor ${p.device_id}
                        </h3>
                        <div style="display:flex;flex-direction:column;gap:4px;font-size:13px">
                            <div><strong>Total:</strong> ${total} pedestrians</div>
                            <div style="display:flex;gap:12px">
                                <span>Left: ${left}</span>
                                <span>Right: ${right}</span>
                            </div>
                            <div style="color:#64748b;font-size:12px">${readings} readings</div>
                        </div>
                    </div>
                `)
                .addTo(map);
        });

        map.on('mouseenter', CIRCLE_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', CIRCLE_LAYER, () => { map.getCanvas().style.cursor = ''; });
    }

    function setVisibility(map: MapLibreMap, visible: boolean) {
        const v = visible ? 'visible' : 'none';
        if (map.getLayer(CIRCLE_LAYER)) map.setLayoutProperty(CIRCLE_LAYER, 'visibility', v);
        if (map.getLayer(LABEL_LAYER))  map.setLayoutProperty(LABEL_LAYER, 'visibility', v);
    }

    const togglePedestrianSensors = (map: MapLibreMap | null) => {
        if (!map) return;
        showPedestrianSensors.value = !showPedestrianSensors.value;
        ensureLayers(map);
        setVisibility(map, showPedestrianSensors.value);
    };

    return {
        showPedestrianSensors,
        togglePedestrianSensors,
    };
}
