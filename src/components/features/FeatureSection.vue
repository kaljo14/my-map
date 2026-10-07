<template>
  <section
    class="feature-section reveal-section"
    :class="[`section-${index}`, { reversed: index % 2 !== 0 }]"
  >
    <div class="section-inner">
      <!-- Visual side -->
      <div class="section-visual">
        <div class="visual-frame">
          <div class="frame-glow" :style="`--glow-hue: ${section.hue || 25}`"></div>
          <div class="visual-icon-grid">
            <span class="material-symbols-outlined main-icon">{{ section.icon }}</span>
          </div>
          <div class="visual-float-tags">
            <span
              v-for="(tag, ti) in section.tags"
              :key="ti"
              class="float-tag"
              :style="`--tag-i: ${ti}`"
            >
              <span class="material-symbols-outlined tag-icon">{{ tag.icon }}</span>
              {{ tag.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Content side -->
      <div class="section-content">
        <div class="section-label-line">
          <span class="section-number">0{{ index + 1 }}</span>
          <span class="section-label-text">{{ section.label }}</span>
        </div>
        <h2 class="section-title">{{ section.title }}</h2>
        <p class="section-desc">{{ section.description }}</p>

        <div class="capability-list">
          <div
            v-for="(cap, ci) in section.capabilities"
            :key="ci"
            class="capability-item"
          >
            <div class="cap-icon-wrap">
              <span class="material-symbols-outlined cap-icon">{{ cap.icon }}</span>
            </div>
            <div class="cap-body">
              <h4 class="cap-title">{{ cap.title }}</h4>
              <p class="cap-desc">{{ cap.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FeatureSectionData } from '@/composables/useFeaturesTranslations'

defineProps<{
  section: FeatureSectionData
  index: number
}>()
</script>

<style scoped>
.feature-section {
  padding: 80px 32px;
  scroll-margin-top: 140px;
}
.feature-section:nth-child(even) {
  background: rgba(255, 255, 255, 0.01);
}
.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}
.feature-section.reversed .section-inner {
  direction: rtl;
}
.feature-section.reversed .section-inner > * {
  direction: ltr;
}

/* Visual side */
.section-visual {
  position: sticky;
  top: 180px;
}
.visual-frame {
  position: relative;
  aspect-ratio: 1;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.frame-glow {
  position: absolute;
  top: -40%;
  left: -40%;
  width: 180%;
  height: 180%;
  background: radial-gradient(
    circle at 50% 50%,
    hsla(var(--glow-hue), 75%, 55%, 0.08) 0%,
    transparent 50%
  );
  pointer-events: none;
}
.visual-icon-grid {
  display: flex;
  align-items: center;
  justify-content: center;
}
.main-icon {
  font-size: 80px;
  color: var(--orange);
  opacity: 0.3;
  filter: drop-shadow(0 0 40px rgba(226, 123, 53, 0.25));
}
.visual-float-tags {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.float-tag {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface2);
  border: 1px solid var(--border2);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.72rem;
  color: var(--text-2);
  letter-spacing: 0.01em;
  opacity: 0;
  animation: tagFloat 0.6s ease forwards;
  animation-delay: calc(0.8s + var(--tag-i) * 0.15s);
}
.float-tag .tag-icon {
  font-size: 14px;
  color: var(--orange);
}
.float-tag:nth-child(1) { top: 16%; left: 8%; }
.float-tag:nth-child(2) { top: 12%; right: 8%; }
.float-tag:nth-child(3) { bottom: 18%; right: 10%; }
.float-tag:nth-child(4) { bottom: 14%; left: 6%; }

@keyframes tagFloat {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Content side */
.section-label-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.section-number {
  font-family: 'Syne', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--orange);
  background: var(--orange-dim);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  letter-spacing: 0.02em;
}
.section-label-text {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.section-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 16px;
  color: var(--text);
}
.section-desc {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-2);
  font-weight: 300;
  margin-bottom: 36px;
  max-width: 520px;
}

/* Capability list */
.capability-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.capability-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 10px;
  transition: background 0.2s;
}
.capability-item:hover {
  background: rgba(255, 255, 255, 0.02);
}
.cap-icon-wrap {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-top: 2px;
}
.cap-icon {
  font-size: 18px;
  color: var(--orange);
}
.cap-body { flex: 1; min-width: 0; }
.cap-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 4px;
  letter-spacing: 0;
}
.cap-desc {
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--text-3);
  font-weight: 300;
}

/* Reveal animation */
.reveal-section {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal-section.revealed {
  opacity: 1;
  transform: none;
}

@media (max-width: 900px) {
  .section-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .feature-section.reversed .section-inner {
    direction: ltr;
  }
  .section-visual {
    position: static;
  }
  .visual-frame {
    max-width: 100%;
    aspect-ratio: 16/9;
  }
  .feature-section {
    padding: 60px 20px;
  }
}

@media (max-width: 600px) {
  .capability-item {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
