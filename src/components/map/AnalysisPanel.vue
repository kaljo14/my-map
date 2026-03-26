<template>
  <div class="analysis-panel">
    <!-- Map Settings -->
    <div class="filters-section">
      <h3>{{ $t('analysis.settings.title') }}</h3>

      <!-- Place type toggle cards -->
      <div class="layer-cards">
        <button
          v-for="pt in placeTypes"
          :key="pt.category"
          :class="['layer-card', { active: pt.visible }]"
          @click="$emit('togglePlaceType', pt.category)"
        >
          <span class="layer-card-emoji">{{ pt.emoji }}</span>
          <span class="layer-card-label">{{ $t(`analysis.settings.${pt.labelKey}`) || pt.category }}</span>
          <span class="layer-card-indicator"></span>
        </button>
      </div>

      <!-- Grocery Chain Filter (shown only when grocery stores layer is active) -->
      <div v-if="isGroceryVisible" class="filter-group grocery-chain-filter">
        <label>{{ $t('analysis.filters.groceryChain') }}</label>
        <div class="tag-buttons">
          <button
            v-for="tag in groceryTags"
            :key="tag.value"
            :class="['tag-btn', { active: groceryTagFilters.includes(tag.value) }]"
            @click="$emit('toggleGroceryTagFilter', tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <!-- Utility toggles -->
      <div class="toggle-row-group">
        <button
          :class="['toggle-row', { active: enableClustering }]"
          @click="$emit('toggleClustering')"
        >
          <span class="toggle-row-icon">⬡</span>
          <span class="toggle-row-label">{{ $t('analysis.settings.enableClustering') }}</span>
          <span class="toggle-pill" :class="{ on: enableClustering }"></span>
        </button>

        <button
          :class="['toggle-row', { active: showMetroVector }]"
          @click="$emit('toggleMetroVector')"
        >
          <span class="toggle-row-icon">🚇</span>
          <span class="toggle-row-label">Metro Lines</span>
          <span class="toggle-pill" :class="{ on: showMetroVector }"></span>
        </button>

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

        <button
          :class="['toggle-row', { active: showMetroStops }]"
          @click="$emit('toggleMetroStops')"
        >
          <span class="toggle-row-icon">📍</span>
          <span class="toggle-row-label">Metro Stops</span>
          <span class="toggle-pill" :class="{ on: showMetroStops }"></span>
        </button>

        <button
          :class="['toggle-row', { active: showPedestrianNetwork }]"
          @click="$emit('togglePedestrianNetwork')"
        >
          <span class="toggle-row-icon">🚶</span>
          <span class="toggle-row-label">Walk Score Network</span>
          <span class="toggle-pill" :class="{ on: showPedestrianNetwork }"></span>
        </button>

        <button
          :class="['toggle-row', { active: showOsmPois }]"
          @click="$emit('toggleOsmPois')"
        >
          <span class="toggle-row-icon">📍</span>
          <span class="toggle-row-label">OSM POIs</span>
          <span class="toggle-pill" :class="{ on: showOsmPois }"></span>
        </button>

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

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '../LanguageSwitcher.vue';

const { t } = useI18n();

const props = defineProps<{
  isMobile: boolean;
  placeTypes: Array<{ category: string; emoji: string; labelKey: string; visible: boolean }>;
  enableClustering: boolean;
  showMetroVector: boolean;
  activeMetroLines: string[];
  showMetroStops: boolean;
  activeStopLines: string[];
  metroLinesList: string[];
  metroColors: Record<string, string>;
  groceryTagFilters: string[];
  showPedestrianNetwork: boolean;
  showOsmPois: boolean;
}>();

defineEmits<{
  (e: 'togglePlaceType', category: string): void;
  (e: 'toggleClustering'): void;
  (e: 'toggleMetroVector'): void;
  (e: 'toggleMetroLine', line: string): void;
  (e: 'toggleMetroStops'): void;
  (e: 'toggleStopLine', line: string): void;
  (e: 'toggleGroceryTagFilter', tag: string): void;
  (e: 'togglePedestrianNetwork'): void;
  (e: 'toggleOsmPois'): void;
}>();

const isGroceryVisible = computed(() =>
  props.placeTypes.some(pt => pt.category === 'grocery store' && pt.visible)
);

const groceryTags = computed(() => [
  { value: 'big-chains', label: t('analysis.filters.groceryBigChains') },
  { value: 'lidl',       label: 'Lidl' },
  { value: 'kaufland',   label: 'Kaufland' },
  { value: 'billa',      label: 'Billa' },
  { value: 'fantastico', label: 'Fantastico' },
]);

</script>

<style scoped>
/* ── Palette: warm dark ──────────────────────────────────
   bg:        #161B16   elevated:  #252018
   border:    rgba(245,240,232,0.08)
   text:      #f5f0e8   muted: #8a7e72   faint: #5a5048
   accent:    #d97757
   ─────────────────────────────────────────────────────── */

.analysis-panel {
  width: 100%;
  height: 100%;
  background: #161B16;
  color: #f5f0e8;
  padding: 0;
  overflow-y: auto;
  border-right: 1px solid rgba(245, 240, 232, 0.07);
}

.analysis-panel::-webkit-scrollbar { width: 5px; }
.analysis-panel::-webkit-scrollbar-track { background: transparent; }
.analysis-panel::-webkit-scrollbar-thumb {
  background: rgba(245, 240, 232, 0.15);
  border-radius: 3px;
}
.analysis-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 240, 232, 0.25);
}

.stats-section {
  margin: 0;
  padding: 24px;
  background: rgba(0, 0, 0, 0.15);
}

.stats-section h3,
.filters-section h3,
.distribution-section h3 {
  font-size: 0.75rem;
  margin-bottom: 16px;
  color: #8a7e72;
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
  height: 14px;
  background: #d97757;
  border-radius: 2px;
}

.stat-card {
  background: rgba(245, 240, 232, 0.04);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  text-align: center;
  border: 1px solid rgba(245, 240, 232, 0.07);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: #d97757;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(217, 119, 87, 0.3);
  box-shadow: 0 8px 20px rgba(217, 119, 87, 0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #d97757;
  margin-bottom: 6px;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #8a7e72;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.filters-section {
  margin: 0;
  padding: 24px;
  background: rgba(0, 0, 0, 0.08);
  border-top: 1px solid rgba(245, 240, 232, 0.07);
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group label {
  display: block;
  margin-bottom: 10px;
  font-size: 0.875rem;
  color: #c4b8ae;
  font-weight: 500;
}

.slider {
  width: 100%;
  margin-bottom: 10px;
  height: 5px;
  border-radius: 3px;
  background: rgba(245, 240, 232, 0.1);
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
  background: #d97757;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(217, 119, 87, 0.4);
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(217, 119, 87, 0.6);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d97757;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(217, 119, 87, 0.4);
}

.filter-value {
  display: inline-block;
  background: rgba(217, 119, 87, 0.15);
  padding: 5px 14px;
  border-radius: 20px;
  font-weight: 600;
  color: #d97757;
  border: 1px solid rgba(217, 119, 87, 0.3);
  font-size: 0.875rem;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-range span {
  color: #8a7e72;
  font-weight: 500;
}

.price-input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(245, 240, 232, 0.1);
  background: rgba(245, 240, 232, 0.05);
  color: #f5f0e8;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.price-input::placeholder { color: #5a5048; }

.price-input:focus {
  outline: none;
  border-color: #d97757;
  background: rgba(245, 240, 232, 0.08);
  box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.12);
}

/* ── Place type layer cards ─────────────────────────────── */
.layer-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.layer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px 10px;
  border-radius: 12px;
  border: 1.5px solid rgba(245, 240, 232, 0.08);
  background: rgba(245, 240, 232, 0.03);
  color: #5a5048;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.layer-card:hover {
  border-color: rgba(217, 119, 87, 0.35);
  background: rgba(217, 119, 87, 0.06);
  color: #a89e94;
}

.layer-card.active {
  border-color: rgba(217, 119, 87, 0.6);
  background: rgba(217, 119, 87, 0.12);
  color: #f5f0e8;
  box-shadow: 0 0 12px rgba(217, 119, 87, 0.15);
}

.layer-card-emoji {
  font-size: 1.4rem;
  line-height: 1;
  transition: transform 0.2s;
}

.layer-card.active .layer-card-emoji { transform: scale(1.1); }

.layer-card-label {
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.layer-card-indicator {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: transparent;
  transition: background 0.2s;
}

.layer-card.active .layer-card-indicator { background: #d97757; }

/* ── Utility toggle rows ────────────────────────────────── */
.toggle-row-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #5a5048;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.toggle-row:hover {
  background: rgba(245, 240, 232, 0.05);
  color: #a89e94;
}

.toggle-row.active { color: #c4b8ae; }

.toggle-row-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.toggle-row-label {
  flex: 1;
  font-weight: 500;
}

/* iOS-style pill toggle */
.toggle-pill {
  width: 34px;
  height: 18px;
  border-radius: 9px;
  background: rgba(245, 240, 232, 0.12);
  position: relative;
  flex-shrink: 0;
  transition: background 0.25s;
}

.toggle-pill::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #5a5048;
  transition: transform 0.25s, background 0.25s;
}

.toggle-pill.on { background: rgba(217, 119, 87, 0.4); }
.toggle-pill.on::after { transform: translateX(16px); background: #d97757; }

.grocery-chain-filter {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(245, 240, 232, 0.07);
}

.tag-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-btn {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(245, 240, 232, 0.12);
  background: rgba(245, 240, 232, 0.05);
  color: #8a7e72;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: rgba(217, 119, 87, 0.35);
  color: #c4b8ae;
}

.tag-btn.active {
  background: rgba(217, 119, 87, 0.2);
  border-color: rgba(217, 119, 87, 0.6);
  color: #d97757;
}

.reset-btn {
  width: 100%;
  padding: 12px;
  background: rgba(245, 240, 232, 0.06);
  color: #c4b8ae;
  border: 1px solid rgba(245, 240, 232, 0.12);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.reset-btn:hover {
  background: rgba(217, 119, 87, 0.15);
  border-color: rgba(217, 119, 87, 0.4);
  color: #d97757;
  transform: translateY(-1px);
}

.reset-btn:active { transform: translateY(0); }

.distribution-section {
  margin: 0;
  padding: 24px;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(245, 240, 232, 0.07);
}

.nested-checkboxes {
  margin-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  padding-left: 8px;
  border-left: 2px solid rgba(245, 240, 232, 0.1);
}

.nested-label {
  font-size: 0.8rem !important;
  padding: 4px !important;
  color: #8a7e72;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(245, 240, 232, 0.15);
}
</style>
