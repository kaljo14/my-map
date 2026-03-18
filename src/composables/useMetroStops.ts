import { ref } from 'vue';
import L from 'leaflet';
import MetroAPI from '@/api/metro';

const METRO_STOP_COLORS: Record<string, string> = {
    'M1': '#EE3124',
    'M2': '#0054A6',
    'M3': '#00A651',
    'M4': '#FFD700',
};

export function useMetroStops() {
    const showMetroStops = ref(false);
    const activeStopLines = ref<string[]>(['M1', 'M2', 'M3', 'M4']);
    const METRO_LINES = ['M1', 'M2', 'M3', 'M4'];

    let stopsLayer: L.LayerGroup | null = null;

    const buildStopsLayer = async (map: any): Promise<L.LayerGroup> => {
        const data = await MetroAPI.getMetroStops();
        const group = L.layerGroup();

        for (const feature of data.features) {
            const props = feature.properties;
            if (!activeStopLines.value.includes(props.line)) continue;

            const [lng, lat] = feature.geometry.coordinates;
            const color = METRO_STOP_COLORS[props.line] || '#f39c12';

            const marker = L.circleMarker([lat, lng], {
                radius: 7,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 1,
            });

            marker.bindPopup(`
                <div style="font-family: system-ui; min-width: 180px;">
                    <h3 style="margin: 0 0 4px 0; color: ${color};">${props.line}</h3>
                    <p style="margin: 0; font-size: 0.9rem; font-weight: 600;">${props.stop_name}</p>
                    <small style="color: #718096;">Stop ID: ${props.stop_id}</small>
                </div>
            `);

            group.addLayer(marker);
        }

        return group;
    };

    const toggleMetroStops = async (map: any) => {
        showMetroStops.value = !showMetroStops.value;
        if (!map) return;

        if (showMetroStops.value) {
            stopsLayer = await buildStopsLayer(map);
            stopsLayer.addTo(map);
        } else {
            if (stopsLayer) {
                stopsLayer.remove();
                stopsLayer = null;
            }
        }
    };

    const toggleStopLine = async (lineId: string, map: any) => {
        if (activeStopLines.value.includes(lineId)) {
            activeStopLines.value = activeStopLines.value.filter(id => id !== lineId);
        } else {
            activeStopLines.value.push(lineId);
        }

        if (showMetroStops.value && map) {
            if (stopsLayer) {
                stopsLayer.remove();
                stopsLayer = null;
            }
            stopsLayer = await buildStopsLayer(map);
            stopsLayer.addTo(map);
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
