import { ref } from 'vue';
import L from 'leaflet';
import 'leaflet.vectorgrid';
import auth from '@/services/auth';

export function useMapGrid() {
  const showGrid = ref(false);
  const minPopulation = ref(0);
  let gridLayer: any = null;
  let mapRef: L.Map | null = null;

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

    mapRef = mapInstance;

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

              // Hide cells below minimum population threshold
              if (population < minPopulation.value) {
                return {
                  fillOpacity: 0,
                  stroke: false,
                  fill: false
                };
              }

              return {
                fillColor: interpolateColor(population, populationStops),
                fillOpacity: 0.4,
                stroke: true,
                fill: true,
                color: 'white',
                weight: 0.01 // Thinner border for better visualization
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
          const total = props.T || 1; // Avoid division by zero
          const pctYouth = Math.round(((props.Y_LT15 || 0) / total) * 100);
          const pctWorking = Math.round(((props.Y15_64 || 0) / total) * 100);
          const pctSeniors = Math.round(((props.Y_GE65 || 0) / total) * 100);

          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <div class="grid-popup" style="font-family: system-ui, sans-serif; min-width: 220px;">
                <h3 style="margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; color: #1e293b; font-size: 16px;">Grid Statistics</h3>
                
                <div style="margin-bottom: 16px; background: #f8fafc; padding: 8px; border-radius: 6px;">
                  <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                    ${props.T.toLocaleString()} <span style="font-size: 12px; font-weight: 400; color: #64748b;">Residents</span>
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
      (gridLayer as any).addTo(mapInstance as any);
    } else {
      if (gridLayer) {
        (gridLayer as any).remove();
      }
    }
  };

  const updateGridFilter = (threshold: number) => {
    minPopulation.value = threshold;

    // If grid is currently shown, refresh it
    if (showGrid.value && gridLayer && mapRef) {
      gridLayer.remove();
      gridLayer = null;
      toggleGrid(mapRef);
    }
  };

  return {
    showGrid,
    minPopulation,
    toggleGrid,
    updateGridFilter
  };
}
