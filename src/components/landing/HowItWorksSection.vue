<template>
  <section id="how-it-works" class="how reveal-section">
    <div class="how-inner">
      <div class="how-header">
        <div class="section-label">{{ t.how.label }}</div>
        <h2 class="section-title how-title">{{ t.how.title }}</h2>
      </div>
      <div class="steps">
        <div
          class="step"
          v-for="(step, i) in t.how.steps"
          :key="i"
          :style="`--step-i:${i}`"
        >
          <div class="step-num-col">
            <div class="step-num-ring">
              <span class="step-num">0{{ i + 1 }}</span>
            </div>
            <div
              class="step-connector"
              v-if="i < t.how.steps.length - 1"
            ></div>
          </div>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </div>
        </div>
      </div>
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
.how {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
  background-image:
    linear-gradient(
      to bottom,
      rgba(8, 9, 12, 0.82) 0%,
      rgba(8, 9, 12, 0.7) 50%,
      rgba(8, 9, 12, 0.88) 100%
    ),
    url('/screen.png');
  background-size: 120% auto;
  background-position: center center;
  background-repeat: no-repeat;
  animation: howBgDrift 18s ease-in-out infinite alternate;
}
@keyframes howBgDrift {
  0% {
    background-position: 40% 45%;
    background-size: 120% auto;
  }
  33% {
    background-position: 55% 50%;
    background-size: 125% auto;
  }
  66% {
    background-position: 48% 55%;
    background-size: 122% auto;
  }
  100% {
    background-position: 43% 48%;
    background-size: 120% auto;
  }
}
.how-inner {
  max-width: 680px;
  margin: 0 auto;
}
.how-header {
  margin-bottom: 56px;
}
.how-title {
  max-width: 500px;
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

.steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.step {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 24px;
  animation: fadeInCard 0.6s ease both;
  animation-delay: calc(var(--step-i) * 0.15s);
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
.step-num-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step-num-ring {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border2);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.step-num {
  font-family: 'Syne', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--orange);
  letter-spacing: 0.04em;
}
.step-connector {
  width: 1px;
  flex: 1;
  min-height: 40px;
  background: linear-gradient(to bottom, var(--border2), transparent);
  margin: 8px 0;
}
.step-content {
  padding-bottom: 40px;
}
.step-content h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}
.step-content p {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-2);
  font-weight: 300;
}

@media (max-width: 900px) {
  .how {
    background-size: cover;
    background-position: center center;
    animation: none;
  }
}
@media (max-width: 600px) {
  .how {
    padding: 60px 20px;
    background-size: cover;
    background-position: center center;
    animation: none;
  }
  .how-inner {
    max-width: 100%;
  }
  .how-header {
    margin-bottom: 40px;
  }
}
</style>
