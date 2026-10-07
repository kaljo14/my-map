<template>
  <section class="showcase reveal-section" ref="showcaseRef">
    <div class="showcase-inner">
      <div class="section-label">{{ t.showcase.label }}</div>
      <h2 class="section-title">{{ t.showcase.title }}</h2>
      <p class="section-sub">{{ t.showcase.sub }}</p>

      <!-- 3D Interactive Preview -->
      <div
        class="hero-visual"
        :class="{ visible: showcaseVisible }"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
        ref="heroVisual"
      >
        <div class="screenshot-3d" :style="screenshotStyle">
          <div class="float-badge badge-tl">
            <div class="fb-icon">
              <span class="material-symbols-outlined">content_cut</span>
            </div>
            <div class="fb-content">
              <div class="fb-value">366</div>
              <div class="fb-label">{{ t.map.barbershops }}</div>
            </div>
          </div>

          <div class="float-badge badge-tr">
            <div class="fb-icon score-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle
                  cx="7"
                  cy="7"
                  r="6"
                  stroke="#E27B35"
                  stroke-width="1.5"
                />
                <path
                  d="M4.5 7l2 2 3-3"
                  stroke="#E27B35"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="fb-content">
              <div class="fb-value amber">
                87<span class="fb-unit">/100</span>
              </div>
              <div class="fb-label">{{ t.map.locationScore }}</div>
            </div>
          </div>

          <div class="float-badge badge-br">
            <div class="fb-mini-chart">
              <div
                v-for="(h, i) in radarBars"
                :key="i"
                class="radar-bar"
                :style="{
                  width: h + '%',
                  background: i % 2 === 0 ? '#E27B35' : '#4a7fa8',
                }"
              ></div>
            </div>
            <div class="fb-label">{{ t.map.opportunityZones }}</div>
          </div>

          <div class="float-badge badge-bl">
            <div class="fb-dot-amber"></div>
            <div class="fb-content">
              <div class="fb-value">3</div>
              <div class="fb-label">{{ t.map.opportunityZones }}</div>
            </div>
          </div>

          <div class="app-screenshot-wrap">
            <div class="screenshot-chrome">
              <div class="chrome-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="map-url">lonctus.app/map &middot; Sofia Analysis</span>
            </div>
            <img
              src="/app-screenshot.png"
              alt="Lonctus map analysis showing Sofia with competitor density and location scoring"
              class="app-img"
              loading="eager"
            />
            <div class="screenshot-gloss"></div>
          </div>
        </div>
        <div class="visual-glow"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { LandingTranslations } from '@/composables/useLandingTranslations'

defineProps<{
  t: LandingTranslations
}>()

const heroVisual = ref<HTMLElement | null>(null)
const showcaseRef = ref<HTMLElement | null>(null)
const showcaseVisible = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const radarBars = [65, 87, 72, 54, 91]

const screenshotStyle = computed(() => ({
  transform: `perspective(1200px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg) scale3d(1,1,1)`,
  transition:
    tiltX.value === 0 && tiltY.value === 0
      ? 'transform 0.8s ease'
      : 'transform 0.15s ease',
}))

function onMouseMove(e: MouseEvent) {
  const el = heroVisual.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = (e.clientX - cx) / (rect.width / 2)
  const dy = (e.clientY - cy) / (rect.height / 2)
  tiltY.value = dx * 8
  tiltX.value = -dy * 5
}

function onMouseLeave() {
  tiltX.value = 0
  tiltY.value = 0
}

onMounted(() => {
  if (!showcaseRef.value) return
  new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) showcaseVisible.value = true
    },
    { threshold: 0.2 },
  ).observe(showcaseRef.value)
})
</script>

<style scoped>
.showcase {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
  background-color: var(--bg2);
  background-image:
    linear-gradient(
      to bottom,
      rgba(8, 9, 12, 0.82) 0%,
      rgba(8, 9, 12, 0.7) 50%,
      rgba(8, 9, 12, 0.82) 100%
    ),
    url('/ea-bg.png');
  background-size:
    auto 100%,
    auto 100%;
  background-repeat: repeat-x, repeat-x;
  background-position:
    center center,
    center center;
}
.showcase-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}
.showcase-inner .section-sub {
  margin-left: auto;
  margin-right: auto;
}

/* Section labels / titles (shared patterns) */
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

/* 3D Interactive Visual */
.hero-visual {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 1s ease 0.3s,
    transform 1s ease 0.3s;
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 48px auto 0;
}
.hero-visual.visible {
  opacity: 1;
  transform: none;
}
.screenshot-3d {
  transform-style: preserve-3d;
  will-change: transform;
}
.app-screenshot-wrap {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border2);
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.04);
  background: var(--surface);
}
.screenshot-chrome {
  background: var(--surface2);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
}
.chrome-dots {
  display: flex;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.red {
  background: #ff5f57;
}
.dot.yellow {
  background: #febc2e;
}
.dot.green {
  background: #28c840;
}
.map-url {
  font-size: 0.72rem;
  color: var(--text-3);
  letter-spacing: 0.01em;
}
.app-img {
  display: block;
  width: 100%;
  height: auto;
}
.screenshot-gloss {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 50%
  );
  pointer-events: none;
  border-radius: 10px;
}
.visual-glow {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 100px;
  background: radial-gradient(
    ellipse,
    rgba(226, 123, 53, 0.18) 0%,
    transparent 70%
  );
  pointer-events: none;
  filter: blur(20px);
}

/* Float badges */
.float-badge {
  position: absolute;
  background: rgba(13, 15, 20, 0.92);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(12px);
  z-index: 10;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: floatBadge 4s ease-in-out infinite;
}
.badge-tl {
  top: -14px;
  left: -20px;
  animation-delay: 0s;
}
.badge-tr {
  top: -14px;
  right: -20px;
  animation-delay: 0.8s;
}
.badge-br {
  bottom: 30px;
  right: -20px;
  animation-delay: 1.6s;
}
.badge-bl {
  bottom: 30px;
  left: -20px;
  animation-delay: 2.4s;
}
@keyframes floatBadge {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
.fb-icon {
  width: 28px;
  height: 28px;
  background: var(--surface2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--orange);
}
.fb-icon .material-symbols-outlined {
  font-size: 16px;
}
.score-icon {
  background: rgba(226, 123, 53, 0.1);
}
.fb-value {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
  line-height: 1;
}
.fb-value.amber {
  color: var(--orange);
}
.fb-unit {
  font-size: 0.65rem;
  font-weight: 400;
  color: var(--text-3);
}
.fb-label {
  font-size: 0.7rem;
  color: var(--text-3);
  margin-top: 2px;
  white-space: nowrap;
}
.fb-dot-amber {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--orange);
  flex-shrink: 0;
  box-shadow: 0 0 6px var(--orange);
}
.fb-mini-chart {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 60px;
}
.radar-bar {
  height: 4px;
  border-radius: 2px;
  transition: width 0.3s;
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
  .hero-visual {
    display: none;
  }
  .badge-tl,
  .badge-bl {
    left: -8px;
  }
  .badge-tr,
  .badge-br {
    right: -8px;
  }
}
@media (max-width: 600px) {
  .showcase {
    padding: 60px 20px;
  }
  .showcase-inner .section-sub {
    font-size: 0.875rem;
  }
}
</style>
