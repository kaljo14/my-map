<template>
  <SidebarSection title="Spatial Tools" :default-open="false" icon="draw">
    <div class="toggle-row-group">
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
        {{ isPinMode ? 'Drop pins on map...' : 'Location Comparison' }}
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
</template>

<script setup lang="ts">
import SidebarSection from '../SidebarSection.vue';
import ToggleRow from '../../ui/ToggleRow.vue';
import TogglePill from '../../ui/TogglePill.vue';
import PinItem from '../../ui/PinItem.vue';
import type { ComparisonPin } from '@/composables/useLocationComparison';

defineProps<{
  isDrawingMode: boolean;
  hasActivePolygon: boolean;
  pins: ComparisonPin[];
  pinCount: number;
  isPinMode: boolean;
  isComparisonOpen: boolean;
}>();

defineEmits<{
  (e: 'startDrawing'): void;
  (e: 'clearPolygon'): void;
  (e: 'togglePinMode'): void;
  (e: 'clearComparison'): void;
  (e: 'removePin', id: string): void;
  (e: 'compareLocations'): void;
  (e: 'closeComparison'): void;
}>();
</script>

<style scoped>
.toggle-row-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.area-select-btn.active {
  border-color: rgba(16, 185, 129, 0.4) !important;
  background: rgba(16, 185, 129, 0.08) !important;
  color: #10b981 !important;
}

.area-select-btn.drawing {
  opacity: 0.6;
  cursor: default;
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
