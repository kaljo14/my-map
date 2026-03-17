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
          :filters="filters"
          :availableServices="availableServices"

          :isAddShopMode="isAddShopMode"

          :placeTypes="placeTypesForPanel"
          :enableClustering="enableClustering"
          :showMetroVector="showMetroVector"
          :activeMetroLines="activeMetroLines"
          :showMetroStops="showMetroStops"
          :activeStopLines="activeStopLines"
          :metroLinesList="metroLinesList"
          :metroColors="metroColors"
          @update:filters="handleFilterUpdate"
          @resetFilters="resetFilters"

          @toggleAddShopMode="toggleAddShopMode"
          @togglePlaceType="toggleVisible"
          @toggleClustering="enableClustering = !enableClustering"
          @toggleMetroVector="handleToggleMetroVector"
          @toggleMetroLine="handleToggleMetroLine"
          @toggleMetroStops="handleToggleMetroStops"
          @toggleStopLine="handleToggleStopLine"
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
      <div class="map-wrapper">
        <MapStats
          :isMobile="isMobile"
          :filteredCount="placeInstances[0]?.filteredPlaces.length ?? 0"
          :averageRating="averageRating"
        />
        <l-map
          :zoom="zoom"
          :center="center"
          :use-global-leaflet="true"
          :options="{ zoomControl: false }"
          @click="onMapClick"
          @ready="onMapReady"
        >
          <l-control-layers />
          <MapControls 
            :showPopulationGrid="showPopulationGrid"
            :showAnalysisGrid="showAnalysisGrid"
            :selectedThreshold="selectedThreshold"
            @togglePopulationGrid="handleTogglePopulationGrid"
            @toggleAnalysisGrid="handleToggleAnalysisGrid"
            @updateThreshold="updateThreshold"
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
                  <div class="shop-marker-content saved">{{ inst.config.emoji }}</div>
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
                  <div class="shop-marker-content saved">{{ inst.config.emoji }}</div>
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
import { ref, computed, onMounted } from "vue";
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LPopup,
  LControlLayers,
  LLayerGroup,
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
import { useMetroLines } from "@/composables/useMetroLines";
import { useMetroStops } from "@/composables/useMetroStops";
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
  filters,
  availableServices,
  averageRating,
  resetFilters,
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

// Filter handlers
const handleFilterUpdate = (newFilters: any) => {
  filters.value = newFilters;
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

const {
  showShopModal,
  newShopPin,
  newShopName,
  userAddedShops,
  isAddShopMode,

  showDeleteConfirm,
  shopToDelete,
  toggleAddShopMode,
  onMapClick,
  cancelAddShop,
  saveShop,
  editBarbershop,
  confirmDelete,
  cancelDelete,
  deleteBarbershop
} = useShopManagement(placeInstances[0].fetchPlaces);

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

