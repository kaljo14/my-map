<template>
  <SidebarSection title="Map Layers" :default-open="true" icon="layers">
    <div class="toggle-row-group">
      <ToggleRow
        label="Population Density"
        variant="sidebar"
        :model-value="store.population.showPopulationGrid"
        @toggle="store.togglePopulationGrid()"
      >
        <template #icon>
          <span class="material-symbols-outlined">group</span>
        </template>
      </ToggleRow>
      <div v-if="store.population.showPopulationGrid" class="layer-filter-inline">
        <span class="filter-inline-label">Density threshold</span>
        <div class="filter-inline-options">
          <button
            v-for="opt in densityOptions"
            :key="opt.value"
            :class="['filter-inline-btn', { selected: store.population.selectedThreshold === opt.value }]"
            @click="store.updateThreshold(opt.value)"
          >
            <span class="dot" :style="{ background: opt.color }"></span>
            {{ opt.label }}
          </button>
        </div>
      </div>

      <ToggleRow
        label="Analysis Grid"
        variant="sidebar"
        :model-value="store.analysisGrid.showAnalysisGrid"
        @toggle="store.toggleAnalysisGrid()"
      >
        <template #icon>
          <span class="material-symbols-outlined">grid_on</span>
        </template>
      </ToggleRow>

      <ToggleRow
        label="Retail Listings"
        variant="sidebar"
        :model-value="store.retailListings.showRetailListings"
        @toggle="store.toggleRetailListings()"
      >
        <template #icon>
          <span class="material-symbols-outlined">storefront</span>
        </template>
      </ToggleRow>

      <ToggleRow
        label="Address.bg Listings"
        variant="sidebar"
        :model-value="store.adresLocations.showAdresLocations"
        @toggle="store.toggleAdresLocations()"
      >
        <template #icon>
          <span class="material-symbols-outlined">real_estate_agent</span>
        </template>
      </ToggleRow>
      <div v-if="store.retailListings.showRetailListings && isAuthenticated" class="layer-action-inline">
        <button class="add-listing-btn" @click="$emit('startAddListing')">
          <span class="material-symbols-outlined" style="font-size:14px;line-height:1">add</span>
          Add Listing
        </button>
      </div>

      <ToggleRow
        label="Opportunity Heatmap"
        variant="sidebar"
        :model-value="store.opportunityHeatmap.showOpportunityHeatmap"
        @toggle="store.toggleOpportunityHeatmap()"
      >
        <template #icon>
          <span class="material-symbols-outlined">local_fire_department</span>
        </template>
      </ToggleRow>
      <div v-if="store.opportunityHeatmap.showOpportunityHeatmap" class="layer-filter-inline">
        <span class="filter-inline-label">Category</span>
        <div class="heatmap-pills">
          <button
            :class="['heatmap-pill', { active: store.opportunityHeatmap.activeCategory === 'barbershop' }]"
            @click="store.setHeatmapCategory('barbershop')"
          ><span class="material-symbols-outlined" style="font-size:14px;line-height:1">content_cut</span> Barbershop</button>
          <button
            :class="['heatmap-pill', { active: store.opportunityHeatmap.activeCategory === 'gym' }]"
            @click="store.setHeatmapCategory('gym')"
          ><span class="material-symbols-outlined" style="font-size:14px;line-height:1">fitness_center</span> Gym</button>
        </div>
      </div>
    </div>
  </SidebarSection>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SidebarSection from '../SidebarSection.vue';
import ToggleRow from '../../ui/ToggleRow.vue';
import { useLayerStore } from '@/stores/layerStore';
import { isAuthenticated } from '@/services/auth';

defineEmits<{
  (e: 'startAddListing'): void;
}>();

const { t } = useI18n();
const store = useLayerStore();

const densityOptions = computed(() => [
  { value: 0,     label: t('map.filters.allAreas'),       color: '#3288bd' },
  { value: 1000,  label: t('map.filters.residents1k'),    color: '#66c2a5' },
  { value: 5000,  label: t('map.filters.residents5k'),    color: '#abdda4' },
  { value: 10000, label: t('map.filters.residents10k'),   color: '#e6f598' },
  { value: 15000, label: t('map.filters.residents15k'),   color: '#fee08b' },
  { value: 20000, label: t('map.filters.residents20k'),   color: '#fdae61' },
  { value: 24000, label: t('map.filters.residents24k'),   color: '#f46d43' },
]);
</script>

<style scoped>
.toggle-row-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

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

.layer-action-inline {
  padding: 4px 10px 6px;
}

.add-listing-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 7px;
  border: 1px solid rgba(13, 148, 136, 0.35);
  background: rgba(13, 148, 136, 0.1);
  color: #0d9488;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.add-listing-btn:hover {
  background: rgba(13, 148, 136, 0.2);
  border-color: rgba(13, 148, 136, 0.5);
}
</style>
