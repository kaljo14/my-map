<template>
  <div ref="rootEl" class="geocoding-search">
    <div class="search-input-wrapper">
      <span class="material-symbols-outlined search-icon">search</span>
      <input
        v-model="query"
        type="text"
        :placeholder="$t('search.placeholder')"
        @focus="isOpen = true"
        @keydown.escape="clearSearch"
      />
      <button v-if="query" class="clear-btn" @click="clearSearch">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <ul v-if="isOpen && results.length" class="results-dropdown">
      <li
        v-for="(result, i) in results"
        :key="`${result.lat},${result.lng},${i}`"
        @click="selectResult(result)"
      >
        <span class="material-symbols-outlined result-icon">location_on</span>
        <span class="result-text">{{ result.displayName }}</span>
      </li>
    </ul>
    <div v-if="isOpen && isLoading" class="results-dropdown loading-indicator">
      <span class="loading-text">{{ $t('common.loading') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, onMounted, onUnmounted } from 'vue';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useGeocoding } from '@/composables/useGeocoding';

const props = defineProps<{
  mapInstance: MapLibreMap | null;
}>();

const { query, results, isLoading, isOpen, selectResult, clearSearch } =
  useGeocoding(toRef(props, 'mapInstance'));

const rootEl = ref<HTMLElement | null>(null);

function onClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>

<style scoped>
.geocoding-search {
  position: absolute;
  top: 10px;
  right: 50px;
  z-index: 1000;
  width: 280px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(8, 9, 12, 0.92);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(245, 240, 232, 0.07);
  padding: 6px 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.search-icon {
  color: rgba(245, 240, 232, 0.5);
  font-size: 18px;
  flex-shrink: 0;
}

input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #f5f0e8;
  font-size: 13px;
  font-family: inherit;
  min-width: 0;
}

input::placeholder {
  color: rgba(245, 240, 232, 0.4);
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.clear-btn .material-symbols-outlined {
  font-size: 16px;
  color: rgba(245, 240, 232, 0.5);
}

.clear-btn:hover .material-symbols-outlined {
  color: #f5f0e8;
}

.results-dropdown {
  margin-top: 4px;
  background: rgba(8, 9, 12, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(245, 240, 232, 0.07);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  list-style: none;
  padding: 4px 0;
}

.results-dropdown li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: #f5f0e8;
  font-size: 13px;
  transition: background 0.15s;
}

.results-dropdown li:hover {
  background: rgba(245, 240, 232, 0.08);
}

.result-icon {
  color: #d97757;
  font-size: 16px;
  flex-shrink: 0;
}

.result-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-indicator {
  padding: 10px 12px;
}

.loading-text {
  color: rgba(245, 240, 232, 0.5);
  font-size: 13px;
}
</style>
