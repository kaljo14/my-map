import { ref } from 'vue';
import L from 'leaflet';
import TilesAPI from '@/api/tiles';

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

    let stopsLayer: any = null;

    const createStopsLayer = (map: any) => {
        const tileUrl = `/api/martin/gtfs_stops/{z}/{x}/{y}.pbf`;
        const headers = TilesAPI.getAuthHeaders();

        const layer = (L as any).vectorGrid.protobuf(tileUrl, {
            pane: 'overlayPane',
            vectorTileLayerStyles: {
                gtfs_stops: (properties: any) => {
                    const isActive = activeStopLines.value.includes(properties.line);
                    if (!isActive) {
                        return { radius: 0, fillOpacity: 0, stroke: false };
                    }
                    const lineColor = METRO_STOP_COLORS[properties.line] || '#f39c12';
                    return {
                        radius: 7,
                        fillColor: lineColor,
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1,
                    };
                },
            },
            interactive: true,
            getFeatureId: (f: any) => f.properties.stop_id || f.properties.id,
            fetchOptions: { headers },
            maxNativeZoom: 14,
        });

        layer.on('click', (e: any) => {
            const props = e.layer.properties;
            const lineColor = METRO_STOP_COLORS[props.line] || '#f39c12';
            L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                    <div style="font-family: system-ui; min-width: 180px;">
                        <h3 style="margin: 0 0 4px 0; color: ${lineColor};">${props.line || ''}</h3>
                        <p style="margin: 0; font-size: 0.9rem; font-weight: 600;">${props.stop_name || ''}</p>
                        <small style="color: #718096;">Stop ID: ${props.stop_id || ''}</small>
                    </div>
                `)
                .openOn(map);
        });

        return layer;
    };

    const toggleMetroStops = (map: any) => {
        showMetroStops.value = !showMetroStops.value;
        if (!map) return;

        if (showMetroStops.value) {
            if (!stopsLayer) {
                stopsLayer = createStopsLayer(map);
            }
            stopsLayer.addTo(map);
        } else {
            if (stopsLayer && map.hasLayer(stopsLayer)) {
                stopsLayer.remove();
            }
        }
    };

    const toggleStopLine = (lineId: string, map: any) => {
        if (activeStopLines.value.includes(lineId)) {
            activeStopLines.value = activeStopLines.value.filter(id => id !== lineId);
        } else {
            activeStopLines.value.push(lineId);
        }

        // Recreate layer to reflect the updated filter
        if (showMetroStops.value && map) {
            if (stopsLayer && map.hasLayer(stopsLayer)) {
                stopsLayer.remove();
            }
            stopsLayer = null;
            showMetroStops.value = false;
            toggleMetroStops(map);
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
