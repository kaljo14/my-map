<template>
  <div class="analysis-panel">
    <!-- Map Settings -->
    <div class="filters-section">
      <h3>{{ $t('analysis.settings.title') }}</h3>
      <div class="checkbox-group">
        <label>
          <input 
            type="checkbox" 
            :checked="showBarbershops"
            @change="$emit('toggleShowBarbershops')"
          />
           {{ $t('analysis.settings.showBarbershops') }}
        </label>
        <label>
          <input 
            type="checkbox" 
            :checked="showGyms"
            @change="$emit('toggleShowGyms')"
          />
           {{ $t('analysis.settings.showGyms') || 'Show Gyms' }}
        </label>
        <label>
          <input 
            type="checkbox" 
            :checked="enableClustering"
            @change="$emit('toggleClustering')"
            :disabled="!showBarbershops"
          />
          {{ $t('analysis.settings.enableClustering') }}
        </label>
        <label>
          <input 
            type="checkbox" 
            :checked="showMetroVector"
            @change="$emit('toggleMetroVector')"
          />
           Metro Vector Lines
        </label>
        
        <!-- Individual Metro Lines -->
        <div v-if="showMetroVector" class="nested-checkboxes">
          <label 
            v-for="line in metroLinesList" 
            :key="line"
            class="nested-label"
          >
            <input 
              type="checkbox" 
              :checked="activeMetroLines.includes(line)"
              @change="$emit('toggleMetroLine', line)"
            />
            <span class="color-dot" :style="{ backgroundColor: metroColors[line] }"></span>
            {{ line }}
          </label>
        </div>

        <label>
          <input 
            type="checkbox" 
            :checked="showMetroStops"
            @change="$emit('toggleMetroStops')"
          />
           Metro Stops
        </label>
        
        <!-- Individual Metro Stop Lines -->
        <div v-if="showMetroStops" class="nested-checkboxes">
          <label 
            v-for="line in metroLinesList" 
            :key="`stop-${line}`"
            class="nested-label"
          >
            <input 
              type="checkbox" 
              :checked="activeStopLines.includes(line)"
              @change="$emit('toggleStopLine', line)"
            />
            <span class="color-dot" :style="{ backgroundColor: metroColors[line] }"></span>
            {{ line }}
          </label>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <h3>{{ $t('analysis.filters.title') }}</h3>
      
      <div class="filter-group">
        <label>{{ $t('analysis.filters.reviews') }}</label>
        <input 
          type="number" 
          min="0" 
          :value="filters.minReviews"
          @input="updateFilter('minReviews', ($event.target as HTMLInputElement).value)"
          class="price-input"
          placeholder="0"
        />
      </div>

      <div class="filter-group">
        <label>{{ $t('analysis.filters.rating') }}</label>
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
        <label>{{ $t('analysis.filters.priceRange') }}</label>
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



      <button @click="$emit('resetFilters')" class="reset-btn">{{ $t('analysis.filters.reset') }}</button>
    </div>



    <!-- Add Barbershop Section -->
    <div class="opportunity-section" v-if="false">
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





    <!-- Language Settings -->
    <div class="distribution-section">
      <h3>{{ $t('common.language') }}</h3>
      <div style="padding: 0 12px;">
        <LanguageSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import LanguageSwitcher from '../LanguageSwitcher.vue';

const props = defineProps<{
  isMobile: boolean;
  filters: {
    minRating: number;
    minReviews: number;
    minPrice: number | null;
    maxPrice: number | null;
    services: string[];
  };
  availableServices: string[];

  isAddShopMode: boolean;

  showBarbershops: boolean;
  showGyms: boolean;
  enableClustering: boolean;
  showMetroVector: boolean;
  activeMetroLines: string[];
  showMetroStops: boolean;
  activeStopLines: string[];
  metroLinesList: string[];
  metroColors: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: any): void;
  (e: 'resetFilters'): void;

  (e: 'toggleAddShopMode'): void;
  (e: 'toggleShowBarbershops'): void;
  (e: 'toggleShowGyms'): void;
  (e: 'toggleClustering'): void;
  (e: 'toggleMetroVector'): void;
  (e: 'toggleMetroLine', line: string): void;
  (e: 'toggleMetroStops'): void;
  (e: 'toggleStopLine', line: string): void;
}>();

const updateFilter = (key: string, value: string | number) => {
  const newFilters = { ...props.filters };
  if (key === 'minRating') newFilters.minRating = Number(value);
  if (key === 'minReviews') newFilters.minReviews = Number(value);
  if (key === 'minPrice') newFilters.minPrice = value === '' ? null : Number(value);
  if (key === 'maxPrice') newFilters.maxPrice = value === '' ? null : Number(value);
  emit('update:filters', newFilters);
};


</script>

<style scoped>
.analysis-panel {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 0;
  overflow-y: auto;
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
.distribution-section h3::before,
.distribution-section h3 {
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



.distribution-section {
  margin: 0;
  padding: 24px;
  background: rgba(15, 23, 42, 0.3);
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}


.nested-checkboxes {
  margin-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  padding-left: 8px;
  border-left: 2px solid rgba(148, 163, 184, 0.2);
}

.nested-label {
  font-size: 0.8rem !important;
  padding: 4px !important;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
