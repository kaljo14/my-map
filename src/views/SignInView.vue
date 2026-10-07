<template>
  <div class="signin-page">
    <div class="brand-panel">
      <div class="brand-content">
        <div class="logo">
          <img src="/log.png" alt="Lonctus" class="logo-img" />
          <span class="logo-text">Lonctus</span>
        </div>
        <p class="tagline">Visualize the city.<br />Find your next location.</p>
        <div class="decorative-grid" aria-hidden="true">
          <div v-for="i in 20" :key="i" class="grid-dot" />
        </div>
      </div>
    </div>

    <div class="form-panel">
      <SignIn
        routing="path"
        path="/sign-in"
        :fallback-redirect-url="'/map'"
        :appearance="{
          variables: {
            colorPrimary: '#d97757',
            colorBackground: '#111214',
            colorInputBackground: '#1a1b1e',
            colorInputText: '#f5f0e8',
            colorText: '#f5f0e8',
            colorTextSecondary: '#a89e94',
            colorNeutral: '#f5f0e8',
            borderRadius: '8px',
            fontFamily: '\'DM Sans\', sans-serif',
          },
          elements: {
            card: 'shadow-none border border-white/5',
            formButtonPrimary: 'bg-[#d97757] hover:bg-[#c86843]',
          },
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>

<style scoped>
.signin-page {
  min-height: 100vh;
  display: flex;
  background: #08090c;
}

/* ── Left branded panel ── */
.brand-panel {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #0f1015 0%, #1a1108 60%, #2a1a08 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse 60% 50% at 30% 40%,
      rgba(217, 119, 87, 0.18) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse 40% 60% at 80% 80%,
      rgba(217, 119, 87, 0.08) 0%,
      transparent 60%
    );
  pointer-events: none;
}

.brand-content {
  position: relative;
  z-index: 1;
  padding: 48px;
  max-width: 440px;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 48px;
}

.logo-img {
  height: 56px;
  width: auto;
  filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.3));
}

.logo-text {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 1.75rem;
  color: #f5f0e8;
  margin-left: 12px;
  letter-spacing: -0.01em;
}

.tagline {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  color: #f5f0e8;
  font-family: 'Syne', sans-serif;
  letter-spacing: -0.02em;
}

.tagline span {
  color: #d97757;
}

/* Decorative dot grid */
.decorative-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-top: 64px;
  opacity: 0.3;
}

.grid-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #d97757;
}

/* ── Right form panel ── */
.form-panel {
  width: 520px;
  flex-shrink: 0;
  background: #08090c;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  padding: 48px 40px;
}

/* ── Responsive: stack on small screens ── */
@media (max-width: 768px) {
  .signin-page {
    flex-direction: column;
  }

  .brand-panel {
    flex: none;
    padding: 40px 24px 32px;
    min-height: 200px;
  }

  .brand-content {
    padding: 0;
  }

  .tagline {
    font-size: 1.5rem;
  }

  .decorative-grid {
    display: none;
  }

  .form-panel {
    width: 100%;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding: 32px 24px;
  }
}
</style>
