import { ref } from 'vue';
import L from 'leaflet';

import TilesAPI from '@/api/tiles';

export function usePopulationGrid() {
    const showPopulationGrid = ref(false);
    const minPopulation = ref(0);
    let populationLayer: any = null;
    let labelLayer: L.LayerGroup | null = null;
    let mapRef: L.Map | null = null;

    // Color stops for population density
    const populationStops = [
        { value: 0, color: '#3288bd' },      // 0: Blue (Low)
        { value: 1000, color: '#66c2a5' },   // 1k: Greenish Cyan
        { value: 4000, color: '#abdda4' },   // 5k: Light Green
        { value: 8000, color: '#e6f598' },  // 10k: Yellow-Green
        { value: 12000, color: '#fee08b' },  // 15k: Yellow
        { value: 16000, color: '#fdae61' },  // 20k: Orange
        { value: 20000, color: '#f46d43' }   // 25k+: Red
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

    // Helper function to get color based on population
    const getPopulationColor = (population: number): string => {
        return interpolateColor(population, populationStops);
    };

    const togglePopulationGrid = (mapInstance: any, forceState?: boolean) => {
        if (forceState !== undefined) {
            showPopulationGrid.value = forceState;
        } else {
            showPopulationGrid.value = !showPopulationGrid.value;
        }

        if (!mapInstance) {
            console.warn('togglePopulationGrid: mapInstance is null');
            return;
        }

        mapRef = mapInstance;

        if (showPopulationGrid.value) {
            // Initialize label layer if needed
            if (!labelLayer) {
                labelLayer = L.layerGroup().addTo(mapInstance);
            } else {
                labelLayer.addTo(mapInstance);
            }

            if (!populationLayer) {
                // @ts-ignore - leaflet.vectorgrid types might be missing
                const tileUrl = TilesAPI.getTileUrlTemplate();
                const headers = TilesAPI.getAuthHeaders();

                populationLayer = (L as any).vectorGrid.protobuf(tileUrl, {
                    pane: 'overlayPane',
                    vectorTileLayerStyles: {
                        grid: function (properties: any) {
                            const population = properties.T || 0;

                            // Hide cells below minimum population threshold
                            if (population < minPopulation.value) {
                                return {
                                    fillOpacity: 0,
                                    stroke: false,
                                    fill: false
                                };
                            }

                            return {
                                fillColor: getPopulationColor(population),
                                fillOpacity: 0.6,
                                stroke: true,
                                fill: true,
                                color: 'white',
                                weight: 1
                            };
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

                populationLayer.on('click', function (e: any) {
                    const props = e.layer.properties;
                    const total = props.T || 1; // Avoid division by zero
                    const pctYouth = Math.round(((props.Y_LT15 || 0) / total) * 100);
                    const pctWorking = Math.round(((props.Y15_64 || 0) / total) * 100);
                    const pctSeniors = Math.round(((props.Y_GE65 || 0) / total) * 100);

                    // Get the color for this population
                    const statusColor = getPopulationColor(total);

                    L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`
              <div class="population-popup" style="font-family: system-ui, sans-serif; min-width: 240px;">
                <h3 style="margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; color: #1e293b; font-size: 16px;">Grid Statistics</h3>
                
                <div style="margin-bottom: 16px; background: ${statusColor}15; padding: 10px; border-radius: 6px; border-left: 3px solid ${statusColor};">
                  <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                    ${total.toLocaleString()} <span style="font-size: 12px; font-weight: 400; color: #64748b;">Residents</span>
                  </div>
                  <div style="display: flex; gap: 12px; font-size: 13px; color: #475569;">
                    <span title="Men">👨 ${(props.M || 0).toLocaleString()}</span>
                    <span title="Women">👩 ${(props.F || 0).toLocaleString()}</span>
                  </div>
                </div>

                <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Age Distribution</h4>
                
                <!-- Youth -->
                <div style="margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #334155;">
                    <span>Youth (<15)</span>
                    <span style="font-weight: 600;">${(props.Y_LT15 || 0).toLocaleString()} (${pctYouth}%)</span>
                  </div>
                  <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${pctYouth}%; background: #4ade80; height: 100%;"></div>
                  </div>
                </div>

                <!-- Working Age -->
                <div style="margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #334155;">
                    <span>Working (15-64)</span>
                    <span style="font-weight: 600;">${(props.Y15_64 || 0).toLocaleString()} (${pctWorking}%)</span>
                  </div>
                  <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${pctWorking}%; background: #60a5fa; height: 100%;"></div>
                  </div>
                </div>

                <!-- Seniors -->
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #334155;">
                    <span>Seniors (65+)</span>
                    <span style="font-weight: 600;">${(props.Y_GE65 || 0).toLocaleString()} (${pctSeniors}%)</span>
                  </div>
                  <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${pctSeniors}%; background: #f472b6; height: 100%;"></div>
                  </div>
                </div>
              </div>
            `)
                        .openOn(mapInstance! as any);
                });
            }
            (populationLayer as any).addTo(mapInstance as any);
        } else {
            if (populationLayer) {
                (populationLayer as any).remove();
            }
            if (labelLayer) {
                labelLayer.clearLayers();
                labelLayer.remove();
            }
        }
    };

    const updatePopulationGridFilter = (threshold: number) => {
        minPopulation.value = threshold;

        // If grid is currently shown, refresh it
        if (showPopulationGrid.value && populationLayer && mapRef) {
            populationLayer.remove();
            populationLayer = null;
            togglePopulationGrid(mapRef, true);
        }
    };

    return {
        showPopulationGrid,
        minPopulation,
        togglePopulationGrid,
        updatePopulationGridFilter
    };
}
