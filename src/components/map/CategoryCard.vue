<template>
  <div class="category-card">
    <div class="category-header">
      <span class="material-symbols-outlined category-emoji">{{ category.emoji }}</span>
      <span class="category-name">{{ category.label }}</span>
      <span class="category-count">{{ category.count }}</span>
    </div>

    <div class="proportion-track">
      <div
        class="proportion-fill"
        :style="{ width: (category.count / totalCount * 100) + '%' }"
      ></div>
    </div>

    <div class="category-meta">
      <span v-if="category.avgRating > 0" class="meta-rating"><span class="material-symbols-outlined" style="font-size:10px;vertical-align:middle;line-height:1">star</span> {{ category.avgRating.toFixed(1) }} avg</span>
      <span class="meta-pct">{{ Math.round(category.count / totalCount * 100) }}% of area</span>
    </div>

    <div v-if="category.topPlaces.length > 0" class="top-places">
      <div
        v-for="place in category.topPlaces"
        :key="place.place_id ?? place.id"
        class="place-row"
      >
        <span class="place-name">{{ place.name }}</span>
        <span v-if="place.rating" class="place-rating"><span class="material-symbols-outlined" style="font-size:10px;vertical-align:middle;line-height:1">star</span> {{ place.rating.toFixed(1) }}</span>
      </div>
      <span v-if="category.count > category.topPlaces.length" class="places-more">
        +{{ category.count - category.topPlaces.length }} more
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Place } from '@/api/places';

interface CategoryStat {
  category: string;
  emoji: string;
  label: string;
  count: number;
  avgRating: number;
  topPlaces: Place[];
}

defineProps<{
  category: CategoryStat;
  totalCount: number;
}>();
</script>

<style scoped>
.category-card {
  background: rgba(245, 240, 232, 0.03);
  border: 1px solid rgba(245, 240, 232, 0.07);
  border-radius: 10px;
  padding: 10px 12px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.category-emoji {
  font-size: 18px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 240, 232, 0.05);
  border-radius: 7px;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-size: 0.8rem;
  font-weight: 600;
  color: #c4b8ae;
}

.category-count {
  font-size: 1.1rem;
  font-weight: 700;
  color: #d97757;
}

.proportion-track {
  height: 3px;
  background: rgba(245, 240, 232, 0.07);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.proportion-fill {
  height: 100%;
  background: #d97757;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.category-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: #5a5048;
  margin-bottom: 6px;
}

.meta-rating {
  color: #8a7e72;
}

.top-places {
  border-top: 1px solid rgba(245, 240, 232, 0.06);
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.place-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.place-name {
  font-size: 0.72rem;
  color: #8a7e72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.place-rating {
  font-size: 0.68rem;
  color: #d97757;
  flex-shrink: 0;
}

.places-more {
  font-size: 0.68rem;
  color: #5a5048;
  margin-top: 2px;
}
</style>
