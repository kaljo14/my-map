<template>
  <div class="map-stats" :class="{ 'notch': !isMobile }">
    <div class="stat-item">
      <span class="stat-label">{{ isMobile ? $t('stats.shops') : $t('stats.totalBarbershops') }}</span>
      <span class="stat-value">{{ filteredCount }}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-label" v-if="!isMobile">{{ $t('stats.avgRating') }}</span>
      <span class="stat-value">
        <span class="star">★</span>
        {{ averageRating.toFixed(1) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">


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

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: #8a7e72;
  font-weight: 500;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #f5f0e8;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-divider {
  width: 1px;
  height: 12px;
  background: rgba(245, 240, 232, 0.15);
}

.star {
  color: #d97757;
  font-size: 0.85rem;
}
</style>

