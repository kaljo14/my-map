<template>
  <div style="display: none">
    <slot v-if="ready"></slot>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, ref, provide, nextTick, toRaw } from 'vue';
import L from 'leaflet';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
});

const ready = ref(false);
const leafletRef = ref<any>(null);

// Inject the parent map or layer group
// @vue-leaflet/vue-leaflet uses specific injection keys. 
// We'll try to find the map or a parent layer group.
const addLayer = inject('addLayer') as (layer: any) => void;
const removeLayer = inject('removeLayer') as (layer: any) => void;

// Create the marker cluster group
const markerClusterGroup = L.markerClusterGroup(props.options);

// Provide addLayer/removeLayer to children (markers)
// This allows children (l-marker) to add themselves to this cluster group
provide('addLayer', (layer: any) => {
  // IMPORTANT: Vue 3 proxies objects. Leaflet hates proxies.
  // We must use toRaw() to ensure we are passing the raw Leaflet layer to the cluster group.
  markerClusterGroup.addLayer(toRaw(layer));
});

provide('removeLayer', (layer: any) => {
  markerClusterGroup.removeLayer(toRaw(layer));
});

onMounted(async () => {
  // Wait for next tick to ensure parent is ready
  await nextTick();
  
  // Add this cluster group to the parent (map or layer group)
  if (addLayer) {
    addLayer(markerClusterGroup);
  }
  
  leafletRef.value = markerClusterGroup;
  ready.value = true;
});

onBeforeUnmount(() => {
  if (removeLayer) {
    removeLayer(markerClusterGroup);
  }
});

// Expose the leaflet object
defineExpose({
  leafletObject: markerClusterGroup,
});
</script>
