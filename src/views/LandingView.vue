<template>
  <div class="landing" :class="{ ready: isReady }">
    <!-- Grid overlay -->
    <div class="grid-overlay" aria-hidden="true"></div>

    <LandingNav
      :scrolled="scrolled"
      :lang="lang"
      :t="t"
      @toggle-lang="toggleLang"
    />

    <HeroSection :t="t" :is-ready="isReady" :scrolled="scrolled" />

    <StatsBar :t="t" />

    <ShowcaseSection :t="t" />

    <FeatureGrid :t="t" />

    <HowItWorksSection :t="t" />

    <QuoteSection :t="t" />

    <EarlyAccessForm :t="t" />

    <LandingFooter :t="t" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLandingTranslations } from '@/composables/useLandingTranslations'
import { useRevealAnimations } from '@/composables/useRevealAnimations'
import LandingNav from '@/components/landing/LandingNav.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import StatsBar from '@/components/landing/StatsBar.vue'
import ShowcaseSection from '@/components/landing/ShowcaseSection.vue'
import FeatureGrid from '@/components/landing/FeatureGrid.vue'
import HowItWorksSection from '@/components/landing/HowItWorksSection.vue'
import QuoteSection from '@/components/landing/QuoteSection.vue'
import EarlyAccessForm from '@/components/landing/EarlyAccessForm.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const { lang, t, toggleLang } = useLandingTranslations()
useRevealAnimations()

const isReady = ref(false)
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 60
}

onMounted(() => {
  requestAnimationFrame(() => {
    isReady.value = true
  })
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

/* Design tokens */
.landing {
  --bg: #08090c;
  --bg2: #0e1014;
  --surface: #13151a;
  --surface2: #1a1d24;
  --border: rgba(255, 255, 255, 0.06);
  --border2: rgba(255, 255, 255, 0.1);
  --orange: #e27b35;
  --orange-dim: rgba(226, 123, 53, 0.12);
  --orange-glow: rgba(226, 123, 53, 0.2);
  --charcoal: #3d4048;
  --text: #f0ede8;
  --text-2: #a8a49e;
  --text-3: #5c5955;
  --green: #3e8a5a;
  --blue: #3a7ec8;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.landing {
  min-height: 100vh;
  background: #08090c;
  color: #f0ede8;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

/* Grid overlay */
.grid-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(circle, rgba(226, 123, 53, 0.35) 1.5px, transparent 1.5px),
    linear-gradient(rgba(226, 123, 53, 0.1) 2px, transparent 2px),
    linear-gradient(90deg, rgba(226, 123, 53, 0.1) 2px, transparent 2px);
  background-size:
    88px 88px,
    88px 88px,
    88px 88px;
  mask-image: radial-gradient(
    ellipse 110% 90% at 50% 50%,
    black 20%,
    transparent 80%
  );
}

/* Reveal sections (shared animation) */
:deep(.reveal-section) {
  opacity: 0;
  transform: translateY(32px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}
:deep(.reveal-section.revealed) {
  opacity: 1;
  transform: none;
}
</style>
