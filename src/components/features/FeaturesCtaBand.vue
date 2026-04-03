<template>
  <section class="cta-band reveal-section">
    <div class="cta-inner">
      <h2 class="cta-title">{{ t.cta.title }}</h2>
      <p class="cta-sub">{{ t.cta.sub }}</p>
      <div class="cta-actions">
        <RouterLink to="/map" class="btn-primary">
          <span>{{ t.cta.primary }}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </RouterLink>
        <RouterLink to="/" class="btn-ghost">{{ t.cta.secondary }}</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { FeaturesTranslations } from '@/composables/useFeaturesTranslations'

defineProps<{
  t: FeaturesTranslations
}>()
</script>

<style scoped>
.cta-band {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
  text-align: center;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.cta-inner {
  max-width: 600px;
  margin: 0 auto;
}
.cta-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}
.cta-sub {
  font-size: 1rem;
  color: var(--text-2);
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 32px;
}
.cta-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--orange);
  color: #08090c;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(226, 123, 53, 0.35);
}
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 400;
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 4px;
  border: 1px solid var(--border2);
  transition: all 0.2s;
}
.btn-ghost:hover {
  border-color: var(--text-3);
  background: rgba(255,255,255,0.03);
}

/* Reveal animation */
.reveal-section {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal-section:global(.revealed) {
  opacity: 1;
  transform: none;
}
</style>
