<template>
  <div class="landing" :class="{ ready: isReady }">

    <!-- ── Ambient background ── -->
    <div class="ambient-bg" aria-hidden="true">
      <div class="topo-rings">
        <span v-for="i in 8" :key="i" class="ring" :style="`--i:${i}`"></span>
      </div>
      <div class="grain"></div>
    </div>

    <!-- ── Nav ── -->
    <nav class="nav">
      <div class="nav-inner">
        <span class="logo">
          <span class="logo-pin">◉</span>
          PinPoint
        </span>
        <div class="nav-links">
          <a href="#features">{{ t.nav.features }}</a>
          <a href="#how-it-works">{{ t.nav.howItWorks }}</a>
          <button class="lang-toggle" @click="toggleLang">
            {{ lang === 'en' ? 'БГ' : 'EN' }}
          </button>
          <a href="#early-access" class="nav-cta">{{ t.nav.cta }}</a>
        </div>
      </div>
    </nav>

    <!-- ── Hero ── -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          {{ t.hero.badge }}
        </div>

        <h1 class="hero-title">
          <span class="title-line title-line-1">{{ t.hero.titleLine1 }}</span>
          <span class="title-line title-line-2">
            <em class="title-em">{{ t.hero.titleLine2 }}</em>
          </span>
        </h1>

        <p class="hero-sub">{{ t.hero.sub }}</p>

        <div class="hero-actions">
          <a href="#early-access" class="btn-primary">
            <span>{{ t.hero.ctaPrimary }}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <RouterLink to="/map" class="btn-ghost">{{ t.hero.ctaSecondary }}</RouterLink>
        </div>

        <div class="hero-meta">
          <span v-for="m in [t.hero.meta1, t.hero.meta2, t.hero.meta3]" :key="m" class="meta-item">
            <span class="meta-check" aria-hidden="true">✓</span>
            {{ m }}
          </span>
        </div>
      </div>

      <!-- ── Map preview ── -->
      <div class="map-preview-wrap">
        <div class="map-preview">
          <div class="map-chrome">
            <div class="chrome-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <span class="map-url">pinpoint.app/map</span>
            <div class="chrome-controls">
              <span class="ctrl-pill"></span>
              <span class="ctrl-pill"></span>
            </div>
          </div>
          <div class="map-screen">
            <div class="map-base-layer"></div>
            <div class="map-grid-layer"></div>
            <!-- Heat cells -->
            <div class="heat-cell" v-for="h in heatCells" :key="h.id"
              :style="{ top: h.top, left: h.left, width: h.w, height: h.h, opacity: h.opacity, background: h.color }">
            </div>
            <!-- Animated dots -->
            <span v-for="d in mapDots" :key="d.id" class="map-dot"
              :style="{ top: d.top, left: d.left, '--delay': d.delay, '--size': d.size }">
            </span>
            <!-- Metro line SVG -->
            <svg class="metro-svg" viewBox="0 0 800 340" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 0 180 Q 200 140 400 160 Q 600 180 800 150" stroke="#d97757" stroke-width="2.5" fill="none" opacity="0.6" stroke-dasharray="6 4"/>
              <path d="M 0 240 Q 150 210 300 220 Q 500 235 800 200" stroke="#6ba8d4" stroke-width="2" fill="none" opacity="0.45" stroke-dasharray="5 3"/>
            </svg>
            <!-- Overlay pills -->
            <div class="overlay-pill pill-tl">
              <span class="pill-icon">💈</span>
              <span>24 {{ t.map.barbershops }}</span>
            </div>
            <div class="overlay-pill pill-tr">
              <span class="pill-icon">💪</span>
              <span>11 {{ t.map.gyms }}</span>
            </div>
            <div class="overlay-pill pill-bl analysis-pill">
              <span class="pill-dot"></span>
              <span>3 {{ t.map.opportunityZones }}</span>
            </div>
            <!-- Cursor indicator -->
            <div class="map-cursor">
              <div class="cursor-ring"></div>
              <div class="cursor-dot"></div>
            </div>
          </div>
        </div>
        <!-- Glow beneath map -->
        <div class="map-glow" aria-hidden="true"></div>
      </div>
    </section>

    <!-- ── Stats ── -->
    <section class="stats-bar">
      <div class="stats-inner">
        <StatItem v-for="s in statsDisplay" :key="s.label" class="stat" :label="s.label">
          {{ s.display }}
        </StatItem>
      </div>
    </section>

    <!-- ── Features ── -->
    <section id="features" class="features">
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
          >
            <div class="feature-icon-wrap">
              <span class="feature-icon">{{ f.icon }}</span>
            </div>
            <div class="feature-body">
              <h3>{{ f.title }}</h3>
              <p>{{ f.body }}</p>
            </div>
            <div class="card-glow"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── How it works ── -->
    <section id="how-it-works" class="how">
      <div class="how-inner">
        <div class="section-label">{{ t.how.label }}</div>
        <h2 class="section-title how-title">{{ t.how.title }}</h2>
        <div class="steps">
          <div class="step" v-for="(step, i) in t.how.steps" :key="i" :style="`--step-i:${i}`">
            <div class="step-num-wrap">
              <span class="step-num">0{{ i + 1 }}</span>
              <div class="step-line" v-if="i < t.how.steps.length - 1"></div>
            </div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Quote ── -->
    <section class="quote-section">
      <div class="quote-inner">
        <div class="quote-mark" aria-hidden="true">"</div>
        <blockquote>{{ t.quote.text }}</blockquote>
        <cite>{{ t.quote.author }}</cite>
      </div>
    </section>

    <!-- ── Early Access ── -->
    <section id="early-access" class="early-access">
      <div class="ea-glow" aria-hidden="true"></div>
      <div class="ea-inner">
        <div class="section-label">{{ t.earlyAccess.label }}</div>
        <h2 class="ea-title">{{ t.earlyAccess.title }}</h2>
        <p class="ea-sub">{{ t.earlyAccess.sub }}</p>

        <form class="ea-form" @submit.prevent="handleSubmit" v-if="!submitted">
          <div class="ea-fields">
            <input v-model="form.name" type="text" :placeholder="t.earlyAccess.namePlaceholder" required class="ea-input" />
            <input v-model="form.email" type="email" :placeholder="t.earlyAccess.emailPlaceholder" required class="ea-input" />
            <select v-model="form.category" class="ea-input ea-select" required>
              <option value="" disabled>{{ t.earlyAccess.categoryPlaceholder }}</option>
              <option v-for="opt in t.earlyAccess.categories" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <button type="submit" class="btn-primary ea-btn">
            <span>{{ t.earlyAccess.submit }}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </form>

        <div v-else class="submitted-state">
          <div class="submitted-icon">✓</div>
          <p>{{ t.earlyAccess.submitted }}</p>
        </div>

        <p class="ea-fine">{{ t.earlyAccess.fine }}</p>
      </div>
    </section>

    <!-- ── Footer ── -->
    <footer class="footer">
      <span class="logo footer-logo">
        <span class="logo-pin">◉</span>
        PinPoint
      </span>
      <span class="footer-copy">{{ t.footer.copy }}</span>
      <RouterLink to="/map" class="footer-link">{{ t.footer.openMap }}</RouterLink>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import StatItem from '@/components/ui/StatItem.vue'

const lang = ref<'en' | 'bg'>('en')
const submitted = ref(false)
const isReady = ref(false)
const form = reactive({ name: '', email: '', category: '' })

function toggleLang() {
  lang.value = lang.value === 'en' ? 'bg' : 'en'
}

function handleSubmit() {
  submitted.value = true
}

onMounted(() => {
  requestAnimationFrame(() => { isReady.value = true })
})

// Map dots
const mapDots = [
  { id: 1,  top: '18%', left: '22%', delay: '0s',    size: '28px' },
  { id: 2,  top: '32%', left: '55%', delay: '0.4s',  size: '22px' },
  { id: 3,  top: '48%', left: '38%', delay: '0.8s',  size: '32px' },
  { id: 4,  top: '62%', left: '70%', delay: '1.2s',  size: '26px' },
  { id: 5,  top: '25%', left: '78%', delay: '0.6s',  size: '20px' },
  { id: 6,  top: '72%', left: '25%', delay: '1.0s',  size: '24px' },
  { id: 7,  top: '15%', left: '48%', delay: '0.2s',  size: '18px' },
  { id: 8,  top: '55%', left: '12%', delay: '1.4s',  size: '30px' },
  { id: 9,  top: '38%', left: '85%', delay: '0.5s',  size: '22px' },
  { id: 10, top: '80%', left: '50%', delay: '0.9s',  size: '26px' },
  { id: 11, top: '42%', left: '62%', delay: '0.3s',  size: '20px' },
  { id: 12, top: '20%', left: '65%', delay: '1.1s',  size: '16px' },
  { id: 13, top: '68%', left: '42%', delay: '0.7s',  size: '28px' },
  { id: 14, top: '30%', left: '32%', delay: '1.3s',  size: '22px' },
]

const heatCells = [
  { id: 1, top: '10%', left: '15%', w: '22%', h: '30%', opacity: 0.12, color: '#d97757' },
  { id: 2, top: '20%', left: '45%', w: '18%', h: '25%', opacity: 0.18, color: '#d97757' },
  { id: 3, top: '45%', left: '60%', w: '25%', h: '35%', opacity: 0.08, color: '#6ba8d4' },
  { id: 4, top: '55%', left: '10%', w: '20%', h: '28%', opacity: 0.14, color: '#5ea87a' },
  { id: 5, top: '5%',  left: '65%', w: '15%', h: '22%', opacity: 0.1,  color: '#d97757' },
]

const counters = ref([0, 0, 0, 0])

const translations = {
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How it works',
      cta: 'Get Early Access',
    },
    hero: {
      badge: 'Business Location Intelligence',
      titleLine1: 'Stop guessing.',
      titleLine2: 'Find where your business wins.',
      sub: 'PinPoint overlays competitor density, population data, and transit accessibility on one interactive map — so you can pick locations backed by data, not instinct.',
      ctaPrimary: 'Register for Early Access',
      ctaSecondary: 'See Live Demo →',
      meta1: 'No credit card required',
      meta2: 'Free during beta',
      meta3: 'Built for Sofia — expanding everywhere',
    },
    map: {
      barbershops: 'barbershops',
      gyms: 'gyms',
      opportunityZones: 'opportunity zones',
    },
    stats: {
      businesses: 'Businesses mapped',
      metroLines: 'Metro lines analyzed',
      gridCells: 'Population grid cells',
      cityName: 'Sofia',
      cityLabel: 'City covered, more coming',
    },
    features: {
      label: 'What you get',
      title: 'Everything you need to pick the right spot',
      sub: 'Most entrepreneurs rely on gut feel and walking around. PinPoint gives you the data layer that was always missing.',
      items: [
        { icon: '🗺️', title: 'Competitor Mapping', body: 'See every business in your category plotted on a live map. Instantly spot saturated areas and underserved neighbourhoods.' },
        { icon: '👥', title: 'Population Density Overlay', body: 'Overlay census-derived population grids to understand where your potential customers actually live — not just where real estate is cheap.' },
        { icon: '🚇', title: 'Transit Accessibility', body: 'Visualise metro lines and stops to gauge foot traffic potential. High-transit corridors mean more walk-ins, not just residents.' },
        { icon: '🟢', title: 'Opportunity Zone Analysis', body: 'The analysis grid cross-references competitor density against population to surface zones where demand outstrips supply.' },
        { icon: '🔍', title: 'Smart Filtering', body: 'Filter competitors by services offered, ratings, and more. Narrow down to exactly who you\'re competing against — or who you\'re not.' },
        { icon: '📍', title: 'Pin & Compare', body: 'Drop candidate locations directly on the map and compare their data profiles side-by-side before committing to a lease or investment.' },
      ],
    },
    how: {
      label: 'Process',
      title: 'From blank map to confident decision in minutes',
      steps: [
        { title: 'Choose your category', body: 'Tell PinPoint what kind of business you\'re opening. We load the relevant competitor dataset automatically.' },
        { title: 'Explore the layers', body: 'Toggle population density, metro proximity, and competitor clusters. See patterns emerge that you\'d never spot on foot.' },
        { title: 'Lock in your location', body: 'Identify your opportunity zone, pin your candidate address, and walk into lease negotiations with data behind you.' },
      ],
    },
    quote: {
      text: 'We spent three months searching for a gym location. With a tool like this, we\'d have found the right spot in a week.',
      author: '— Beta tester, Sofia fitness entrepreneur',
    },
    earlyAccess: {
      label: 'Early Access',
      title: 'Be first when we launch',
      sub: 'PinPoint is in private beta. Join the waitlist and get free access during launch — plus a direct line to shape the product.',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'Work email',
      categoryPlaceholder: 'Business type',
      submit: 'Request Early Access',
      submitted: '🎉 You\'re on the list! We\'ll be in touch.',
      fine: 'No spam. Unsubscribe any time. We\'ll only reach out about PinPoint.',
      categories: [
        { value: 'barbershop', label: 'Barbershop / Hair salon' },
        { value: 'gym', label: 'Gym / Fitness studio' },
        { value: 'cafe', label: 'Café / Restaurant' },
        { value: 'retail', label: 'Retail' },
        { value: 'other', label: 'Other' },
      ],
    },
    footer: {
      copy: '© 2026 · Business Location Intelligence',
      openMap: 'Open Map →',
    },
  },

  bg: {
    nav: {
      features: 'Функции',
      howItWorks: 'Как работи',
      cta: 'Ранен достъп',
    },
    hero: {
      badge: 'Интелигентен избор на бизнес локация',
      titleLine1: 'Спрете да гадаете.',
      titleLine2: 'Намерете мястото, където бизнесът ви печели.',
      sub: 'PinPoint нанася гъстотата на конкурентите, демографски данни и достъпност до транспорт върху една интерактивна карта — за да избирате локации с данни, не с интуиция.',
      ctaPrimary: 'Регистрирайте се за ранен достъп',
      ctaSecondary: 'Вижте демото →',
      meta1: 'Без кредитна карта',
      meta2: 'Безплатно по време на бета',
      meta3: 'Изградено за София — разширяваме се навсякъде',
    },
    map: {
      barbershops: 'бръснарници',
      gyms: 'фитнеса',
      opportunityZones: 'зони на възможност',
    },
    stats: {
      businesses: 'Нанесени бизнеса',
      metroLines: 'Анализирани метро линии',
      gridCells: 'Клетки демографска мрежа',
      cityName: 'София',
      cityLabel: 'Покрит град, предстоят още',
    },
    features: {
      label: 'Какво получавате',
      title: 'Всичко нужно за избора на правилното място',
      sub: 'Повечето предприемачи разчитат на усещане и обходи. PinPoint ви дава слоя с данни, който винаги е липсвал.',
      items: [
        { icon: '🗺️', title: 'Картографиране на конкуренти', body: 'Вижте всеки бизнес от вашата категория нанесен на жива карта. Открийте незабавно наситени райони и необслужени квартали.' },
        { icon: '👥', title: 'Слой демографска плътност', body: 'Наложете демографска мрежа, за да разберете къде живеят потенциалните ви клиенти — не само където недвижимите имоти са евтини.' },
        { icon: '🚇', title: 'Достъпност до транспорт', body: 'Визуализирайте метро линии и спирки, за да прецените пешеходния трафик. Транспортните коридори носят повече посетители.' },
        { icon: '🟢', title: 'Анализ на зони с възможности', body: 'Аналитичната мрежа кръстосва гъстотата на конкурентите с населеността и открива зоните, където търсенето надвишава предлагането.' },
        { icon: '🔍', title: 'Интелигентно филтриране', body: 'Филтрирайте конкурентите по предлагани услуги, оценки и още. Стеснете точно до тези, с които се конкурирате — или не.' },
        { icon: '📍', title: 'Маркирай и сравни', body: 'Поставете кандидат-локации директно върху картата и сравнете профилите им един до друг, преди да поемете ангажимент за наем или инвестиция.' },
      ],
    },
    how: {
      label: 'Процес',
      title: 'От празна карта до уверено решение за минути',
      steps: [
        { title: 'Изберете категория', body: 'Кажете на PinPoint какъв вид бизнес откривате. Ние зареждаме съответния набор от данни за конкурентите автоматично.' },
        { title: 'Разгледайте слоевете', body: 'Включвайте демографска плътност, близост до метро и клъстери конкуренти. Наблюдавайте модели, които никога не бихте открили с обход.' },
        { title: 'Заключете локацията', body: 'Открийте зоната с възможности, маркирайте адреса-кандидат и влезте в преговорите за наем с данни зад гърба си.' },
      ],
    },
    quote: {
      text: 'Прекарахме три месеца в търсене на локация за фитнес. С такъв инструмент щяхме да намерим правилното място за една седмица.',
      author: '— Бета тестер, Sofia фитнес предприемач',
    },
    earlyAccess: {
      label: 'Ранен достъп',
      title: 'Бъдете първи при стартирането',
      sub: 'PinPoint е в затворена бета. Присъединете се към списъка и получете безплатен достъп при стартиране — плюс пряка линия за оформяне на продукта.',
      namePlaceholder: 'Вашето име',
      emailPlaceholder: 'Служебен имейл',
      categoryPlaceholder: 'Вид бизнес',
      submit: 'Заявете ранен достъп',
      submitted: '🎉 Вие сте в списъка! Ще се свържем с вас.',
      fine: 'Без спам. Отписване по всяко време. Ще се свързваме само за PinPoint.',
      categories: [
        { value: 'barbershop', label: 'Бръснарница / Фризьорски салон' },
        { value: 'gym', label: 'Фитнес / Спортен клуб' },
        { value: 'cafe', label: 'Кафене / Ресторант' },
        { value: 'retail', label: 'Търговия на дребно' },
        { value: 'other', label: 'Друго' },
      ],
    },
    footer: {
      copy: '© 2026 · Интелигентен избор на бизнес локация',
      openMap: 'Отвори картата →',
    },
  },
}

const t = computed(() => translations[lang.value])

const statsDisplay = computed(() => {
  const s = t.value.stats
  return [
    { display: counters.value[0] + '+', label: s.businesses },
    { display: counters.value[1] + '',  label: s.metroLines },
    { display: counters.value[2] + '+', label: s.gridCells },
    { display: s.cityName,              label: s.cityLabel },
  ]
})

onMounted(() => {
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
    setTimeout(() => requestAnimationFrame(tick), 400 + i * 150)
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@300;400;500;600;700;800;900&display=swap');

/* ── Tokens ── */
:root {
  --clr-bg:       #0b0e0b;
  --clr-bg2:      #111510;
  --clr-surface:  #161b16;
  --clr-accent:   #d97757;
  --clr-accent2:  #e8a87c;
  --clr-gold:     #c9a84c;
  --clr-text:     #f0ebe3;
  --clr-muted:    #8a8070;
  --clr-faint:    #3a3830;
  --clr-border:   rgba(240,235,227,0.08);
}

/* ── Base ── */
.landing {
  min-height: 100vh;
  background: #0b0e0b;
  color: #f0ebe3;
  font-family: 'Figtree', sans-serif;
  overflow-x: hidden;
}

/* ── Ambient BG ── */
.ambient-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.topo-rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(217, 119, 87, calc(0.06 - var(--i) * 0.006));
  width: calc(var(--i) * 14vw + 10vw);
  height: calc(var(--i) * 14vw + 10vw);
  animation: ring-pulse 8s ease-in-out infinite;
  animation-delay: calc(var(--i) * -1s);
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes ring-pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.015); }
}

.grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.4;
}

/* ── Nav ── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11, 14, 11, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(240, 235, 227, 0.06);
}

.nav-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 2.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: 'Figtree', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  color: #f0ebe3;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo-pin {
  color: #d97757;
  font-size: 1rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.nav-links a {
  color: #6b6860;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover { color: #f0ebe3; }

.nav-cta {
  background: #d97757 !important;
  color: #0b0e0b !important;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 700 !important;
  font-size: 0.85rem !important;
  transition: background 0.2s !important, transform 0.15s !important;
}
.nav-cta:hover {
  background: #e8a87c !important;
  color: #0b0e0b !important;
  transform: translateY(-1px);
}

.lang-toggle {
  background: transparent;
  border: 1px solid rgba(240, 235, 227, 0.15);
  color: #6b6860;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.08em;
  transition: all 0.2s;
}
.lang-toggle:hover {
  border-color: #d97757;
  color: #d97757;
}

/* ── Hero ── */
.hero {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  margin: 0 auto;
  padding: 7rem 2.5rem 4rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
}

.hero-inner {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.ready .hero-inner {
  opacity: 1;
  transform: translateY(0);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.4rem 1rem;
  background: rgba(217, 119, 87, 0.1);
  border: 1px solid rgba(217, 119, 87, 0.3);
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #e8a87c;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d97757;
  animation: badge-blink 2s ease-in-out infinite;
}

@keyframes badge-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.hero-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(3rem, 6.5vw, 5.25rem);
  font-weight: 400;
  line-height: 1.07;
  letter-spacing: -0.02em;
  color: #f0ebe3;
  margin-bottom: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.1em;
}

.title-line {
  display: block;
}

.title-em {
  font-style: italic;
  background: linear-gradient(135deg, #d97757 0%, #e8b86d 50%, #d97757 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}

@keyframes shimmer {
  0%   { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.hero-sub {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #6b6860;
  max-width: 580px;
  margin: 0 auto 2.75rem;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.9rem 2rem;
  background: #d97757;
  color: #0b0e0b;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  font-family: 'Figtree', sans-serif;
  box-shadow: 0 4px 20px rgba(217, 119, 87, 0.3);
}

.btn-primary:hover {
  background: #e8a87c;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(217, 119, 87, 0.45);
}

.btn-primary:disabled {
  background: #3a3830;
  color: #6b6860;
  cursor: default;
  transform: none;
  box-shadow: none;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0.9rem 2rem;
  background: transparent;
  color: #6b6860;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid rgba(240, 235, 227, 0.12);
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.btn-ghost:hover {
  border-color: rgba(240, 235, 227, 0.3);
  color: #f0ebe3;
  background: rgba(240, 235, 227, 0.04);
}

.hero-meta {
  display: flex;
  gap: 1.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #4a4840;
  font-weight: 500;
}

.meta-check {
  color: #5ea87a;
  font-size: 0.75rem;
}

/* ── Map Preview ── */
.map-preview-wrap {
  position: relative;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1s ease 0.3s, transform 1s ease 0.3s;
}

.ready .map-preview-wrap {
  opacity: 1;
  transform: translateY(0);
}

.map-preview {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(240, 235, 227, 0.1);
  box-shadow:
    0 0 0 1px rgba(217, 119, 87, 0.12),
    0 40px 80px rgba(0, 0, 0, 0.6),
    0 8px 32px rgba(0, 0, 0, 0.4);
  background: #0f1310;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.map-chrome {
  background: #1a1f1a;
  padding: 0.7rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(240, 235, 227, 0.06);
}

.chrome-dots { display: flex; gap: 6px; align-items: center; }
.dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
.dot.red    { background: #ff5f57; }
.dot.yellow { background: #ffbd2e; }
.dot.green  { background: #28c840; }

.map-url {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  color: #4a4840;
  background: rgba(255,255,255,0.04);
  padding: 0.2rem 0.75rem;
  border-radius: 4px;
  max-width: 200px;
  margin: 0 auto;
}

.chrome-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ctrl-pill {
  width: 28px;
  height: 10px;
  border-radius: 5px;
  background: rgba(255,255,255,0.06);
}

.map-screen {
  position: relative;
  height: 380px;
  background: #131a14;
  overflow: hidden;
}

.map-base-layer {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(94, 168, 122, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 60%, rgba(217, 119, 87, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 20%, rgba(107, 168, 212, 0.04) 0%, transparent 40%);
}

.map-grid-layer {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(240,235,227,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240,235,227,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
}

.heat-cell {
  position: absolute;
  border-radius: 6px;
  filter: blur(20px);
  transition: opacity 0.5s;
}

.map-dot {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: rgba(217, 119, 87, 0.22);
  border: 1.5px solid rgba(217, 119, 87, 0.75);
  animation: dot-pulse 3s ease-in-out infinite;
  animation-delay: var(--delay);
  transform: translate(-50%, -50%);
}

.map-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(217, 119, 87, 0.25);
  animation: ring-expand 3s ease-out infinite;
  animation-delay: var(--delay);
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
  50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes ring-expand {
  0%   { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2.5); opacity: 0; }
}

.metro-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.overlay-pill {
  position: absolute;
  background: rgba(15, 19, 16, 0.85);
  border: 1px solid rgba(240, 235, 227, 0.12);
  backdrop-filter: blur(8px);
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 600;
  color: #d0c8be;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pill-tl { top: 14px; left: 14px; }
.pill-tr { top: 14px; right: 14px; }
.pill-bl { bottom: 14px; left: 14px; }
.pill-icon { font-size: 0.9rem; }

.analysis-pill {
  background: rgba(10, 30, 15, 0.88);
  border-color: rgba(94, 168, 122, 0.35);
  color: #7ec89a;
}

.pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5ea87a;
  animation: badge-blink 2s ease-in-out infinite;
}

.map-cursor {
  position: absolute;
  top: 52%;
  left: 58%;
  transform: translate(-50%, -50%);
  animation: cursor-float 4s ease-in-out infinite;
}

.cursor-ring {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(217, 119, 87, 0.8);
  border-radius: 50%;
  position: relative;
  animation: cursor-ring-pulse 2s ease-in-out infinite;
}

.cursor-dot {
  width: 8px;
  height: 8px;
  background: #d97757;
  border-radius: 50%;
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes cursor-float {
  0%, 100% { transform: translate(-50%, -50%) translate(0, 0); }
  25%       { transform: translate(-50%, -50%) translate(6px, -4px); }
  50%       { transform: translate(-50%, -50%) translate(12px, 2px); }
  75%       { transform: translate(-50%, -50%) translate(4px, 6px); }
}

@keyframes cursor-ring-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(217, 119, 87, 0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(217, 119, 87, 0); }
}

.map-glow {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 120px;
  background: radial-gradient(ellipse, rgba(217, 119, 87, 0.2) 0%, transparent 70%);
  filter: blur(20px);
  pointer-events: none;
}

/* ── Stats ── */
.stats-bar {
  position: relative;
  z-index: 1;
  background: #111510;
  border-top: 1px solid rgba(240, 235, 227, 0.06);
  border-bottom: 1px solid rgba(240, 235, 227, 0.06);
  padding: 3rem 2.5rem;
}

.stats-inner {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}

.stat {
  text-align: center;
  padding: 0 2rem;
  border-right: 1px solid rgba(240, 235, 227, 0.07);
  --stat-value-size: 2.75rem;
  --stat-value-weight: 400;
  --stat-value-font: 'Instrument Serif', serif;
  --stat-value-color: #d97757;
  --stat-value-line-height: 1;
  --stat-label-size: 0.78rem;
  --stat-label-color: #4a4840;
  --stat-label-spacing: 0.02em;
  --stat-label-gap: 0.5rem;
}

.stat:last-child { border-right: none; }

/* ── Features ── */
.features {
  position: relative;
  z-index: 1;
  padding: 8rem 2.5rem;
}

.features-inner {
  max-width: 1160px;
  margin: 0 auto;
}

.section-head {
  text-align: center;
  margin-bottom: 5rem;
}

.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #d97757;
  margin-bottom: 1.25rem;
}

.section-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  color: #f0ebe3;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
  line-height: 1.15;
}

.section-sub {
  color: #6b6860;
  font-size: 1rem;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.8;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5px;
  background: rgba(240, 235, 227, 0.06);
  border-radius: 16px;
  overflow: hidden;
}

.feature-card {
  background: #0f1310;
  padding: 2.25rem 2rem;
  position: relative;
  overflow: hidden;
  transition: background 0.3s;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-card:hover {
  background: #131a14;
}

.feature-card:hover .card-glow {
  opacity: 1;
}

.card-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217,119,87,0.12) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}

.feature-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(217, 119, 87, 0.1);
  border: 1px solid rgba(217, 119, 87, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon { font-size: 1.3rem; }

.feature-body { }

.feature-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #d0c8be;
  margin-bottom: 0.6rem;
  letter-spacing: -0.01em;
}

.feature-card p {
  font-size: 0.875rem;
  color: #4a4840;
  line-height: 1.75;
}

/* ── How it works ── */
.how {
  position: relative;
  z-index: 1;
  background: #111510;
  border-top: 1px solid rgba(240, 235, 227, 0.06);
  padding: 8rem 2.5rem;
}

.how-inner {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.how-title { margin-bottom: 4rem; }

.steps {
  display: flex;
  flex-direction: column;
  gap: 0;
  text-align: left;
  position: relative;
}

.step {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 2rem;
  padding-bottom: 3.5rem;
  opacity: 0;
  transform: translateX(-16px);
  animation: step-in 0.6s ease forwards;
  animation-delay: calc(0.2s + var(--step-i) * 0.15s);
}

@keyframes step-in {
  to { opacity: 1; transform: translateX(0); }
}

.step-num-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-num {
  font-family: 'Instrument Serif', serif;
  font-size: 3rem;
  font-weight: 400;
  color: rgba(217, 119, 87, 0.35);
  letter-spacing: -0.04em;
  line-height: 1;
  width: 72px;
  text-align: center;
}

.step-line {
  flex: 1;
  width: 1px;
  background: rgba(240, 235, 227, 0.07);
  margin-top: 1rem;
  min-height: 48px;
}

.step-content {
  padding-top: 0.25rem;
}

.step-content h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #d0c8be;
  margin-bottom: 0.65rem;
  letter-spacing: -0.015em;
}

.step-content p {
  font-size: 0.9rem;
  color: #4a4840;
  line-height: 1.8;
}

/* ── Quote ── */
.quote-section {
  position: relative;
  z-index: 1;
  padding: 7rem 2.5rem;
  overflow: hidden;
}

.quote-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(217,119,87,0.05) 0%, transparent 65%);
  pointer-events: none;
}

.quote-inner {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

.quote-mark {
  font-family: 'Instrument Serif', serif;
  font-size: 8rem;
  line-height: 0.6;
  color: rgba(217, 119, 87, 0.15);
  margin-bottom: 1rem;
  display: block;
}

blockquote {
  font-family: 'Instrument Serif', serif;
  font-size: 1.5rem;
  font-style: italic;
  color: #d0c8be;
  line-height: 1.65;
  margin: 0 0 1.5rem;
  font-weight: 400;
}

cite {
  font-size: 0.82rem;
  color: #4a4840;
  font-style: normal;
  letter-spacing: 0.04em;
}

/* ── Early Access ── */
.early-access {
  position: relative;
  z-index: 1;
  background: #111510;
  border-top: 1px solid rgba(240, 235, 227, 0.06);
  padding: 8rem 2.5rem;
  overflow: hidden;
}

.ea-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(217,119,87,0.12) 0%, transparent 65%);
  filter: blur(40px);
  pointer-events: none;
}

.ea-inner {
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

.ea-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  color: #f0ebe3;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

.ea-sub {
  color: #4a4840;
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 3rem;
}

.ea-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ea-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.ea-fields .ea-input:last-child {
  grid-column: 1 / -1;
}

.ea-input {
  background: rgba(240, 235, 227, 0.04);
  border: 1px solid rgba(240, 235, 227, 0.1);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  color: #f0ebe3;
  font-size: 0.9rem;
  font-family: 'Figtree', sans-serif;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  -webkit-appearance: none;
  appearance: none;
}

.ea-input::placeholder { color: #3a3830; }
.ea-input:focus {
  border-color: rgba(217, 119, 87, 0.5);
  background: rgba(240, 235, 227, 0.06);
}

.ea-select { cursor: pointer; }
.ea-select option { background: #1a1f1a; color: #f0ebe3; }

.ea-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  justify-content: center;
}

.ea-fine {
  font-size: 0.76rem;
  color: #2e2c28;
  margin-top: 1.25rem;
  line-height: 1.6;
}

/* ── Submitted state ── */
.submitted-state {
  padding: 3rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.submitted-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(94, 168, 122, 0.15);
  border: 1px solid rgba(94, 168, 122, 0.4);
  color: #5ea87a;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.submitted-state p {
  color: #d0c8be;
  font-size: 1.05rem;
  font-weight: 600;
}

/* ── Footer ── */
.footer {
  position: relative;
  z-index: 1;
  background: #0b0e0b;
  padding: 2rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  border-top: 1px solid rgba(240, 235, 227, 0.04);
}

.footer-logo { font-size: 0.95rem; }
.footer-copy { font-size: 0.78rem; color: #2e2c28; }
.footer-link { font-size: 0.82rem; color: #4a4840; text-decoration: none; transition: color 0.2s; }
.footer-link:hover { color: #d97757; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .feature-grid { grid-template-columns: repeat(2, 1fr); }
  .stats-inner { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
  .stat { border-right: none; border-bottom: 1px solid rgba(240,235,227,0.07); padding-bottom: 2rem; }
  .stat:nth-child(2n) { border-bottom: 1px solid rgba(240,235,227,0.07); }
  .stat:nth-last-child(-n+2) { border-bottom: none; }
}

@media (max-width: 640px) {
  .nav-links a:not(.nav-cta) { display: none; }
  .hero { padding: 5rem 1.5rem 3rem; }
  .feature-grid { grid-template-columns: 1fr; }
  .stats-inner { grid-template-columns: 1fr 1fr; }
  .map-screen { height: 280px; }
  .ea-fields { grid-template-columns: 1fr; }
  .ea-fields .ea-input:last-child { grid-column: auto; }
  .hero-title { font-size: clamp(2.2rem, 9vw, 3.5rem); }
}
</style>
