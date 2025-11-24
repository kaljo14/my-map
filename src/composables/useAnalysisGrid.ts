import { ref } from 'vue';
import L from 'leaflet';
import 'leaflet.vectorgrid';
import auth from '@/services/auth';

export function useAnalysisGrid() {
    const showAnalysisGrid = ref(false);
    let densityLayer: any = null;

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

    const toggleAnalysisGrid = (mapInstance: L.Map | null) => {
        showAnalysisGrid.value = !showAnalysisGrid.value;

        if (!mapInstance) return;

        if (showAnalysisGrid.value) {
            if (!densityLayer) {
                // @ts-ignore - leaflet.vectorgrid types might be missing
                const tileServerUrl = import.meta.env.VITE_TILE_SERVER_URL || '/api/tiles';

                // Get JWT token for authentication
                const token = auth.getToken();
                const headers: Record<string, string> = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                densityLayer = L.vectorGrid.protobuf(`${tileServerUrl}/data/density/{z}/{x}/{y}.pbf`, {
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

                densityLayer.on('click', function (e: any) {
                    const props = e.layer.properties;
                    const densityScore = props.density_score || 0;
                    const malePopulation = props.male_population || 0;
                    const barbershopCount = props.barbershop_count || 0;

                    // Determine market status based on gradient
                    let marketStatus = '';
                    let statusEmoji = '';
                    if (densityScore >= 2000) {
                        marketStatus = 'Very High Opportunity';
                        statusEmoji = '🔥';
                    } else if (densityScore >= 1500) {
                        marketStatus = 'High Opportunity';
                        statusEmoji = '🔴';
                    } else if (densityScore >= 1000) {
                        marketStatus = 'Good Opportunity';
                        statusEmoji = '🟠';
                    } else if (densityScore >= 750) {
                        marketStatus = 'Moderate';
                        statusEmoji = '🟡';
                    } else if (densityScore >= 500) {
                        marketStatus = 'Balanced';
                        statusEmoji = '🟢';
                    } else if (densityScore >= 250) {
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
                  🔥 2000+: Very High | 🔴 1500+: High<br>
                  🟠 1000+: Good | 🟡 750+: Moderate<br>
                  🟢 500+: Balanced | 🔵 250+: Competitive<br>
                  ❄️ <250: Saturated
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
        }
    };

    return {
        showAnalysisGrid,
        toggleAnalysisGrid
    };
}
