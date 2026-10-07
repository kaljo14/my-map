<template>
  <footer class="footer">
    <span class="logo footer-logo">
      <img src="/log.png" alt="Lonctus" class="logo-img footer-logo-img" />
      <span class="logo-name">Lonctus</span>
    </span>
    <span class="footer-copy">{{ t.footer.copy }}</span>
    <RouterLink to="/map" class="footer-link">{{
      t.footer.openMap
    }}</RouterLink>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { LandingTranslations } from '@/composables/useLandingTranslations'

defineProps<{
  t: LandingTranslations
}>()
</script>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  padding: 32px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: default;
}
.logo-img {
  height: 48px;
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
.footer-logo {
  cursor: default;
}
.footer-logo-img {
  height: 48px;
}
.footer-copy {
  font-size: 0.8rem;
  color: var(--text-3);
}
.footer-link {
  font-size: 0.85rem;
  color: var(--text-2);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover {
  color: var(--orange);
}

@media (max-width: 600px) {
  .footer {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
    gap: 12px;
  }
}
</style>
