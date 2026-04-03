<template>
  <nav class="nav" :class="{ scrolled }">
    <div class="nav-inner">
      <span class="logo">
        <img src="/log.png" alt="Lonctus logo" class="logo-img" />
        <span class="logo-name">Lonctus</span>
      </span>
      <div class="nav-links">
        <a href="#features">{{ t.nav.features }}</a>
        <a href="#how-it-works">{{ t.nav.howItWorks }}</a>
        <RouterLink to="/features" class="nav-link-all">{{
          lang === 'en' ? 'All Features' : 'Всички функции'
        }}</RouterLink>
        <button class="lang-toggle" @click="$emit('toggleLang')">
          {{ lang === 'en' ? 'БГ' : 'EN' }}
        </button>
        <a href="#early-access" class="nav-cta">{{ t.nav.cta }}</a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { LandingTranslations } from '@/composables/useLandingTranslations'

defineProps<{
  scrolled: boolean
  lang: string
  t: LandingTranslations
}>()

defineEmits<{
  toggleLang: []
}>()
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 32px;
  height: 80px;
  display: flex;
  align-items: center;
  transition:
    background 0.3s,
    border-color 0.3s,
    backdrop-filter 0.3s;
}
.nav.scrolled {
  background: rgba(8, 9, 12, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: default;
}
.logo-img {
  height: 64px;
  width: auto;
  filter: drop-shadow(0 0 6px rgba(226, 123, 53, 0.3));
}
.logo-name {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: -0.01em;
  color: var(--text);
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}
.nav-links a {
  text-decoration: none;
  color: var(--text-2);
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  transition: color 0.2s;
}
.nav-links a:hover {
  color: var(--text);
}
.lang-toggle {
  background: none;
  border: 1px solid var(--border2);
  color: var(--text-2);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-toggle:hover {
  border-color: var(--orange);
  color: var(--orange);
}
.nav-cta {
  background: var(--orange) !important;
  color: #08090c !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  letter-spacing: 0.04em;
  padding: 8px 18px;
  border-radius: 4px;
  transition:
    opacity 0.2s,
    transform 0.15s !important;
}
.nav-cta:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .nav {
    padding: 0 16px;
  }
  .nav-links a {
    display: none;
  }
}
</style>
