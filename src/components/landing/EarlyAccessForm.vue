<template>
  <section id="early-access" class="early-access reveal-section">
    <div class="ea-glow" aria-hidden="true"></div>
    <div class="ea-inner">
      <div class="section-label">{{ t.earlyAccess.label }}</div>
      <h2 class="ea-title">{{ t.earlyAccess.title }}</h2>
      <p class="ea-sub">{{ t.earlyAccess.sub }}</p>

      <form class="ea-form" @submit.prevent="handleSubmit" v-if="!submitted">
        <div class="ea-fields">
          <input
            v-model="form.name"
            type="text"
            :placeholder="t.earlyAccess.namePlaceholder"
            required
            class="ea-input"
          />
          <input
            v-model="form.email"
            type="email"
            :placeholder="t.earlyAccess.emailPlaceholder"
            required
            class="ea-input"
          />
          <select v-model="form.category" class="ea-input ea-select" required>
            <option value="" disabled>
              {{ t.earlyAccess.categoryPlaceholder }}
            </option>
            <option
              v-for="opt in t.earlyAccess.categories"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
        <button type="submit" class="btn-primary ea-btn">
          <span>{{ t.earlyAccess.submit }}</span>
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
        </button>
      </form>

      <div v-else class="submitted-state">
        <div class="submitted-icon">
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <p>{{ t.earlyAccess.submitted }}</p>
      </div>

      <p class="ea-fine">{{ t.earlyAccess.fine }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { LandingTranslations } from '@/composables/useLandingTranslations'

defineProps<{
  t: LandingTranslations
}>()

const submitted = ref(false)
const form = reactive({ name: '', email: '', category: '' })

function handleSubmit() {
  submitted.value = true
}
</script>

<style scoped>
.early-access {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
  background-image:
    linear-gradient(
      to bottom,
      rgba(8, 9, 12, 0.78) 0%,
      rgba(8, 9, 12, 0.6) 50%,
      rgba(8, 9, 12, 0.85) 100%
    ),
    url('/screen2.png');
  background-size: 110% auto;
  background-position: center 30%;
  background-repeat: no-repeat;
  overflow: hidden;
  animation: eaBgRise 22s ease-in-out infinite alternate;
}
@keyframes eaBgRise {
  0% {
    background-position: center 20%;
    background-size: 110% auto;
  }
  40% {
    background-position: center 40%;
    background-size: 114% auto;
  }
  70% {
    background-position: center 55%;
    background-size: 111% auto;
  }
  100% {
    background-position: center 70%;
    background-size: 110% auto;
  }
}
.early-access::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 60% at 50% 100%,
    rgba(226, 123, 53, 0.05) 0%,
    transparent 70%
  );
  pointer-events: none;
}
.ea-glow {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(
    ellipse,
    rgba(226, 123, 53, 0.08) 0%,
    transparent 70%
  );
  pointer-events: none;
  filter: blur(40px);
}
.ea-inner {
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

/* Section label */
.section-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--orange);
  margin-bottom: 16px;
}

.ea-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
  margin-bottom: 16px;
  line-height: 1.1;
}
.ea-sub {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-2);
  font-weight: 300;
  margin-bottom: 40px;
}
.ea-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ea-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ea-input {
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 12px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  -webkit-appearance: none;
}
.ea-input::placeholder {
  color: var(--text-3);
}
.ea-input:focus {
  border-color: var(--orange);
}
.ea-select {
  cursor: pointer;
  color: var(--text-2);
}
.ea-select option {
  background: #1a1d24;
  color: var(--text);
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
.ea-btn {
  width: 100%;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  padding: 16px 24px;
  letter-spacing: 0.02em;
  box-shadow:
    0 0 0 1px rgba(226, 123, 53, 0.4),
    0 4px 24px rgba(226, 123, 53, 0.35);
  border-radius: 6px;
}
.ea-btn:hover {
  box-shadow:
    0 0 0 1px rgba(226, 123, 53, 0.6),
    0 8px 32px rgba(226, 123, 53, 0.5);
  transform: translateY(-2px);
}
.ea-fine {
  margin-top: 16px;
  font-size: 0.75rem;
  color: var(--text-3);
  line-height: 1.5;
}
.submitted-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
}
.submitted-icon .material-symbols-outlined {
  font-size: 3rem;
  color: var(--green);
}
.submitted-state p {
  font-size: 1rem;
  color: var(--text-2);
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
  .early-access {
    background-size: cover;
    background-position: center 40%;
    animation: none;
  }
}
@media (max-width: 600px) {
  .early-access {
    padding: 60px 20px;
    background-size: cover;
    background-position: center 40%;
    animation: none;
  }
  .ea-inner {
    max-width: 100%;
  }
  .ea-glow {
    display: none;
  }
  .ea-title {
    font-size: clamp(1.6rem, 6vw, 2rem);
  }
  .ea-input {
    font-size: 1rem;
    padding: 14px 16px;
  }
  .ea-btn {
    padding: 15px 20px;
    font-size: 0.95rem;
  }
}
</style>
