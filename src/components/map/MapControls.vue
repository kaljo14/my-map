<template>
  <l-control position="topright" class="custom-control">
    <button 
      @click="$emit('toggleGrid')" 
      class="grid-toggle-btn"
      :class="{ active: showGrid }"
      title="Toggle Grid Layer"
    >
      <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3h18v18H3V3z" fill="none" stroke="currentColor" stroke-width="2"/>
        <!-- Choropleth regions with different opacities -->
        <path d="M5 5h6v6H5V5z" fill="currentColor" fill-opacity="0.2"/>
        <path d="M13 5h6v6h-6V5z" fill="currentColor" fill-opacity="0.6"/>
        <path d="M5 13h6v6H5v-6z" fill="currentColor" fill-opacity="0.8"/>
        <path d="M13 13h6v6h-6v-6z" fill="currentColor" fill-opacity="0.4"/>
      </svg>
    </button>
  </l-control>
</template>

<script setup lang="ts">
import { LControl } from "@vue-leaflet/vue-leaflet";
import { defineProps, defineEmits } from 'vue';

defineProps<{
  showGrid: boolean;
}>();

defineEmits<{
  (e: 'toggleGrid'): void;
}>();
</script>

<style scoped>
.custom-control {
  margin-right: 10px;
  margin-top: 10px;
}

.grid-toggle-btn {
  background-color: #fff;
  border: 2px solid rgba(0,0,0,0.2);
  background-clip: padding-box;
  border-radius: 5px;
  width: 50px; /* Slightly larger than standard */
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;
  box-shadow: 0 1px 5px rgba(0,0,0,0.65);
}

.grid-toggle-btn:hover {
  background-color: #f4f4f4;
}

.grid-toggle-btn.active {
  background-color: #e2e8f0;
  border-color: #6366f1;
}

.grid-toggle-btn.active .icon {
  color: #6366f1;
  fill: #6366f1;
}

.icon {
  width: 28px;
  height: 28px;
  color: #4a5568;
  fill: #4a5568;
}
</style>
