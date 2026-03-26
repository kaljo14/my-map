<template>
  <div class="pin-item">
    <div class="pin-index-dot" :class="`dot-${index}`">{{ index }}</div>
    <div class="pin-item-info">
      <span class="pin-item-label">{{ label }}</span>
      <span class="pin-item-coords">{{ lat.toFixed(4) }}, {{ lng.toFixed(4) }}</span>
    </div>
    <button class="pin-remove-btn" title="Remove pin" @click="$emit('remove')">×</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  index: number;
  label: string;
  lat: number;
  lng: number;
}>();

defineEmits<{
  (e: 'remove'): void;
}>();
</script>

<style scoped>
.pin-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px;
  border-radius: 8px;
  background: rgba(245, 240, 232, 0.03);
  border: 1px solid rgba(245, 240, 232, 0.06);
}

.pin-index-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dot-1 { background: rgba(217, 119, 87, 0.2);   color: #d97757; border: 1px solid rgba(217, 119, 87, 0.35); }
.dot-2 { background: rgba(16, 185, 129, 0.18);  color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.dot-3 { background: rgba(245, 158, 11, 0.18);  color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.dot-4 { background: rgba(192, 94, 58, 0.18);   color: #c05e3a; border: 1px solid rgba(192, 94, 58, 0.3); }
.dot-5 { background: rgba(196, 184, 174, 0.12); color: #c4b8ae; border: 1px solid rgba(196, 184, 174, 0.25); }

.pin-item-info {
  flex: 1;
  min-width: 0;
}

.pin-item-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #d4cfc8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pin-item-coords {
  display: block;
  font-size: 0.68rem;
  color: #5a5048;
  margin-top: 1px;
}

.pin-remove-btn {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1px solid rgba(245, 240, 232, 0.12);
  background: rgba(245, 240, 232, 0.06);
  color: #8a7e72;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1;
  padding: 0;
}

.pin-remove-btn:hover {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.35);
  color: #f87171;
}
</style>
