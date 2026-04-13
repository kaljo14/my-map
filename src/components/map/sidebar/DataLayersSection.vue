<template>
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
    <div class="toggle-row-group">
      <ToggleRow variant="sidebar" :label="$t('analysis.settings.enableClustering')" :model-value="enableClustering" @toggle="$emit('toggleClustering')">
        <template #icon>
          <span class="material-symbols-outlined">bubble_chart</span>
        </template>
      </ToggleRow>
    </div>
  </SidebarSection>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SidebarSection from '../SidebarSection.vue';
import ToggleRow from '../../ui/ToggleRow.vue';

const { t } = useI18n();

const props = defineProps<{
  placeTypes: Array<{ category: string; emoji: string; labelKey: string; visible: boolean }>;
  enableClustering: boolean;
  groceryTagFilters: string[];
}>();

defineEmits<{
  (e: 'togglePlaceType', category: string): void;
  (e: 'toggleClustering'): void;
  (e: 'toggleGroceryTagFilter', tag: string): void;
}>();

const isGroceryVisible = computed(() =>
  props.placeTypes.some(pt => pt.category === 'grocery store' && pt.visible)
);

const groceryTags = computed(() => [
  { value: 'big-chains', label: t('analysis.filters.groceryBigChains') },
  { value: 'lidl',       label: 'Lidl' },
  { value: 'kaufland',   label: 'Kaufland' },
  { value: 'billa',      label: 'Billa' },
  { value: 'fantastiko', label: 'Fantastico' },
]);
</script>

<style scoped>
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

.toggle-row-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
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
</style>
