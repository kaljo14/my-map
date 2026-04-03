<template>
  <div class="features-page" :class="{ ready: isReady }">
    <!-- Grid overlay -->
    <div class="grid-overlay" aria-hidden="true"></div>

    <FeaturesNav
      :scrolled="scrolled"
      :lang="lang"
      :t="t"
      @toggle-lang="toggleLang"
    />

    <FeaturesHero :t="t" />

    <FeatureNavPills
      :sections="t.sections"
      :active-section="activeSection"
      :scrolled="scrolled"
      @scroll-to="scrollToSection"
    />

    <!-- Feature sections -->
    <div class="sections-wrap">
      <FeatureSection
        v-for="(section, i) in t.sections"
        :key="i"
        :ref="el => { if (el) sectionRefs[i] = (el as any).$el ?? (el as HTMLElement) }"
        :section="section"
        :index="i"
      />
    </div>

    <FeaturesCtaBand :t="t" />

    <FeaturesFooter :t="t" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFeaturesTranslations } from '@/composables/useFeaturesTranslations'
import { useRevealAnimations } from '@/composables/useRevealAnimations'
import FeaturesNav from '@/components/features/FeaturesNav.vue'
import FeaturesHero from '@/components/features/FeaturesHero.vue'
import FeatureNavPills from '@/components/features/FeatureNavPills.vue'
import FeatureSection from '@/components/features/FeatureSection.vue'
import FeaturesCtaBand from '@/components/features/FeaturesCtaBand.vue'
import FeaturesFooter from '@/components/features/FeaturesFooter.vue'

const { lang, t, toggleLang } = useFeaturesTranslations()
useRevealAnimations()

const isReady = ref(false)
const scrolled = ref(false)
const activeSection = ref(0)
const sectionRefs = ref<HTMLElement[]>([])

function scrollToSection(i: number) {
  const el = sectionRefs.value[i]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function onScroll() {
  scrolled.value = window.scrollY > 60

  let closest = 0
  let closestDist = Infinity
  sectionRefs.value.forEach((el, i) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dist = Math.abs(rect.top - 160)
    if (dist < closestDist) {
      closestDist = dist
      closest = i
    }
  })
  activeSection.value = closest
}

onMounted(() => {
  requestAnimationFrame(() => { isReady.value = true })
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

/* Design tokens */
.features-page {
  --bg: #08090c;
  --bg2: #0e1014;
  --surface: #13151a;
  --surface2: #1a1d24;
  --border: rgba(255, 255, 255, 0.06);
  --border2: rgba(255, 255, 255, 0.1);
  --orange: #e27b35;
  --orange-dim: rgba(226, 123, 53, 0.12);
  --orange-glow: rgba(226, 123, 53, 0.2);
  --text: #f0ede8;
  --text-2: #a8a49e;
  --text-3: #5c5955;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; }

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
  background-size: 88px 88px, 88px 88px, 88px 88px;
  mask-image: radial-gradient(ellipse 110% 90% at 50% 50%, black 20%, transparent 80%);
}

/* Sections wrap */
.sections-wrap {
  position: relative;
  z-index: 1;
  padding: 40px 0;
}
</style>
