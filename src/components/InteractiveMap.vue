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
          :groceryTagFilters="groceryTagFilters"
          :isDrawingMode="isDrawingMode"
          :hasActivePolygon="!!activePolygon"
          :pins="comparisonPins"
          :pinCount="comparisonPinCount"
          :isPinMode="isPinMode"
          :isComparisonOpen="isComparisonOpen"
          @togglePlaceType="toggleVisible"
          @toggleClustering="enableClustering = !enableClustering"
          @toggleGroceryTagFilter="toggleGroceryTagFilter"
          @startDrawing="startDrawing"
          @clearPolygon="clearPolygon"
          @togglePinMode="togglePinMode"
          @clearComparison="clearComparison"
          @removePin="removeComparisonPin"
          @compareLocations="openComparison"
          @closeComparison="closeComparison"
          @switchBaseLayer="onSwitchBaseLayer"
          @startAddListing="startAddListing"
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
      <div class="map-wrapper" :class="{ 'drawing-cursor': isDrawingMode, 'pin-cursor': isPinMode, 'listing-cursor': isAddListingMode }">
        <MapStats
          :isMobile="isMobile"
          :filteredCount="totalFilteredCount"
          :averageRating="averageRating"
          :label="statsLabel"
        />

        <GeocodingSearch :map-instance="mapInstance" />

        <PolygonControls
          :isDrawingMode="isDrawingMode"
          :hasActivePolygon="!!activePolygon"
          :vertexCount="drawingVertices.length"
          :filteredCount="totalFilteredCount"
          @finish="finishDrawing"
          @clear="clearPolygon"
        />

        <!-- Drawing mode overlay -->
        <div v-if="isDrawingMode" class="drawing-overlay"></div>

        <!-- MapLibre container -->
        <div ref="mapContainer" class="map-div" :class="{ 'map-dark': isDarkMap }"></div>

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

    <!-- Add Retail Listing Modal -->
    <RetailListingModal
      :show="showListingModal"
      @close="cancelAddListing"
      @save="saveListing"
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
import { ref, computed, onMounted } from 'vue';

import auth from '@/services/auth';
import i18n from '@/i18n';

// Composables
import { useMapInstance } from '@/composables/useMapInstance';
import { useMobileDetection } from '@/composables/useMobileDetection';
import { usePlacesManager } from '@/composables/usePlacesManager';
import { useShopManagement } from '@/composables/useShopManagement';
import { useRetailListingManagement } from '@/composables/useRetailListingManagement';
import { initDeckOverlay } from '@/composables/useDeckOverlay';
import { usePlacesDeckLayer } from '@/composables/usePlacesDeckLayer';
import { useLocationComparison } from '@/composables/useLocationComparison';
import { usePolygonDrawing } from '@/composables/usePolygonDrawing';
import { useMapMarkers } from '@/composables/useMapMarkers';
import { useLayerStore } from '@/stores/layerStore';

// Components
import AnalysisPanel from './map/AnalysisPanel.vue';
import ShopModal from './map/ShopModal.vue';
import RetailListingModal from './map/RetailListingModal.vue';
import DeleteConfirmModal from './map/DeleteConfirmModal.vue';
import AppHeader from './map/AppHeader.vue';
import MapStats from './map/MapStats.vue';
import BottomNav from './map/BottomNav.vue';
import LocationComparisonPanel from './map/LocationComparisonPanel.vue';
import AreaAnalysisPanel from './map/AreaAnalysisPanel.vue';
import PolygonControls from './map/PolygonControls.vue';
import GeocodingSearch from './map/GeocodingSearch.vue';
import { isDarkMap } from '@/stores/mapConfig';

const { logout } = auth;

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

const layerStore = useLayerStore();

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

const {
  isAddListingMode,
  showListingModal,
  onMapClick: onListingMapClick,
  cancelAddListing,
  saveListing,
  startAddListing: startAddListingMode,
} = useRetailListingManagement(
  layerStore.refreshRetailListings,
  mapInstance,
);

function startAddListing() {
  // Ensure only one "add" mode is active at a time
  if (isDrawingMode.value) return;
  if (isPinMode.value) togglePinMode();
  startAddListingMode();
}

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

// Polygon drawing (watchers + keyboard handler registered automatically)
const { initDrawingLayers } = usePolygonDrawing(
  mapInstance,
  drawingVertices,
  activePolygon,
  isDrawingMode,
  clearPolygon,
);

// Map markers (comparison pin watcher registered automatically)
const { openShopPopup, addComparisonMarker, syncMarkers } = useMapMarkers(
  mapInstance,
  {
    userAddedShops,
    newShopPin,
    comparisonPins,
    removeComparisonPin,
    togglePinMode,
    editBarbershop,
    confirmDelete,
  },
);

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
    const name = CATEGORY_DISPLAY_NAMES[visible[0]!.config.category] ?? visible[0]!.config.category;
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

// ── Map init ─────────────────────────────────────────────────────────────

onMounted(async () => {
  isSidebarOpen.value = false;
  fetchAll();

  if (!mapContainer.value) return;
  const map = await initMap(mapContainer.value);
  layerStore.setMap(map);

  initDrawingLayers(map);
  initDeckOverlay(map);

  for (const inst of placeInstances) {
    usePlacesDeckLayer(inst, mapInstance, enableClustering, openShopPopup);
  }

  // Map click handler
  map.on('click', (e) => {
    if (isDrawingMode.value) {
      addVertex(e.lngLat.lat, e.lngLat.lng);
    } else if (isPinMode.value) {
      if (comparisonPins.value.length < 5) {
        const pin = addComparisonPin(e.lngLat.lat, e.lngLat.lng);
        addComparisonMarker(pin, map, comparisonPins.value.length);
      }
      if (comparisonPins.value.length >= 5) togglePinMode();
    } else if (isAddListingMode.value) {
      onListingMapClick({ latlng: { lat: e.lngLat.lat, lng: e.lngLat.lng } });
    } else {
      onMapClick({ latlng: { lat: e.lngLat.lat, lng: e.lngLat.lng } });
    }
  });

  // Render loop: sync low-count DOM markers (user-added shops, new shop pin)
  map.on('render', () => syncMarkers(map));
});
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

.map-wrapper.listing-cursor :deep(.maplibregl-canvas) {
  cursor: crosshair !important;
}

/* Shift area panel left when comparison panel is also open */
:deep(.shifted-left) {
  right: 348px !important;
}

.map-div {
  position: absolute;
  inset: 0;
}

/* User-added & new shop marker styles (kept as DOM markers) */
:deep(.shop-marker-wrapper.saved-shop-marker) { --pin-color: #d97757; }
:deep(.shop-marker-wrapper.new-shop-marker) { --pin-color: #6366f1; }

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
  width: 30px;
  height: 30px;
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
  font-size: 15px;
  line-height: 1;
  color: var(--pin-color, #d97757);
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

:deep(.geocoding-marker) {
  cursor: pointer;
  transform: translate(-50%, -100%);
}

:deep(.geocoding-marker-dot) {
  width: 32px;
  height: 32px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: #6366f1;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
