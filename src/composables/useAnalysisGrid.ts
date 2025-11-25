import { ref } from 'vue';
import L from 'leaflet';

import TilesAPI from '@/api/tiles';

export function useAnalysisGrid() {
    const showAnalysisGrid = ref(false);
    let densityLayer: any = null;
    let labelLayer: L.LayerGroup | null = null;
    // Store labels by tile key to manage lifecycle
    const tileLabels: Record<string, L.Layer[]> = {};

    // Color stops for density score (matching population grid style)
    const densityStops = [
        { value: 0, color: '#3288bd' },      // 0: Blue (Low)
        { value: 250, color: '#66c2a5' },    // 250: Greenish Cyan
        { value: 500, color: '#abdda4' },    // 500: Light Green
        { value: 750, color: '#e6f598' },    // 750: Yellow-Green
        { value: 1000, color: '#fee08b' },   // 1k: Yellow
        { value: 1500, color: '#fdae61' },   // 1.5k: Orange
        { value: 2000, color: '#f46d43' }    // 2k+: Red
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

    // Helper function to get color based on density score
    const getDensityColor = (score: number): string => {
        return interpolateColor(score, densityStops);
    };

    const toggleAnalysisGrid = async (mapInstance: L.Map | null) => {
        showAnalysisGrid.value = !showAnalysisGrid.value;

        if (!mapInstance) {
            console.warn('toggleAnalysisGrid: mapInstance is null');
            return;
        }

        if (showAnalysisGrid.value) {
            // Initialize label layer if needed
            if (!labelLayer) {
                labelLayer = L.layerGroup().addTo(mapInstance);
            } else {
                labelLayer.addTo(mapInstance);
            }

            // 1. Show Vector Grid (Tiles)
            if (!densityLayer) {
                // @ts-ignore - leaflet.vectorgrid types might be missing
                const tileUrl = TilesAPI.getDensityTileUrlTemplate();
                const headers = TilesAPI.getAuthHeaders();

                densityLayer = (L as any).vectorGrid.protobuf(tileUrl, {
                    pane: 'overlayPane',
                    vectorTileLayerStyles: {
                        density: function (properties: any) {
                            const densityScore = properties.density_score || 0;

                            return {
                                fillColor: getDensityColor(densityScore),
                                fillOpacity: 0.6,
                                stroke: true,
                                fill: true,
                                color: 'white',
                                weight: 1
                            };
                        }
                    },
                    interactive: true,
                    getFeatureId: function (f: any) { return f.properties.GRD_ID || f.properties.id; },
                    maxNativeZoom: 14,
                    // Add fetchOptions to include JWT token in tile requests
                    fetchOptions: {
                        headers: headers
                    }
                });

                // Handle tile loading to extract labels
                densityLayer.on('tileload', (e: any) => {
                    const key = densityLayer._tileCoordsToKey(e.coords);
                    // Access the internal vector tile data
                    // Note: This relies on internal implementation details of L.vectorGrid
                    const vectorTile = densityLayer._vectorTiles[key];

                    if (vectorTile && vectorTile.layers && vectorTile.layers.density) {
                        const layer = vectorTile.layers.density;
                        const labels: L.Layer[] = [];

                        for (let i = 0; i < layer.length; i++) {
                            const feature = layer.feature(i);
                            if (feature.properties.barbershop_count > 0) {
                                // Calculate centroid
                                const geometry = feature.loadGeometry();
                                if (!geometry || geometry.length === 0) continue;

                                // Simple centroid calculation (average of points in the first ring)
                                const ring = geometry[0];
                                let x = 0, y = 0;
                                for (const point of ring) {
                                    x += point.x;
                                    y += point.y;
                                }
                                x /= ring.length;
                                y /= ring.length;

                                // Convert tile coordinates to LatLng
                                // Leaflet tiles are 256px, vector tiles usually 4096 extent
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
                                        html: `<div class="label-content">✂️ ${feature.properties.barbershop_count}</div>`,
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
                densityLayer.on('tileunload', (e: any) => {
                    const key = densityLayer._tileCoordsToKey(e.coords);
                    const labels = tileLabels[key];
                    if (labels) {
                        labels.forEach(label => labelLayer!.removeLayer(label));
                        delete tileLabels[key];
                    }
                });

                densityLayer.on('click', function (e: any) {
                    const props = e.layer.properties;
                    const densityScore = props.density_score || 0;
                    const malePopulation = props.male_population || 0;
                    const barbershopCount = props.barbershop_count || 0;

                    // Determine market status based on gradient
                    let marketStatus = '';
                    let statusEmoji = '';
                    if (densityScore >= 4000) {
                        marketStatus = 'Very High Opportunity';
                        statusEmoji = '🔥';
                    } else if (densityScore >= 3000) {
                        marketStatus = 'High Opportunity';
                        statusEmoji = '🔴';
                    } else if (densityScore >= 2000) {
                        marketStatus = 'Good Opportunity';
                        statusEmoji = '🟠';
                    } else if (densityScore >= 1500) {
                        marketStatus = 'Moderate';
                        statusEmoji = '🟡';
                    } else if (densityScore >= 1000) {
                        marketStatus = 'Balanced';
                        statusEmoji = '🟢';
                    } else if (densityScore >= 500) {
                        marketStatus = 'Competitive';
                        statusEmoji = '🔵';
                    } else {
                        marketStatus = 'Saturated';
                        statusEmoji = '❄️';
                    }

                    // Get the color for this density score
                    const statusColor = getDensityColor(densityScore);

                    L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`
              <div class="density-popup" style="font-family: system-ui, sans-serif; min-width: 240px;">
                <h3 style="margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; color: #1e293b; font-size: 16px;">Market Analysis</h3>
                
                <div style="margin-bottom: 16px; background: ${statusColor}15; padding: 10px; border-radius: 6px; border-left: 3px solid ${statusColor};">
                  <div style="font-size: 14px; font-weight: 600; color: ${statusColor}; margin-bottom: 4px;">
                    ${statusEmoji} ${marketStatus}
                  </div>
                  <div style="font-size: 20px; font-weight: 700; color: #0f172a;">
                    ${densityScore.toFixed(0)} <span style="font-size: 12px; font-weight: 400; color: #64748b;">men/shop</span>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                  <div style="background: #f8fafc; padding: 8px; border-radius: 6px;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Male Population</div>
                    <div style="font-size: 16px; font-weight: 600; color: #1e293b;">👨 ${malePopulation.toLocaleString()}</div>
                  </div>
                  <div style="background: #f8fafc; padding: 8px; border-radius: 6px;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Barbershops</div>
                    <div style="font-size: 16px; font-weight: 600; color: #1e293b;">✂️ ${barbershopCount}</div>
                  </div>
                </div>

                <div style="font-size: 11px; color: #94a3b8; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                  <strong>Density Scale:</strong><br>
                  🔥 4000+: Very High | 🔴 3000+: High<br>
                  🟠 2000+: Good | 🟡 1500+: Moderate<br>
                  🟢 1000+: Balanced | 🔵 500+: Competitive<br>
                  ❄️ <500: Saturated
                </div>
              </div>
            `)
                        .openOn(mapInstance! as any);
                });
            }
            (densityLayer as any).addTo(mapInstance as any);

        } else {
            if (densityLayer) {
                (densityLayer as any).remove();
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

    return {
        showAnalysisGrid,
        toggleAnalysisGrid
    };
}
