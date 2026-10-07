<template>
  <section class="hero" @mousemove="onHeroMouseMove" @mouseleave="onHeroMouseLeave">
    <div class="hero-3d-stage" aria-hidden="true">
      <div class="hero-bg-parallax" :style="heroParallaxStyle">
        <div class="hero-bg-img"></div>
        <div class="hero-sheen"></div>
      </div>
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-inner">
      <div class="hero-text" :class="{ visible: isReady }">
        <div class="hero-badge">
          <span class="badge-pulse"></span>
          {{ t.hero.badge }}
        </div>

        <h1 class="hero-title">
          <span class="title-line-1">{{ t.hero.titleLine1 }}</span>
          <span class="title-line-2">
            <em class="title-em">{{ t.hero.titleLine2 }}</em>
          </span>
        </h1>

        <div class="hero-logo-wrap">
          <img src="/log.png" alt="Lonctus Graphic" class="hero-center-logo" />
        </div>

        <p class="hero-sub">{{ t.hero.sub }}</p>

        <div class="hero-actions">
          <a href="#early-access" class="btn-primary">
            <span>{{ t.hero.ctaPrimary }}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
          <RouterLink to="/map" class="btn-ghost">{{
            t.hero.ctaSecondary
          }}</RouterLink>
        </div>

        <div class="hero-meta">
          <span
            v-for="m in [t.hero.meta1, t.hero.meta2, t.hero.meta3]"
            :key="m"
            class="meta-item"
          >
            <span class="meta-check" aria-hidden="true">&#10003;</span>
            {{ m }}
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- Scroll indicator -->
  <div class="scroll-indicator" :class="{ hidden: scrolled }">
    <div class="scroll-line"></div>
    <span>Scroll</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { LandingTranslations } from '@/composables/useLandingTranslations'

defineProps<{
  t: LandingTranslations
  isReady: boolean
  scrolled: boolean
}>()

const heroMouseX = ref(0.5)
const heroMouseY = ref(0.5)
const heroIsHovered = ref(false)

const heroParallaxStyle = computed(() => {
  const rx = (heroMouseY.value - 0.5) * -10
  const ry = (heroMouseX.value - 0.5) * 14
  return {
    transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
    transition: heroIsHovered.value
      ? 'transform 0.12s ease-out'
      : 'transform 2s cubic-bezier(0.25,0.46,0.45,0.94)',
  }
})

function onHeroMouseMove(e: MouseEvent) {
  const section = e.currentTarget as HTMLElement
  const rect = section.getBoundingClientRect()
  heroMouseX.value = (e.clientX - rect.left) / rect.width
  heroMouseY.value = (e.clientY - rect.top) / rect.height
  heroIsHovered.value = true
}

function onHeroMouseLeave() {
  heroIsHovered.value = false
}
</script>

<style scoped>
.hero {
  position: relative;
  z-index: 1;
  padding: 140px 32px 80px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #08090c;
}
.hero > * {
  position: relative;
  z-index: 1;
}
.hero-3d-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
  perspective: 900px;
  perspective-origin: 50% 50%;
  overflow: hidden;
}
.hero-bg-parallax {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
}
.hero-bg-img {
  position: absolute;
  top: -8%;
  left: -8%;
  width: 116%;
  height: 116%;
  background-image: url('/Gemini_Generated_Image_ilploqilploqilpl.png');
  background-size: cover;
  background-position: center center;
  animation: heroBg3d 28s ease-in-out infinite;
  transform-origin: 50% 50%;
}
.hero-sheen {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    108deg,
    transparent 35%,
    rgba(255, 215, 140, 0.06) 48%,
    rgba(255, 235, 170, 0.1) 50%,
    rgba(255, 215, 140, 0.06) 52%,
    transparent 65%
  );
  animation: heroSheen 18s ease-in-out infinite;
  pointer-events: none;
}
@keyframes heroSheen {
  0% {
    opacity: 0;
    transform: translateX(-60%) skewX(-20deg);
  }
  5% {
    opacity: 1;
  }
  40% {
    opacity: 1;
    transform: translateX(60%) skewX(-20deg);
  }
  45% {
    opacity: 0;
    transform: translateX(60%) skewX(-20deg);
  }
  100% {
    opacity: 0;
    transform: translateX(-60%) skewX(-20deg);
  }
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to bottom,
      rgba(8, 9, 12, 0.68) 0%,
      rgba(8, 9, 12, 0.48) 45%,
      rgba(8, 9, 12, 0.75) 100%
    ),
    radial-gradient(
      ellipse at 30% 40%,
      rgba(226, 123, 53, 0.07) 0%,
      transparent 60%
    );
  pointer-events: none;
}
@keyframes heroBg3d {
  0% {
    transform: rotateX(4deg) rotateY(-3deg);
  }
  15% {
    transform: rotateX(1deg) rotateY(4deg);
  }
  35% {
    transform: rotateX(-3deg) rotateY(2deg);
  }
  55% {
    transform: rotateX(-2deg) rotateY(-4deg);
  }
  75% {
    transform: rotateX(3deg) rotateY(-1deg);
  }
  100% {
    transform: rotateX(4deg) rotateY(-3deg);
  }
}
.hero-inner {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.hero-text {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}
.hero-text.visible {
  opacity: 1;
  transform: none;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border2);
  padding: 6px 14px 6px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  color: var(--text-2);
  letter-spacing: 0.02em;
  margin-bottom: 28px;
}
.badge-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--orange);
  box-shadow: 0 0 0 0 rgba(226, 123, 53, 0.4);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(226, 123, 53, 0.5);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(226, 123, 53, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(226, 123, 53, 0);
  }
}
.hero-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(2.4rem, 4.5vw, 3.8rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
}
.title-line-1 {
  display: block;
  color: var(--text-3);
}
.title-line-2 {
  display: block;
}
.title-em {
  font-style: normal;
  background: linear-gradient(135deg, #e27b35 0%, #f0a060 60%, #d46020 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-logo-wrap {
  margin-bottom: 40px;
}
.hero-center-logo {
  height: 340px;
  width: auto;
  filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.4))
    drop-shadow(0 12px 24px rgba(226, 123, 53, 0.35));
}
.hero-sub {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-2);
  max-width: 520px;
  margin: 0 auto 36px;
  font-weight: 300;
  text-align: center;
}
.hero-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--orange);
  color: #08090c;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 60%
  );
  pointer-events: none;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(226, 123, 53, 0.35);
}
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  padding: 12px 22px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  transition:
    color 0.2s,
    border-color 0.2s,
    background 0.2s;
}
.btn-ghost:hover {
  color: var(--text);
  border-color: var(--orange);
  background: rgba(226, 123, 53, 0.08);
}
.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  justify-content: center;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-3);
}
.meta-check {
  color: var(--orange);
  font-size: 0.85rem;
}

/* Scroll indicator */
.scroll-indicator {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
  opacity: 1;
  transition: opacity 0.4s;
}
.scroll-indicator.hidden {
  opacity: 0;
  pointer-events: none;
}
.scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, var(--orange), transparent);
  animation: scrollDown 1.8s ease-in-out infinite;
}
@keyframes scrollDown {
  0% {
    transform: scaleY(0);
    transform-origin: top;
  }
  50% {
    transform: scaleY(1);
    transform-origin: top;
  }
  51% {
    transform: scaleY(1);
    transform-origin: bottom;
  }
  100% {
    transform: scaleY(0);
    transform-origin: bottom;
  }
}
.scroll-indicator span {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: var(--text-3);
  text-transform: uppercase;
}

@media (max-width: 600px) {
  .hero {
    padding: 88px 20px 56px;
    min-height: 100svh;
  }
  .hero-3d-stage {
    perspective: none;
  }
  .hero-bg-parallax {
    transform: none !important;
    transition: none !important;
    transform-style: flat;
  }
  .hero-bg-img {
    top: -4%;
    left: -4%;
    width: 108%;
    height: 108%;
    background-size: cover;
    background-position: center 30%;
    animation: heroBgMobilePan 26s ease-in-out infinite alternate;
  }
  .hero-sheen {
    display: none;
  }
  @keyframes heroBgMobilePan {
    0% {
      transform: translateY(0%) translateX(0%);
    }
    100% {
      transform: translateY(-2%) translateX(-1%);
    }
  }
  .hero-overlay {
    background: linear-gradient(
      to bottom,
      rgba(8, 9, 12, 0.8) 0%,
      rgba(8, 9, 12, 0.55) 45%,
      rgba(8, 9, 12, 0.85) 100%
    );
  }
  .hero-badge {
    margin-bottom: 18px;
  }
  .hero-title {
    font-size: clamp(1.9rem, 7.5vw, 2.6rem);
    margin-bottom: 20px;
  }
  .hero-sub {
    font-size: 0.875rem;
    margin-bottom: 28px;
  }
  .hero-center-logo {
    height: clamp(160px, 45vw, 260px);
  }
  .hero-logo-wrap {
    margin-bottom: 28px;
  }
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-bottom: 24px;
  }
  .btn-primary,
  .btn-ghost {
    justify-content: center;
    width: 100%;
  }
  .hero-meta {
    gap: 10px 20px;
  }
}
</style>
