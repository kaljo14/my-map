<template>
  <l-control position="topright">
    <button 
      class="leaflet-control-custom"
      :class="{ active: showGrid }"
      @click.stop="toggleGrid"
      title="Toggle Population Grid"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H10V10H3V3Z" fill="currentColor" fill-opacity="0.4"/>
        <path d="M14 3H21V10H14V3Z" fill="currentColor" fill-opacity="0.8"/>
        <path d="M3 14H10V21H3V14Z" fill="currentColor" fill-opacity="0.6"/>
        <path d="M14 14H21V21H14V14Z" fill="currentColor" fill-opacity="1"/>
      </svg>
    </button>
  </l-control>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { LControl } from "@vue-leaflet/vue-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";
import auth from "@/services/auth";

const props = defineProps<{
  map: any;
}>();

const showGrid = ref(false);
let gridLayer: any = null;

const toggleGrid = () => {
  showGrid.value = !showGrid.value;
  
  if (!props.map) return;

  if (showGrid.value) {
    if (!gridLayer) {
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
      const interpolateColor = (value: number, stops: {value: number, color: string}[]) => {
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

      // @ts-ignore - leaflet.vectorgrid types might be missing
      const tileServerUrl = import.meta.env.VITE_TILE_SERVER_URL || '/api/tiles';
      
      // Get JWT token for authentication
      const token = auth.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      gridLayer = (L as any).vectorGrid.protobuf(`${tileServerUrl}/data/grid/{z}/{x}/{y}.pbf`, {
        pane: 'overlayPane',
        vectorTileLayerStyles: {
          grid: function(properties: any) {
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
        getFeatureId: function(f: any) { return f.properties.GRD_ID; },
        maxNativeZoom: 8,
        // Add fetchOptions to include JWT token in tile requests
        fetchOptions: {
          headers: headers
        }
      });

      gridLayer.on('click', function(e: any) {
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
          .openOn(props.map! as any);
      });
    }
    (gridLayer as any).addTo(props.map as any);
  } else {
    if (gridLayer) {
      (gridLayer as any).remove();
    }
  }
};

onUnmounted(() => {
  if (gridLayer && props.map) {
    (gridLayer as any).remove();
  }
});
</script>

<style scoped>
.leaflet-control-custom {
  background-color: white;
  border: 2px solid rgba(0,0,0,0.2);
  background-clip: padding-box;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  color: #4a5568;
  padding: 0;
}

.leaflet-control-custom:hover {
  background-color: #f4f4f4;
  color: #2d3748;
}

.leaflet-control-custom.active {
  background-color: #ebf8ff;
  color: #3182ce;
  border-color: #3182ce;
}

.leaflet-control-custom svg {
  width: 24px;
  height: 24px;
}

:global(.grid-popup) {
  min-width: 200px;
}

:global(.grid-popup h3) {
  margin: 0 0 10px 0;
  color: #ff7800;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

:global(.grid-properties) {
  width: 100%;
  border-collapse: collapse;
}

:global(.grid-properties td) {
  padding: 4px 0;
  font-size: 0.9rem;
  color: #333;
}

:global(.grid-properties td:first-child) {
  padding-right: 10px;
  color: #666;
}
</style>
