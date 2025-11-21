<template>
  <div class="app-layout">
    <!-- App Header -->
    <AppHeader />

    <div class="map-container">
      <!-- Sidebar Toggle Button -->
      <button 
        class="sidebar-toggle-btn"
        @click="toggleSidebar"
        title="Toggle Sidebar"
        :class="{ active: isSidebarOpen }"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor"/>
        </svg>
      </button>

      <!-- Analysis Panel -->
      <AnalysisPanel :is-open="isSidebarOpen" />

      <!-- Map -->
      <div class="map-wrapper">
        <l-map
          :zoom="zoom"
          :center="center"
          :use-global-leaflet="true"
          @click="onMapClick"
          @ready="onMapReady"
        >
          <l-control-layers />
          
          <MapControls :map="mapInstance" />
          
          <l-tile-layer
            v-for="layer in baseLayers"
            :key="layer.name"
            :name="layer.name"
            :url="layer.url"
            :visible="layer.visible"
            layer-type="base"
            :attribution="layer.attribution"
          ></l-tile-layer>

          <MapMarkers />
        </l-map>

        <!-- Modals -->
        <ShopModal />
        <DeleteConfirmModal />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  LMap,
  LTileLayer,
  LControlLayers,
} from "@vue-leaflet/vue-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";

import { baseLayers } from "@/stores/mapConfig";
import { useMapStore } from "@/stores/mapStore";

// Components
import AppHeader from "./map/AppHeader.vue";
import AnalysisPanel from "./map/AnalysisPanel.vue";
import MapControls from "./map/MapControls.vue";
import MapMarkers from "./map/MapMarkers.vue";
import ShopModal from "./map/ShopModal.vue";
import DeleteConfirmModal from "./map/DeleteConfirmModal.vue";

const store = useMapStore();

const zoom = ref(12);
const center = ref<[number, number]>([42.6977, 23.3219]); // Sofia center
const isSidebarOpen = ref(true);
const mapInstance = ref<L.Map | null>(null);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const onMapReady = (map: L.Map) => {
  mapInstance.value = map;
};

const onMapClick = (e: any) => {
  if (!store.isAddShopMode) return;

  // e.latlng contains the coordinates
  store.setNewShopPin({
    lat: e.latlng.lat,
    lng: e.latlng.lng
  });
  store.setShowShopModal(true);
};

onMounted(() => {
  store.fetchBarbershops();
});
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.map-container {
  display: flex;
  flex: 1;
  width: 100%;
  position: relative;
  height: calc(100vh - 64px);
}

.map-wrapper {
  flex: 1;
  position: relative;
}

.sidebar-toggle-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2100; /* Above sidebar (2000) and map */
  background-color: white;
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 4px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4a5568;
  transition: all 0.2s;
  box-shadow: 0 1px 5px rgba(0,0,0,0.65);
}

.sidebar-toggle-btn:hover {
  background-color: #f4f4f4;
  color: #2d3748;
}

.sidebar-toggle-btn.active {
  background-color: #fff;
  color: #3182ce;
  left: 360px; /* Move button with sidebar */
}
</style>
