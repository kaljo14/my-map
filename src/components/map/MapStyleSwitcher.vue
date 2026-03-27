<template>
  <button
    class="dark-toggle"
    :title="isDarkMap ? 'Switch to light map' : 'Switch to dark map'"
    @click="toggle"
  >
    <span class="material-symbols-outlined" aria-hidden="true">{{ isDarkMap ? 'light_mode' : 'dark_mode' }}</span>
    <span class="label-text">{{ isDarkMap ? 'Light' : 'Dark' }}</span>
  </button>
</template>

<script setup lang="ts">
import { baseLayers, isDarkMap } from '@/stores/mapConfig';

const emit = defineEmits<{ switch: [name: string] }>();

function toggle() {
  const next = isDarkMap.value ? 'CARTO Light' : 'CARTO Dark';
  baseLayers.value.forEach(l => { l.visible = l.name === next; });
  emit('switch', next);
}
</script>

<style scoped>
.dark-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 7px;
  border: 1px solid rgba(245, 240, 232, 0.12);
  background: transparent;
  color: #8a7e72;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.dark-toggle:hover {
  background: rgba(245, 240, 232, 0.08);
  color: #c4b8ae;
  border-color: rgba(245, 240, 232, 0.2);
}

.dark-toggle .material-symbols-outlined {
  font-size: 14px;
  line-height: 1;
}
</style>
