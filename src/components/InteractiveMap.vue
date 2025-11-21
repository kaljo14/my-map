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
          :searchRadius="searchRadius"
          :showOpportunityZones="showOpportunityZones"
          :opportunityZonesCount="opportunityZones.length"
          :isAddShopMode="isAddShopMode"
          :priceDistribution="priceDistribution"
          :maxPriceCount="maxPriceCount"
          @update:filters="filters = $event"
          @resetFilters="resetFilters"
          @update:searchRadius="searchRadius = $event"
          @toggleOpportunityZones="toggleOpportunityZones"
          @toggleAddShopMode="toggleAddShopMode"
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
          :filteredCount="filteredBarbershops.length"
          :averageRating="averageRating"
        />
        <l-map
          :zoom="zoom"
          :center="center"
          :use-global-leaflet="true"
          @click="onMapClick"
          @ready="onMapReady"
        >
          <l-control-layers />
          <MapControls 
            :showGrid="showGrid"
            @toggleGrid="toggleGrid(mapInstance as any)"
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

          <l-marker-cluster-group :options="{ spiderfyOnMaxZoom: true }">
            <l-marker
              v-for="shop in filteredBarbershops"
              :key="shop.id"
              :lat-lng="[shop.lat, shop.lng]"
            >
              <l-icon :icon-anchor="[20, 40]" class-name="barbershop-marker">
                <div class="shop-marker-content saved">
                  💈
                </div>
              </l-icon>
              <l-popup :options="{ maxWidth: 400, minWidth: 300 }">
                <div class="popup-content enhanced">
                  <!-- Photo Header -->
                  <div v-if="shop.photo_url" class="popup-photo">
                    <img :src="shop.photo_url" :alt="shop.name" @error="(e) => (e.target as HTMLImageElement).style.display='none'" />
                  </div>
                  
                  <!-- Title and Rating with Edit Button -->
                  <div class="popup-header">
                    <div class="popup-header-content">
                      <h3 class="popup-title">{{ shop.name }}</h3>
                      <div class="popup-rating">
                        <span class="stars">{{ getStars(shop.rating || 0) }}</span>
                        <span class="rating-value">{{ shop.rating || 'N/A' }}</span>
                        <span class="rating-count" v-if="shop.user_ratings_total">({{ shop.user_ratings_total }} reviews)</span>
                      </div>
                    </div>
                    <div class="edit-menu-container" v-if="isAuthenticated">
                      <button @click="toggleEditMenu(shop.place_id)" class="edit-btn" title="Edit">
                        ⚙️
                      </button>
                      <div v-if="activeEditMenu === shop.place_id" class="edit-dropdown">
                        <button @click="editBarbershop(shop)" class="dropdown-item">
                          ✏️ Edit Info
                        </button>
                        <button @click="confirmDelete(shop)" class="dropdown-item delete">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <div v-if="shop.is_open_now !== null" class="status-badge" :class="{ open: shop.is_open_now }">
                    {{ shop.is_open_now ? '🟢 Open Now' : '🔴 Closed' }}
                  </div>

                  <!-- Info Grid -->
                  <div class="popup-info">
                    <div class="info-row" v-if="shop.price_level">
                      <strong>💰 Price:</strong> {{ '€'.repeat(shop.price_level) }}
                    </div>
                    <div class="info-row" v-if="shop.address">
                      <strong>📍 Address:</strong> {{ shop.address }}
                    </div>
                    <div class="info-row" v-if="shop.formatted_phone_number">
                      <strong>📞 Phone:</strong> 
                      <a :href="`tel:${shop.formatted_phone_number}`">{{ shop.formatted_phone_number }}</a>
                    </div>
                    <div class="info-row" v-if="shop.opening_hours_text">
                      <strong>🕒 Hours:</strong>
                      <div class="hours-list">
                        <div v-for="(line, idx) in shop.opening_hours_text.split('\n').slice(0, 3)" :key="idx" class="hours-line">
                          {{ line }}
                        </div>
                        <div v-if="shop.opening_hours_text.split('\n').length > 3" class="hours-more">
                          +{{ shop.opening_hours_text.split('\n').length - 3 }} more days
                        </div>
                      </div>
                    </div>
                    <div class="info-row" v-if="shop.services && shop.services.length > 0">
                      <strong>🏷️ Services:</strong> {{ shop.services.slice(0, 3).join(', ') }}
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="popup-actions">
                    <a v-if="shop.website" :href="shop.website" target="_blank" class="action-btn">
                      🌐 Website
                    </a>
                    <a v-if="shop.google_maps_url" :href="shop.google_maps_url" target="_blank" class="action-btn">
                      🗺️ Directions
                    </a>
                  </div>
                </div>
              </l-popup>
            </l-marker>
          </l-marker-cluster-group>

          <!-- Opportunity Zone Markers -->
          <l-marker-cluster-group v-if="showOpportunityZones" :options="{ spiderfyOnMaxZoom: true }">
            <l-marker
              v-for="(zone, index) in opportunityZones"
              :key="`zone-${index}`"
              :lat-lng="[zone.lat, zone.lng]"
            >
              <l-icon :icon-anchor="[20, 40]" class-name="opportunity-marker">
                <div class="opportunity-marker-content">
                  <div class="opportunity-icon">📍</div>
                  <div class="opportunity-label">Opportunity</div>
                </div>
              </l-icon>
              <l-popup>
                <div class="popup-content">
                  <h3 class="popup-title opportunity-title">📍 Opportunity Zone</h3>
                  <div class="popup-info">
                    <div class="info-row">
                      <strong>No barbershops within:</strong> {{ searchRadius }}km
                    </div>
                    <div class="info-row">
                      <strong>Nearest barbershop:</strong> {{ zone.nearestDistance.toFixed(2) }}km away
                    </div>
                    <div class="info-row">
                      <strong>Coordinates:</strong> {{ zone.lat.toFixed(4) }}, {{ zone.lng.toFixed(4) }}
                    </div>
                    <div class="opportunity-note">
                      💡 This area has low competition and could be a good location for a new barbershop!
                    </div>
                  </div>
                </div>
              </l-popup>
            </l-marker>
          </l-marker-cluster-group>

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
          <l-marker-cluster-group :options="{ spiderfyOnMaxZoom: true }">
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
      @cancel="cancelDelete"
      @confirm="deleteBarbershop"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LPopup,
  LControlLayers,
} from "@vue-leaflet/vue-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";
import { LMarkerClusterGroup } from "vue-leaflet-markercluster";

import { baseLayers } from "@/stores/mapConfig";
import auth from "@/services/auth";

// Composables
import { useBarbershops } from "@/composables/useBarbershops";
import { useMapGrid } from "@/composables/useMapGrid";
import { useOpportunityZones } from "@/composables/useOpportunityZones";
import { useShopManagement } from "@/composables/useShopManagement";

// Components
import AnalysisPanel from "./map/AnalysisPanel.vue";
import ShopModal from "./map/ShopModal.vue";
import DeleteConfirmModal from "./map/DeleteConfirmModal.vue";
import MapControls from "./map/MapControls.vue";
import AppHeader from "./map/AppHeader.vue";
import MapStats from "./map/MapStats.vue";

const { isAuthenticated, userProfile, login, logout } = auth;

const zoom = ref(12);
const center = ref<[number, number]>([42.6977, 23.3219]); // Sofia center
const mapInstance = ref<L.Map | null>(null);
const isSidebarOpen = ref(true);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  // Set initial sidebar state: Open on desktop, Closed on mobile
  isSidebarOpen.value = !isMobile.value;
  
  window.addEventListener('resize', checkMobile);
  fetchBarbershops();
});

const onMapReady = (map: L.Map) => {
  mapInstance.value = map;
};

// Use Composables
const {
  barbershops,
  filters,
  fetchBarbershops,
  availableServices,
  filteredBarbershops,
  averageRating,
  averagePrice,
  priceDistribution,
  maxPriceCount,
  resetFilters
} = useBarbershops();

const {
  showGrid,
  toggleGrid
} = useMapGrid();

const {
  searchRadius,
  showOpportunityZones,
  opportunityZones,
  toggleOpportunityZones
} = useOpportunityZones(barbershops);

const {
  showShopModal,
  newShopPin,
  newShopName,
  userAddedShops,
  isAddShopMode,
  activeEditMenu,
  showDeleteConfirm,
  shopToDelete,
  toggleAddShopMode,
  onMapClick,
  cancelAddShop,
  saveShop,
  toggleEditMenu,
  editBarbershop,
  confirmDelete,
  cancelDelete,
  deleteBarbershop
} = useShopManagement(fetchBarbershops);

const getStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  return "★".repeat(fullStars) + (hasHalfStar ? "½" : "") + "☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
};
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
  right: -32px; /* Increased width */
  width: 32px;
  height: 64px; /* Taller for better grab area */
  transform: translateY(-50%);
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.3); /* More visible border */
  border-left: none;
  border-radius: 0 12px 12px 0; /* More rounded */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e2e8f0; /* Brighter icon */
  box-shadow: 6px 0 12px rgba(0,0,0,0.2);
  transition: all 0.2s;
  padding-left: 4px; /* Push icon slightly to the right */
}

.sidebar-toggle:hover {
  background: #334155;
  color: white;
  width: 36px; /* Expands more on hover */
  right: -36px;
  box-shadow: 8px 0 16px rgba(0,0,0,0.3);
}

.toggle-icon {
  font-size: 14px; /* Larger icon */
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
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

/* Popup Styles */
.popup-content {
  min-width: 250px;
  max-width: 350px;
}

.popup-photo {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  margin: -14px -20px 12px -20px;
  position: relative;
}

.popup-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.popup-title {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a202c;
}

.popup-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #f59e0b;
  font-size: 1rem;
}

.rating-value {
  font-weight: 700;
  color: #4a5568;
}

.rating-count {
  color: #718096;
  font-size: 0.8rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 12px;
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.open {
  background: #dcfce7;
  color: #166534;
}

.popup-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.4;
}

.info-row strong {
  color: #2d3748;
  font-weight: 600;
}

.hours-list {
  margin-top: 4px;
  padding-left: 8px;
  border-left: 2px solid #e2e8f0;
}

.hours-line {
  font-size: 0.85rem;
  color: #718096;
}

.hours-more {
  font-size: 0.8rem;
  color: #a0aec0;
  font-style: italic;
  margin-top: 2px;
}

.popup-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #4a5568;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #edf2f7;
  color: #2d3748;
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

/* Edit Menu Styles */
.edit-menu-container {
  position: relative;
}

.edit-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: #f1f5f9;
}

.edit-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  min-width: 120px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  padding: 8px 12px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #475569;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item:hover {
  background: #f8fafc;
  color: #1e293b;
}

.dropdown-item.delete {
  color: #ef4444;
  border-top: 1px solid #f1f5f9;
}

.dropdown-item.delete:hover {
  background: #fef2f2;
  color: #dc2626;
}
</style>
