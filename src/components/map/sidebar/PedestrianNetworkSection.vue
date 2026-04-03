<template>
  <SidebarSection title="Pedestrian Network" :default-open="false" icon="directions_walk">
    <div class="toggle-row-group">
      <ToggleRow
        label="Show All Layers"
        variant="sidebar"
        :model-value="store.pedestrianNetwork.showAnyPedestrianNetwork"
        @toggle="store.toggleAllPedestrianNetwork()"
      >
        <template #icon><span class="material-symbols-outlined">layers</span></template>
      </ToggleRow>
      <ToggleRow label="City Network" variant="sidebar" :model-value="store.pedestrianNetwork.showPedestrianCity" @toggle="store.togglePedestrianCity()">
        <template #icon><span class="material-symbols-outlined">directions_walk</span></template>
      </ToggleRow>
      <ToggleRow label="City Network (alt)" variant="sidebar" :model-value="store.pedestrianNetwork.showPedestrianCityAlt" @toggle="store.togglePedestrianCityAlt()">
        <template #icon><span class="material-symbols-outlined">directions_walk</span></template>
      </ToggleRow>
      <ToggleRow label="Municipality Network" variant="sidebar" :model-value="store.pedestrianNetwork.showPedestrianMunicipality" @toggle="store.togglePedestrianMunicipality()">
        <template #icon><span class="material-symbols-outlined">hiking</span></template>
      </ToggleRow>
      <ToggleRow label="Municipality Network (alt)" variant="sidebar" :model-value="store.pedestrianNetwork.showPedestrianMunicipalityAlt" @toggle="store.togglePedestrianMunicipalityAlt()">
        <template #icon><span class="material-symbols-outlined">hiking</span></template>
      </ToggleRow>
      <ToggleRow label="Segmented Network" variant="sidebar" :model-value="store.pedestrianNetwork.showPedestrianSegmented" @toggle="store.togglePedestrianSegmented()">
        <template #icon><span class="material-symbols-outlined">linear_scale</span></template>
      </ToggleRow>
      <ToggleRow label="Integration Zones" variant="sidebar" :model-value="store.pedestrianNetwork.showPedestrianIntegration" @toggle="store.togglePedestrianIntegration()">
        <template #icon><span class="material-symbols-outlined">blur_on</span></template>
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
