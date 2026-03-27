<template>
  <div class="analysis-panel">
    <div class="panel-scroll">

    <!-- Section 1: Data Layers -->
    <SidebarSection :title="$t('analysis.settings.title')" :default-open="true" icon="tune">
      <div class="layer-cards">
        <button
          v-for="pt in placeTypes"
          :key="pt.category"
          :class="['layer-card', { active: pt.visible }]"
          @click="$emit('togglePlaceType', pt.category)"
        >
          <span class="material-symbols-outlined layer-card-emoji">{{ pt.emoji }}</span>
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

    <!-- Section 2: Map Layers -->
    <SidebarSection title="Map Layers" :default-open="true" icon="layers">
      <div class="toggle-row-group">
        <ToggleRow
          label="Population Density"
          variant="sidebar"
          :model-value="showPopulationGrid"
          @toggle="$emit('togglePopulationGrid')"
        >
          <template #icon>
            <span class="material-symbols-outlined">group</span>
          </template>
        </ToggleRow>
        <div v-if="showPopulationGrid" class="layer-filter-inline">
          <span class="filter-inline-label">Density threshold</span>
          <div class="filter-inline-options">
            <button
              v-for="opt in densityOptions"
              :key="opt.value"
              :class="['filter-inline-btn', { selected: selectedThreshold === opt.value }]"
              @click="$emit('updateThreshold', opt.value)"
            >
              <span class="dot" :style="{ background: opt.color }"></span>
              {{ opt.label }}
            </button>
          </div>
        </div>

        <ToggleRow
          label="Analysis Grid"
          variant="sidebar"
          :model-value="showAnalysisGrid"
          @toggle="$emit('toggleAnalysisGrid')"
        >
          <template #icon>
            <span class="material-symbols-outlined">grid_on</span>
          </template>
        </ToggleRow>

        <ToggleRow
          label="Opportunity Heatmap"
          variant="sidebar"
          :model-value="showOpportunityHeatmap"
          @toggle="$emit('toggleOpportunityHeatmap')"
        >
          <template #icon>
            <span class="material-symbols-outlined">local_fire_department</span>
          </template>
        </ToggleRow>
        <div v-if="showOpportunityHeatmap" class="layer-filter-inline">
          <span class="filter-inline-label">Category</span>
          <div class="heatmap-pills">
            <button
              :class="['heatmap-pill', { active: activeCategoryHeatmap === 'barbershop' }]"
              @click="$emit('setHeatmapCategory', 'barbershop')"
            ><span class="material-symbols-outlined" style="font-size:14px;line-height:1">content_cut</span> Barbershop</button>
            <button
              :class="['heatmap-pill', { active: activeCategoryHeatmap === 'gym' }]"
              @click="$emit('setHeatmapCategory', 'gym')"
            ><span class="material-symbols-outlined" style="font-size:14px;line-height:1">fitness_center</span> Gym</button>
          </div>
        </div>
      </div>
    </SidebarSection>

    <!-- Section 3: Infrastructure -->
    <SidebarSection title="Infrastructure" :default-open="false" icon="route">
      <div class="toggle-row-group">
        <ToggleRow label="Metro Lines" variant="sidebar" :model-value="showMetroVector" @toggle="$emit('toggleMetroVector')">
          <template #icon>
            <span class="material-symbols-outlined">train</span>
          </template>
        </ToggleRow>
        <CheckboxGroup
          v-if="showMetroVector"
          :items="metroLineItems"
          :checked-items="activeMetroLines"
          @change="$emit('toggleMetroLine', $event)"
        />

        <ToggleRow label="Metro Stops" variant="sidebar" :model-value="showMetroStops" @toggle="$emit('toggleMetroStops')">
          <template #icon>
            <span class="material-symbols-outlined">directions_transit</span>
          </template>
        </ToggleRow>
        <CheckboxGroup
          v-if="showMetroStops"
          :items="metroLineItems"
          :checked-items="activeStopLines"
          @change="$emit('toggleStopLine', $event)"
        />

        <ToggleRow label="Walk Score Network" variant="sidebar" :model-value="showPedestrianNetwork" @toggle="$emit('togglePedestrianNetwork')">
          <template #icon>
            <span class="material-symbols-outlined">directions_walk</span>
          </template>
        </ToggleRow>
        <ToggleRow label="OSM POIs" variant="sidebar" :model-value="showOsmPois" @toggle="$emit('toggleOsmPois')">
          <template #icon>
            <span class="material-symbols-outlined">pin_drop</span>
          </template>
        </ToggleRow>
      </div>
    </SidebarSection>

    <!-- Section 4: Spatial Tools -->
    <SidebarSection title="Spatial Tools" :default-open="false" icon="draw">
      <div class="toggle-row-group">
        <ToggleRow variant="sidebar" :label="$t('analysis.settings.enableClustering')" :model-value="enableClustering" @toggle="$emit('toggleClustering')">
          <template #icon>
            <span class="material-symbols-outlined">bubble_chart</span>
          </template>
        </ToggleRow>

        <ToggleRow
          variant="sidebar"
          :model-value="hasActivePolygon || isDrawingMode"
          :class="{ 'area-select-btn': true, drawing: isDrawingMode }"
          @toggle="isDrawingMode || hasActivePolygon ? $emit('clearPolygon') : $emit('startDrawing')"
        >
          <template #icon>
            <span class="material-symbols-outlined">format_shapes</span>
          </template>
          {{ isDrawingMode ? 'Drawing on map...' : hasActivePolygon ? 'Area selected' : 'Select Area for Analysis' }}
          <template #trailing>
            <TogglePill :model-value="hasActivePolygon || isDrawingMode" />
          </template>
        </ToggleRow>

        <ToggleRow
          variant="sidebar"
          :model-value="isPinMode || pins.length > 0 || isComparisonOpen"
          @toggle="isPinMode || pins.length > 0 || isComparisonOpen ? $emit('clearComparison') : $emit('togglePinMode')"
        >
          <template #icon>
            <span class="material-symbols-outlined">compare_arrows</span>
          </template>
          {{ isPinMode ? 'Drop pins on map…' : 'Location Comparison' }}
          <template #trailing>
            <TogglePill :model-value="isPinMode || pins.length > 0 || isComparisonOpen" />
          </template>
        </ToggleRow>

        <!-- Pin list + compare (shown inline when comparison is active) -->
        <template v-if="pins.length > 0 || isPinMode">
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
          <button
            v-if="pins.length >= 2"
            :class="['compare-btn', { 'compare-btn--close': isComparisonOpen }]"
            @click="isComparisonOpen ? $emit('closeComparison') : $emit('compareLocations')"
          >
            <template v-if="isComparisonOpen"><span class="material-symbols-outlined" style="font-size:16px;line-height:1">close</span> Close Comparison</template>
            <template v-else>Compare {{ pins.length }} Location{{ pins.length !== 1 ? 's' : '' }}</template>
          </button>
        </template>
      </div>
    </SidebarSection>

    </div><!-- end panel-scroll -->

    <div class="panel-footer">
      <MapStyleSwitcher @switch="$emit('switchBaseLayer', $event)" />
      <LanguageSwitcher />
    </div>

  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '../LanguageSwitcher.vue';
import MapStyleSwitcher from './MapStyleSwitcher.vue';
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
  showPopulationGrid: boolean;
  selectedThreshold: number;
  showAnalysisGrid: boolean;
  showOpportunityHeatmap: boolean;
  activeCategoryHeatmap: string;
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
  (e: 'togglePopulationGrid'): void;
  (e: 'toggleAnalysisGrid'): void;
  (e: 'updateThreshold', value: number): void;
  (e: 'toggleOpportunityHeatmap'): void;
  (e: 'setHeatmapCategory', category: string): void;
  (e: 'startDrawing'): void;
  (e: 'clearPolygon'): void;
  (e: 'togglePinMode'): void;
  (e: 'clearComparison'): void;
  (e: 'removePin', id: string): void;
  (e: 'compareLocations'): void;
  (e: 'closeComparison'): void;
  (e: 'switchBaseLayer', name: string): void;
}>();

const densityOptions = computed(() => [
  { value: 0,     label: t('map.filters.allAreas'),       color: '#3288bd' },
  { value: 1000,  label: t('map.filters.residents1k'),    color: '#66c2a5' },
  { value: 5000,  label: t('map.filters.residents5k'),    color: '#abdda4' },
  { value: 10000, label: t('map.filters.residents10k'),   color: '#e6f598' },
  { value: 15000, label: t('map.filters.residents15k'),   color: '#fee08b' },
  { value: 20000, label: t('map.filters.residents20k'),   color: '#fdae61' },
  { value: 24000, label: t('map.filters.residents24k'),   color: '#f46d43' },
]);

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
  background: #08090C;
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
  padding: 10px 16px;
  border-top: 1px solid rgba(245, 240, 232, 0.07);
  background: #08090C;
  display: flex;
  flex-direction: row;
  gap: 8px;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}

.layer-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  border-radius: 12px;
  border: 1px solid rgba(245, 240, 232, 0.06);
  background: rgba(245, 240, 232, 0.04);
  color: #5a5048;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
  overflow: hidden;
}

.layer-card:hover {
  border-color: rgba(245, 240, 232, 0.12);
  background: rgba(245, 240, 232, 0.07);
  color: #a89e94;
}

.layer-card.active {
  border-color: rgba(217, 119, 87, 0.45);
  background: rgba(217, 119, 87, 0.1);
  color: #f5f0e8;
}

.layer-card:active {
  transform: scale(0.98);
}

.layer-card-emoji {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
  color: #8a7e72;
  transition: color 0.18s;
}

.layer-card.active .layer-card-emoji {
  color: #d97757;
}

.layer-card-label {
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.2;
  color: inherit;
}

.layer-card-indicator {
  display: none;
}

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

/* ── Inline layer filters ──────────────────────────────── */
.layer-filter-inline {
  margin: 4px 0 6px 0;
  padding: 10px 10px 10px 12px;
  border-radius: 8px;
  background: rgba(245, 240, 232, 0.04);
  border: 1px solid rgba(245, 240, 232, 0.06);
}

.filter-inline-label {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #5a5048;
  font-weight: 600;
  margin-bottom: 8px;
}

.filter-inline-options {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filter-inline-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #8a7e72;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}

.filter-inline-btn:hover {
  background: rgba(245, 240, 232, 0.06);
  color: #c4b8ae;
}

.filter-inline-btn.selected {
  background: rgba(217, 119, 87, 0.12);
  color: #d97757;
}

.filter-inline-btn .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.heatmap-pills {
  display: flex;
  gap: 6px;
}

.heatmap-pill {
  flex: 1;
  padding: 6px 8px;
  border-radius: 7px;
  border: 1px solid rgba(245, 240, 232, 0.1);
  background: rgba(245, 240, 232, 0.04);
  color: #8a7e72;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.heatmap-pill:hover {
  background: rgba(245, 240, 232, 0.08);
  color: #c4b8ae;
}

.heatmap-pill.active {
  background: rgba(217, 119, 87, 0.15);
  border-color: rgba(217, 119, 87, 0.4);
  color: #d97757;
}
</style>
