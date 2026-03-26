import { ref } from 'vue';
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import TilesAPI from '@/api/tiles';

const METRO_COLORS: Record<string, string> = {
    M1: '#EE3124',
    M2: '#0054A6',
    M3: '#00A651',
    M4: '#FFD700',
};

export const METRO_LINES = ['M1', 'M2', 'M3', 'M4'];

export function useMetroLines() {
    const showMetroVector = ref(false);
    const activeMetroLines = ref<string[]>(['M1', 'M2', 'M3', 'M4']);

    let activePopup: maplibregl.Popup | null = null;

    function sourceId(lineId: string) { return `metro-line-${lineId}`; }
    function layerId(lineId: string) { return `metro-line-${lineId}-layer`; }

    function addLine(map: MapLibreMap, lineId: string) {
        if (map.getSource(sourceId(lineId))) return;

        const tileUrl = TilesAPI.getMetroLineTileUrlTemplate(lineId);
        map.addSource(sourceId(lineId), {
            type: 'vector',
            tiles: [tileUrl],
            maxzoom: 14,
            bounds: [23.15, 42.55, 23.50, 42.75],
        });

        map.addLayer({
            id: layerId(lineId),
            type: 'line',
            source: sourceId(lineId),
            'source-layer': `metro_line_${lineId}`,
            layout: { visibility: 'none' },
            paint: {
                'line-color': METRO_COLORS[lineId]!,
                'line-width': 4,
                'line-opacity': 0.9,
            },
        });

        map.on('click', layerId(lineId), (e) => {
            const props = e.features?.[0]?.properties ?? {};
            const name = props.route_short_name || props.line || lineId;
            const description = props.route_long_name || '';
            activePopup?.remove();
            activePopup = new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div class="popup-content">
                        <h3 style="color:${METRO_COLORS[lineId]}; margin:0 0 4px 0">${name}</h3>
                        <p style="margin:0">${description}</p>
                    </div>
                `)
                .addTo(map);
        });

        map.on('mouseenter', layerId(lineId), () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerId(lineId), () => { map.getCanvas().style.cursor = ''; });
    }

    function updateVisibility(map: MapLibreMap) {
        // Layer insertion order determines draw order; M4 added first (bottom), M1 last (top).
        // Layers already exist after first toggle — just update visibility.
        METRO_LINES.forEach(lineId => {
            if (!map.getLayer(layerId(lineId))) return;
            const visible = showMetroVector.value && activeMetroLines.value.includes(lineId);
            map.setLayoutProperty(layerId(lineId), 'visibility', visible ? 'visible' : 'none');
        });
    }

    function ensureLayers(map: MapLibreMap) {
        // Add layers in bottom-to-top order (M4 → M1) so M1 renders on top
        ;['M4', 'M3', 'M2', 'M1'].forEach(id => addLine(map, id));
    }

    const toggleMetroVector = (map: MapLibreMap | null) => {
        if (!map) return;
        showMetroVector.value = !showMetroVector.value;
        ensureLayers(map);
        updateVisibility(map);
    };

    const toggleMetroLine = (lineId: string, map: MapLibreMap | null) => {
        if (!map) return;
        if (activeMetroLines.value.includes(lineId)) {
            activeMetroLines.value = activeMetroLines.value.filter(id => id !== lineId);
        } else {
            activeMetroLines.value.push(lineId);
        }
        if (showMetroVector.value) {
            ensureLayers(map);
            updateVisibility(map);
        }
    };

    return {
        showMetroVector,
        toggleMetroVector,
        activeMetroLines,
        toggleMetroLine,
        METRO_LINES,
        METRO_COLORS,
    };
}
