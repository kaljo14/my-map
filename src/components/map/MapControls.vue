<template>
  <l-control position="topright" class="custom-control">
    <div class="control-container" v-click-outside="closeMenu">
      <!-- Main Toggle Button -->
      <button 
        @click="toggleMenu" 
        class="main-btn"
        :class="{ active: menuOpen || showGrid }"
        title="Population Grid Settings"
      >
        <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3h18v18H3V3z" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M5 5h6v6H5V5z" fill="currentColor" fill-opacity="0.2"/>
          <path d="M13 5h6v6h-6V5z" fill="currentColor" fill-opacity="0.6"/>
          <path d="M5 13h6v6H5v-6z" fill="currentColor" fill-opacity="0.8"/>
          <path d="M13 13h6v6h-6v-6z" fill="currentColor" fill-opacity="0.4"/>
        </svg>
      </button>

      <!-- Popover Menu -->
      <div v-if="menuOpen" class="popover-menu">
        <div class="menu-header">
          <span class="menu-title">Population Grid</span>
          <label class="switch">
            <input type="checkbox" :checked="showGrid" @change="$emit('toggleGrid')">
            <span class="slider round"></span>
          </label>
        </div>

        <div v-if="showGrid" class="menu-content">
          <div class="filter-section">
            <span class="section-label">Density Filter</span>
            <div class="filter-options">
              <button
                v-for="option in filterOptions"
                :key="option.value"
                @click="selectThreshold(option.value)"
                class="filter-option"
                :class="{ selected: selectedThreshold === option.value }"
              >
                <span class="color-dot" :style="{ backgroundColor: option.color }"></span>
                <span class="option-text">{{ option.label }}</span>
                <span v-if="selectedThreshold === option.value" class="check-icon">✓</span>
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="menu-placeholder">
          <p>Enable the grid to see population density data and filter options.</p>
        </div>
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

const menuOpen = ref(false);

const filterOptions = [
  { value: 0, label: 'All Areas', color: '#3288bd' },
  { value: 1000, label: '1,000+ Residents', color: '#66c2a5' },
  { value: 5000, label: '5,000+ Residents', color: '#abdda4' },
  { value: 10000, label: '10,000+ Residents', color: '#e6f598' },
  { value: 15000, label: '15,000+ Residents', color: '#fee08b' },
  { value: 20000, label: '20,000+ Residents', color: '#fdae61' },
  { value: 24000, label: '24,000+ Residents', color: '#f46d43' }
];

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const selectThreshold = (value: number) => {
  emit('updateThreshold', value);
};

// Simple click-outside directive
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};
</script>

<style scoped>
.custom-control {
  margin-right: 10px;
  margin-top: 10px;
  pointer-events: auto;
}

.control-container {
  position: relative;
}

.main-btn {
  background-color: #fff;
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 8px;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.main-btn:hover {
  background-color: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.main-btn.active {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

.main-btn.active .icon {
  color: #3b82f6;
  fill: #3b82f6;
}

.icon {
  width: 24px;
  height: 24px;
  color: #64748b;
  fill: #64748b;
  transition: all 0.2s;
}

.popover-menu {
  position: absolute;
  top: 0;
  right: 54px; /* Position to the left of the button */
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.menu-header {
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

input:checked + .slider {
  background-color: #3b82f6;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.menu-content {
  padding: 8px 0;
  max-height: 300px;
  overflow-y: auto;
}

.menu-placeholder {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
}

.section-label {
  display: block;
  padding: 8px 16px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  font-weight: 600;
}

.filter-option {
  width: 100%;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.filter-option:hover {
  background-color: #f1f5f9;
}

.filter-option.selected {
  background-color: #eff6ff;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  font-size: 13px;
  color: #334155;
}

.filter-option.selected .option-text {
  color: #1e293b;
  font-weight: 500;
}

.check-icon {
  color: #3b82f6;
  font-weight: bold;
  font-size: 14px;
}
</style>
