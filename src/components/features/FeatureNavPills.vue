<template>
  <div class="feature-nav" :class="{ stuck: scrolled }">
    <div class="feature-nav-inner">
      <button
        v-for="(section, i) in sections"
        :key="i"
        class="feature-pill"
        :class="{ active: activeSection === i }"
        @click="$emit('scrollTo', i)"
      >
        <span class="material-symbols-outlined pill-icon">{{ section.icon }}</span>
        <span class="pill-label">{{ section.navLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeatureSectionData } from '@/composables/useFeaturesTranslations'

defineProps<{
  sections: FeatureSectionData[]
  activeSection: number
  scrolled: boolean
}>()

defineEmits<{
  scrollTo: [index: number]
}>()
</script>

<style scoped>
.feature-nav {
  position: sticky;
  top: 80px;
  z-index: 90;
  padding: 16px 32px;
  transition: background 0.3s;
}
.feature-nav.stuck {
  background: rgba(8, 9, 12, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
.feature-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 2px;
}
.feature-nav-inner::-webkit-scrollbar { display: none; }
.feature-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-3);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 100px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s;
  flex-shrink: 0;
}
.feature-pill:hover {
  border-color: var(--border2);
  color: var(--text-2);
}
.feature-pill.active {
  background: var(--orange-dim);
  border-color: rgba(226, 123, 53, 0.3);
  color: var(--orange);
}
.pill-icon {
  font-size: 16px;
}

@media (max-width: 600px) {
  .feature-nav-inner {
    gap: 4px;
  }
  .pill-label { display: none; }
  .feature-pill { padding: 6px 10px; }
}
</style>
