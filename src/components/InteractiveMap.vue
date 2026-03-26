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
      <div class="sidebar-wrapper" :class="{ closed: !isSidebarOpen }">
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
          @togglePlaceType="toggleVisible"
          @toggleClustering="enableClustering = !enableClustering"
          @toggleMetroVector="handleToggleMetroVector"
          @toggleMetroLine="handleToggleMetroLine"
          @toggleMetroStops="handleToggleMetroStops"
          @toggleStopLine="handleToggleStopLine"
          @toggleGroceryTagFilter="toggleGroceryTagFilter"
          @togglePedestrianNetwork="handleTogglePedestrianNetwork"
          @toggleOsmPois="handleToggleOsmPois"
        />
        
        <!-- Sidebar Toggle Handle -->
        <button 
          class="sidebar-toggle" 
          @click="isSidebarOpen = !isSidebarOpen"
          title="Toggle Sidebar"
        >
          <span class="toggle-icon">{{ isSidebarOpen ? '◀' : '▶' }}</span>
        </button>
      </div>

      <!-- Map -->
      <div class="map-wrapper" :class="{ 'drawing-cursor': isDrawingMode }">
        <MapStats
          :isMobile="isMobile"
          :filteredCount="placeInstances[0]?.filteredPlaces.length ?? 0"
          :averageRating="averageRating"
        />

        <!-- Polygon Draw Controls -->
        <div class="polygon-controls">
          <template v-if="!isDrawingMode && !activePolygon">
            <button class="polygon-btn" @click="startDrawing" title="Draw area to filter points">
              ⬡ Draw Area
            </button>
          </template>
          <template v-else-if="isDrawingMode">
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
        <l-map
          :zoom="zoom"
          :center="center"
          :use-global-leaflet="true"
          :options="{ zoomControl: false }"
          @click="handleMapClick"
          @ready="onMapReady"
        >
          <l-control-layers />
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
          <l-tile-layer
            v-for="layer in baseLayers"
            :key="layer.name"
            :name="layer.name"
            :url="layer.url"
            :visible="layer.visible"
            layer-type="base"
            :attribution="layer.attribution"
          ></l-tile-layer>

          <!-- Analysis Grid Layer is now handled by the composable using vector tiles -->

          <!-- Metro Lines Layer -->
          <!-- Metro Lines Layer (Deprecated: Removed) -->

          <!-- Place Layers (all types rendered generically) -->
          <template v-for="inst in placeInstances" :key="inst.config.category">
            <l-marker-cluster-group
              v-if="inst.visible && enableClustering"
              :options="{ spiderfyOnMaxZoom: true, maxClusterRadius: 12 }"
            >
              <l-marker
                v-for="place in inst.filteredPlaces"
                :key="place.id"
                :lat-lng="[place.lat, place.lng]"
              >
                <l-icon :icon-anchor="[20, 40]" :class-name="inst.config.markerClass">
                  <div class="shop-marker-content saved">
                    <img v-if="place.tags?.includes('lidl')" src="/Lidl-Logo.svg" class="chain-logo" alt="Lidl" />
                    <img v-else-if="place.tags?.includes('kaufland')" src="/Kaufland_201x_logo.svg" class="chain-logo" alt="Kaufland" />
                    <img v-else-if="place.tags?.includes('billa')" src="/Billa_Logo_2012.svg" class="chain-logo" alt="Billa" />
                    <img v-else-if="place.tags?.includes('fantastico')" src="/Fantastico.png" class="chain-logo" alt="Fantastico" />
                    <template v-else>{{ inst.config.emoji }}</template>
                  </div>
                </l-icon>
                <l-popup :options="{ maxWidth: 400, minWidth: 300 }">
                  <ShopPopup
                    :shop="place"
                    :isAuthenticated="isAuthenticated"
                    @edit="(s) => inst.config.category === 'barbershop' ? editBarbershop(s) : null"
                    @delete="(s) => inst.config.category === 'barbershop' ? confirmDelete(s) : null"
                  />
                </l-popup>
              </l-marker>
            </l-marker-cluster-group>

            <l-layer-group v-if="inst.visible && !enableClustering">
              <l-marker
                v-for="place in inst.filteredPlaces"
                :key="place.id"
                :lat-lng="[place.lat, place.lng]"
              >
                <l-icon :icon-anchor="[20, 40]" :class-name="inst.config.markerClass">
                  <div class="shop-marker-content saved">
                    <img v-if="place.tags?.includes('lidl')" src="/Lidl-Logo.svg" class="chain-logo" alt="Lidl" />
                    <img v-else-if="place.tags?.includes('kaufland')" src="/Kaufland_201x_logo.svg" class="chain-logo" alt="Kaufland" />
                    <img v-else-if="place.tags?.includes('billa')" src="/Billa_Logo_2012.svg" class="chain-logo" alt="Billa" />
                    <img v-else-if="place.tags?.includes('fantastico')" src="/Fantastico.png" class="chain-logo" alt="Fantastico" />
                    <template v-else>{{ inst.config.emoji }}</template>
                  </div>
                </l-icon>
                <l-popup :options="{ maxWidth: 400, minWidth: 300 }">
                  <ShopPopup
                    :shop="place"
                    :isAuthenticated="isAuthenticated"
                    @edit="(s) => inst.config.category === 'barbershop' ? editBarbershop(s) : null"
                    @delete="(s) => inst.config.category === 'barbershop' ? confirmDelete(s) : null"
                  />
                </l-popup>
              </l-marker>
            </l-layer-group>
          </template>

          <!-- Polygon Drawing Preview -->
          <template v-if="isDrawingMode && drawingVertices.length >= 2">
            <l-polygon
              :lat-lngs="drawingVertices"
              :options="{ color: '#f59e0b', weight: 2, fillOpacity: 0.08, dashArray: '6 6' }"
            />
          </template>
          <template v-if="isDrawingMode">
            <l-circle-marker
              v-for="(v, i) in drawingVertices"
              :key="i"
              :lat-lng="v"
              :radius="5"
              :options="{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 1, weight: 2 }"
            />
          </template>

          <!-- Active Filter Polygon -->
          <l-polygon
            v-if="activePolygon"
            :lat-lngs="activePolygon"
            :options="{ color: '#10b981', weight: 2, fillOpacity: 0.12 }"
          />

          <!-- Temporary Pin for New Shop -->
          <l-marker
            v-if="newShopPin"
            :lat-lng="[newShopPin.lat, newShopPin.lng]"
          >
            <l-icon :icon-anchor="[20, 40]" class-name="new-shop-marker">
              <div class="shop-marker-content new">
                📍
              </div>
            </l-icon>
          </l-marker>

          <!-- User Added Shops -->
          <l-marker-cluster-group :options="{ spiderfyOnMaxZoom: true, maxClusterRadius: 12 }">
            <l-marker
              v-for="(shop, index) in userAddedShops"
              :key="`shop-${index}`"
              :lat-lng="[shop.lat, shop.lng]"
            >
              <l-icon :icon-anchor="[20, 40]" class-name="saved-shop-marker">
                <div class="shop-marker-content saved">
                  💈
                </div>
              </l-icon>
              <l-popup>
                <div class="popup-content">
                  <h3 class="popup-title">{{ shop.name }}</h3>
                  <div class="popup-info">
                    <div class="info-row">
                      <strong>Added:</strong> {{ new Date(shop.timestamp).toLocaleDateString() }}
                    </div>
                  </div>
                </div>
              </l-popup>
            </l-marker>
          </l-marker-cluster-group>
        </l-map>
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LPopup,
  LControlLayers,
  LLayerGroup,
  LPolygon,
  LCircleMarker,
} from "@vue-leaflet/vue-leaflet";

import { LMarkerClusterGroup } from "vue-leaflet-markercluster";

import { baseLayers } from "@/stores/mapConfig";
import auth from "@/services/auth";

// Composables
import { useMapInstance } from "@/composables/useMapInstance";
import { useMobileDetection } from "@/composables/useMobileDetection";
import { usePlacesManager } from "@/composables/usePlacesManager";
import { usePopulationLayers } from "@/composables/usePopulationLayers";
import { useAnalysisGrid } from "@/composables/useAnalysisGrid";
import { useOpportunityHeatmap } from "@/composables/useOpportunityHeatmap";
import { useMetroLines } from "@/composables/useMetroLines";
import { useMetroStops } from "@/composables/useMetroStops";
import { usePedestrianNetwork } from "@/composables/usePedestrianNetwork";
import { useOsmPois } from "@/composables/useOsmPois";
import { useShopManagement } from "@/composables/useShopManagement";
// Components
import AnalysisPanel from "./map/AnalysisPanel.vue";
import ShopModal from "./map/ShopModal.vue";
import DeleteConfirmModal from "./map/DeleteConfirmModal.vue";
import MapControls from "./map/MapControls.vue";
import AppHeader from "./map/AppHeader.vue";
import MapStats from "./map/MapStats.vue";
import BottomNav from "./map/BottomNav.vue";
import ShopPopup from "./map/ShopPopup.vue";

const { isAuthenticated, userProfile, login, logout } = auth;

const { mapInstance, zoom, center, onMapReady } = useMapInstance();
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

onMounted(() => {
  isSidebarOpen.value = false;
  fetchAll();
});

const {
  showPopulationGrid,
  selectedThreshold,
  togglePopulationGrid,
  updateThreshold,
} = usePopulationLayers();

const {
  showAnalysisGrid,
  toggleAnalysisGrid: toggleAnalysisGridComposable
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
  METRO_COLORS
} = useMetroLines();

const {
  showMetroStops,
  activeStopLines,
  toggleMetroStops,
  toggleStopLine
} = useMetroStops();

const {
  showPedestrianNetwork,
  togglePedestrianNetwork,
} = usePedestrianNetwork();

const {
  showOsmPois,
  toggleOsmPois,
} = useOsmPois();

const handleToggleMetroVector = () => {
    toggleMetroVector(mapInstance.value);
};

const handleToggleMetroLine = (line: string) => {
    toggleMetroLine(line, mapInstance.value);
};

const handleToggleMetroStops = () => {
    toggleMetroStops(mapInstance.value);
};

const handleToggleStopLine = (line: string) => {
  toggleStopLine(line, mapInstance.value);
};

const handleTogglePedestrianNetwork = () => {
  togglePedestrianNetwork(mapInstance.value);
};

const handleToggleOsmPois = () => {
  toggleOsmPois(mapInstance.value);
};

// Expose constants to template
const metroLinesList = METRO_LINES;
const metroColors = METRO_COLORS;

const handleTogglePopulationGrid = () => {
  if (showAnalysisGrid.value) {
    toggleAnalysisGridComposable(mapInstance.value);
  }
  togglePopulationGrid(mapInstance.value);
};

const handleToggleAnalysisGrid = () => {
  if (showPopulationGrid.value) {
    togglePopulationGrid(mapInstance.value);
  }
  toggleAnalysisGridComposable(mapInstance.value);
};

const handleToggleOpportunityHeatmap = () => {
  toggleOpportunityHeatmap(mapInstance.value);
};

const handleSetHeatmapCategory = (cat: string) => {
  setHeatmapCategory(cat as any, mapInstance.value);
};

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
  deleteBarbershop
} = useShopManagement(placeInstances[0]!.fetchPlaces);

const handleMapClick = (e: any) => {
  if (isDrawingMode.value) {
    addVertex(e.latlng.lat, e.latlng.lng);
  } else {
    onMapClick(e);
  }
};

const totalFilteredCount = computed(() =>
  placeInstances.reduce((sum, inst) => sum + (inst.visible ? inst.filteredPlaces.length : 0), 0)
);

// Press Escape to cancel drawing
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
  font-size: 14px;
  font-weight: bold;
}

.map-wrapper {
  flex: 1;
  position: relative;
}

.map-wrapper.drawing-cursor :deep(.leaflet-container) {
  cursor: crosshair !important;
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

/* Marker Styles */
.barbershop-marker {
  background: transparent !important;
  border: none !important;
}

.shop-marker-content {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  transition: transform 0.2s;
}

.shop-marker-content:hover {
  transform: scale(1.2);
}

.chain-logo {
  width: 24px;
  height: 24px;
  display: block;
}

.chain-logo[alt="Billa"],
.chain-logo[alt="Fantastico"] {
  width: auto;
  height: 18px;
}


/* Opportunity Zone Styles */
.opportunity-marker-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
}

.opportunity-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.opportunity-label {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  margin-top: -5px;
}

.opportunity-title {
  color: #059669;
}

.opportunity-note {
  margin-top: 12px;
  padding: 8px;
  background: #ecfdf5;
  border-radius: 6px;
  color: #047857;
  font-size: 0.85rem;
  border: 1px solid #d1fae5;
}


/* Metro Stop Marker Styles */
:deep(.metro-stop-marker) {
  background: transparent !important;
  border: none !important;
}

:deep(.metro-stop-icon) {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
  cursor: pointer;
  transition: transform 0.2s;
}

:deep(.metro-stop-icon:hover) {
  transform: scale(1.2);
}

:deep(.metro-stop-inner) {
  color: white;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Metro Stop Popup Styles */
:deep(.metro-stop-popup) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.metro-stop-header) {
  padding-left: 12px;
  margin-bottom: 8px;
}

:deep(.metro-stop-header h3) {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 700;
}

:deep(.metro-stop-header .stop-name) {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
}

:deep(.metro-stop-info) {
  padding: 8px 0 0 0;
  border-top: 1px solid #e2e8f0;
}

:deep(.metro-stop-info small) {
  color: #718096;
  font-size: 0.75rem;
}
</style>

