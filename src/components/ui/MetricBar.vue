<template>
  <div class="metric-row">
    <span class="metric-label">{{ label }}</span>
    <div class="metric-bar-track">
      <div class="metric-bar-fill" :style="{ width: value + '%', background: barColor }"></div>
    </div>
    <span class="metric-value">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: number;
  color: string;
}>();

const barColor = computed(() => (props.value < 35 ? '#ef4444' : props.color));
</script>

<style scoped>
.metric-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-label {
  font-size: 0.7rem;
  color: #8a7e72;
  width: 105px;
  flex-shrink: 0;
}

.metric-bar-track {
  flex: 1;
  height: 4px;
  background: rgba(245, 240, 232, 0.07);
  border-radius: 2px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.metric-value {
  font-size: 0.7rem;
  color: #c4b8ae;
  width: 20px;
  text-align: right;
  flex-shrink: 0;
}
</style>
