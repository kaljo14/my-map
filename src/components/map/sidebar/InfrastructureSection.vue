<template>
  <SidebarSection title="Infrastructure" :default-open="false" icon="route">
    <div class="toggle-row-group">
      <ToggleRow label="Metro Lines" variant="sidebar" :model-value="store.metro.showMetroVector" @toggle="store.toggleMetroVector()">
        <template #icon>
          <span class="material-symbols-outlined">train</span>
        </template>
      </ToggleRow>
      <CheckboxGroup
        v-if="store.metro.showMetroVector"
        :items="metroLineItems"
        :checked-items="store.metro.activeMetroLines"
        @change="store.toggleMetroLine($event)"
      />

      <ToggleRow label="Metro Stops" variant="sidebar" :model-value="store.metroStops.showMetroStops" @toggle="store.toggleMetroStops()">
        <template #icon>
          <span class="material-symbols-outlined">directions_transit</span>
        </template>
      </ToggleRow>
      <CheckboxGroup
        v-if="store.metroStops.showMetroStops"
        :items="metroLineItems"
        :checked-items="store.metroStops.activeStopLines"
        @change="store.toggleStopLine($event)"
      />

      <ToggleRow label="Walk Score Network" variant="sidebar" :model-value="store.pedestrian.showPedestrianNetwork" @toggle="store.togglePedestrianNetwork()">
        <template #icon>
          <span class="material-symbols-outlined">directions_walk</span>
        </template>
      </ToggleRow>
      <ToggleRow label="OSM POIs" variant="sidebar" :model-value="store.osmPois.showOsmPois" @toggle="store.toggleOsmPois()">
        <template #icon>
          <span class="material-symbols-outlined">pin_drop</span>
        </template>
      </ToggleRow>
      <ToggleRow label="Parking Zones" variant="sidebar" :model-value="store.parking.showParkingZones" @toggle="store.toggleParkingZones()">
        <template #icon>
          <span class="material-symbols-outlined">local_parking</span>
        </template>
      </ToggleRow>
      <div v-if="store.parking.showParkingZones" class="parking-zone-legend">
        <button
          class="parking-filter-pill"
          :class="{ active: store.parking.showBlueZone }"
          style="--pill-color:#0064ff;--pill-fill:rgba(0,100,255,0.2)"
          @click="store.toggleBlueZone()"
        >
          <span class="parking-legend-swatch"></span>
          <span class="parking-legend-label">Blue Zone</span>
        </button>
        <button
          class="parking-filter-pill"
          :class="{ active: store.parking.showGreenZone }"
          style="--pill-color:#00b400;--pill-fill:rgba(0,180,0,0.2)"
          @click="store.toggleGreenZone()"
        >
          <span class="parking-legend-swatch"></span>
          <span class="parking-legend-label">Green Zone</span>
        </button>
      </div>
    </div>
  </SidebarSection>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SidebarSection from '../SidebarSection.vue';
import ToggleRow from '../../ui/ToggleRow.vue';
import CheckboxGroup from '../../ui/CheckboxGroup.vue';
import { useLayerStore } from '@/stores/layerStore';

const store = useLayerStore();

const metroLineItems = computed(() =>
  store.metro.METRO_LINES.map(line => ({
    value: line,
    label: line,
    color: store.metro.METRO_COLORS[line],
  }))
);
</script>

<style scoped>
.toggle-row-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.parking-zone-legend {
  display: flex;
  gap: 8px;
  padding: 6px 12px 4px;
}

.parking-filter-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px 3px 5px;
  border-radius: 12px;
  border: 1.5px solid rgba(138, 126, 114, 0.3);
  background: transparent;
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.15s, border-color 0.15s;
}

.parking-filter-pill.active {
  opacity: 1;
  border-color: var(--pill-color);
}

.parking-filter-pill:hover {
  opacity: 0.8;
}

.parking-legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: var(--pill-fill);
  border: 1.5px solid var(--pill-color);
}

.parking-legend-label {
  font-size: 11px;
  color: #8a7e72;
}
</style>
