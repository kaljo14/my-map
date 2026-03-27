<template>
  <div class="map-container">
    <AppHeader v-if="!isMobile" />

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
          :showPopulationGrid="showPopulationGrid"
          :selectedThreshold="selectedThreshold"
          :showAnalysisGrid="showAnalysisGrid"
          :showOpportunityHeatmap="showOpportunityHeatmap"
          :activeCategoryHeatmap="heatmapCategory"
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
          @togglePopulationGrid="handleTogglePopulationGrid"
          @toggleAnalysisGrid="handleToggleAnalysisGrid"
          @updateThreshold="updateThreshold"
          @toggleOpportunityHeatmap="handleToggleOpportunityHeatmap"
          @setHeatmapCategory="handleSetHeatmapCategory"
          @startDrawing="startDrawing"
          @clearPolygon="clearPolygon"
          @togglePinMode="togglePinMode"
          @clearComparison="clearComparison"
          @removePin="removeComparisonPin"
          @compareLocations="openComparison"
          @closeComparison="closeComparison"
          @switchBaseLayer="onSwitchBaseLayer"
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
          :filteredCount="totalFilteredCount"
          :averageRating="averageRating"
          :label="statsLabel"
        />

        <!-- Polygon Draw Controls (in-progress + active state only) -->
        <div v-if="isDrawingMode || activePolygon" class="polygon-controls">
          <template v-if="isDrawingMode">
            <span class="drawing-hint">{{ drawingVertices.length }} point{{ drawingVertices.length !== 1 ? 's' : '' }} — click map to add</span>
            <button
              class="polygon-btn finish"
              :disabled="drawingVertices.length < 3"
              @click="finishDrawing"
            ><span class="material-symbols-outlined" style="font-size:15px;line-height:1">check</span> Finish</button>
            <button class="polygon-btn cancel" @click="clearPolygon"><span class="material-symbols-outlined" style="font-size:15px;line-height:1">close</span> Cancel</button>
          </template>
          <template v-else-if="activePolygon">
            <span class="polygon-count"><span class="material-symbols-outlined" style="font-size:14px;line-height:1;vertical-align:middle">hexagon</span> {{ totalFilteredCount }} in area</span>
            <button class="polygon-btn clear" @click="clearPolygon"><span class="material-symbols-outlined" style="font-size:15px;line-height:1">close</span> Clear</button>
          </template>
        </div>

        <!-- Drawing mode overlay -->
        <div v-if="isDrawingMode" class="drawing-overlay"></div>

        <!-- MapLibre container -->
        <div ref="mapContainer" class="map-div" :class="{ 'map-dark': isDarkMap }"></div>

        <!-- Pin mode cursor -->

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
import AppHeader from './map/AppHeader.vue';
import MapStats from './map/MapStats.vue';
import BottomNav from './map/BottomNav.vue';
import ShopPopup from './map/ShopPopup.vue';
import LocationComparisonPanel from './map/LocationComparisonPanel.vue';
import AreaAnalysisPanel from './map/AreaAnalysisPanel.vue';
import { isDarkMap } from '@/stores/mapConfig';

const { isAuthenticated, logout } = auth;

const mapContainer = ref<HTMLElement | null>(null);
const { mapInstance, initMap, switchBaseLayer } = useMapInstance();

function onSwitchBaseLayer(name: string) {
  if (mapInstance.value) switchBaseLayer(mapInstance.value, name);
}
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
  clearPins: clearComparison,
  togglePinMode,
  openComparison,
  closeComparison,
} = useLocationComparison();

const totalFilteredCount = computed(() =>
  placeInstances.reduce((sum, inst) => sum + (inst.visible ? inst.filteredPlaces.length : 0), 0)
);

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  barbershop: 'Barbershops',
  gym: 'Gyms',
  carwash: 'Car Washes',
  'grocery store': 'Grocery Stores',
};

const statsLabel = computed(() => {
  if (isMobile.value) return i18n.global.t('stats.shops');
  const visible = placeInstances.filter(i => i.visible);
  if (visible.length === 1) {
    const name = CATEGORY_DISPLAY_NAMES[visible[0].config.category] ?? visible[0].config.category;
    return `Total ${name}:`;
  }
  return i18n.global.t('stats.total');
});

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
// Per-category HTML cluster marker caches: category → Map<"c-{clusterId}", maplibregl.Marker>
const clusterMarkerCaches = new Map<string, Map<string, maplibregl.Marker>>();
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

function sourceId(category: string)         { return `places-${category.replace(/ /g, '-')}`; }
function clusterSourceLayerId(category: string) { return `${sourceId(category)}-cluster-src`; }
function pointLayerId(category: string)         { return `${sourceId(category)}-points`; }

/** Convert a 6-digit hex colour to an rgba() string. */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Build the HTML element for a cluster bubble. */
function createClusterElement(count: number, inst: (typeof placeInstances)[0]): HTMLElement {
  const color = inst.config.clusterColor;
  const size   = count < 10 ? 38 : count < 50 ? 48 : count < 200 ? 58 : 68;
  const label  = count >= 1000 ? `${Math.round(count / 100) / 10}k` : String(count);
  const el = document.createElement('div');
  el.className = 'cluster-marker-wrapper';
  el.innerHTML = `<div class="cluster-bubble" style="
    width:${size}px;height:${size}px;
    background:${color};
    font-size:${size < 48 ? 13 : size < 58 ? 14 : 15}px;
    box-shadow:0 2px 10px rgba(0,0,0,0.28),0 0 0 3px rgba(255,255,255,0.9),0 0 0 8px ${hexToRgba(color, 0.22)};
  ">${label}</div>`;
  return el;
}

function setupCategoryLayers(map: MapLibreMap, inst: (typeof placeInstances)[0]) {
  const cat = inst.config.category;
  const sid = sourceId(cat);

  if (map.getSource(sid)) return;

  map.addSource(sid, {
    type: 'geojson',
    data: placesToGeoJSON([]),
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 60,
  });

  const clusterVis = inst.visible && enableClustering.value ? 'visible' : 'none';
  const initVis    = inst.visible ? 'visible' : 'none';

  // ── Invisible cluster-centroid layer ──────────────────────────────────
  // queryRenderedFeatures target for custom HTML cluster bubbles.
  // MapLibre produces cluster features (has point_count) only below
  // clusterMaxZoom (14), so this layer auto-empties at zoom ≥ 14.
  map.addLayer({
    id: clusterSourceLayerId(cat),
    type: 'circle',
    source: sid,
    filter: ['has', 'point_count'],
    layout: { visibility: clusterVis },
    paint: { 'circle-radius': 1, 'circle-opacity': 0 },
  });

  // ── Invisible individual-point layer ──────────────────────────────────
  // queryRenderedFeatures target for individual HTML emoji markers.
  // minzoom: 13 so individual markers only emerge once the map is
  // zoomed in enough to distinguish them from clusters.
  map.addLayer({
    id: pointLayerId(cat),
    type: 'circle',
    source: sid,
    filter: ['!', ['has', 'point_count']],
    minzoom: 13,
    layout: { visibility: initVis },
    paint: { 'circle-radius': 4, 'circle-opacity': 0.02 },
  });

  clusterMarkerCaches.set(cat, new Map());
  markerCaches.set(cat, new Map());
}

function getMarkerIcon(props: Record<string, any>, inst: (typeof placeInstances)[0]): string {
  let tags: string[] = [];
  try { tags = JSON.parse(props.tags ?? '[]'); } catch { /* ignore */ }
  if (tags.includes('lidl')) return '<img src="/Lidl-Logo.svg" class="chain-logo" alt="Lidl"/>';
  if (tags.includes('kaufland')) return '<img src="/Kaufland_201x_logo.svg" class="chain-logo" alt="Kaufland"/>';
  if (tags.includes('billa')) return '<img src="/Billa_Logo_2012.svg" class="chain-logo" alt="Billa"/>';
  if (tags.includes('fantastico')) return '<img src="/Fantastico.png" class="chain-logo" alt="Fantastico"/>';
  return `<span class="material-symbols-outlined">${inst.config.emoji}</span>`;
}

function createMarkerElement(props: Record<string, any>, inst: (typeof placeInstances)[0]): HTMLElement {
  const el = document.createElement('div');
  el.className = `shop-marker-wrapper ${inst.config.markerClass}`;
  el.style.cssText = 'cursor:pointer;transform:translate(-50%,-50%)';
  el.innerHTML = `<div class="shop-pin-marker"><div class="shop-pin-head">${getMarkerIcon(props, inst)}</div></div>`;
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
  const cat          = inst.config.category;
  const markerCache  = markerCaches.get(cat);
  const clusterCache = clusterMarkerCaches.get(cat);

  if (!inst.visible) {
    markerCache?.forEach(m => m.remove());  markerCache?.clear();
    clusterCache?.forEach(m => m.remove()); clusterCache?.clear();
    return;
  }

  if (!markerCache || !clusterCache) return;

  if (enableClustering.value) {
    // ── Cluster bubbles ────────────────────────────────────────────────────
    const clusterFeatures = map.queryRenderedFeatures({ layers: [clusterSourceLayerId(cat)] });
    const visClusterIds   = new Set(clusterFeatures.map(f => `c-${f.properties!.cluster_id}`));

    for (const f of clusterFeatures) {
      const cid   = `c-${f.properties!.cluster_id}`;
      if (clusterCache.has(cid)) continue;
      const coords    = (f.geometry as GeoJSON.Point).coordinates as [number, number];
      const clusterId = f.properties!.cluster_id as number;
      const el        = createClusterElement(f.properties!.point_count as number, inst);
      const marker    = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map);
      el.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const zoom = await (map.getSource(sourceId(cat)) as maplibregl.GeoJSONSource)
            .getClusterExpansionZoom(clusterId);
          map.easeTo({ center: coords, zoom: zoom + 0.5 });
        } catch { /* ignore */ }
      });
      clusterCache.set(cid, marker);
    }

    for (const [cid, marker] of clusterCache) {
      if (!visClusterIds.has(cid)) { marker.remove(); clusterCache.delete(cid); }
    }

    // ── Individual point markers (zoom ≥ 13, unclustered points) ──────────
    const rendered  = map.queryRenderedFeatures({ layers: [pointLayerId(cat)] });
    const visIds    = new Set(rendered.map(f => String(f.properties!.id)));

    for (const f of rendered) {
      const id = String(f.properties!.id);
      if (markerCache.has(id)) continue;
      const lngLat = (f.geometry as GeoJSON.Point).coordinates as [number, number];
      const el     = createMarkerElement(f.properties as Record<string, any>, inst);
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(lngLat).addTo(map);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const place = inst.filteredPlaces.find(p => String(p.place_id || p.id) === id);
        if (place) openShopPopup(place, marker.getLngLat(), inst);
      });
      markerCache.set(id, marker);
    }

    for (const [id, marker] of markerCache) {
      if (!visIds.has(id)) { marker.remove(); markerCache.delete(id); }
    }

  } else {
    // ── Clustering off: show all individual markers in viewport ────────────
    clusterCache.forEach(m => m.remove()); clusterCache.clear();

    const bounds    = map.getBounds();
    const inView    = inst.filteredPlaces.filter(p => !bounds || bounds.contains([p.lng, p.lat]));
    const visibleIds = new Set(inView.map(p => String(p.place_id || p.id)));

    for (const place of inView) {
      const id = String(place.place_id || place.id);
      if (markerCache.has(id)) continue;
      const props = {
        id,
        name: place.name,
        category: place.category,
        tags: Array.isArray(place.tags) ? JSON.stringify(place.tags) : (place.tags ?? '[]'),
      };
      const el     = createMarkerElement(props, inst);
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([place.lng, place.lat])
        .addTo(map);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const found = inst.filteredPlaces.find(p => String(p.place_id || p.id) === id);
        if (found) openShopPopup(found, marker.getLngLat(), inst);
      });
      markerCache.set(id, marker);
    }

    for (const [id, marker] of markerCache) {
      if (!visibleIds.has(id)) { marker.remove(); markerCache.delete(id); }
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
    el.innerHTML = '<div class="shop-pin-marker"><div class="shop-pin-head"><span class="material-symbols-outlined">content_cut</span></div></div>';
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
      if (!map.getLayer(clusterSourceLayerId(cat))) return;
      const clusterVis = visible && enableClustering.value ? 'visible' : 'none';
      map.setLayoutProperty(clusterSourceLayerId(cat), 'visibility', clusterVis);
      map.setLayoutProperty(pointLayerId(cat),         'visibility', visible ? 'visible' : 'none');
    });
  }

  // Watch enableClustering → toggle cluster source layer visibility + flush caches
  watch(enableClustering, (clustering) => {
    for (const inst of placeInstances) {
      const cat = inst.config.category;
      if (!map.getLayer(clusterSourceLayerId(cat))) continue;
      const vis = clustering && inst.visible ? 'visible' : 'none';
      map.setLayoutProperty(clusterSourceLayerId(cat), 'visibility', vis);
    }
    for (const inst of placeInstances) {
      const cat = inst.config.category;
      markerCaches.get(cat)?.forEach(m => m.remove());  markerCaches.get(cat)?.clear();
      clusterMarkerCaches.get(cat)?.forEach(m => m.remove()); clusterMarkerCaches.get(cat)?.clear();
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
      el.innerHTML = '<div class="shop-pin-marker"><div class="shop-pin-head new-pin"><span class="material-symbols-outlined">location_on</span></div></div>';
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

    // Flush both caches — the render loop will recreate all markers
    const cat = inst.config.category;
    markerCaches.get(cat)?.forEach(m => m.remove());      markerCaches.get(cat)?.clear();
    clusterMarkerCaches.get(cat)?.forEach(m => m.remove()); clusterMarkerCaches.get(cat)?.clear();
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
  background: #08090C;
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

.drawing-overlay {
  position: absolute;
  inset: 0;
  z-index: 999;
  background: rgba(245, 158, 11, 0.3);
  pointer-events: none;
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

/* ── Cluster bubble markers ─────────────────────────────────────────────── */
:deep(.cluster-marker-wrapper) {
  cursor: pointer;
  transform: translate(-50%, -50%);
}

:deep(.cluster-bubble) {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-family: system-ui, -apple-system, sans-serif;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  will-change: transform;
}

:deep(.cluster-bubble:hover) {
  transform: scale(1.12);
}

/* Per-category pin colors */
:deep(.shop-marker-wrapper.barbershop-marker) { --pin-color: #d97757; }
:deep(.shop-marker-wrapper.gym-marker) { --pin-color: #5b8dd9; }
:deep(.shop-marker-wrapper.carwash-marker) { --pin-color: #4db89e; }
:deep(.shop-marker-wrapper.grocery-marker) { --pin-color: #7bc96f; }
:deep(.shop-marker-wrapper.saved-shop-marker) { --pin-color: #d97757; }
:deep(.shop-marker-wrapper.new-shop-marker) { --pin-color: #6366f1; }

/* Pin marker shape */
:deep(.shop-pin-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

:deep(.shop-pin-marker:hover) {
  transform: scale(1.18);
}

:deep(.shop-pin-head) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(250, 248, 244, 0.72);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--pin-color, #d97757);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.25);
  position: relative;
}

:deep(.map-dark .shop-pin-head) {
  background: rgba(15, 15, 20, 0.65);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.5);
}

:deep(.shop-pin-head .material-symbols-outlined) {
  font-size: 20px;
  line-height: 1;
  color: var(--pin-color, #d97757);
}

:deep(.chain-logo) {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
  border-radius: 3px;
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
