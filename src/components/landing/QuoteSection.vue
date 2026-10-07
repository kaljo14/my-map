<template>
  <section class="quote-section reveal-section">
    <div class="quote-inner">
      <div class="quote-mark" aria-hidden="true">"</div>
      <blockquote>{{ t.quote.text }}</blockquote>
      <cite>{{ t.quote.author }}</cite>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingTranslations } from '@/composables/useLandingTranslations'

defineProps<{
  t: LandingTranslations
}>()
</script>

<style scoped>
.quote-section {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
  text-align: center;
}
.quote-inner {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
}
.quote-mark {
  font-family: 'Syne', sans-serif;
  line-height: 0.5;
  color: var(--orange-dim);
  margin-bottom: 24px;
  border: 1px solid rgba(226, 123, 53, 0.08);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 32px;
  background: var(--surface);
  color: var(--orange);
}
blockquote {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  font-style: italic;
  line-height: 1.6;
  color: var(--text);
  font-weight: 300;
  margin-bottom: 24px;
}
cite {
  font-size: 0.85rem;
  color: var(--text-3);
  font-style: normal;
  letter-spacing: 0.02em;
}

@media (max-width: 600px) {
  .quote-section {
    padding: 60px 20px;
  }
  blockquote {
    font-size: 1.05rem;
  }
}
</style>
