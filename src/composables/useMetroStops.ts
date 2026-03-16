import { ref } from 'vue';
import MetroAPI from '@/api/metro';
import type { MetroStopFeature } from '@/api/metro';
import L from 'leaflet';

export function useMetroStops() {
    const showMetroStops = ref(false);
    const metroStops = ref<MetroStopFeature[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Store marker layers grouped by line
    const markerLayers: Record<string, L.LayerGroup> = {};

    // Line-specific visibility (M1, M2, M3, M4)
    const activeStopLines = ref<string[]>(['M1', 'M2', 'M3', 'M4']);

    const METRO_LINES = ['M1', 'M2', 'M3', 'M4'];

    /**
     * Fetch metro stops from API
     */
    const fetchMetroStops = async () => {
        if (metroStops.value.length > 0) return; // Already loaded

        isLoading.value = true;
        error.value = null;

        try {
            const data = await MetroAPI.getMetroStops();
            metroStops.value = data.features;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to load metro stops';
            console.error('Error fetching metro stops:', err);
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Create a custom icon with the metro line color
     */
    const createStopIcon = (color: string) => {
        return L.divIcon({
            className: 'metro-stop-marker',
            html: `
                <div class="metro-stop-icon" style="background: ${color};">
                    <div class="metro-stop-inner">M</div>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });
    };

    /**
     * Create popup content for a stop
     */
    const createPopupContent = (stop: MetroStopFeature) => {
        const { stop_name, line, stop_id, route_color } = stop.properties;
        return `
            <div class="metro-stop-popup">
                <div class="metro-stop-header" style="border-left: 4px solid ${route_color};">
                    <h3 style="color: ${route_color};">${line}</h3>
                    <p class="stop-name">${stop_name}</p>
                </div>
                <div class="metro-stop-info">
                    <small>Stop ID: ${stop_id}</small>
                </div>
            </div>
        `;
    };

    /**
     * Update map markers based on visibility settings
     */
    const updateMapMarkers = (mapInstance: any) => {
        if (!mapInstance) return;

        // Remove all existing markers
        METRO_LINES.forEach(lineId => {
            if (markerLayers[lineId]) {
                markerLayers[lineId].removeFrom(mapInstance);
            }
        });

        // Only add markers if the main toggle is on
        if (!showMetroStops.value) return;

        // Group stops by line
        const stopsByLine: Record<string, MetroStopFeature[]> = {};
        metroStops.value.forEach(stop => {
            const line = stop.properties.line;
            if (!stopsByLine[line]) {
                stopsByLine[line] = [];
            }
            stopsByLine[line].push(stop);
        });

        // Create markers for each active line
        METRO_LINES.forEach(lineId => {
            const shouldShow = activeStopLines.value.includes(lineId);

            if (shouldShow && stopsByLine[lineId]) {
                // Create layer group if it doesn't exist
                if (!markerLayers[lineId]) {
                    markerLayers[lineId] = L.layerGroup();
                }

                // Clear existing markers in this layer
                markerLayers[lineId].clearLayers();

                // Add markers for each stop on this line
                stopsByLine[lineId].forEach(stop => {
                    const [lng, lat] = stop.geometry.coordinates;
                    const color = stop.properties.route_color;

                    const marker = L.marker([lat, lng], {
                        icon: createStopIcon(color)
                    });

                    marker.bindPopup(createPopupContent(stop));
                    marker.addTo(markerLayers[lineId]!);
                });

                // Add the layer group to the map
                markerLayers[lineId].addTo(mapInstance);
            }
        });
    };

    /**
     * Toggle metro stops visibility
     */
    const toggleMetroStops = async (mapInstance: any) => {
        showMetroStops.value = !showMetroStops.value;

        // Fetch data if not already loaded
        if (showMetroStops.value && metroStops.value.length === 0) {
            await fetchMetroStops();
        }

        updateMapMarkers(mapInstance);
    };

    /**
     * Toggle individual line visibility
     */
    const toggleStopLine = (lineId: string, mapInstance: any) => {
        if (activeStopLines.value.includes(lineId)) {
            activeStopLines.value = activeStopLines.value.filter(id => id !== lineId);
        } else {
            activeStopLines.value.push(lineId);
        }

        // Only update if the main toggle is on
        if (showMetroStops.value) {
            updateMapMarkers(mapInstance);
        }
    };

    return {
        showMetroStops,
        metroStops,
        isLoading,
        error,
        activeStopLines,
        METRO_LINES,
        toggleMetroStops,
        toggleStopLine,
        fetchMetroStops
    };
}
