<template>
  <div class="map-container">
    <!-- Analysis Panel -->
    <div class="analysis-panel">
      <h2 class="panel-title">Barbershop Analysis - Sofia</h2>
      
      <!-- Statistics -->
      <div class="stats-section">
        <h3>Statistics</h3>
        <div class="stat-card">
          <div class="stat-value">{{ filteredBarbershops.length }}</div>
          <div class="stat-label">Total Barbershops</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageRating.toFixed(1) }}</div>
          <div class="stat-label">Avg Rating</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">€{{ averagePrice.toFixed(0) }}</div>
          <div class="stat-label">Avg Price</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <h3>Filters</h3>
        
        <div class="filter-group">
          <label>Rating (min):</label>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="0.5" 
            v-model.number="filters.minRating"
            class="slider"
          />
          <span class="filter-value">{{ filters.minRating }}</span>
        </div>

        <div class="filter-group">
          <label>Price Range:</label>
          <div class="price-range">
            <input 
              type="number" 
              v-model.number="filters.minPrice" 
              placeholder="Min"
              class="price-input"
            />
            <span>-</span>
            <input 
              type="number" 
              v-model.number="filters.maxPrice" 
              placeholder="Max"
              class="price-input"
            />
          </div>
        </div>

        <div class="filter-group">
          <label>Services:</label>
          <div class="checkbox-group">
            <label v-for="service in availableServices" :key="service">
              <input 
                type="checkbox" 
                :value="service" 
                v-model="filters.services"
              />
              {{ service }}
            </label>
          </div>
        </div>

        <button @click="resetFilters" class="reset-btn">Reset Filters</button>
      </div>

      <!-- Opportunity Zones -->
      <div class="opportunity-section">
        <h3>Opportunity Zones</h3>
        <p class="opportunity-description">
          Find locations with no barbershops within {{ searchRadius }}km radius
        </p>
        <div class="filter-group">
          <label>Search Radius (km):</label>
          <input 
            type="range" 
            min="1" 
            max="5" 
            step="0.5" 
            v-model.number="searchRadius"
            class="slider"
          />
          <span class="filter-value">{{ searchRadius }}km</span>
        </div>
        <button 
          @click="toggleOpportunityZones" 
          :class="['opportunity-btn', { active: showOpportunityZones }]"
        >
          {{ showOpportunityZones ? 'Hide' : 'Show' }} Opportunity Zones
        </button>
        <div v-if="showOpportunityZones" class="opportunity-count">
          {{ opportunityZones.length }} potential locations found
        </div>
      </div>

      <!-- Add Barbershop Section -->
      <div class="opportunity-section">
        <h3>Add Barbershop</h3>
        <p class="opportunity-description">
          Click the button below to enable adding a new barbershop location by clicking on the map.
        </p>
        <button 
          @click="toggleAddShopMode" 
          :class="['opportunity-btn', { active: isAddShopMode }]"
        >
          {{ isAddShopMode ? 'Cancel Adding Barbershop' : 'Add Barbershop' }}
        </button>
      </div>

      <!-- Price Distribution -->
      <div class="distribution-section">
        <h3>Price Distribution</h3>
        <div class="price-bars">
          <div 
            v-for="(count, range) in priceDistribution" 
            :key="range"
            class="price-bar"
          >
            <div class="bar-label">{{ range }}</div>
            <div class="bar-container">
              <div 
                class="bar-fill" 
                :style="{ width: `${(count / maxPriceCount) * 100}%` }"
              ></div>
              <span class="bar-count">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map -->
    <div class="map-wrapper">
    <l-map
      :zoom="zoom"
      :center="center"
      :use-global-leaflet="true"
      :max-zoom="18"
      @click="onMapClick"
    >
      <l-control-layers />
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
                  <img :src="shop.photo_url" :alt="shop.name" @error="(e) => e.target.style.display='none'" />
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
                  <div class="edit-menu-container">
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

    <!-- Add Shop Modal -->
    <div v-if="showShopModal" class="shop-modal-overlay">
      <div class="shop-modal">
        <h3>Add Barbershop Location</h3>
        <div class="form-group">
          <label>Barbershop Name:</label>
          <input 
            v-model="newShopName" 
            type="text" 
            placeholder="e.g. Cool Cuts"
            class="modal-input"
            ref="shopInput"
            @keyup.enter="saveShop"
          />
        </div>
        <div class="modal-actions">
          <button @click="cancelAddShop" class="cancel-btn">Cancel</button>
          <button @click="saveShop" class="save-btn">Save Barbershop</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="shop-modal-overlay">
      <div class="shop-modal">
        <h3>⚠️ Confirm Deletion</h3>
        <p class="confirm-message">Are you sure you want to delete <strong>{{ shopToDelete?.name }}</strong>?</p>
        <p class="confirm-warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
          <button @click="deleteBarbershop" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
    </div>
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
} from "@vue-leaflet/vue-leaflet";
import { LMarkerClusterGroup } from "vue-leaflet-markercluster";

import { baseLayers } from "@/stores/mapConfig";

const zoom = ref(12);
const center = ref<[number, number]>([42.6977, 23.3219]); // Sofia center

interface Barbershop {
  place_id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  google_maps_url?: string;
  opening_hours?: string;
  photos?: string;
  icon_url?: string;
  types?: string;
  reviews?: string;
  editorial_summary?: string;
  curbside_pickup?: boolean;
  delivery?: boolean;
  dine_in?: boolean;
  takeout?: boolean;
  reservable?: boolean;
  wheelchair_accessible?: boolean;
  utc_offset_minutes?: number;
  // Legacy fields for compatibility
  id?: string | number;
  price?: number;
  services?: string[];
}

const barbershops = ref<Barbershop[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Fetch barbershops from API
const fetchBarbershops = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const response = await fetch('http://localhost:8080/api/barbershops');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    barbershops.value = data.map((shop: any) => {
      // Parse JSON string fields
      let parsedOpeningHours = null;
      let parsedPhotos = null;
      let parsedTypes = null;
      let parsedReviews = null;
      
      try {
        if (shop.opening_hours && typeof shop.opening_hours === 'string') {
          parsedOpeningHours = JSON.parse(shop.opening_hours);
        }
      } catch (e) {
        console.warn('Failed to parse opening_hours for', shop.name);
      }
      
      try {
        if (shop.photos && typeof shop.photos === 'string') {
          parsedPhotos = JSON.parse(shop.photos);
        }
      } catch (e) {
        console.warn('Failed to parse photos for', shop.name);
      }
      
      try {
        if (shop.types && typeof shop.types === 'string') {
          parsedTypes = JSON.parse(shop.types);
        }
      } catch (e) {
        console.warn('Failed to parse types for', shop.name);
      }
      
      try {
        if (shop.reviews && typeof shop.reviews === 'string') {
          parsedReviews = JSON.parse(shop.reviews);
        }
      } catch (e) {
        console.warn('Failed to parse reviews for', shop.name);
      }
      
      // Extract photo URL (using Google Places API photo reference)
      const photoUrl = parsedPhotos && parsedPhotos[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${parsedPhotos[0].photo_reference}&key=YOUR_API_KEY`
        : null;
      
      // Extract opening hours text
      const openingHoursText = parsedOpeningHours?.weekday_text?.join('\n') || null;
      const isOpenNow = parsedOpeningHours?.open_now || null;
      
      // Extract types as readable services
      const services = parsedTypes?.filter((t: string) => 
        !['point_of_interest', 'establishment'].includes(t)
      ).map((t: string) => 
        t.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      ) || [];
      
      return {
        ...shop,
        // Ensure required fields have defaults
        id: shop.place_id || shop.id,
        rating: shop.rating || 0,
        user_ratings_total: shop.user_ratings_total || 0,
        price_level: shop.price_level || 0,
        // Parsed fields
        photo_url: photoUrl,
        opening_hours_text: openingHoursText,
        is_open_now: isOpenNow,
        parsed_reviews: parsedReviews,
        // Legacy compatibility
        price: shop.price_level || shop.price || 0,
        reviews: shop.user_ratings_total || shop.reviews || 0,
        services: services.length > 0 ? services : (shop.services || [])
      };
    });
  } catch (err) {
    console.error('Failed to fetch barbershops:', err);
    error.value = 'Failed to load barbershops. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchBarbershops();
});

const filters = ref({
  minRating: 0,
  minPrice: null as number | null,
  maxPrice: null as number | null,
  services: [] as string[],
});

const availableServices = computed(() => {
  const allServices = new Set<string>();
  barbershops.value.forEach(shop => {
    shop.services.forEach(service => allServices.add(service));
  });
  return Array.from(allServices).sort();
});

const filteredBarbershops = computed(() => {
  return barbershops.value.filter(shop => {
    if (shop.rating < filters.value.minRating) return false;
    if (filters.value.minPrice !== null && shop.price < filters.value.minPrice) return false;
    if (filters.value.maxPrice !== null && shop.price > filters.value.maxPrice) return false;
    if (filters.value.services.length > 0) {
      const hasService = filters.value.services.some(service => 
        shop.services.includes(service)
      );
      if (!hasService) return false;
    }
    return true;
  });
});

const averageRating = computed(() => {
  if (filteredBarbershops.value.length === 0) return 0;
  const sum = filteredBarbershops.value.reduce((acc, shop) => acc + shop.rating, 0);
  return sum / filteredBarbershops.value.length;
});

const averagePrice = computed(() => {
  if (filteredBarbershops.value.length === 0) return 0;
  const sum = filteredBarbershops.value.reduce((acc, shop) => acc + shop.price, 0);
  return sum / filteredBarbershops.value.length;
});

const priceDistribution = computed(() => {
  const ranges = {
    "€0-15": 0,
    "€16-20": 0,
    "€21-25": 0,
    "€26-30": 0,
    "€31-35": 0,
    "€36+": 0,
  };
  
  filteredBarbershops.value.forEach(shop => {
    if (shop.price <= 15) ranges["€0-15"]++;
    else if (shop.price <= 20) ranges["€16-20"]++;
    else if (shop.price <= 25) ranges["€21-25"]++;
    else if (shop.price <= 30) ranges["€26-30"]++;
    else if (shop.price <= 35) ranges["€31-35"]++;
    else ranges["€36+"]++;
  });
  
  return ranges;
});

const maxPriceCount = computed(() => {
  return Math.max(...Object.values(priceDistribution.value), 1);
});

const getRatingClass = (rating: number) => {
  if (rating >= 4.5) return "rating-excellent";
  if (rating >= 4.0) return "rating-good";
  if (rating >= 3.5) return "rating-average";
  return "rating-poor";
};

const getStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  return "★".repeat(fullStars) + (hasHalfStar ? "½" : "") + "☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
};

const resetFilters = () => {
  filters.value = {
    minRating: 0,
    minPrice: null,
    maxPrice: null,
    services: [],
  };
};

// --- Opportunity Zones Logic ---
// Calculate areas with low density of barbershops
const searchRadius = ref(1.5); // km
const showOpportunityZones = ref(false);

interface OpportunityZone {
  lat: number;
  lng: number;
  nearestDistance: number;
}

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Generate opportunity zones using a grid approach
const opportunityZones = computed((): OpportunityZone[] => {
  if (!showOpportunityZones.value) return [];
  
  const zones: OpportunityZone[] = [];
  
  // Define Sofia bounds
  const latStart = 42.62;
  const latEnd = 42.75;
  const minLng = 23.27;
  const maxLng = 23.38;
  
  // Grid step size (smaller = more points, more accurate but slower)
  // Using 0.015 (~1.5km) for better performance while maintaining accuracy
  const gridStep = 0.015;
  
  // Check each grid point
  for (let lat = latStart; lat <= latEnd; lat += gridStep) {
    for (let lng = minLng; lng <= maxLng; lng += gridStep) {
      // Find distance to nearest barbershop
      let minDistance = Infinity;
      
      barbershops.value.forEach(shop => {
        const dist = calculateDistance(lat, lng, shop.lat, shop.lng);
        if (dist < minDistance) minDistance = dist;
      });
      
      // If nearest shop is further than radius, it's an opportunity zone
      if (minDistance > searchRadius.value) {
        zones.push({
          lat,
          lng,
          nearestDistance: minDistance
        });
      }
    }
  }
  
  // Filter to avoid too many overlapping points
  // Keep only zones that are at least 0.5km apart
  const filteredZones: OpportunityZone[] = [];
  const minZoneDistance = 0.5; // km
  
  zones.forEach(zone => {
    const isTooClose = filteredZones.some(existing => 
      calculateDistance(zone.lat, zone.lng, existing.lat, existing.lng) < minZoneDistance
    );
    
    if (!isTooClose) {
      filteredZones.push(zone);
    }
  });
  
  // Sort by distance (furthest from nearest barbershop = best opportunity)
  return filteredZones.sort((a, b) => b.nearestDistance - a.nearestDistance);
});

const toggleOpportunityZones = () => {
  showOpportunityZones.value = !showOpportunityZones.value;
};

// --- Barbershop / Pin Functionality ---

interface ShopLocation {
  lat: number;
  lng: number;
  name: string;
  timestamp: number;
}

const showShopModal = ref(false);
const newShopPin = ref<{lat: number, lng: number} | null>(null);
const newShopName = ref("");
const userAddedShops = ref<ShopLocation[]>([]);
const isAddShopMode = ref(false);

// Edit menu state
const activeEditMenu = ref<string | null>(null);
const showDeleteConfirm = ref(false);
const shopToDelete = ref<Barbershop | null>(null);

const toggleAddShopMode = () => {
  isAddShopMode.value = !isAddShopMode.value;
  if (!isAddShopMode.value) {
    newShopPin.value = null;
    showShopModal.value = false;
  }
};

const onMapClick = (e: any) => {
  if (!isAddShopMode.value) return;

  // e.latlng contains the coordinates
  newShopPin.value = {
    lat: e.latlng.lat,
    lng: e.latlng.lng
  };
  newShopName.value = "";
  showShopModal.value = true;
};

const cancelAddShop = () => {
  showShopModal.value = false;
  newShopPin.value = null;
  isAddShopMode.value = false; // Exit mode on cancel
};

const saveShop = async () => {
  if (!newShopPin.value) return;

  const shopData = {
    name: newShopName.value || "Untitled Barbershop",
    lat: newShopPin.value.lat,
    lng: newShopPin.value.lng,
    address: "", // Empty for now, as it's not collected in the modal
    business_status: "OPERATIONAL", // Default status for a new shop
    rating: 0 // Default rating for a new shop
  };

  try {
    const response = await fetch('http://localhost:8080/api/barbershops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shopData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const savedShop = await response.json();
    console.log("Barbershop saved successfully:", savedShop);

    // Add to local state for immediate display
    userAddedShops.value.push({
      ...savedShop,
      timestamp: Date.now()
    });

    // Refresh the main barbershops list to include the newly added shop
    await fetchBarbershops();
  } catch (error) {
    console.error("Failed to save barbershop:", error);
    alert("Failed to save barbershop. Please try again.");
    return; // Don't close modal on error
  }

  showShopModal.value = false;
  newShopPin.value = null;
  isAddShopMode.value = false; // Exit mode after saving
};

// Edit menu functions
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
  
  // Show confirmation dialog
  shopToDelete.value = shop;
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  shopToDelete.value = null;
};

const deleteBarbershop = async () => {
  if (!shopToDelete.value) return;

  const placeId = shopToDelete.value.place_id;
  
  try {
    const response = await fetch(`http://localhost:8080/api/barbershops/${placeId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`Barbershop ${shopToDelete.value.name} deleted successfully`);

    // Refresh the barbershops list
    await fetchBarbershops();
    
    // Close the confirmation dialog
    showDeleteConfirm.value = false;
    shopToDelete.value = null;
  } catch (error) {
    console.error('Failed to delete barbershop:', error);
    alert('Failed to delete barbershop. Please try again.');
  }
};
</script>

<style scoped>
.map-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.analysis-panel {
  width: 380px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 0;
  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  border-right: 1px solid rgba(148, 163, 184, 0.1);
}

.analysis-panel::-webkit-scrollbar {
  width: 6px;
}

.analysis-panel::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}

.analysis-panel::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.analysis-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.panel-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  padding: 24px 24px 20px;
  color: #f8fafc;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  letter-spacing: -0.5px;
}

.stats-section {
  margin: 0;
  padding: 24px;
  background: rgba(15, 23, 42, 0.3);
}

.stats-section h3,
.filters-section h3,
.distribution-section h3 {
  font-size: 0.875rem;
  margin-bottom: 16px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-section h3::before,
.filters-section h3::before,
.distribution-section h3::before {
  content: "";
  width: 3px;
  height: 16px;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 2px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #cbd5e0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.filters-section {
  margin: 0;
  padding: 24px;
  background: rgba(15, 23, 42, 0.2);
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group label {
  display: block;
  margin-bottom: 10px;
  font-size: 0.875rem;
  color: #e2e8f0;
  font-weight: 500;
}

.slider {
  width: 100%;
  margin-bottom: 10px;
  height: 6px;
  border-radius: 3px;
  background: rgba(30, 41, 59, 0.8);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.6);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.filter-value {
  display: inline-block;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.3);
  font-size: 0.875rem;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-range span {
  color: #94a3b8;
  font-weight: 500;
}

.price-input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(30, 41, 59, 0.6);
  color: white;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.price-input::placeholder {
  color: #64748b;
}

.price-input:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 160px;
  overflow-y: auto;
  padding: 12px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  cursor: pointer;
  margin-bottom: 0;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
  color: #e2e8f0;
}

.checkbox-group label:hover {
  background: rgba(99, 102, 241, 0.1);
}

.checkbox-group input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
}

.reset-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.reset-btn:active {
  transform: translateY(0);
}

.opportunity-section {
  margin: 0;
  padding: 24px;
  background: rgba(15, 23, 42, 0.2);
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.opportunity-description {
  font-size: 0.875rem;
  color: #cbd5e0;
  margin-bottom: 16px;
  line-height: 1.5;
}

.opportunity-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  margin-bottom: 12px;
}

.opportunity-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.opportunity-btn.active {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.opportunity-btn.active:hover {
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.opportunity-count {
  text-align: center;
  padding: 10px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 6px;
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* Shop Modal Styles */
.shop-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.shop-modal {
  background: #1e293b;
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.shop-modal h3 {
  margin: 0 0 20px;
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.6);
  color: white;
  font-size: 1rem;
  margin-bottom: 24px;
}

.modal-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: transparent;
  color: #cbd5e0;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(148, 163, 184, 0.1);
  color: white;
}

.save-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.shop-marker-content {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  transition: transform 0.2s;
}

.shop-marker-content:hover {
  transform: scale(1.2);
}

.distribution-section {
  margin: 0;
  padding: 24px;
  background: rgba(15, 23, 42, 0.3);
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.price-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.price-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  min-width: 70px;
  font-size: 0.8rem;
  color: #cbd5e0;
  font-weight: 500;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  height: 28px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 6px;
  padding: 2px;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 4px;
  transition: width 0.4s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.bar-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: #e2e8f0;
  min-width: 35px;
  text-align: right;
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

.marker-content {
  background: white;
  border: 2px solid #2d3748;
  border-radius: 8px;
  padding: 6px 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 70px;
  position: relative;
}

.marker-content::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}

.marker-content.rating-excellent {
  border-color: #48bb78;
  background: linear-gradient(135deg, #f0fff4, #ffffff);
}

.marker-content.rating-good {
  border-color: #4299e1;
  background: linear-gradient(135deg, #ebf8ff, #ffffff);
}

.marker-content.rating-average {
  border-color: #ed8936;
  background: linear-gradient(135deg, #fffaf0, #ffffff);
}

.marker-content.rating-poor {
  border-color: #e53e3e;
  background: linear-gradient(135deg, #fff5f5, #ffffff);
}

.marker-rating {
  font-size: 0.75rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 2px;
}

.marker-price {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a202c;
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

/* Delete Confirmation Modal */
.confirm-message {
  font-size: 1rem;
  color: #1a202c;
  margin-bottom: 12px;
  line-height: 1.5;
}

.confirm-message strong {
  color: #dc2626;
}

.confirm-warning {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 24px;
  font-style: italic;
}

.delete-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  transition: all 0.2s;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
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

.editorial-summary {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 12px;
  font-style: italic;
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

.amenities {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 12px;
}

.amenity {
  font-size: 1.5rem;
  cursor: help;
  transition: transform 0.2s;
}

.amenity:hover {
  transform: scale(1.2);
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
.marker-cluster,
.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large {
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

.marker-cluster:hover,
.marker-cluster-small:hover,
.marker-cluster-medium:hover,
.marker-cluster-large:hover {
  transform: scale(1.1) !important;
  background: #3182ce !important;
}

/* Opportunity Marker Styles */
.opportunity-marker {
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
