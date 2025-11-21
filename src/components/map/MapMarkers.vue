<template>
  <div>
    <!-- Barbershops -->
    <l-marker-cluster-group :options="{ spiderfyOnMaxZoom: true }">
      <l-marker
          v-for="shop in store.filteredBarbershops"
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
    <l-marker-cluster-group v-if="store.showOpportunityZones" :options="{ spiderfyOnMaxZoom: true }">
      <l-marker
        v-for="(zone, index) in store.opportunityZones"
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
                <strong>No barbershops within:</strong> {{ store.searchRadius }}km
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
      v-if="store.newShopPin"
      :lat-lng="[store.newShopPin.lat, store.newShopPin.lng]"
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
        v-for="(shop, index) in store.userAddedShops"
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  LMarker,
  LIcon,
  LPopup,
} from "@vue-leaflet/vue-leaflet";
import { LMarkerClusterGroup } from "vue-leaflet-markercluster";
import { useMapStore, type Barbershop } from '@/stores/mapStore';
import auth from "@/services/auth";

const store = useMapStore();
const { isAuthenticated } = auth;

const activeEditMenu = ref<string | null>(null);

const getStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  return "★".repeat(fullStars) + (hasHalfStar ? "½" : "") + "☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
};

const toggleEditMenu = (placeId: string) => {
  if (activeEditMenu.value === placeId) {
    activeEditMenu.value = null;
  } else {
    activeEditMenu.value = placeId;
  }
};

const editBarbershop = (shop: Barbershop) => {
  // Close the edit menu
  activeEditMenu.value = null;
  
  // TODO: Implement edit functionality
  // For now, just show an alert
  alert(`Edit functionality for ${shop.name} will be implemented soon!`);
};

const confirmDelete = (shop: Barbershop) => {
  // Close the edit menu
  activeEditMenu.value = null;
  
  store.setShopToDelete(shop);
  store.setShowDeleteConfirm(true);
};
</script>

<style scoped>
/* Marker Styles */
:global(.barbershop-marker) {
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

.popup-content.enhanced {
  min-width: 300px;
  max-width: 400px;
}

.popup-photo {
  margin: -12px -12px 12px -12px;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  height: 180px;
}

.popup-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Popup Header with Edit Button */
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.popup-header-content {
  flex: 1;
}

.popup-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1a202c;
}

/* Edit Menu */
.edit-menu-container {
  position: relative;
}

.edit-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

.edit-btn:active {
  transform: translateY(0);
}

.edit-dropdown {
  position: absolute;
  top: 42px;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 140px;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: white;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  color: #1a202c;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item.delete {
  color: #dc2626;
}

.dropdown-item.delete:hover {
  background: #fef2f2;
}

.popup-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stars {
  color: #fbbf24;
  font-size: 1rem;
}

.rating-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a202c;
}

.rating-count {
  font-size: 0.85rem;
  color: #64748b;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
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
  margin-bottom: 12px;
}

.info-row {
  font-size: 0.9rem;
  color: #1a202c;
  line-height: 1.6;
}

.info-row strong {
  color: #475569;
  font-weight: 600;
}

.info-row a {
  color: #3b82f6;
  text-decoration: none;
}

.info-row a:hover {
  text-decoration: underline;
}

.hours-list {
  margin-top: 4px;
  font-size: 0.85rem;
  line-height: 1.6;
}

.hours-line {
  color: #475569;
}

.hours-more {
  color: #64748b;
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
  padding: 8px 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

/* Cluster Styles */
:global(.marker-cluster),
:global(.marker-cluster-small),
:global(.marker-cluster-medium),
:global(.marker-cluster-large) {
  border-radius: 50% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: white !important;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5) !important;
  transition: all 0.2s ease-in-out !important;
  cursor: pointer !important;
  line-height: 1 !important;
  background: #4299e1 !important;
}

:global(.marker-cluster:hover),
:global(.marker-cluster-small:hover),
:global(.marker-cluster-medium:hover),
:global(.marker-cluster-large:hover) {
  transform: scale(1.1) !important;
  background: #3182ce !important;
}

/* Opportunity Marker Styles */
:global(.opportunity-marker) {
  background: transparent !important;
  border: none !important;
}

.opportunity-marker-content {
  background: linear-gradient(135deg, #10b981, #059669);
  border: 3px solid #ffffff;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  text-align: center;
  min-width: 100px;
  position: relative;
  animation: pulse-opportunity 2s ease-in-out infinite;
}

.opportunity-marker-content::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #10b981;
}

@keyframes pulse-opportunity {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.6);
  }
}

.opportunity-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.opportunity-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.opportunity-title {
  color: #10b981 !important;
}

.opportunity-note {
  margin-top: 12px;
  padding: 10px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 6px;
  border-left: 3px solid #10b981;
  font-size: 0.875rem;
  color: #1f2937;
  line-height: 1.5;
}
</style>
