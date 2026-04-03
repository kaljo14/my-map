<template>
  <SidebarSection title="SofiaPlan" :default-open="false" icon="location_city">
    <div class="toggle-row-group">
      <ToggleRow
        label="Show All Layers"
        variant="sidebar"
        :model-value="store.sofiaPlan.showAnySofiaPlan"
        @toggle="store.toggleAllSofiaPlan()"
      >
        <template #icon><span class="material-symbols-outlined">layers</span></template>
      </ToggleRow>
      <ToggleRow label="Urban Zoning" variant="sidebar" :model-value="store.sofiaPlan.showZoning" @toggle="store.toggleZoning()">
        <template #icon><span class="material-symbols-outlined">domain</span></template>
      </ToggleRow>
      <CheckboxGroup
        v-if="store.sofiaPlan.showZoning"
        :items="store.sofiaPlan.zoningCategoryItems"
        :checked-items="store.sofiaPlan.activeZoningCategories"
        @change="store.toggleZoningCategory($event)"
      />
      <ToggleRow label="Income Levels" variant="sidebar" :model-value="store.sofiaPlan.showIncome" @toggle="store.toggleIncome()">
        <template #icon><span class="material-symbols-outlined">payments</span></template>
      </ToggleRow>
      <ToggleRow label="Property Prices" variant="sidebar" :model-value="store.sofiaPlan.showPropertyPrices" @toggle="store.togglePropertyPrices()">
        <template #icon><span class="material-symbols-outlined">real_estate_agent</span></template>
      </ToggleRow>
      <ToggleRow label="Metro Catchments" variant="sidebar" :model-value="store.sofiaPlan.showMetroCatchments" @toggle="store.toggleMetroCatchments()">
        <template #icon><span class="material-symbols-outlined">train</span></template>
      </ToggleRow>
      <ToggleRow label="Pedestrian Syntax" variant="sidebar" :model-value="store.sofiaPlan.showPedestrianSyntax" @toggle="store.togglePedestrianSyntax()">
        <template #icon><span class="material-symbols-outlined">schema</span></template>
      </ToggleRow>
      <div v-if="store.sofiaPlan.showPedestrianSyntax" style="padding:6px 12px 10px 36px">
        <NeighborhoodPicker
          :neighborhoods="store.sofiaPlan.neighborhoodNames"
          :model-value="store.sofiaPlan.selectedPedestrianNeighborhoods"
          @update:model-value="store.selectPedestrianNeighborhood($event)"
          style="margin-bottom:8px"
        />
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:11px;color:#64748b">Min rank within neighbourhood</span>
          <span style="font-size:11px;font-weight:600;color:#f46d43">
            {{ store.sofiaPlan.pedestrianSyntaxThreshold === 0 ? 'All' : `top ${100 - store.sofiaPlan.pedestrianSyntaxThreshold}%` }}
          </span>
        </div>
        <input
          type="range"
          :min="0"
          :max="95"
          :step="5"
          :value="store.sofiaPlan.pedestrianSyntaxThreshold"
          @input="store.setPedestrianSyntaxThreshold(Number(($event.target as HTMLInputElement).value))"
          style="width:100%;accent-color:#f46d43"
        />
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:2px">
          <span>All streets</span>
          <span>Best only</span>
        </div>
      </div>
      <ToggleRow label="Population Density" variant="sidebar" :model-value="store.sofiaPlan.showSofiaPlanPopulation" @toggle="store.toggleSofiaPlanPopulation()">
        <template #icon><span class="material-symbols-outlined">group</span></template>
      </ToggleRow>
      <ToggleRow label="Business Turnover" variant="sidebar" :model-value="store.sofiaPlan.showBusinessTurnover" @toggle="store.toggleBusinessTurnover()">
        <template #icon><span class="material-symbols-outlined">storefront</span></template>
      </ToggleRow>
      <ToggleRow label="Development Potential" variant="sidebar" :model-value="store.sofiaPlan.showDevelopmentPotential" @toggle="store.toggleDevelopmentPotential()">
        <template #icon><span class="material-symbols-outlined">construction</span></template>
      </ToggleRow>
      <ToggleRow label="Zoning Parameters" variant="sidebar" :model-value="store.sofiaPlan.showZoningParams" @toggle="store.toggleZoningParams()">
        <template #icon><span class="material-symbols-outlined">rule</span></template>
      </ToggleRow>
      <ToggleRow label="Neighborhoods" variant="sidebar" :model-value="store.sofiaPlan.showNeighborhoods" @toggle="store.toggleNeighborhoods()">
        <template #icon><span class="material-symbols-outlined">location_city</span></template>
      </ToggleRow>
      <ToggleRow label="Census Addresses" variant="sidebar" :model-value="store.sofiaPlan.showCensusAddresses" @toggle="store.toggleCensusAddresses()">
        <template #icon><span class="material-symbols-outlined">home</span></template>
      </ToggleRow>
      <ToggleRow label="Demographic Forecast" variant="sidebar" :model-value="store.sofiaPlan.showDemographicForecast" @toggle="store.toggleDemographicForecast()">
        <template #icon><span class="material-symbols-outlined">trending_up</span></template>
      </ToggleRow>
      <ToggleRow label="Forecast (Planning Unit)" variant="sidebar" :model-value="store.sofiaPlan.showDemographicForecastGe" @toggle="store.toggleDemographicForecastGe()">
        <template #icon><span class="material-symbols-outlined">area_chart</span></template>
      </ToggleRow>
      <ToggleRow label="Population Potential" variant="sidebar" :model-value="store.sofiaPlan.showPopulationPotential" @toggle="store.togglePopulationPotential()">
        <template #icon><span class="material-symbols-outlined">groups</span></template>
      </ToggleRow>
      <ToggleRow label="Residential Load" variant="sidebar" :model-value="store.sofiaPlan.showResidentialLoad" @toggle="store.toggleResidentialLoad()">
        <template #icon><span class="material-symbols-outlined">apartment</span></template>
      </ToggleRow>
      <ToggleRow label="Health Service Concentration" variant="sidebar" :model-value="store.sofiaPlan.showHealthServiceConcentration" @toggle="store.toggleHealthServiceConcentration()">
        <template #icon><span class="material-symbols-outlined">medical_services</span></template>
      </ToggleRow>
      <ToggleRow label="Health Infrastructure Concentration" variant="sidebar" :model-value="store.sofiaPlan.showHealthInfrastructureConcentration" @toggle="store.toggleHealthInfrastructureConcentration()">
        <template #icon><span class="material-symbols-outlined">local_hospital</span></template>
      </ToggleRow>
      <div class="ge-subsection-header">
        Buildings & Morphology (Planning Unit)
      </div>
      <ToggleRow label="Building Density" variant="sidebar" :model-value="store.sofiaPlan.showBuildingDensityGe" @toggle="store.toggleBuildingDensityGe()">
        <template #icon><span class="material-symbols-outlined">density_medium</span></template>
      </ToggleRow>
      <ToggleRow label="Building Footprint" variant="sidebar" :model-value="store.sofiaPlan.showBuildingFootprintGe" @toggle="store.toggleBuildingFootprintGe()">
        <template #icon><span class="material-symbols-outlined">square_foot</span></template>
      </ToggleRow>
      <ToggleRow label="Residential Typology" variant="sidebar" :model-value="store.sofiaPlan.showResidentialTypologyGe" @toggle="store.toggleResidentialTypologyGe()">
        <template #icon><span class="material-symbols-outlined">holiday_village</span></template>
      </ToggleRow>
      <ToggleRow label="Urban Morphology" variant="sidebar" :model-value="store.sofiaPlan.showUrbanMorphologyGe" @toggle="store.toggleUrbanMorphologyGe()">
        <template #icon><span class="material-symbols-outlined">map</span></template>
      </ToggleRow>
    </div>
  </SidebarSection>
</template>

<script setup lang="ts">
import SidebarSection from '../SidebarSection.vue';
import ToggleRow from '../../ui/ToggleRow.vue';
import CheckboxGroup from '../../ui/CheckboxGroup.vue';
import NeighborhoodPicker from '../../ui/NeighborhoodPicker.vue';
import { useLayerStore } from '@/stores/layerStore';

const store = useLayerStore();
</script>

<style scoped>
.toggle-row-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ge-subsection-header {
  margin: 10px 0 6px 0;
  padding: 6px 0 4px 0;
  border-top: 1px solid rgba(245, 240, 232, 0.08);
  font-size: 10px;
  font-weight: 600;
  color: #8a7e72;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
