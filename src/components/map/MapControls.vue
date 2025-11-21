<template>
  <l-control position="topright" class="custom-control">
    <button 
      @click="$emit('toggleGrid')" 
      class="grid-toggle-btn"
      :class="{ active: showGrid }"
      title="Toggle Grid Layer"
    >
      <span class="icon">▦</span>
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
  border-radius: 4px;
  width: 34px; /* Match Leaflet control size */
  height: 34px;
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
}

.icon {
  font-size: 20px;
  color: #4a5568;
  font-weight: bold;
}
</style>
