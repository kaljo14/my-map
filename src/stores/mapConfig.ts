import { ref, computed } from 'vue';

export const baseLayers = ref([
  {
    name: 'Minimal Light',
    visible: true,
    url: 'https://tiles.openfreemap.org/styles/positron',
  },
  {
    name: 'Minimal Dark',
    visible: false,
    url: 'https://tiles.openfreemap.org/styles/dark',
  },
]);

export const isDarkMap = computed(() =>
  baseLayers.value.find(l => l.visible)?.name === 'Minimal Dark'
);
