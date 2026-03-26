<template>
  <div class="analysis-panel">
    <div class="panel-scroll">

    <!-- Section 1: Data Layers -->
    <SidebarSection :title="$t('analysis.settings.title')" :default-open="true">
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

      <!-- Grocery Chain Filter -->
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
    </SidebarSection>

    <!-- Section 2: Infrastructure -->
    <SidebarSection title="Infrastructure" :default-open="false">
      <div class="toggle-row-group">
        <ToggleRow icon="🚇" label="Metro Lines" :model-value="showMetroVector" @toggle="$emit('toggleMetroVector')" />
        <CheckboxGroup
          v-if="showMetroVector"
          :items="metroLineItems"
          :checked-items="activeMetroLines"
          @change="$emit('toggleMetroLine', $event)"
        />

        <ToggleRow icon="📍" label="Metro Stops" :model-value="showMetroStops" @toggle="$emit('toggleMetroStops')" />
        <CheckboxGroup
          v-if="showMetroStops"
          :items="metroLineItems"
          :checked-items="activeStopLines"
          @change="$emit('toggleStopLine', $event)"
        />

        <ToggleRow icon="🚶" label="Walk Score Network" :model-value="showPedestrianNetwork" @toggle="$emit('togglePedestrianNetwork')" />
        <ToggleRow icon="📍" label="OSM POIs" :model-value="showOsmPois" @toggle="$emit('toggleOsmPois')" />
      </div>
    </SidebarSection>

    <!-- Section 3: Spatial Tools -->
    <SidebarSection title="Spatial Tools" :default-open="false">
      <div class="toggle-row-group">
        <ToggleRow icon="⬡" :label="$t('analysis.settings.enableClustering')" :model-value="enableClustering" @toggle="$emit('toggleClustering')" />

        <ToggleRow
          icon="⬡"
          :model-value="hasActivePolygon"
          :disabled="isDrawingMode"
          :class="{ 'area-select-btn': true, drawing: isDrawingMode }"
          @toggle="hasActivePolygon ? $emit('clearPolygon') : $emit('startDrawing')"
        >
          {{ isDrawingMode ? 'Drawing on map...' : hasActivePolygon ? 'Area selected' : 'Select Area for Analysis' }}
          <template #trailing>
            <span v-if="hasActivePolygon" class="area-clear-x">✕</span>
            <TogglePill v-else-if="!isDrawingMode" :model-value="false" />
          </template>
        </ToggleRow>
      </div>
    </SidebarSection>

    <!-- Section 4: Location Comparison -->
    <SidebarSection title="Location Comparison" :default-open="true">
      <!-- Drop Pin button -->
      <button
        :class="['drop-pin-btn', { active: isPinMode }]"
        @click="$emit('togglePinMode')"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
          <circle cx="8" cy="6" r="3" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 16c0 0-5-5.5-5-10a5 5 0 0110 0c0 4.5-5 10-5 10z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        {{ isPinMode ? 'Click map to place pin…' : '+ Drop Pin' }}
      </button>

      <!-- Pin list -->
      <div v-if="pins.length > 0" class="pin-list">
        <PinItem
          v-for="(pin, idx) in pins"
          :key="pin.id"
          :index="idx + 1"
          :label="pin.label"
          :lat="pin.lat"
          :lng="pin.lng"
          @remove="$emit('removePin', pin.id)"
        />
      </div>

      <!-- Compare button -->
      <button
        v-if="pins.length >= 2"
        :class="['compare-btn', { 'compare-btn--close': isComparisonOpen }]"
        @click="isComparisonOpen ? $emit('closeComparison') : $emit('compareLocations')"
      >
        {{ isComparisonOpen ? '× Close Comparison' : `Compare ${pins.length} Location${pins.length !== 1 ? 's' : ''}` }}
      </button>
    </SidebarSection>

    </div><!-- end panel-scroll -->

    <div class="panel-footer">
      <LanguageSwitcher />
    </div>

  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '../LanguageSwitcher.vue';
import SidebarSection from './SidebarSection.vue';
import TogglePill from '../ui/TogglePill.vue';
import ToggleRow from '../ui/ToggleRow.vue';
import CheckboxGroup from '../ui/CheckboxGroup.vue';
import PinItem from '../ui/PinItem.vue';
import type { ComparisonPin } from '@/composables/useLocationComparison';

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
  isDrawingMode: boolean;
  hasActivePolygon: boolean;
  pins: ComparisonPin[];
  pinCount: number;
  isPinMode: boolean;
  isComparisonOpen: boolean;
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
  (e: 'startDrawing'): void;
  (e: 'clearPolygon'): void;
  (e: 'togglePinMode'): void;
  (e: 'removePin', id: string): void;
  (e: 'compareLocations'): void;
  (e: 'closeComparison'): void;
}>();

const metroLineItems = computed(() =>
  props.metroLinesList.map(line => ({
    value: line,
    label: line,
    color: props.metroColors[line],
  }))
);

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
  overflow: hidden;
  border-right: 1px solid rgba(245, 240, 232, 0.07);
  display: flex;
  flex-direction: column;
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.panel-scroll::-webkit-scrollbar { width: 5px; }
.panel-scroll::-webkit-scrollbar-track { background: transparent; }
.panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(245, 240, 232, 0.15);
  border-radius: 3px;
}
.panel-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 240, 232, 0.25);
}

.panel-footer {
  flex-shrink: 0;
  padding: 12px 16px;
  border-top: 1px solid rgba(245, 240, 232, 0.07);
  background: #161B16;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group label {
  display: block;
  margin-bottom: 10px;
  font-size: 0.875rem;
  color: #c4b8ae;
  font-weight: 500;
}

/* ── Place type layer cards ─────────────────────────────── */
.layer-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}

.layer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 13px 6px 11px;
  border-radius: 10px;
  border: 1px solid rgba(245, 240, 232, 0.07);
  background: rgba(245, 240, 232, 0.03);
  color: #5a5048;
  cursor: pointer;
  transition: all 0.18s ease;
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

.layer-card:active {
  transform: scale(1.02);
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
  letter-spacing: 0.8px;
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
  gap: 1px;
}

/* Area select overrides (green active state, disabled drawing state) */
.area-select-btn.active {
  border-color: rgba(16, 185, 129, 0.4) !important;
  background: rgba(16, 185, 129, 0.08) !important;
  color: #10b981 !important;
}

.area-select-btn.drawing {
  opacity: 0.6;
  cursor: default;
}

.area-clear-x {
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
  flex-shrink: 0;
}

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

/* ── Pins section ─────────────────────────────────────── */
.drop-pin-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 9px;
  border: 1px dashed rgba(245, 240, 232, 0.18);
  background: transparent;
  color: #8a7e72;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 8px;
}

.drop-pin-btn:hover {
  background: rgba(245, 240, 232, 0.05);
  color: #c4b8ae;
  border-color: rgba(245, 240, 232, 0.3);
}

.drop-pin-btn.active {
  border-color: rgba(217, 119, 87, 0.5);
  background: rgba(217, 119, 87, 0.08);
  color: #d97757;
  border-style: solid;
}

.pin-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.compare-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #d97757, #c05e3a);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: opacity 0.15s, transform 0.1s;
  margin-top: 4px;
}

.compare-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.compare-btn:active {
  transform: scale(0.98);
}

.compare-btn--close {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.compare-btn--close:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.25);
  transform: translateY(-1px);
}
</style>
