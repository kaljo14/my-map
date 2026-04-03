<template>
  <footer class="footer">
    <span class="logo footer-logo">
      <img src="/log.png" alt="Lonctus" class="logo-img footer-logo-img" />
      <span class="logo-name">Lonctus</span>
    </span>
    <span class="footer-copy">{{ t.footer.copy }}</span>
    <RouterLink to="/map" class="footer-link">{{ t.footer.openMap }}</RouterLink>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { FeaturesTranslations } from '@/composables/useFeaturesTranslations'

defineProps<{
  t: FeaturesTranslations
}>()
</script>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid var(--border);
}
.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: default;
}
.footer-logo-img { height: 32px; }
.logo-img {
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
.footer-copy {
  font-size: 0.75rem;
  color: var(--text-3);
}
.footer-link {
  font-size: 0.8rem;
  color: var(--text-2);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover { color: var(--orange); }

@media (max-width: 600px) {
  .footer {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
