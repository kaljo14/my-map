<template>
  <l-control position="topright" class="custom-control">
    <button 
      @click="$emit('toggleGrid')" 
      class="grid-toggle-btn"
      :class="{ active: showGrid }"
      title="Toggle Grid Layer"
    >
      <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3h18v18H3V3z" fill="none" stroke="currentColor" stroke-width="2"/>
        <!-- Choropleth regions with different opacities -->
        <path d="M5 5h6v6H5V5z" fill="currentColor" fill-opacity="0.2"/>
        <path d="M13 5h6v6h-6V5z" fill="currentColor" fill-opacity="0.6"/>
        <path d="M5 13h6v6H5v-6z" fill="currentColor" fill-opacity="0.8"/>
        <path d="M13 13h6v6h-6v-6z" fill="currentColor" fill-opacity="0.4"/>
      </svg>
    </button>
    
    <!-- High Density Filter (shown only when grid is active)    
    <!-- High Density Filter Dropdown (shown only when grid is active) -->
    <div v-if="showGrid" class="filter-dropdown-container">
      <button 
        @click="toggleDropdown"
        class="filter-btn"
        :class="{ active: selectedThreshold > 0 }"
        title="Filter by Population Density"
      >
        <span class="filter-icon">📊</span>
        <span class="filter-text">{{ getThresholdLabel(selectedThreshold) }}</span>
        <span class="dropdown-arrow">{{ dropdownOpen ? '▲' : '▼' }}</span>
      </button>
      
      <div v-if="dropdownOpen" class="filter-dropdown-menu">
        <button
          v-for="option in filterOptions"
          :key="option.value"
          @click="selectThreshold(option.value)"
          class="dropdown-item"
          :class="{ selected: selectedThreshold === option.value }"
        >
          <span class="color-indicator" :style="{ backgroundColor: option.color }"></span>
          <span class="option-label">{{ option.label }}</span>
          <span v-if="selectedThreshold === option.value" class="check-mark">✓</span>
        </button>
      </div>
    </div>
  </l-control>
</template>

<script setup lang="ts">
import { LControl } from "@vue-leaflet/vue-leaflet";
import { ref } from 'vue';

defineProps<{
  showGrid: boolean;
  selectedThreshold: number;
}>();

const emit = defineEmits<{
  (e: 'toggleGrid'): void;
  (e: 'updateThreshold', value: number): void;
}>();

const dropdownOpen = ref(false);

const filterOptions = [
  { value: 0, label: 'All Areas', color: '#3288bd' },
  { value: 1000, label: '1,000+', color: '#66c2a5' },
  { value: 5000, label: '5,000+', color: '#abdda4' },
  { value: 10000, label: '10,000+', color: '#e6f598' },
  { value: 15000, label: '15,000+', color: '#fee08b' },
  { value: 20000, label: '20,000+', color: '#fdae61' },
  { value: 24000, label: '24,000+', color: '#f46d43' }
];

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const selectThreshold = (value: number) => {
  emit('updateThreshold', value);
  dropdownOpen.value = false;
};

const getThresholdLabel = (value: number) => {
  const option = filterOptions.find(opt => opt.value === value);
  return option ? option.label : 'Filter';
};
</script>

<style scoped>
.custom-control {
  margin-right: 10px;
  margin-top: 10px;
}

.grid-toggle-btn {
  background-color: #fff;
  border: 2px solid rgba(0,0,0,0.2);
  background-clip: padding-box;
  border-radius: 5px;
  width: 50px; /* Slightly larger than standard */
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;
  box-shadow: 0 1px 5px rgba(0,0,0,0.65);
}

.grid-toggle-btn:hover {
  background-color: #f4f4f4;
}

.grid-toggle-btn.active {
  background-color: #e2e8f0;
  border-color: #6366f1;
}

.grid-toggle-btn.active .icon {
  color: #6366f1;
  fill: #6366f1;
}

.icon {
  width: 28px;
  height: 28px;
  color: #4a5568;
  fill: #4a5568;
}

.filter-dropdown-container {
  margin-top: 8px;
  position: relative;
}

.filter-btn {
  background-color: #fff;
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 5px;
  padding: 6px 10px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.65);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #f4f4f4;
}

.filter-btn.active {
  background-color: #e2e8f0;
  border-color: #6366f1;
  color: #4338ca;
}

.filter-icon {
  font-size: 14px;
}

.filter-text {
  font-size: 11px;
  font-weight: 600;
  color: #4a5568;
  white-space: nowrap;
  flex: 1;
}

.filter-btn.active .filter-text {
  color: #4338ca;
}

.dropdown-arrow {
  font-size: 8px;
  color: #64748b;
  margin-left: auto;
}

.filter-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: #fff;
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #4a5568;
  transition: background-color 0.15s;
  text-align: left;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.dropdown-item.selected {
  background-color: #e2e8f0;
  color: #4338ca;
  font-weight: 600;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.option-label {
  flex: 1;
}

.check-mark {
  color: #6366f1;
  font-weight: bold;
  font-size: 12px;
}
</style>
