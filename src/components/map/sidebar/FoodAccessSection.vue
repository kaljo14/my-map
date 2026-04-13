<template>
  <SidebarSection title="Food Access" icon="local_grocery_store">
    <div class="toggle-row-group">
      <ToggleRow
        label="Grocery Chain Density"
        variant="sidebar"
        :model-value="store.foodDesert.showGroceryDesert"
        @toggle="store.toggleGroceryDesert()"
      >
        <template #icon>
          <span class="material-symbols-outlined">shopping_cart</span>
        </template>
      </ToggleRow>
      <div v-if="store.foodDesert.showGroceryDesert" class="layer-description">
        <div class="legend-bar"></div>
        <div class="legend-labels">
          <span>Underserved</span>
          <span>Well served</span>
        </div>
        <p>
          Population per chain store within 3 km. Only the
          <strong>Billa, Lidl, Kaufland, Fantastico</strong> locations from your database.
          Red = many people per store (opportunity). Green = well served.
        </p>
      </div>
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

.layer-description {
  margin: 4px 0 8px 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(245, 240, 232, 0.04);
  border: 1px solid rgba(245, 240, 232, 0.06);
}

.legend-bar {
  height: 7px;
  border-radius: 4px;
  background: linear-gradient(to right, #d00000, #ff6d00, #ffc300, #aacc00, #55a630, #2b9348);
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 3px;
  margin-bottom: 8px;
}

.layer-description p {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: #8a7e72;
}

.layer-description strong {
  color: #c4b8ae;
}
</style>
