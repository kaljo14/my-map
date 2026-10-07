<template>
  <SidebarSection title="Transport & Accessibility" :default-open="false" icon="directions_transit">
    <div class="toggle-row-group">
      <ToggleRow
        label="Show All Layers"
        variant="sidebar"
        :model-value="store.transport.showAnyTransport"
        @toggle="store.toggleAllTransport()"
      >
        <template #icon><span class="material-symbols-outlined">layers</span></template>
      </ToggleRow>

      <ToggleRow label="Transit Access (Planning Zone)" variant="sidebar" :model-value="store.transport.showTransitAccessGe" @toggle="store.toggleTransitAccessGe()">
        <template #icon><span class="material-symbols-outlined">directions_transit</span></template>
      </ToggleRow>
      <ToggleRow label="PT Access (by District)" variant="sidebar" :model-value="store.transport.showTransitAccessDistrict" @toggle="store.toggleTransitAccessDistrict()">
        <template #icon><span class="material-symbols-outlined">map</span></template>
      </ToggleRow>
      <ToggleRow label="Metro Access 800 m" variant="sidebar" :model-value="store.transport.showMetroAccess800m" @toggle="store.toggleMetroAccess800m()">
        <template #icon><span class="material-symbols-outlined">train</span></template>
      </ToggleRow>
      <ToggleRow label="Metro Access 1200 m+" variant="sidebar" :model-value="store.transport.showMetroAccess1200m" @toggle="store.toggleMetroAccess1200m()">
        <template #icon><span class="material-symbols-outlined">train</span></template>
      </ToggleRow>
      <ToggleRow label="Bus Lines" variant="sidebar" :model-value="store.transport.showBusLines" @toggle="store.toggleBusLines()">
        <template #icon><span class="material-symbols-outlined">directions_bus</span></template>
      </ToggleRow>
      <ToggleRow label="Bus Lines (alt)" variant="sidebar" :model-value="store.transport.showBusLinesAlt" @toggle="store.toggleBusLinesAlt()">
        <template #icon><span class="material-symbols-outlined">directions_bus</span></template>
      </ToggleRow>
      <ToggleRow label="Trolleybus Lines" variant="sidebar" :model-value="store.transport.showTrolleybusLines" @toggle="store.toggleTrolleybusLines()">
        <template #icon><span class="material-symbols-outlined">electric_bolt</span></template>
      </ToggleRow>
      <ToggleRow label="Tram Lines" variant="sidebar" :model-value="store.transport.showTramLines" @toggle="store.toggleTramLines()">
        <template #icon><span class="material-symbols-outlined">tram</span></template>
      </ToggleRow>
      <ToggleRow label="Tram Lines (alt)" variant="sidebar" :model-value="store.transport.showTramLinesAlt" @toggle="store.toggleTramLinesAlt()">
        <template #icon><span class="material-symbols-outlined">tram</span></template>
      </ToggleRow>
      <ToggleRow label="Railway Stations" variant="sidebar" :model-value="store.transport.showRailwayStations" @toggle="store.toggleRailwayStations()">
        <template #icon><span class="material-symbols-outlined">directions_railway</span></template>
      </ToggleRow>
      <ToggleRow label="Cycling Network" variant="sidebar" :model-value="store.transport.showCyclingNetwork" @toggle="store.toggleCyclingNetwork()">
        <template #icon><span class="material-symbols-outlined">pedal_bike</span></template>
      </ToggleRow>
      <ToggleRow label="Cycling Network (alt)" variant="sidebar" :model-value="store.transport.showCyclingNetworkAlt" @toggle="store.toggleCyclingNetworkAlt()">
        <template #icon><span class="material-symbols-outlined">pedal_bike</span></template>
      </ToggleRow>
      <ToggleRow label="Planned Cycling" variant="sidebar" :model-value="store.transport.showCyclingPlanned" @toggle="store.toggleCyclingPlanned()">
        <template #icon><span class="material-symbols-outlined">route</span></template>
      </ToggleRow>
    </div>
  </SidebarSection>
</template>

<script setup lang="ts">
import SidebarSection from '../SidebarSection.vue';
import ToggleRow from '../../ui/ToggleRow.vue';
import { useLayerStore } from '@/stores/layerStore';

const store = useLayerStore();
</script>

<style scoped>
.toggle-row-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
</style>
