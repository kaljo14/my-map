import { ref } from 'vue';
import L from 'leaflet';

import TilesAPI from '@/api/tiles';

export function usePopulationLayers() {
    const showPopulationGrid = ref(false);
    const minPopulation = ref(0);
    const selectedThreshold = ref(0);
    let populationLayer: any = null;
    let labelLayer: L.LayerGroup | null = null;
    // Store labels by tile key to manage lifecycle
    const tileLabels: Record<string, L.Layer[]> = {};

    // Color stops for population density (matching useMapGrid style)
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
    const getPopulationColor = (score: number): string => {
        return interpolateColor(score, populationStops);
    };

    let mapRef: L.Map | null = null;

    const updatePopulationGridFilter = (threshold: number) => {
        minPopulation.value = threshold;

        // If grid is currently shown, refresh it to apply filter
        if (showPopulationGrid.value && populationLayer && mapRef) {
            // We need to remove and re-add the layer to force style update/re-render or at least re-eval of styles if we used a react style function.
            // But since labels are generated on tileload, we need to basically reload tiles or filter labels dynamically.
            // A simple remove/add usually works well enough for Leaflet layers to reset.
            populationLayer.remove();
            populationLayer = null;
            togglePopulationGrid(mapRef, true);
        }
    };

    const togglePopulationGrid = async (mapInstance: any, forceState?: boolean) => {
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

            // 1. Show Vector Grid (Tiles)
            if (!populationLayer) {
                // @ts-ignore - leaflet.vectorgrid types might be missing
                // Use Population Grid Tile URL from the tileserver's /data/population_grid endpoint
                const tileUrl = TilesAPI.getPopulationGridTileUrlTemplate();
                const headers = TilesAPI.getAuthHeaders();

                populationLayer = (L as any).vectorGrid.protobuf(tileUrl, {
                    pane: 'overlayPane',
                    vectorTileLayerStyles: {
                        population_grid: function (properties: any) {
                            // New schema: population
                            const population = properties.population || 0;

                            // Filter logic
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
                    getFeatureId: function (f: any) { return f.properties.grid_id || f.properties.id; },
                    maxNativeZoom: 14, // Matches Analysis Grid
                    // Add fetchOptions to include JWT token in tile requests
                    fetchOptions: {
                        headers: headers
                    }
                });

                // Handle tile loading to extract labels
                populationLayer.on('tileload', (e: any) => {
                    const key = populationLayer._tileCoordsToKey(e.coords);
                    const vectorTile = populationLayer._vectorTiles[key];

                    // Check for 'population_grid' layer
                    if (vectorTile && vectorTile.layers && vectorTile.layers.population_grid) {
                        const layer = vectorTile.layers.population_grid;
                        const labels: L.Layer[] = [];

                        for (let i = 0; i < layer.length; i++) {
                            const feature = layer.feature(i);
                            const props = feature.properties;
                            // New schema: population
                            const population = props.population || 0;

                            // Only show labels for filtered features
                            if (population >= minPopulation.value) {
                                // Calculate centroid
                                const geometry = feature.loadGeometry();
                                if (!geometry || geometry.length === 0) continue;

                                // Simple centroid calculation
                                const ring = geometry[0];
                                let x = 0, y = 0;
                                for (const point of ring) {
                                    x += point.x;
                                    y += point.y;
                                }
                                x /= ring.length;
                                y /= ring.length;

                                // Convert tile coordinates
                                const extent = layer.extent || 4096;
                                const ratio = 256 / extent;

                                const tilePixelPoint = L.point(x * ratio, y * ratio);
                                const globalPixelPoint = tilePixelPoint.add(
                                    L.point(e.coords.x * 256, e.coords.y * 256)
                                );
                                const latLng = mapInstance.unproject(globalPixelPoint, e.coords.z);

                                // Create label
                                const label = L.marker(latLng, {
                                    icon: L.divIcon({
                                        className: 'grid-label',
                                        html: `<div class="label-content">👥 ${population.toLocaleString()}</div>`,
                                        iconSize: [40, 24],
                                        iconAnchor: [20, 12]
                                    }),
                                    interactive: false,
                                    zIndexOffset: 1000
                                });

                                labels.push(label);
                                labelLayer!.addLayer(label);
                            }
                        }

                        tileLabels[key] = labels;
                    }
                });

                // Handle tile unloading to remove labels
                populationLayer.on('tileunload', (e: any) => {
                    const key = populationLayer._tileCoordsToKey(e.coords);
                    const labels = tileLabels[key];
                    if (labels) {
                        labels.forEach(label => labelLayer!.removeLayer(label));
                        delete tileLabels[key];
                    }
                });

                populationLayer.on('click', function (e: any) {
                    const props = e.layer.properties;

                    // New Data Schema Mapping
                    const total = props.population || 0;
                    const male = props.male_population || 0;
                    const female = props.female_population || 0;

                    // Age groups
                    const youth = props.pop_youth || 0;
                    const adult = props.pop_adult || 0;
                    const senior = props.pop_senior || 0;

                    const pctYouth = total > 0 ? Math.round((youth / total) * 100) : 0;
                    const pctWorking = total > 0 ? Math.round((adult / total) * 100) : 0;
                    const pctSeniors = total > 0 ? Math.round((senior / total) * 100) : 0;

                    // Get the color for this population
                    const statusColor = getPopulationColor(total);

                    L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`
              <div class="population-popup" style="font-family: system-ui, sans-serif; min-width: 240px;">
                <h3 style="margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; color: #1e293b; font-size: 16px;">Grid Statistics</h3>
                <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">ID: ${props.grid_id || 'N/A'}</div>
                
                <div style="margin-bottom: 16px; background: ${statusColor}15; padding: 10px; border-radius: 6px; border-left: 3px solid ${statusColor};">
                  <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                    ${total.toLocaleString()} <span style="font-size: 12px; font-weight: 400; color: #64748b;">Residents</span>
                  </div>
                  <div style="display: flex; gap: 12px; font-size: 13px; color: #475569;">
                    <span title="Men">👨 ${male.toLocaleString()}</span>
                    <span title="Women">👩 ${female.toLocaleString()}</span>
                  </div>
                </div>

                <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Age Distribution</h4>
                
                <!-- Youth -->
                <div style="margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #334155;">
                    <span>Youth (0-14)</span>
                    <span style="font-weight: 600;">${youth.toLocaleString()} (${pctYouth}%)</span>
                  </div>
                  <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${pctYouth}%; background: #4ade80; height: 100%;"></div>
                  </div>
                </div>

                <!-- Working Age -->
                <div style="margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #334155;">
                    <span>Adult (15-64)</span>
                    <span style="font-weight: 600;">${adult.toLocaleString()} (${pctWorking}%)</span>
                  </div>
                  <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${pctWorking}%; background: #60a5fa; height: 100%;"></div>
                  </div>
                </div>

                <!-- Seniors -->
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #334155;">
                    <span>Senior (65+)</span>
                    <span style="font-weight: 600;">${senior.toLocaleString()} (${pctSeniors}%)</span>
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
                // Clear stored labels
                for (const key in tileLabels) {
                    delete tileLabels[key];
                }
            }
        }
    };

    const updateThreshold = (value: number) => {
        selectedThreshold.value = value;
        updatePopulationGridFilter(value);
    };

    return {
        showPopulationGrid,
        minPopulation,
        selectedThreshold,
        togglePopulationGrid,
        updatePopulationGridFilter,
        updateThreshold,
    };
}
