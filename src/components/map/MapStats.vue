<template>
  <div class="map-stats" :class="{ 'notch': !isMobile }">
    <StatItem inline :label="isMobile ? $t('stats.shops') : $t('stats.totalBarbershops')">
      {{ filteredCount }}
    </StatItem>
    <div class="stat-divider"></div>
    <StatItem inline :label="!isMobile ? $t('stats.avgRating') : undefined">
      <span class="material-symbols-outlined star">star</span>{{ averageRating.toFixed(1) }}
    </StatItem>
  </div>
</template>

<script setup lang="ts">
import StatItem from '@/components/ui/StatItem.vue';

defineProps<{
  filteredCount: number;
  averageRating: number;
  isMobile: boolean;
}>();
</script>

<style scoped>
.map-stats {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(22, 27, 22, 0.88);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f5f0e8;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(245, 240, 232, 0.1);
  z-index: 1000;
  pointer-events: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.map-stats.notch {
  top: 0;
  border-radius: 0 0 16px 16px;
  border-top: none;
  background: rgba(22, 27, 22, 0.96);
  padding: 8px 24px 10px 24px;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.stat-divider {
  width: 1px;
  height: 12px;
  background: rgba(245, 240, 232, 0.15);
}

.star {
  color: #d97757;
  font-size: 14px;
  line-height: 1;
  vertical-align: middle;
}
</style>

