import { watch, onMounted, onUnmounted } from 'vue';
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import type { Ref } from 'vue';
import { useLayerStore } from '@/stores/layerStore';

// ── GeoJSON converters ──────────────────────────────────────────────────────

function verticesToLineGeoJSON(vertices: [number, number][]): GeoJSON.FeatureCollection {
  if (vertices.length < 2) return { type: 'FeatureCollection', features: [] };
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: vertices.map(([lat, lng]) => [lng, lat]) },
      properties: {},
    }],
  };
}

function verticesToPointsGeoJSON(vertices: [number, number][]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: vertices.map(([lat, lng]) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {},
    })),
  };
}

function polygonToGeoJSON(polygon: [number, number][] | null): GeoJSON.FeatureCollection {
  if (!polygon || polygon.length < 3) return { type: 'FeatureCollection', features: [] };
  const coords = [...polygon, polygon[0]!].map(([lat, lng]) => [lng, lat]);
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] },
      properties: {},
    }],
  };
}

// ── Layer setup ─────────────────────────────────────────────────────────────

function setupDrawingLayers(map: MapLibreMap) {
  map.addSource('drawing-line', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('drawing-points', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('active-polygon', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

  map.addLayer({
    id: 'drawing-line-layer',
    type: 'line',
    source: 'drawing-line',
    paint: { 'line-color': '#f59e0b', 'line-width': 2, 'line-dasharray': [6, 6] },
  });

  map.addLayer({
    id: 'drawing-points-layer',
    type: 'circle',
    source: 'drawing-points',
    paint: { 'circle-radius': 5, 'circle-color': '#f59e0b', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' },
  });

  map.addLayer({
    id: 'active-polygon-fill',
    type: 'fill',
    source: 'active-polygon',
    paint: { 'fill-color': '#10b981', 'fill-opacity': 0.12 },
  });

  map.addLayer({
    id: 'active-polygon-outline',
    type: 'line',
    source: 'active-polygon',
    paint: { 'line-color': '#10b981', 'line-width': 2 },
  });
}

// ── Composable ──────────────────────────────────────────────────────────────

export function usePolygonDrawing(
  mapInstance: Ref<MapLibreMap | null>,
  drawingVertices: Ref<[number, number][]>,
  activePolygon: Ref<[number, number][] | null>,
  isDrawingMode: Ref<boolean>,
  clearPolygon: () => void,
) {
  const layerStore = useLayerStore();

  /** Call once after map loads to add drawing sources + layers */
  function initDrawingLayers(map: MapLibreMap) {
    setupDrawingLayers(map);
  }

  // Sync drawing-in-progress vertices to map sources
  watch(drawingVertices, (vertices) => {
    const map = mapInstance.value;
    if (!map || !map.getSource('drawing-line')) return;
    (map.getSource('drawing-line') as GeoJSONSource).setData(verticesToLineGeoJSON(vertices));
    (map.getSource('drawing-points') as GeoJSONSource).setData(verticesToPointsGeoJSON(vertices));
  });

  // Sync finalized polygon to map source + filter OSM POIs
  watch(activePolygon, (polygon) => {
    const map = mapInstance.value;
    if (!map || !map.getSource('active-polygon')) return;
    (map.getSource('active-polygon') as GeoJSONSource).setData(polygonToGeoJSON(polygon));
    // Clear drawing sources when polygon is finalized
    if (polygon) {
      (map.getSource('drawing-line') as GeoJSONSource).setData({ type: 'FeatureCollection', features: [] });
      (map.getSource('drawing-points') as GeoJSONSource).setData({ type: 'FeatureCollection', features: [] });
    }
    // Filter OSM POIs to show only those within the selected area
    layerStore.osmPois.setAreaPolygon(polygon, map);
  });

  // Escape key cancels drawing
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDrawingMode.value) clearPolygon();
  };
  onMounted(() => window.addEventListener('keydown', handleKeydown));
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

  return { initDrawingLayers };
}
