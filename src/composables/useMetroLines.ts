import { ref } from 'vue';
import TilesAPI from '@/api/tiles';
import L from 'leaflet';

export function useMetroLines() {


    // Vector Layer Support
    const showMetroVector = ref(false);
    // Store layers by line ID
    const vectorLayers: Record<string, any> = {};
    const METRO_LINES = ['M1', 'M2', 'M3', 'M4'];
    const activeMetroLines = ref<string[]>(['M1', 'M2', 'M3', 'M4']);

    const updateMapLayers = (mapInstance: any) => {
        if (!mapInstance) return;

        // Define Z-Index for stacking order (Higher is on top)
        // User requested: M1 (Top) -> M2 -> M3 -> M4 (Bottom)
        const Z_INDEXES: Record<string, number> = {
            'M1': 500,
            'M2': 400,
            'M3': 300,
            'M4': 200
        };

        METRO_LINES.forEach(lineId => {
            const shouldBeVisible = showMetroVector.value && activeMetroLines.value.includes(lineId);

            if (shouldBeVisible) {
                if (!vectorLayers[lineId]) {
                    const tileUrl = TilesAPI.getMetroLineTileUrlTemplate(lineId);

                    // Create styles object that handles common layer name variations
                    const layerStyles: Record<string, any> = {};
                    const possibleLayerNames = [
                        `metro_line_${lineId}`, // Matches filename
                        lineId,                 // Matches ID (M1, M2...)
                        'metro_lines',          // Generic
                        'lines',
                        'default',
                        'mbtiles'
                    ];

                    const styleFunction = function (_properties: any) {
                        return {
                            color: METRO_COLORS[lineId],
                            weight: 4,
                            opacity: 0.9,
                            fill: false,
                            stroke: true
                        };
                    };

                    possibleLayerNames.forEach(name => {
                        layerStyles[name] = styleFunction;
                    });

                    // @ts-ignore
                    const layer = (L as any).vectorGrid.protobuf(tileUrl, {
                        pane: 'overlayPane',
                        vectorTileLayerStyles: layerStyles,
                        interactive: true,
                        zIndex: Z_INDEXES[lineId], // Explicit Z-Index

                        minZoom: 0,
                        maxZoom: 18, // Lines remain visible up to zoom 18
                        // Bounds for Sofia, Bulgaria metro system
                        bounds: L.latLngBounds(
                            L.latLng(42.55, 23.15),  // Southwest
                            L.latLng(42.75, 23.50)   // Northeast
                        ),
                        maxNativeZoom: 14, // Stop requesting new tiles after zoom 14, reuse zoom 14 tiles
                        tolerance: 3,
                        getFeatureId: function (feature: any) {
                            return feature.properties.id || feature.properties.stop_id;
                        }
                    });

                    layer.on('click', (e: any) => {
                        const props = e.layer.properties;
                        const name = props.route_short_name || props.line || lineId;
                        const description = props.route_long_name || '';

                        L.popup()
                            .setLatLng(e.latlng)
                            .setContent(`
                                <div class="popup-content">
                                    <h3 class="popup-title" style="color: ${METRO_COLORS[lineId]}">${name}</h3>
                                    <p>${description}</p>
                                </div>
                            `)
                            .openOn(mapInstance);
                    });

                    // Handle tile loading errors gracefully (suppress "out of bounds" errors)
                    layer.on('tileerror', () => {
                        // Silently handle missing tiles - they may not exist at all zoom levels
                        // This is expected behavior for vector tiles
                    });

                    vectorLayers[lineId] = layer;
                }

                // Add to map if not already present
                if (!mapInstance.hasLayer(vectorLayers[lineId])) {
                    vectorLayers[lineId].addTo(mapInstance);
                    // Ensure z-index is applied if method exists
                    if (vectorLayers[lineId].setZIndex) {
                        vectorLayers[lineId].setZIndex(Z_INDEXES[lineId]);
                    }
                }
            } else {
                // Remove from map if present
                if (vectorLayers[lineId] && mapInstance.hasLayer(vectorLayers[lineId])) {
                    vectorLayers[lineId].remove();
                }
            }
        });
    };

    const toggleMetroVector = (mapInstance: any) => {
        showMetroVector.value = !showMetroVector.value;
        updateMapLayers(mapInstance);
    };

    const toggleMetroLine = (lineId: string, mapInstance: any) => {
        if (activeMetroLines.value.includes(lineId)) {
            activeMetroLines.value = activeMetroLines.value.filter(id => id !== lineId);
        } else {
            activeMetroLines.value.push(lineId);
        }

        // Only update if the main toggle is on
        if (showMetroVector.value) {
            updateMapLayers(mapInstance);
        }
    };

    return {
        // Vector exports
        showMetroVector,
        toggleMetroVector,
        activeMetroLines,
        toggleMetroLine,
        METRO_LINES,
        METRO_COLORS
    };
}

// Metro line color mapping - Your specified colors
const METRO_COLORS: Record<string, string> = {
    'M1': '#EE3124', // Red
    'M2': '#0054A6', // Blue
    'M3': '#00A651', // Green
    'M4': '#FFD700', // Yellow
};
