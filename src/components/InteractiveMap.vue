<template>
  <div class="map-container">
    <AppHeader
      v-if="!isMobile"
      :isAuthenticated="isAuthenticated"
      :userProfile="userProfile"
      @login="login"
      @logout="logout"
    />

    <div class="content-wrapper">
      <!-- Sidebar Wrapper -->
      <div class="sidebar-wrapper" :class="{ closed: !isSidebarOpen }" style="z-index:2000">
        <AnalysisPanel
          :isMobile="isMobile"
          :placeTypes="placeTypesForPanel"
          :enableClustering="enableClustering"
          :showMetroVector="showMetroVector"
          :activeMetroLines="activeMetroLines"
          :showMetroStops="showMetroStops"
          :activeStopLines="activeStopLines"
          :metroLinesList="metroLinesList"
          :metroColors="metroColors"
          :groceryTagFilters="groceryTagFilters"
          :showPedestrianNetwork="showPedestrianNetwork"
          :showOsmPois="showOsmPois"
          :isDrawingMode="isDrawingMode"
          :hasActivePolygon="!!activePolygon"
          :pins="comparisonPins"
          :pinCount="comparisonPinCount"
          :isPinMode="isPinMode"
          :isComparisonOpen="isComparisonOpen"
          @togglePlaceType="toggleVisible"
          @toggleClustering="enableClustering = !enableClustering"
          @toggleMetroVector="handleToggleMetroVector"
          @toggleMetroLine="handleToggleMetroLine"
          @toggleMetroStops="handleToggleMetroStops"
          @toggleStopLine="handleToggleStopLine"
          @toggleGroceryTagFilter="toggleGroceryTagFilter"
          @togglePedestrianNetwork="handleTogglePedestrianNetwork"
          @toggleOsmPois="handleToggleOsmPois"
          @startDrawing="startDrawing"
          @clearPolygon="clearPolygon"
          @togglePinMode="togglePinMode"
          @removePin="removeComparisonPin"
          @compareLocations="openComparison"
          @closeComparison="closeComparison"
        />

        <button
          class="sidebar-toggle"
          @click="isSidebarOpen = !isSidebarOpen"
          :aria-label="isSidebarOpen ? 'Close sidebar' : 'Open sidebar'"
          title="Toggle Sidebar"
        >
          <svg
            class="toggle-icon"
            :class="{ rotated: isSidebarOpen }"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Map -->
      <div class="map-wrapper" :class="{ 'drawing-cursor': isDrawingMode, 'pin-cursor': isPinMode }">
        <MapStats
          :isMobile="isMobile"
          :filteredCount="placeInstances[0]?.filteredPlaces.length ?? 0"
          :averageRating="averageRating"
        />

        <!-- Polygon Draw Controls (in-progress + active state only) -->
        <div v-if="isDrawingMode || activePolygon" class="polygon-controls">
          <template v-if="isDrawingMode">
            <span class="drawing-hint">{{ drawingVertices.length }} point{{ drawingVertices.length !== 1 ? 's' : '' }} — click map to add</span>
            <button
              class="polygon-btn finish"
              :disabled="drawingVertices.length < 3"
              @click="finishDrawing"
            >✓ Finish</button>
            <button class="polygon-btn cancel" @click="clearPolygon">✕ Cancel</button>
          </template>
          <template v-else-if="activePolygon">
            <span class="polygon-count">⬡ {{ totalFilteredCount }} in area</span>
            <button class="polygon-btn clear" @click="clearPolygon">✕ Clear</button>
          </template>
        </div>

        <!-- MapLibre container -->
        <div ref="mapContainer" class="map-div"></div>

        <!-- Pin mode cursor -->

        <!-- Map overlay controls (grid / heatmap) — rendered inside map-wrapper as absolute overlay -->
        <MapControls
          :showPopulationGrid="showPopulationGrid"
          :showAnalysisGrid="showAnalysisGrid"
          :selectedThreshold="selectedThreshold"
          :showOpportunityHeatmap="showOpportunityHeatmap"
          :activeCategoryHeatmap="heatmapCategory"
          @togglePopulationGrid="handleTogglePopulationGrid"
          @toggleAnalysisGrid="handleToggleAnalysisGrid"
          @updateThreshold="updateThreshold"
          @toggleOpportunityHeatmap="handleToggleOpportunityHeatmap"
          @setHeatmapCategory="handleSetHeatmapCategory"
        />

        <!-- Area Analysis Panel — floats over map when polygon is active -->
        <AreaAnalysisPanel
          v-if="activePolygon && !isDrawingMode"
          :stats="areaStats"
          :class="{ 'shifted-left': isComparisonOpen }"
          @clear="clearPolygon"
        />

        <!-- Location Comparison Panel — floats over map -->
        <LocationComparisonPanel
          v-if="isComparisonOpen"
          :pins="comparisonPins"
          @close="closeComparison"
          @export="() => {}"
        />
      </div>
    </div>

    <!-- Add Shop Modal -->
    <ShopModal
      :show="showShopModal"
      v-model="newShopName"
      @cancel="cancelAddShop"
      @save="saveShop"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      :show="showDeleteConfirm"
      :shopName="shopToDelete?.name"
      @confirm="deleteBarbershop"
      @cancel="cancelDelete"
    />

    <BottomNav v-if="isMobile" @logout="logout" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, createApp } from 'vue';
import maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';

import auth from '@/services/auth';
import i18n from '@/i18n';
import type { Place } from '@/api/places';

// Composables
import { useMapInstance } from '@/composables/useMapInstance';
import { useMobileDetection } from '@/composables/useMobileDetection';
import { usePlacesManager } from '@/composables/usePlacesManager';
import { usePopulationLayers } from '@/composables/usePopulationLayers';
import { useAnalysisGrid } from '@/composables/useAnalysisGrid';
import { useOpportunityHeatmap } from '@/composables/useOpportunityHeatmap';
import { useMetroLines } from '@/composables/useMetroLines';
import { useMetroStops } from '@/composables/useMetroStops';
import { usePedestrianNetwork } from '@/composables/usePedestrianNetwork';
import { useOsmPois } from '@/composables/useOsmPois';
import { useShopManagement } from '@/composables/useShopManagement';

// Composables
import { useLocationComparison } from '@/composables/useLocationComparison';

// Components
import AnalysisPanel from './map/AnalysisPanel.vue';
import ShopModal from './map/ShopModal.vue';
import DeleteConfirmModal from './map/DeleteConfirmModal.vue';
import MapControls from './map/MapControls.vue';
import AppHeader from './map/AppHeader.vue';
import MapStats from './map/MapStats.vue';
import BottomNav from './map/BottomNav.vue';
import ShopPopup from './map/ShopPopup.vue';
import LocationComparisonPanel from './map/LocationComparisonPanel.vue';
import AreaAnalysisPanel from './map/AreaAnalysisPanel.vue';

const { isAuthenticated, userProfile, login, logout } = auth;

const mapContainer = ref<HTMLElement | null>(null);
const { mapInstance, initMap } = useMapInstance();
const { isMobile } = useMobileDetection();

const isSidebarOpen = ref(true);
const enableClustering = ref(true);

const {
  instances: placeInstances,
  fetchAll,
  toggleVisible,
  averageRating,
  groceryTagFilters,
  toggleGroceryTagFilter,
  isDrawingMode,
  drawingVertices,
  activePolygon,
  startDrawing,
  addVertex,
  finishDrawing,
  clearPolygon,
} = usePlacesManager();

const placeTypesForPanel = computed(() =>
  placeInstances.map(inst => ({
    category: inst.config.category,
    emoji: inst.config.emoji,
    labelKey: inst.config.labelKey,
    visible: inst.visible,
  }))
);

const {
  showPopulationGrid,
  selectedThreshold,
  togglePopulationGrid,
  updateThreshold,
} = usePopulationLayers();

const {
  showAnalysisGrid,
  toggleAnalysisGrid: toggleAnalysisGridComposable,
} = useAnalysisGrid();

const {
  showOpportunityHeatmap,
  activeCategory: heatmapCategory,
  toggleOpportunityHeatmap,
  setHeatmapCategory,
} = useOpportunityHeatmap();

const {
  showMetroVector,
  toggleMetroVector,
  activeMetroLines,
  toggleMetroLine,
  METRO_LINES,
  METRO_COLORS,
} = useMetroLines();

const {
  showMetroStops,
  activeStopLines,
  toggleMetroStops,
  toggleStopLine,
} = useMetroStops();

const {
  showPedestrianNetwork,
  togglePedestrianNetwork,
} = usePedestrianNetwork();

const {
  showOsmPois,
  toggleOsmPois,
  setAreaPolygon: setOsmPoiPolygon,
} = useOsmPois();

const {
  showShopModal,
  newShopPin,
  newShopName,
  userAddedShops,
  showDeleteConfirm,
  shopToDelete,
  onMapClick,
  cancelAddShop,
  saveShop,
  editBarbershop,
  confirmDelete,
  cancelDelete,
  deleteBarbershop,
} = useShopManagement(placeInstances[0]!.fetchPlaces);

const metroLinesList = METRO_LINES;
const metroColors = METRO_COLORS;

const {
  pins: comparisonPins,
  isPinMode,
  isComparisonOpen,
  pinCount: comparisonPinCount,
  addPin: addComparisonPin,
  removePin: removeComparisonPin,
  togglePinMode,
  openComparison,
  closeComparison,
} = useLocationComparison();

const totalFilteredCount = computed(() =>
  placeInstances.reduce((sum, inst) => sum + (inst.visible ? inst.filteredPlaces.length : 0), 0)
);

const areaStats = computed(() =>
  placeInstances
    .filter(inst => inst.visible)
    .map(inst => {
      const places = inst.filteredPlaces;
      const rated = places.filter((p: any) => p.rating);
      const avgRating = rated.length
        ? rated.reduce((s: number, p: any) => s + p.rating, 0) / rated.length
        : 0;
      return {
        category: inst.config.category,
        emoji: inst.config.emoji,
        label: inst.config.category.charAt(0).toUpperCase() + inst.config.category.slice(1) + 's',
        count: places.length,
        avgRating,
        topPlaces: [...places].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4),
      };
    })
);

// ── Handler wrappers ────────────────────────────────────────────────────────

const handleToggleMetroVector = () => toggleMetroVector(mapInstance.value);
const handleToggleMetroLine   = (line: string) => toggleMetroLine(line, mapInstance.value);
const handleToggleMetroStops  = () => toggleMetroStops(mapInstance.value);
const handleToggleStopLine    = (line: string) => toggleStopLine(line, mapInstance.value);
const handleTogglePedestrianNetwork = () => togglePedestrianNetwork(mapInstance.value);
const handleToggleOsmPois     = () => toggleOsmPois(mapInstance.value);

const handleTogglePopulationGrid = () => {
  if (showAnalysisGrid.value) toggleAnalysisGridComposable(mapInstance.value);
  togglePopulationGrid(mapInstance.value);
};

const handleToggleAnalysisGrid = () => {
  if (showPopulationGrid.value) togglePopulationGrid(mapInstance.value);
  toggleAnalysisGridComposable(mapInstance.value);
};

const handleToggleOpportunityHeatmap = () => toggleOpportunityHeatmap(mapInstance.value);
const handleSetHeatmapCategory = (cat: string) => setHeatmapCategory(cat as any, mapInstance.value);

// ── Place markers ────────────────────────────────────────────────────────────

// Per-category HTML marker caches: category → Map<placeId, maplibregl.Marker>
const markerCaches = new Map<string, Map<string, maplibregl.Marker>>();
// Comparison pin markers
const comparisonMarkers = new Map<string, maplibregl.Marker>();
// Popup app instances — track to unmount on close
let activeShopPopup: maplibregl.Popup | null = null;
let newShopPinMarker: maplibregl.Marker | null = null;
// User-added shop markers
const userShopMarkerCache = new Map<string, maplibregl.Marker>();

function placeToFeature(p: Place): GeoJSON.Feature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
    properties: {
      id: String(p.place_id || p.id),
      name: p.name,
      category: p.category,
      tags: Array.isArray(p.tags) ? JSON.stringify(p.tags) : (p.tags ?? '[]'),
    },
  };
}

function placesToGeoJSON(places: Place[]): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: places.map(placeToFeature) };
}

function sourceId(category: string) { return `places-${category.replace(/ /g, '-')}`; }
function clusterLayerId(category: string) { return `${sourceId(category)}-clusters`; }
function clusterCountId(category: string) { return `${sourceId(category)}-cluster-count`; }
function pointLayerId(category: string) { return `${sourceId(category)}-points`; }

function setupCategoryLayers(map: MapLibreMap, inst: (typeof placeInstances)[0]) {
  const cat = inst.config.category;
  const sid = sourceId(cat);

  if (map.getSource(sid)) return;

  map.addSource(sid, {
    type: 'geojson',
    data: placesToGeoJSON([]),
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  const initVis = inst.visible ? 'visible' : 'none';

  // Cluster circles
  map.addLayer({
    id: clusterLayerId(cat),
    type: 'circle',
    source: sid,
    filter: ['has', 'point_count'],
    layout: { visibility: inst.visible && enableClustering.value ? 'visible' : 'none' },
    paint: {
      'circle-color': [
        'step', ['get', 'point_count'],
        '#51bbd6', 10, '#f1f075', 30, '#f28cb1',
      ],
      'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
      'circle-opacity': 0.85,
    },
  });

  // Cluster count labels
  map.addLayer({
    id: clusterCountId(cat),
    type: 'symbol',
    source: sid,
    filter: ['has', 'point_count'],
    layout: {
      visibility: inst.visible && enableClustering.value ? 'visible' : 'none',
      'text-field': '{point_count_abbreviated}',
      'text-size': 13,
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    },
    paint: { 'text-color': '#fff' },
  });

  // Near-invisible unclustered point layer — queryRenderedFeatures target for HTML markers
  map.addLayer({
    id: pointLayerId(cat),
    type: 'circle',
    source: sid,
    filter: ['!', ['has', 'point_count']],
    layout: { visibility: initVis },
    paint: { 'circle-radius': 4, 'circle-opacity': 0.02 },
  });

  // Cluster click → zoom to expand
  map.on('click', clusterLayerId(cat), async (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: [clusterLayerId(cat)] });
    if (!features.length) return;
    const clusterId = features[0]!.properties!.cluster_id as number;
    try {
      const zoom = await (map.getSource(sid) as maplibregl.GeoJSONSource).getClusterExpansionZoom(clusterId);
      map.easeTo({ center: (features[0]!.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
    } catch { /* ignore */ }
  });

  map.on('mouseenter', clusterLayerId(cat), () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', clusterLayerId(cat), () => { map.getCanvas().style.cursor = ''; });

  markerCaches.set(cat, new Map());
}

function getMarkerEmoji(props: Record<string, any>, inst: (typeof placeInstances)[0]): string {
  let tags: string[] = [];
  try { tags = JSON.parse(props.tags ?? '[]'); } catch { /* ignore */ }
  if (tags.includes('lidl')) return '<img src="/Lidl-Logo.svg" class="chain-logo" alt="Lidl"/>';
  if (tags.includes('kaufland')) return '<img src="/Kaufland_201x_logo.svg" class="chain-logo" alt="Kaufland"/>';
  if (tags.includes('billa')) return '<img src="/Billa_Logo_2012.svg" class="chain-logo" alt="Billa"/>';
  if (tags.includes('fantastico')) return '<img src="/Fantastico.png" class="chain-logo" alt="Fantastico"/>';
  return inst.config.emoji;
}

function createMarkerElement(props: Record<string, any>, inst: (typeof placeInstances)[0]): HTMLElement {
  const el = document.createElement('div');
  el.className = `shop-marker-wrapper ${inst.config.markerClass}`;
  el.style.cssText = 'cursor:pointer;transform:translate(-50%,-100%)';
  el.innerHTML = `<div class="shop-marker-content saved">${getMarkerEmoji(props, inst)}</div>`;
  return el;
}

function openShopPopup(place: Place, lngLat: maplibregl.LngLat, inst: (typeof placeInstances)[0]) {
  const el = document.createElement('div');
  const app = createApp(ShopPopup, {
    shop: place,
    isAuthenticated: isAuthenticated.value,
    onEdit: (s: Place) => inst.config.category === 'barbershop' ? editBarbershop(s) : null,
    onDelete: (s: Place) => inst.config.category === 'barbershop' ? confirmDelete(s) : null,
  });
  app.use(i18n);
  app.mount(el);
  activeShopPopup?.remove();
  activeShopPopup = new maplibregl.Popup({ maxWidth: '400px', closeButton: true })
    .setLngLat(lngLat)
    .setDOMContent(el)
    .addTo(mapInstance.value!);
}

function syncCategoryMarkers(map: MapLibreMap, inst: (typeof placeInstances)[0]) {
  if (!inst.visible) {
    const cache = markerCaches.get(inst.config.category);
    cache?.forEach(m => m.remove());
    cache?.clear();
    return;
  }

  const cat = inst.config.category;
  const cache = markerCaches.get(cat);
  if (!cache) return;

  type MarkerEntry = { id: string; lngLat: [number, number]; props: Record<string, any> };
  let visibleIds: Set<string>;
  const toAdd: MarkerEntry[] = [];

  if (enableClustering.value) {
    // Clustering on: show HTML markers only for individual (unclustered) points
    const rendered = map.queryRenderedFeatures({ layers: [pointLayerId(cat)] });
    visibleIds = new Set(rendered.map(f => String(f.properties!.id)));
    for (const f of rendered) {
      const id = String(f.properties!.id);
      if (!cache.has(id)) {
        toAdd.push({
          id,
          lngLat: (f.geometry as GeoJSON.Point).coordinates as [number, number],
          props: f.properties as Record<string, any>,
        });
      }
    }
  } else {
    // Clustering off: show all places within viewport bounds
    const bounds = map.getBounds();
    const inView = inst.filteredPlaces.filter(p => !bounds || bounds.contains([p.lng, p.lat]));
    visibleIds = new Set(inView.map(p => String(p.place_id || p.id)));
    for (const place of inView) {
      const id = String(place.place_id || place.id);
      if (!cache.has(id)) {
        toAdd.push({
          id,
          lngLat: [place.lng, place.lat],
          props: {
            id,
            name: place.name,
            category: place.category,
            tags: Array.isArray(place.tags) ? JSON.stringify(place.tags) : (place.tags ?? '[]'),
          },
        });
      }
    }
  }

  // Add new markers
  for (const { id, lngLat, props } of toAdd) {
    const el = createMarkerElement(props, inst);
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(lngLat)
      .addTo(map);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const place = inst.filteredPlaces.find(p => String(p.place_id || p.id) === id);
      if (place) openShopPopup(place, marker.getLngLat(), inst);
    });
    cache.set(id, marker);
  }

  // Remove markers no longer in view
  for (const [id, marker] of cache) {
    if (!visibleIds.has(id)) {
      marker.remove();
      cache.delete(id);
    }
  }
}

// ── User-added shops ─────────────────────────────────────────────────────────

function syncUserAddedShops(map: MapLibreMap) {
  const current = new Set(userAddedShops.value.map(s => `${s.lat},${s.lng}`));

  // Add new
  for (const shop of userAddedShops.value) {
    const key = `${shop.lat},${shop.lng}`;
    if (userShopMarkerCache.has(key)) continue;
    const el = document.createElement('div');
    el.className = 'shop-marker-wrapper saved-shop-marker';
    el.style.cssText = 'cursor:pointer;transform:translate(-50%,-100%)';
    el.innerHTML = '<div class="shop-marker-content saved">💈</div>';
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([shop.lng, shop.lat])
      .addTo(map);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      activeShopPopup?.remove();
      activeShopPopup = new maplibregl.Popup()
        .setLngLat([shop.lng, shop.lat])
        .setHTML(`<div class="popup-content"><h3 class="popup-title">${shop.name}</h3><div class="popup-info"><div class="info-row"><strong>Added:</strong> ${new Date(shop.timestamp).toLocaleDateString()}</div></div></div>`)
        .addTo(map);
    });
    userShopMarkerCache.set(key, marker);
  }

  // Remove stale
  for (const [key, marker] of userShopMarkerCache) {
    if (!current.has(key)) {
      marker.remove();
      userShopMarkerCache.delete(key);
    }
  }
}

// ── Polygon drawing ──────────────────────────────────────────────────────────

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

// ── Map init ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  isSidebarOpen.value = false;
  fetchAll();

  if (!mapContainer.value) return;
  const map = await initMap(mapContainer.value);

  // Set up drawing layers
  setupDrawingLayers(map);

  // Set up place layers (bottom-to-top: least important categories first)
  for (const inst of [...placeInstances].reverse()) {
    setupCategoryLayers(map, inst);
  }

  // Race-condition fix: fetchAll() runs concurrently with map init. If the API
  // responded before sources were registered above, the watcher fired but found
  // no source and dropped the data. Re-sync any data that already arrived.
  for (const inst of placeInstances) {
    if (inst.filteredPlaces.length > 0) {
      const src = map.getSource(sourceId(inst.config.category)) as GeoJSONSource | undefined;
      if (src) src.setData(placesToGeoJSON(inst.filteredPlaces));
    }
  }

  // Map click handler
  map.on('click', (e) => {
    if (isDrawingMode.value) {
      addVertex(e.lngLat.lat, e.lngLat.lng);
    } else if (isPinMode.value) {
      if (comparisonPins.value.length < 5) {
        const pin = addComparisonPin(e.lngLat.lat, e.lngLat.lng);
        // Add marker for the pin
        const el = document.createElement('div');
        el.className = 'comparison-pin-marker';
        el.dataset.pinId = pin.id;
        el.style.cssText = 'cursor:pointer;transform:translate(-50%,-100%)';
        el.innerHTML = `<div class="comparison-pin-dot dot-${comparisonPins.value.length}"><span style="transform:rotate(45deg);display:block">${pin.index}</span></div>`;
        el.title = 'Click to remove';
        el.addEventListener('click', (evt) => {
          evt.stopPropagation();
          removeComparisonPin(pin.id);
        });
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map);
        comparisonMarkers.set(pin.id, marker);
      }
      if (comparisonPins.value.length >= 5) togglePinMode();
    } else {
      onMapClick({ latlng: { lat: e.lngLat.lat, lng: e.lngLat.lng } });
    }
  });

  // Render loop: sync HTML markers every frame (queryRenderedFeatures is fast)
  map.on('render', () => {
    for (const inst of placeInstances) {
      syncCategoryMarkers(map, inst);
    }
    syncUserAddedShops(map);
    syncNewShopPin(map);
  });

  // Watch inst.visible → sync MapLibre layer visibility
  for (const inst of placeInstances) {
    watch(() => inst.visible, (visible) => {
      const cat = inst.config.category;
      if (!map.getLayer(clusterLayerId(cat))) return;
      const clusterVis = visible && enableClustering.value ? 'visible' : 'none';
      map.setLayoutProperty(clusterLayerId(cat), 'visibility', clusterVis);
      map.setLayoutProperty(clusterCountId(cat), 'visibility', clusterVis);
      map.setLayoutProperty(pointLayerId(cat), 'visibility', visible ? 'visible' : 'none');
    });
  }

  // Watch enableClustering → toggle cluster layer visibility
  watch(enableClustering, (clustering) => {
    for (const inst of placeInstances) {
      const cat = inst.config.category;
      if (!map.getLayer(clusterLayerId(cat))) continue;
      const vis = clustering && inst.visible ? 'visible' : 'none';
      map.setLayoutProperty(clusterLayerId(cat), 'visibility', vis);
      map.setLayoutProperty(clusterCountId(cat), 'visibility', vis);
    }
    for (const inst of placeInstances) {
      const cache = markerCaches.get(inst.config.category);
      cache?.forEach(m => m.remove());
      cache?.clear();
    }
  });
});

// ── New shop pin ─────────────────────────────────────────────────────────────

function syncNewShopPin(map: MapLibreMap) {
  if (newShopPin.value) {
    if (!newShopPinMarker) {
      const el = document.createElement('div');
      el.className = 'shop-marker-wrapper new-shop-marker';
      el.style.cssText = 'transform:translate(-50%,-100%)';
      el.innerHTML = '<div class="shop-marker-content new">📍</div>';
      newShopPinMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([newShopPin.value.lng, newShopPin.value.lat])
        .addTo(map);
    } else {
      newShopPinMarker.setLngLat([newShopPin.value.lng, newShopPin.value.lat]);
    }
  } else if (newShopPinMarker) {
    newShopPinMarker.remove();
    newShopPinMarker = null;
  }
}

// ── Watchers: GeoJSON sources ─────────────────────────────────────────────

// Update place GeoJSON sources when filtered data changes
for (const inst of placeInstances) {
  watch(() => inst.filteredPlaces, (places) => {
    const map = mapInstance.value;
    if (!map) return;
    const source = map.getSource(sourceId(inst.config.category)) as GeoJSONSource | undefined;
    if (!source) return;

    if (!inst.visible || !enableClustering.value) {
      // If not clustering, still update source but use a different display strategy
    }
    source.setData(placesToGeoJSON(places));

    // Also clear marker cache since data changed (render loop will recreate)
    const cache = markerCaches.get(inst.config.category);
    cache?.forEach(m => m.remove());
    cache?.clear();
  }, { deep: false });
}

// Polygon drawing watchers
watch(drawingVertices, (vertices) => {
  const map = mapInstance.value;
  if (!map || !map.getSource('drawing-line')) return;
  (map.getSource('drawing-line') as GeoJSONSource).setData(verticesToLineGeoJSON(vertices));
  (map.getSource('drawing-points') as GeoJSONSource).setData(verticesToPointsGeoJSON(vertices));
});

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
  setOsmPoiPolygon(polygon, map);
});

// Watch for removed comparison pins → remove their map markers
watch(comparisonPins, (newPins) => {
  for (const [id, marker] of comparisonMarkers) {
    if (!newPins.find(p => p.id === id)) {
      marker.remove();
      comparisonMarkers.delete(id);
    }
  }
});

// Keyboard: Escape to cancel drawing
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isDrawingMode.value) clearPolygon();
};
onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<style scoped>
.map-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.sidebar-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 380px;
  z-index: 2000;
  transition: transform 0.3s ease-in-out;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
}

.sidebar-wrapper.closed {
  transform: translateX(-100%);
}

.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -32px;
  width: 32px;
  height: 64px;
  transform: translateY(-50%);
  background: #161B16;
  border: 1px solid rgba(245, 240, 232, 0.12);
  border-left: none;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a7e72;
  box-shadow: 6px 0 12px rgba(0, 0, 0, 0.25);
  transition: all 0.2s;
  padding-left: 4px;
}

.sidebar-toggle:hover {
  background: #252018;
  color: #f5f0e8;
  width: 36px;
  right: -36px;
  box-shadow: 8px 0 16px rgba(0, 0, 0, 0.35);
}

.toggle-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.map-wrapper {
  flex: 1;
  position: relative;
}

.map-wrapper.drawing-cursor :deep(.maplibregl-canvas) {
  cursor: crosshair !important;
}

.map-wrapper.pin-cursor :deep(.maplibregl-canvas) {
  cursor: cell !important;
}

/* Shift area panel left when comparison panel is also open */
:deep(.shifted-left) {
  right: 348px !important;
}

.map-div {
  position: absolute;
  inset: 0;
}

.poi-active-badge {
  position: absolute;
  bottom: 24px;
  right: 10px;
  z-index: 1000;
  background: rgba(22, 27, 22, 0.92);
  border: 1px solid rgba(217, 119, 87, 0.5);
  border-radius: 10px;
  color: #d97757;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 13px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  transition: all 0.2s;
  white-space: nowrap;
}

.poi-active-badge:hover {
  background: rgba(217, 119, 87, 0.15);
  border-color: rgba(217, 119, 87, 0.8);
  color: #f5f0e8;
}

.polygon-controls {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(22, 27, 22, 0.92);
  border: 1px solid rgba(245, 240, 232, 0.14);
  border-radius: 12px;
  padding: 8px 14px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.polygon-btn {
  background: rgba(245, 240, 232, 0.08);
  border: 1px solid rgba(245, 240, 232, 0.16);
  border-radius: 8px;
  color: #d4cfc8;
  font-size: 13px;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.polygon-btn:hover:not(:disabled) {
  background: rgba(245, 240, 232, 0.14);
  color: #f5f0e8;
}

.polygon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.polygon-btn.finish {
  border-color: rgba(16, 185, 129, 0.5);
  color: #10b981;
}

.polygon-btn.finish:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.15);
}

.polygon-btn.cancel,
.polygon-btn.clear {
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.polygon-btn.cancel:hover,
.polygon-btn.clear:hover {
  background: rgba(239, 68, 68, 0.12);
}

.drawing-hint {
  font-size: 12px;
  color: #f59e0b;
  white-space: nowrap;
}

.polygon-count {
  font-size: 12px;
  color: #10b981;
  white-space: nowrap;
}

/* Marker styles */
:deep(.shop-marker-content) {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  transition: transform 0.2s;
}

:deep(.shop-marker-content:hover) {
  transform: scale(1.2);
}

:deep(.chain-logo) {
  width: 24px;
  height: 24px;
  display: block;
}

:deep(.chain-logo[alt="Billa"]),
:deep(.chain-logo[alt="Fantastico"]) {
  width: auto;
  height: 18px;
}

/* Comparison pin markers */
:deep(.comparison-pin-dot) {
  width: 26px;
  height: 26px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

:deep(.comparison-pin-dot.dot-1) {
  background: #d97757;
  color: #fff;
}
:deep(.comparison-pin-dot.dot-2) {
  background: #10b981;
  color: #fff;
}
:deep(.comparison-pin-dot.dot-3) {
  background: #f59e0b;
  color: #fff;
}
:deep(.comparison-pin-dot.dot-4) {
  background: #c05e3a;
  color: #fff;
}
:deep(.comparison-pin-dot.dot-5) {
  background: #c4b8ae;
  color: #161B16;
}

:deep(.comparison-pin-dot > span) {
  transform: rotate(45deg);
}
</style>
