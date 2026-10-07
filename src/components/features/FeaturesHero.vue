<template>
  <section class="hero">
    <div class="hero-inner" :class="{ ready }">
      <div class="hero-badge">
        <span class="badge-pulse"></span>
        {{ t.hero.badge }}
      </div>
      <h1 class="hero-title">
        <span class="title-muted">{{ t.hero.titleLine1 }}</span>
        <span class="title-accent">{{ t.hero.titleLine2 }}</span>
      </h1>
      <p class="hero-sub">{{ t.hero.sub }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FeaturesTranslations } from '@/composables/useFeaturesTranslations'

defineProps<{
  t: FeaturesTranslations
  ready: boolean
}>()
</script>

<style scoped>
.hero {
  position: relative;
  z-index: 1;
  padding: 160px 32px 60px;
  text-align: center;
}
.hero-inner {
  max-width: 800px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.hero-inner.ready {
  opacity: 1;
  transform: none;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border2);
  padding: 6px 14px 6px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  color: var(--text-2);
  letter-spacing: 0.02em;
  margin-bottom: 28px;
}
.badge-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--orange);
  box-shadow: 0 0 0 0 rgba(226, 123, 53, 0.4);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(226, 123, 53, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(226, 123, 53, 0); }
  100% { box-shadow: 0 0 0 0 rgba(226, 123, 53, 0); }
}
.hero-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
}
.title-muted {
  display: block;
  color: var(--text-3);
}
.title-accent {
  display: block;
  background: linear-gradient(135deg, #e27b35 0%, #f0a060 60%, #d46020 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-2);
  max-width: 600px;
  margin: 0 auto;
  font-weight: 300;
}

@media (max-width: 900px) {
  .hero {
    padding: 140px 20px 40px;
  }
}
</style>
