<template>
  <button
    class="dark-toggle"
    :title="isDarkMap ? 'Switch to light map' : 'Switch to dark map'"
    @click="toggle"
  >
    <span class="material-symbols-outlined">{{ isDarkMap ? 'light_mode' : 'dark_mode' }}</span>
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
  width: 50px;
  height: 50px;
  background: #f5f0e8;
  border: 1px solid #d5ccc0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(19, 19, 20, 0.12);
  transition: all 0.2s;
  color: #8a7e72;
  position: absolute;
  top: 120px;
  right: 10px;
  z-index: 1000;
}

.dark-toggle:hover {
  background: #ede7dc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(19, 19, 20, 0.16);
}

.dark-toggle .material-symbols-outlined {
  font-size: 24px;
  line-height: 1;
}
</style>
