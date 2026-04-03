<template>
  <div class="analysis-panel">
    <div class="panel-scroll">
      <DataLayersSection
        :placeTypes="placeTypes"
        :enableClustering="enableClustering"
        :groceryTagFilters="groceryTagFilters"
        @togglePlaceType="$emit('togglePlaceType', $event)"
        @toggleClustering="$emit('toggleClustering')"
        @toggleGroceryTagFilter="$emit('toggleGroceryTagFilter', $event)"
      />
      <MapLayersSection />
      <SofiaPlanSection />
      <PedestrianNetworkSection />
      <TransportSection />
      <InfrastructureSection />
      <SpatialToolsSection
        :isDrawingMode="isDrawingMode"
        :hasActivePolygon="hasActivePolygon"
        :pins="pins"
        :pinCount="pinCount"
        :isPinMode="isPinMode"
        :isComparisonOpen="isComparisonOpen"
        @startDrawing="$emit('startDrawing')"
        @clearPolygon="$emit('clearPolygon')"
        @togglePinMode="$emit('togglePinMode')"
        @clearComparison="$emit('clearComparison')"
        @removePin="$emit('removePin', $event)"
        @compareLocations="$emit('compareLocations')"
        @closeComparison="$emit('closeComparison')"
      />
    </div>
    <div class="panel-footer">
      <MapStyleSwitcher @switch="$emit('switchBaseLayer', $event)" />
      <LanguageSwitcher />
    </div>
  </div>
</template>

<script setup lang="ts">
import LanguageSwitcher from '../LanguageSwitcher.vue';
import MapStyleSwitcher from './MapStyleSwitcher.vue';
import DataLayersSection from './sidebar/DataLayersSection.vue';
import MapLayersSection from './sidebar/MapLayersSection.vue';
import SofiaPlanSection from './sidebar/SofiaPlanSection.vue';
import PedestrianNetworkSection from './sidebar/PedestrianNetworkSection.vue';
import TransportSection from './sidebar/TransportSection.vue';
import InfrastructureSection from './sidebar/InfrastructureSection.vue';
import SpatialToolsSection from './sidebar/SpatialToolsSection.vue';
import type { ComparisonPin } from '@/composables/useLocationComparison';

defineProps<{
  isMobile: boolean;
  placeTypes: Array<{ category: string; emoji: string; labelKey: string; visible: boolean }>;
  enableClustering: boolean;
  groceryTagFilters: string[];
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
  (e: 'toggleGroceryTagFilter', tag: string): void;
  (e: 'startDrawing'): void;
  (e: 'clearPolygon'): void;
  (e: 'togglePinMode'): void;
  (e: 'clearComparison'): void;
  (e: 'removePin', id: string): void;
  (e: 'compareLocations'): void;
  (e: 'closeComparison'): void;
  (e: 'switchBaseLayer', name: string): void;
}>();
</script>

<style scoped>
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
</style>
