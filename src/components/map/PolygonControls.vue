<template>
  <div v-if="isDrawingMode || hasActivePolygon" class="polygon-controls">
    <template v-if="isDrawingMode">
      <span class="drawing-hint">{{ vertexCount }} point{{ vertexCount !== 1 ? 's' : '' }} — click map to add</span>
      <button
        class="polygon-btn finish"
        :disabled="vertexCount < 3"
        @click="$emit('finish')"
      ><span class="material-symbols-outlined" style="font-size:15px;line-height:1">check</span> Finish</button>
      <button class="polygon-btn cancel" @click="$emit('clear')"><span class="material-symbols-outlined" style="font-size:15px;line-height:1">close</span> Cancel</button>
    </template>
    <template v-else-if="hasActivePolygon">
      <span class="polygon-count"><span class="material-symbols-outlined" style="font-size:14px;line-height:1;vertical-align:middle">hexagon</span> {{ filteredCount }} in area</span>
      <button class="polygon-btn clear" @click="$emit('clear')"><span class="material-symbols-outlined" style="font-size:15px;line-height:1">close</span> Clear</button>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isDrawingMode: boolean;
  hasActivePolygon: boolean;
  vertexCount: number;
  filteredCount: number;
}>();

defineEmits<{
  finish: [];
  clear: [];
}>();
</script>

<style scoped>
.polygon-controls {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(22, 27, 22, 0.92);
  border: 1px solid rgba(245, 240, 232, 0.14);
  border-radius: 12px;
  padding: 8px 14px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.polygon-btn {
  background: rgba(245, 240, 232, 0.08);
  border: 1px solid rgba(245, 240, 232, 0.16);
  border-radius: 8px;
  color: #d4cfc8;
  font-size: 13px;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.polygon-btn:hover:not(:disabled) {
  background: rgba(245, 240, 232, 0.14);
  color: #f5f0e8;
}

.polygon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.polygon-btn.finish {
  border-color: rgba(16, 185, 129, 0.5);
  color: #10b981;
}

.polygon-btn.finish:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.15);
}

.polygon-btn.cancel,
.polygon-btn.clear {
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.polygon-btn.cancel:hover,
.polygon-btn.clear:hover {
  background: rgba(239, 68, 68, 0.12);
}

.drawing-hint {
  font-size: 12px;
  color: #f59e0b;
  white-space: nowrap;
}

.polygon-count {
  font-size: 12px;
  color: #10b981;
  white-space: nowrap;
}
</style>
