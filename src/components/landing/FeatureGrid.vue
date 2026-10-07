<template>
  <section id="features" class="features reveal-section">
    <div class="features-inner">
      <div class="section-head">
        <div class="section-label">{{ t.features.label }}</div>
        <h2 class="section-title">{{ t.features.title }}</h2>
        <p class="section-sub">{{ t.features.sub }}</p>
      </div>
      <div class="feature-grid">
        <div
          class="feature-card"
          v-for="(f, i) in t.features.items"
          :key="f.title"
          :style="`--card-i: ${i}`"
          @mousemove="onCardMove($event, i)"
          @mouseleave="onCardLeave(i)"
          :ref="
            (el) => {
              if (el) featureCardRefs[i] = el as HTMLElement
            }
          "
        >
          <div class="fc-glow" :style="cardGlowStyles[i]"></div>
          <div class="feature-icon-wrap">
            <span class="material-symbols-outlined feature-icon">{{
              f.icon
            }}</span>
          </div>
          <div class="feature-body">
            <h3>{{ f.title }}</h3>
            <p>{{ f.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LandingTranslations } from '@/composables/useLandingTranslations'

defineProps<{
  t: LandingTranslations
}>()

const featureCardRefs = ref<HTMLElement[]>([])
const cardGlowStyles = ref<Record<number, string>>({})

function onCardMove(e: MouseEvent, i: number) {
  const card = featureCardRefs.value[i]
  if (!card) return
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  cardGlowStyles.value[i] =
    `background: radial-gradient(300px circle at ${x}px ${y}px, rgba(226,123,53,0.08) 0%, transparent 70%); opacity: 1;`
}

function onCardLeave(i: number) {
  cardGlowStyles.value[i] = 'opacity: 0;'
}
</script>

<style scoped>
.features {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
}
.features-inner {
  max-width: 1200px;
  margin: 0 auto;
}

/* Section labels / titles */
.section-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 16px;
}
.section-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
  line-height: 1.1;
  margin-bottom: 16px;
}
.section-sub {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-2);
  font-weight: 300;
  max-width: 560px;
  margin-bottom: 48px;
}
.section-head {
  text-align: center;
  margin-bottom: 60px;
}
.section-head .section-sub {
  margin: 0 auto;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.feature-card {
  background: var(--surface);
  padding: 32px 28px;
  position: relative;
  overflow: hidden;
  transition: background 0.3s;
  animation: fadeInCard 0.6s ease both;
  animation-delay: calc(var(--card-i) * 0.07s);
}
@keyframes fadeInCard {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.feature-card:hover {
  background: var(--surface2);
}
.fc-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  opacity: 0;
}
.feature-icon-wrap {
  width: 44px;
  height: 44px;
  background: var(--orange-dim);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px solid rgba(226, 123, 53, 0.15);
}
.feature-icon {
  font-size: 20px !important;
  color: var(--orange);
}
.feature-body h3 {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}
.feature-body p {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--text-2);
  font-weight: 300;
}

/* Material Symbols */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}

@media (max-width: 900px) {
  .feature-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 600px) {
  .features {
    padding: 60px 20px;
  }
  .feature-grid {
    grid-template-columns: 1fr;
  }
  .feature-card {
    padding: 24px 20px;
  }
  .section-head {
    margin-bottom: 40px;
  }
}
</style>
