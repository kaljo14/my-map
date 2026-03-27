<template>
  <div class="area-panel">
    <PanelHeader icon="hexagon" title="Area Analysis" close-title="Clear selection" @close="$emit('clear')" />

    <!-- Summary bar -->
    <div class="summary-bar">
      <StatItem class="summary-stat" label="places in area">{{ totalCount }}</StatItem>
      <StatItem v-if="categoriesWithData.length > 0" class="summary-stat" label="categories">{{ categoriesWithData.length }}</StatItem>
      <StatItem v-if="overallAvgRating > 0" class="summary-stat" label="avg rating"><span class="material-symbols-outlined" style="font-size:12px;vertical-align:middle;line-height:1">star</span> {{ overallAvgRating.toFixed(1) }}</StatItem>
    </div>

    <!-- Empty state -->
    <div v-if="totalCount === 0" class="empty-state">
      <span class="material-symbols-outlined empty-icon">hexagon</span>
      <p>No visible places found in the selected area.</p>
      <p class="empty-hint">Try enabling more layers in the sidebar.</p>
    </div>

    <!-- Category breakdown -->
    <div v-else class="panel-body">
      <CategoryCard
        v-for="cat in categoriesWithData"
        :key="cat.category"
        :category="cat"
        :total-count="totalCount"
      />
    </div>

    <!-- Footer -->
    <div class="panel-footer">
      <button class="clear-btn" @click="$emit('clear')"><span class="material-symbols-outlined" style="font-size:16px;line-height:1">close</span> Clear Selection</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Place } from '@/api/places';
import CategoryCard from './CategoryCard.vue';
import PanelHeader from '@/components/ui/PanelHeader.vue';
import StatItem from '@/components/ui/StatItem.vue';

interface CategoryStat {
  category: string;
  emoji: string;
  label: string;
  count: number;
  avgRating: number;
  topPlaces: Place[];
}

const props = defineProps<{
  stats: CategoryStat[];
}>();

defineEmits<{
  (e: 'clear'): void;
}>();

const categoriesWithData = computed(() => props.stats.filter(s => s.count > 0));

const totalCount = computed(() => props.stats.reduce((sum, s) => sum + s.count, 0));

const overallAvgRating = computed(() => {
  const withRatings = props.stats.filter(s => s.avgRating > 0);
  if (!withRatings.length) return 0;
  return withRatings.reduce((sum, s) => sum + s.avgRating, 0) / withRatings.length;
});
</script>

<style scoped>
.area-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: 300px;
  z-index: 1500;
  background: rgba(22, 27, 22, 0.96);
  border: 1px solid rgba(245, 240, 232, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Summary bar */
.summary-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(245, 240, 232, 0.07);
  flex-shrink: 0;
}

.summary-bar {
  --stat-value-size: 1rem;
  --stat-value-color: #d97757;
  --stat-label-size: 0.62rem;
  --stat-label-color: #5a5048;
  --stat-label-transform: uppercase;
  --stat-label-spacing: 0.5px;
  --stat-label-gap: 3px;
}

.summary-stat {
  flex: 1;
  padding: 10px 6px;
  border-right: 1px solid rgba(245, 240, 232, 0.06);
}

.summary-stat:last-child {
  border-right: none;
}

/* Empty state */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 8px;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  color: #5a5048;
  margin-bottom: 4px;
}

.empty-state p {
  font-size: 0.8rem;
  color: #8a7e72;
  margin: 0;
  line-height: 1.4;
}

.empty-hint {
  color: #5a5048 !important;
  font-size: 0.72rem !important;
}

/* Body */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-body::-webkit-scrollbar { width: 4px; }
.panel-body::-webkit-scrollbar-track { background: transparent; }
.panel-body::-webkit-scrollbar-thumb {
  background: rgba(245, 240, 232, 0.12);
  border-radius: 2px;
}

/* Footer */
.panel-footer {
  padding: 10px;
  border-top: 1px solid rgba(245, 240, 232, 0.07);
  flex-shrink: 0;
}

.clear-btn {
  width: 100%;
  padding: 8px;
  border-radius: 9px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.5);
}
</style>
