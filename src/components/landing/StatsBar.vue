<template>
  <section class="stats-bar" ref="statsRef">
    <div class="stats-inner">
      <div class="stat-item" v-for="s in statsDisplay" :key="s.label">
        <div class="stat-value">{{ s.display }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { LandingTranslations } from '@/composables/useLandingTranslations'

const props = defineProps<{
  t: LandingTranslations
}>()

const statsRef = ref<HTMLElement | null>(null)
const counters = ref([0, 0, 0])
let statsAnimated = false

function animateCounters() {
  if (statsAnimated) return
  statsAnimated = true
  const targets = [500, 3, 100]
  targets.forEach((target, i) => {
    const duration = 1800
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      counters.value[i] = Math.round(eased * target)
      if (progress < 1) requestAnimationFrame(tick)
    }
    setTimeout(() => requestAnimationFrame(tick), 200 + i * 150)
  })
}

const statsDisplay = computed(() => {
  const s = props.t.stats
  return [
    { display: counters.value[0] + '+', label: s.businesses },
    { display: counters.value[1] + '', label: s.metroLines },
    { display: counters.value[2] + '+', label: s.gridCells },
    { display: s.cityName, label: s.cityLabel },
  ]
})

onMounted(() => {
  if (!statsRef.value) return
  new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) animateCounters()
    },
    { threshold: 0.5 },
  ).observe(statsRef.value)
})
</script>

<style scoped>
.stats-bar {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.stats-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}
.stat-item {
  text-align: center;
}
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  color: var(--orange);
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}
.stat-label {
  font-size: 0.8rem;
  color: var(--text-3);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .stats-inner {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .stats-inner {
    grid-template-columns: repeat(2, 1fr);
    padding: 28px 20px;
    gap: 20px 16px;
  }
}
</style>
