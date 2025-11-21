import { ref } from 'vue';
import L from 'leaflet';
import 'leaflet.vectorgrid';
import auth from '@/services/auth';

export function useMapGrid() {
    const showGrid = ref(false);
    let gridLayer: any = null;

    // Color stops for population density
    const populationStops = [
        { value: 0, color: '#3288bd' },      // 0: Blue (Low)
        { value: 1000, color: '#66c2a5' },   // 1k: Greenish Cyan
        { value: 5000, color: '#abdda4' },   // 5k: Light Green
        { value: 10000, color: '#e6f598' },  // 10k: Yellow-Green
        { value: 15000, color: '#fee08b' },  // 15k: Yellow
        { value: 20000, color: '#fdae61' },  // 20k: Orange
        { value: 25000, color: '#f46d43' }   // 25k+: Red
    ];

    // Helper to interpolate colors
    const interpolateColor = (value: number, stops: { value: number, color: string }[]) => {
        // Find the two stops the value is between
        for (let i = 0; i < stops.length - 1; i++) {
            const start = stops[i]!;
            const end = stops[i + 1]!;

            if (value >= start.value && value <= end.value) {
                // Calculate ratio
                const ratio = (value - start.value) / (end.value - start.value);

                // Parse hex colors
                const startColor = parseInt(start.color.slice(1), 16);
                const endColor = parseInt(end.color.slice(1), 16);

                // Interpolate RGB components
                const r = Math.round(((startColor >> 16) & 0xFF) * (1 - ratio) + ((endColor >> 16) & 0xFF) * ratio);
                const g = Math.round(((startColor >> 8) & 0xFF) * (1 - ratio) + ((endColor >> 8) & 0xFF) * ratio);
                const b = Math.round((startColor & 0xFF) * (1 - ratio) + (endColor & 0xFF) * ratio);

                return `rgb(${r}, ${g}, ${b})`;
            }
        }

        // Handle out of bounds
        if (!stops.length) return '#000000';
        if (value < stops[0]!.value) return stops[0]!.color;
        if (value > stops[stops.length - 1]!.value) return stops[stops.length - 1]!.color;

        return stops[0]!.color; // Fallback
    };

    const toggleGrid = (mapInstance: L.Map | null) => {
        showGrid.value = !showGrid.value;

        if (!mapInstance) return;

        if (showGrid.value) {
            if (!gridLayer) {
                // @ts-ignore - leaflet.vectorgrid types might be missing
                const tileServerUrl = import.meta.env.VITE_TILE_SERVER_URL || '/api/tiles';

                // Get JWT token for authentication
                const token = auth.getToken();
                const headers: Record<string, string> = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                gridLayer = L.vectorGrid.protobuf(`${tileServerUrl}/data/grid/{z}/{x}/{y}.pbf`, {
                    pane: 'overlayPane',
                    vectorTileLayerStyles: {
                        grid: function (properties: any) {
                            const population = properties.T || 0;
                            return {
                                fillColor: interpolateColor(population, populationStops),
                                fillOpacity: 0.4,
                                stroke: true,
                                fill: true,
                                color: 'white',
                                weight: 0.1 // Thinner border for better visualization
                            }
                        }
                    },
                    interactive: true,
                    getFeatureId: function (f: any) { return f.properties.GRD_ID; },
                    maxNativeZoom: 8,
                    // Add fetchOptions to include JWT token in tile requests
                    fetchOptions: {
                        headers: headers
                    }
                });

                gridLayer.on('click', function (e: any) {
                    const props = e.layer.properties;
                    L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`
              <div class="grid-popup">
                <h3>Grid Cell</h3>
                <table class="grid-properties">
                  <tr><td><strong>Population:</strong></td><td>${props.T}</td></tr>
                  <tr><td><strong>Men:</strong></td><td>${props.M}</td></tr>
                  <tr><td><strong>Women:</strong></td><td>${props.F}</td></tr>
                </table>
              </div>
            `)
                        .openOn(mapInstance! as any);
                });
            }
            (gridLayer as any).addTo(mapInstance as any);
        } else {
            if (gridLayer) {
                (gridLayer as any).remove();
            }
        }
    };

    return {
        showGrid,
        toggleGrid
    };
}
