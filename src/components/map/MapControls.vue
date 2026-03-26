<template>
  <div class="custom-control">
    <div class="control-container" v-click-outside="closeMenu">
      <!-- Main Toggle Button -->
      <button 
        @click="toggleMenu" 
        class="main-btn"
        :class="{ active: menuOpen || showPopulationGrid }"
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
           <div class="header-row">
            <span class="menu-title">{{ $t('map.controls.title') }}</span>
           </div>
          <div class="header-row" style="margin-top: 12px;">
            <span class="menu-title">{{ $t('map.controls.populationGrid') }}</span>
            <label class="switch">
              <input type="checkbox" :checked="showPopulationGrid" @change="$emit('togglePopulationGrid')">
              <span class="slider round"></span>
            </label>
          </div>
          <div class="header-row" style="margin-top: 12px;">
            <span class="menu-title">{{ $t('map.controls.analysisGrid') }}</span>
            <label class="switch">
              <input type="checkbox" :checked="showAnalysisGrid" @change="$emit('toggleAnalysisGrid')">
              <span class="slider round"></span>
            </label>
          </div>
          <div class="header-row" style="margin-top: 12px;">
            <span class="menu-title">{{ $t('map.controls.opportunityHeatmap') }}</span>
            <label class="switch">
              <input type="checkbox" :checked="showOpportunityHeatmap" @change="$emit('toggleOpportunityHeatmap')">
              <span class="slider round"></span>
            </label>
          </div>

        </div>

        <!-- Heatmap category picker (shown when heatmap is active) -->
        <div v-if="showOpportunityHeatmap" class="menu-content">
          <span class="section-label">{{ $t('map.controls.heatmapCategory') }}</span>
          <div class="category-pills">
            <button
              class="category-pill"
              :class="{ active: activeCategoryHeatmap === 'barbershop' }"
              @click="$emit('setHeatmapCategory', 'barbershop')"
            >
              ✂️ {{ $t('map.controls.heatmapBarbershop') }}
            </button>
            <button
              class="category-pill"
              :class="{ active: activeCategoryHeatmap === 'gym' }"
              @click="$emit('setHeatmapCategory', 'gym')"
            >
              🏋️ {{ $t('map.controls.heatmapGym') }}
            </button>
          </div>
        </div>

        <div v-if="showPopulationGrid" class="menu-content">
          <div class="filter-section">
            <span class="section-label">{{ $t('map.controls.densityFilter') }}</span>
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
          <p>{{ $t('map.controls.enableGridMessage') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{
  showPopulationGrid: boolean;
  showAnalysisGrid: boolean;
  selectedThreshold: number;
  showOpportunityHeatmap: boolean;
  activeCategoryHeatmap: string;
}>();

const emit = defineEmits<{
  (e: 'togglePopulationGrid'): void;
  (e: 'toggleAnalysisGrid'): void;
  (e: 'updateThreshold', value: number): void;
  (e: 'toggleOpportunityHeatmap'): void;
  (e: 'setHeatmapCategory', category: string): void;
}>();

const menuOpen = ref(false);

const { t } = useI18n();

const filterOptions = computed(() => [
  { value: 0, label: t('map.filters.allAreas'), color: '#3288bd' },
  { value: 1000, label: t('map.filters.residents1k'), color: '#66c2a5' },
  { value: 5000, label: t('map.filters.residents5k'), color: '#abdda4' },
  { value: 10000, label: t('map.filters.residents10k'), color: '#e6f598' },
  { value: 15000, label: t('map.filters.residents15k'), color: '#fee08b' },
  { value: 20000, label: t('map.filters.residents20k'), color: '#fdae61' },
  { value: 24000, label: t('map.filters.residents24k'), color: '#f46d43' }
]);

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
  position: absolute;
  top: 60px;
  right: 10px;
  z-index: 1000;
  pointer-events: auto;
}

.control-container {
  position: relative;
}

.main-btn {
  background-color: #f5f0e8;
  border: 1px solid #d5ccc0;
  border-radius: 8px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(19, 19, 20, 0.12);
}

.main-btn:hover {
  background-color: #ede7dc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(19, 19, 20, 0.16);
}

.main-btn.active {
  background-color: #fff0ea;
  border-color: #d97757;
}

.main-btn.active .icon {
  color: #d97757;
}

.icon {
  width: 42px;
  height: 42px;
  color: #8a7e72;
  transition: all 0.2s;
}

.popover-menu {
  position: absolute;
  top: 0;
  right: 54px;
  width: 280px;
  background: #f5f0e8;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(19, 19, 20, 0.14);
  border: 1px solid #e0d8cc;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0); }
}

.menu-header {
  padding: 16px;
  background: #ede7dc;
  border-bottom: 1px solid #e0d8cc;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.menu-title {
  font-weight: 600;
  color: #131314;
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
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #c9bfb4;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: #f5f0e8;
  transition: .4s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}

input:checked + .slider { background-color: #d97757; }
input:checked + .slider:before { transform: translateX(18px); }

.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }

.menu-content {
  padding: 8px 0;
  max-height: 300px;
  overflow-y: auto;
}

.menu-placeholder {
  padding: 20px;
  text-align: center;
  color: #9d9080;
  font-size: 13px;
  line-height: 1.5;
}

.section-label {
  display: block;
  padding: 8px 16px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9d9080;
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

.filter-option:hover { background-color: #ede7dc; }

.filter-option.selected { background-color: #fff0ea; }

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  font-size: 13px;
  color: #4a4030;
}

.filter-option.selected .option-text {
  color: #131314;
  font-weight: 500;
}

.check-icon {
  color: #d97757;
  font-weight: bold;
  font-size: 14px;
}

.category-pills {
  display: flex;
  gap: 8px;
  padding: 8px 16px 14px;
}

.category-pill {
  flex: 1;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid #d5ccc0;
  background: #f5f0e8;
  color: #4a4030;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.category-pill:hover {
  background: #ede7dc;
  border-color: #c9bfb4;
}

.category-pill.active {
  background: #fff0ea;
  border-color: #d97757;
  color: #d97757;
  font-weight: 600;
}
</style>
