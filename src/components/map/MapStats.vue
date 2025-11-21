<template>
  <div class="map-stats" :class="{ 'notch': !isMobile }">
    <div class="stat-item">
      <span class="stat-label">{{ isMobile ? 'Shops:' : 'Total Barbershops:' }}</span>
      <span class="stat-value">{{ filteredCount }}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-label" v-if="!isMobile">Avg Rating:</span>
      <span class="stat-value">
        <span class="star">★</span>
        {{ averageRating.toFixed(1) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
  filteredCount: number;
  averageRating: number;
  isMobile: boolean;
}>();
</script>

<style scoped>
.map-stats {
  position: absolute;
  top: 16px; /* Slightly lower on mobile for better spacing */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  padding: 6px 14px; /* Reduced padding */
  border-radius: 100px; /* Pill shape */
  display: flex;
  align-items: center;
  gap: 12px; /* Reduced gap */
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(148, 163, 184, 0.2);
  z-index: 1000;
  pointer-events: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.map-stats.notch {
  top: 0;
  border-radius: 0 0 16px 16px;
  border-top: none;
  background: rgba(15, 23, 42, 0.95);
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
  font-size: 0.8rem; /* Smaller font */
  color: #cbd5e0;
  font-weight: 500;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-divider {
  width: 1px;
  height: 12px;
  background: rgba(148, 163, 184, 0.3);
}

.star {
  color: #f59e0b;
  font-size: 0.85rem;
}
</style>

