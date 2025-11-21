<template>
  <div class="analysis-panel">
    <!-- Statistics -->
    <div class="stats-section">
      <h3>Statistics</h3>
      <div class="stat-card">
        <div class="stat-value">{{ filteredCount }}</div>
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
          :value="filters.minRating"
          @input="updateFilter('minRating', ($event.target as HTMLInputElement).value)"
          class="slider"
        />
        <span class="filter-value">{{ filters.minRating }}</span>
      </div>

      <div class="filter-group">
        <label>Price Range:</label>
        <div class="price-range">
          <input 
            type="number" 
            :value="filters.minPrice"
            @input="updateFilter('minPrice', ($event.target as HTMLInputElement).value)"
            placeholder="Min"
            class="price-input"
          />
          <span>-</span>
          <input 
            type="number" 
            :value="filters.maxPrice"
            @input="updateFilter('maxPrice', ($event.target as HTMLInputElement).value)"
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
              :checked="filters.services.includes(service)"
              @change="toggleService(service)"
            />
            {{ service }}
          </label>
        </div>
      </div>

      <button @click="$emit('resetFilters')" class="reset-btn">Reset Filters</button>
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
          :value="searchRadius"
          @input="$emit('update:searchRadius', Number(($event.target as HTMLInputElement).value))"
          class="slider"
        />
        <span class="filter-value">{{ searchRadius }}km</span>
      </div>
      <button 
        @click="$emit('toggleOpportunityZones')" 
        :class="['opportunity-btn', { active: showOpportunityZones }]"
      >
        {{ showOpportunityZones ? 'Hide' : 'Show' }} Opportunity Zones
      </button>
      <div v-if="showOpportunityZones" class="opportunity-count">
        {{ opportunityZonesCount }} potential locations found
      </div>
    </div>

    <!-- Add Barbershop Section -->
    <div class="opportunity-section">
      <h3>Add Barbershop</h3>
      <p class="opportunity-description">
        Click the button below to enable adding a new barbershop location by clicking on the map.
      </p>
      <button 
        @click="$emit('toggleAddShopMode')" 
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
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  filteredCount: number;
  averageRating: number;
  averagePrice: number;
  filters: {
    minRating: number;
    minPrice: number | null;
    maxPrice: number | null;
    services: string[];
  };
  availableServices: string[];
  searchRadius: number;
  showOpportunityZones: boolean;
  opportunityZonesCount: number;
  isAddShopMode: boolean;
  priceDistribution: Record<string, number>;
  maxPriceCount: number;
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: any): void;
  (e: 'resetFilters'): void;
  (e: 'update:searchRadius', radius: number): void;
  (e: 'toggleOpportunityZones'): void;
  (e: 'toggleAddShopMode'): void;
}>();

const updateFilter = (key: string, value: string | number) => {
  const newFilters = { ...props.filters };
  if (key === 'minRating') newFilters.minRating = Number(value);
  if (key === 'minPrice') newFilters.minPrice = value === '' ? null : Number(value);
  if (key === 'maxPrice') newFilters.maxPrice = value === '' ? null : Number(value);
  emit('update:filters', newFilters);
};

const toggleService = (service: string) => {
  const newFilters = { ...props.filters };
  if (newFilters.services.includes(service)) {
    newFilters.services = newFilters.services.filter(s => s !== service);
  } else {
    newFilters.services = [...newFilters.services, service];
  }
  emit('update:filters', newFilters);
};
</script>

<style scoped>
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

.stats-section {
  margin: 0;
  padding: 24px;
  background: rgba(15, 23, 42, 0.3);
}

.stats-section h3,
.filters-section h3,
.distribution-section h3,
.opportunity-section h3 {
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
.distribution-section h3::before,
.opportunity-section h3::before {
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
</style>
