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
            <l-icon :icon-anchor="[25, 41]" class-name="barbershop-marker">
              <div class="marker-content" :class="getRatingClass(shop.rating)">
                <div class="marker-rating">★ {{ shop.rating }}</div>
                <div class="marker-price">€{{ shop.price }}</div>
              </div>
          </l-icon>
          <l-popup>
              <div class="popup-content">
                <h3 class="popup-title">{{ shop.name }}</h3>
                <div class="popup-rating">
                  <span class="stars">{{ getStars(shop.rating) }}</span>
                  <span class="rating-value">{{ shop.rating }}/5.0</span>
                </div>
                <div class="popup-info">
                  <div class="info-row">
                    <strong>Price:</strong> €{{ shop.price }}
                  </div>
                  <div class="info-row">
                    <strong>Services:</strong> {{ shop.services.join(", ") }}
                  </div>
                  <div class="info-row">
                    <strong>Reviews:</strong> {{ shop.reviews }}
                  </div>
                  <div class="info-row" v-if="shop.address">
                    <strong>Address:</strong> {{ shop.address }}
                  </div>
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
    </l-map>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
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
  id: number;
  name: string;
  lat: number;
  lng: number;
  price: number;
  rating: number;
  reviews: number;
  services: string[];
  address?: string;
}

const barbershops: Barbershop[] = [
  { id: 1, name: "Gentleman's Cut", lat: 42.701, lng: 23.32, price: 25, rating: 4.8, reviews: 127, services: ["Haircut", "Beard Trim", "Hot Towel"], address: "Vitosha Blvd 15" },
  { id: 2, name: "Classic Barbershop", lat: 42.695, lng: 23.33, price: 20, rating: 4.5, reviews: 89, services: ["Haircut", "Beard Trim"], address: "Graf Ignatiev St 8" },
  { id: 3, name: "Modern Man", lat: 42.688, lng: 23.31, price: 30, rating: 4.9, reviews: 203, services: ["Haircut", "Beard Trim", "Hot Towel", "Hair Styling"], address: "Rakovski St 45" },
  { id: 4, name: "Old School Barbers", lat: 42.71, lng: 23.34, price: 18, rating: 4.3, reviews: 56, services: ["Haircut", "Beard Trim"], address: "Slivnitsa Blvd 22" },
  { id: 5, name: "Elite Cuts", lat: 42.68, lng: 23.35, price: 35, rating: 4.7, reviews: 145, services: ["Haircut", "Beard Trim", "Hot Towel", "Hair Styling", "Facial"], address: "Tsarigradsko Shose 125" },
  { id: 6, name: "Barber House", lat: 42.692, lng: 23.29, price: 22, rating: 4.4, reviews: 78, services: ["Haircut", "Beard Trim", "Hair Styling"], address: "Maria Luiza Blvd 12" },
  { id: 7, name: "The Razor's Edge", lat: 42.708, lng: 23.3, price: 28, rating: 4.6, reviews: 112, services: ["Haircut", "Beard Trim", "Hot Towel", "Straight Razor"], address: "Patriarch Evtimii Blvd 3" },
  { id: 8, name: "City Barbers", lat: 42.675, lng: 23.325, price: 15, rating: 4.1, reviews: 43, services: ["Haircut"], address: "Knyaz Boris I St 18" },
  { id: 9, name: "Premium Barbershop", lat: 42.715, lng: 23.315, price: 40, rating: 4.9, reviews: 189, services: ["Haircut", "Beard Trim", "Hot Towel", "Hair Styling", "Facial", "Massage"], address: "James Bourchier Blvd 47" },
  { id: 10, name: "Quick Cuts", lat: 42.685, lng: 23.36, price: 12, rating: 3.9, reviews: 34, services: ["Haircut"], address: "Bulgaria Blvd 88" },
  { id: 11, name: "Style Masters", lat: 42.699, lng: 23.28, price: 26, rating: 4.5, reviews: 98, services: ["Haircut", "Beard Trim", "Hair Styling"], address: "Dondukov Blvd 29" },
  { id: 12, name: "Royal Barbers", lat: 42.705, lng: 23.355, price: 32, rating: 4.7, reviews: 156, services: ["Haircut", "Beard Trim", "Hot Towel", "Hair Styling"], address: "Cherni Vrah Blvd 100" },
  { id: 13, name: "Budget Cuts", lat: 42.67, lng: 23.34, price: 10, rating: 3.7, reviews: 28, services: ["Haircut"], address: "Opalchenska St 5" },
  { id: 14, name: "Luxury Barbers", lat: 42.72, lng: 23.33, price: 45, rating: 5.0, reviews: 234, services: ["Haircut", "Beard Trim", "Hot Towel", "Hair Styling", "Facial", "Massage", "Manicure"], address: "Sofia Ring Mall" },
  { id: 15, name: "Neighborhood Barbers", lat: 42.682, lng: 23.305, price: 16, rating: 4.2, reviews: 52, services: ["Haircut", "Beard Trim"], address: "Hristo Botev Blvd 14" },
  { id: 16, name: "Trendy Cuts", lat: 42.696, lng: 23.345, price: 24, rating: 4.6, reviews: 134, services: ["Haircut", "Beard Trim", "Hair Styling"], address: "Vasil Levski Blvd 33" },
  { id: 17, name: "Executive Barbers", lat: 42.712, lng: 23.295, price: 38, rating: 4.8, reviews: 167, services: ["Haircut", "Beard Trim", "Hot Towel", "Hair Styling", "Facial"], address: "Tsar Osvoboditel Blvd 7" },
  { id: 18, name: "Family Barbershop", lat: 42.678, lng: 23.318, price: 14, rating: 4.0, reviews: 41, services: ["Haircut", "Beard Trim"], address: "Pirotska St 22" },
  { id: 19, name: "Artisan Barbers", lat: 42.703, lng: 23.365, price: 29, rating: 4.7, reviews: 143, services: ["Haircut", "Beard Trim", "Hot Towel", "Straight Razor"], address: "Ivan Vazov St 11" },
  { id: 20, name: "Urban Cuts", lat: 42.69, lng: 23.37, price: 21, rating: 4.4, reviews: 87, services: ["Haircut", "Beard Trim", "Hair Styling"], address: "Ekzarh Yosif St 19" },
  { id: 21, name: "Pro Barbers", lat: 42.704, lng: 23.32, price: 27, rating: 4.6, reviews: 109, services: ["Haircut", "Beard Trim", "Hot Towel"], address: "Alabin St 25" },
  { id: 22, name: "Vintage Barbers", lat: 42.687, lng: 23.34, price: 23, rating: 4.5, reviews: 95, services: ["Haircut", "Beard Trim", "Straight Razor"], address: "Solunska St 8" },
  { id: 23, name: "Express Cuts", lat: 42.693, lng: 23.31, price: 13, rating: 3.8, reviews: 37, services: ["Haircut"], address: "Stamboliyski Blvd 42" },
  { id: 24, name: "Master Barbers", lat: 42.707, lng: 23.345, price: 31, rating: 4.8, reviews: 178, services: ["Haircut", "Beard Trim", "Hot Towel", "Hair Styling"], address: "Shipka St 6" },
  { id: 25, name: "Corner Barbershop", lat: 42.681, lng: 23.33, price: 17, rating: 4.1, reviews: 49, services: ["Haircut", "Beard Trim"], address: "Lyuben Karavelov St 15" },
];

const filters = ref({
  minRating: 0,
  minPrice: null as number | null,
  maxPrice: null as number | null,
  services: [] as string[],
});

const availableServices = computed(() => {
  const allServices = new Set<string>();
  barbershops.forEach(shop => {
    shop.services.forEach(service => allServices.add(service));
  });
  return Array.from(allServices).sort();
});

const filteredBarbershops = computed(() => {
  return barbershops.filter(shop => {
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

// Opportunity Zones
const showOpportunityZones = ref(false);
const searchRadius = ref(2.5); // km

interface OpportunityZone {
  lat: number;
  lng: number;
  nearestDistance: number;
}

// Calculate distance between two coordinates using Haversine formula
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

// Find nearest barbershop distance for a given point
const findNearestBarbershopDistance = (lat: number, lng: number): number => {
  let minDistance = Infinity;
  filteredBarbershops.value.forEach(shop => {
    const distance = calculateDistance(lat, lng, shop.lat, shop.lng);
    if (distance < minDistance) {
      minDistance = distance;
    }
  });
  return minDistance;
};

// Generate opportunity zones using a grid approach
const opportunityZones = computed((): OpportunityZone[] => {
  if (!showOpportunityZones.value) return [];
  
  const zones: OpportunityZone[] = [];
  
  // Define Sofia bounds
  const minLat = 42.65;
  const maxLat = 42.73;
  const minLng = 23.27;
  const maxLng = 23.38;
  
  // Grid step size (smaller = more points, more accurate but slower)
  // Using 0.015 (~1.5km) for better performance while maintaining accuracy
  const gridStep = 0.015;
  
  // Check each grid point
  for (let lat = minLat; lat <= maxLat; lat += gridStep) {
    for (let lng = minLng; lng <= maxLng; lng += gridStep) {
      const nearestDistance = findNearestBarbershopDistance(lat, lng);
      
      // If no barbershops within search radius, it's an opportunity
      if (nearestDistance >= searchRadius.value) {
        zones.push({
          lat,
          lng,
          nearestDistance,
        });
      }
    }
  }
  
  // Filter to avoid too many overlapping points
  // Keep only zones that are at least 0.5km apart
  const filteredZones: OpportunityZone[] = [];
  const minZoneDistance = 0.5; // km
  
  zones.forEach(zone => {
    const isFarEnough = filteredZones.every(existingZone => {
      const distance = calculateDistance(
        zone.lat, zone.lng,
        existingZone.lat, existingZone.lng
      );
      return distance >= minZoneDistance;
    });
    
    if (isFarEnough) {
      filteredZones.push(zone);
    }
  });
  
  // Sort by distance (furthest from nearest barbershop = best opportunity)
  return filteredZones.sort((a, b) => b.nearestDistance - a.nearestDistance);
});

const toggleOpportunityZones = () => {
  showOpportunityZones.value = !showOpportunityZones.value;
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
  min-width: 200px;
}

.popup-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1a202c;
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
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 600;
}

.popup-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  font-size: 0.875rem;
  color: #2d3748;
  line-height: 1.5;
}

.info-row strong {
  color: #1a202c;
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
