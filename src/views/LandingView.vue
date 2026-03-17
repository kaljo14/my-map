<template>
  <div class="landing">

    <!-- Nav -->
    <nav class="nav">
      <div class="nav-inner">
        <span class="logo">PinPoint</span>
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

    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">{{ t.hero.badge }}</div>
      <h1 class="hero-title">
        {{ t.hero.titleLine1 }}<br />
        <span class="accent-text">{{ t.hero.titleLine2 }}</span>
      </h1>
      <p class="hero-sub">{{ t.hero.sub }}</p>
      <div class="hero-actions">
        <a href="#early-access" class="btn-primary">{{ t.hero.ctaPrimary }}</a>
        <RouterLink to="/map" class="btn-ghost">{{ t.hero.ctaSecondary }}</RouterLink>
      </div>
      <div class="hero-meta">
        <span>✓ {{ t.hero.meta1 }}</span>
        <span>✓ {{ t.hero.meta2 }}</span>
        <span>✓ {{ t.hero.meta3 }}</span>
      </div>

      <!-- Mock map preview -->
      <div class="map-preview">
        <div class="map-chrome">
          <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
          <span class="map-url">pinpoint.app/map</span>
        </div>
        <div class="map-screen">
          <div class="map-layer layer-grid"></div>
          <div class="map-layer layer-dots">
            <span v-for="i in 18" :key="i" class="map-dot" :style="dotPositions[i - 1]"></span>
          </div>
          <div class="map-overlay-pill top-left">💈 24 {{ t.map.barbershops }}</div>
          <div class="map-overlay-pill top-right">💪 11 {{ t.map.gyms }}</div>
          <div class="map-overlay-pill bottom-left analysis">🟢 3 {{ t.map.opportunityZones }}</div>
        </div>
      </div>
    </section>

    <!-- Stats bar -->
    <section class="stats-bar">
      <div class="stat">
        <span class="stat-num">500+</span>
        <span class="stat-label">{{ t.stats.businesses }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-num">3</span>
        <span class="stat-label">{{ t.stats.metroLines }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-num">100+</span>
        <span class="stat-label">{{ t.stats.gridCells }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-num">{{ t.stats.cityName }}</span>
        <span class="stat-label">{{ t.stats.cityLabel }}</span>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="features">
      <div class="section-label">{{ t.features.label }}</div>
      <h2 class="section-title">{{ t.features.title }}</h2>
      <p class="section-sub">{{ t.features.sub }}</p>
      <div class="feature-grid">
        <div class="feature-card" v-for="f in t.features.items" :key="f.title">
          <div class="feature-icon">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.body }}</p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="how">
      <div class="section-label">{{ t.how.label }}</div>
      <h2 class="section-title">{{ t.how.title }}</h2>
      <div class="steps">
        <div class="step" v-for="(step, i) in t.how.steps" :key="i">
          <div class="step-num">0{{ i + 1 }}</div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.body }}</p>
        </div>
        <div class="step-arrow" v-if="i < t.how.steps.length - 1" :key="'arrow-' + i" />
      </div>
    </section>

    <!-- Quote -->
    <section class="quote-section">
      <blockquote>{{ t.quote.text }}</blockquote>
      <cite>{{ t.quote.author }}</cite>
    </section>

    <!-- Early access -->
    <section id="early-access" class="early-access">
      <div class="ea-inner">
        <div class="section-label">{{ t.earlyAccess.label }}</div>
        <h2 class="ea-title">{{ t.earlyAccess.title }}</h2>
        <p class="ea-sub">{{ t.earlyAccess.sub }}</p>
        <form class="ea-form" @submit.prevent="handleSubmit">
          <div class="ea-fields">
            <input v-model="form.name" type="text" :placeholder="t.earlyAccess.namePlaceholder" required class="ea-input" />
            <input v-model="form.email" type="email" :placeholder="t.earlyAccess.emailPlaceholder" required class="ea-input" />
            <select v-model="form.category" class="ea-input ea-select" required>
              <option value="" disabled>{{ t.earlyAccess.categoryPlaceholder }}</option>
              <option v-for="opt in t.earlyAccess.categories" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <button type="submit" class="btn-primary ea-btn" :disabled="submitted">
            {{ submitted ? t.earlyAccess.submitted : t.earlyAccess.submit }}
          </button>
        </form>
        <p class="ea-fine">{{ t.earlyAccess.fine }}</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <span class="logo">PinPoint</span>
      <span class="footer-copy">{{ t.footer.copy }}</span>
      <RouterLink to="/map" class="footer-link">{{ t.footer.openMap }}</RouterLink>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { RouterLink } from 'vue-router'

const lang = ref<'en' | 'bg'>('en')
const submitted = ref(false)
const form = reactive({ name: '', email: '', category: '' })

function toggleLang() {
  lang.value = lang.value === 'en' ? 'bg' : 'en'
}

function handleSubmit() {
  console.log('Early access signup:', { ...form })
  submitted.value = true
}

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
      text: '"We spent three months searching for a gym location. With a tool like this, we\'d have found the right spot in a week."',
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
      submitted: '🎉 You\'re on the list!',
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
      text: '„Прекарахме три месеца в търсене на локация за фитнес. С такъв инструмент щяхме да намерим правилното място за една седмица."',
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
      submitted: '🎉 Вие сте в списъка!',
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

const dotPositions = [
  { top: '18%', left: '22%' }, { top: '32%', left: '55%' }, { top: '48%', left: '38%' },
  { top: '62%', left: '70%' }, { top: '25%', left: '78%' }, { top: '72%', left: '25%' },
  { top: '15%', left: '48%' }, { top: '55%', left: '12%' }, { top: '38%', left: '85%' },
  { top: '80%', left: '50%' }, { top: '42%', left: '62%' }, { top: '20%', left: '65%' },
  { top: '68%', left: '42%' }, { top: '30%', left: '32%' }, { top: '58%', left: '88%' },
  { top: '85%', left: '68%' }, { top: '10%', left: '35%' }, { top: '50%', left: '50%' },
]
</script>

<style scoped>
/* ── Tokens ── */
/* bg: #f5f0e8  text: #131314  accent: #d97757  muted: #6b6057  border: #e5ddd0 */

.landing {
  min-height: 100vh;
  background: #f5f0e8;
  color: #131314;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ── Nav ── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(245, 240, 232, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e5ddd0;
}
.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-size: 1.2rem;
  font-weight: 800;
  color: #d97757;
  letter-spacing: -0.03em;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}
.nav-links a {
  color: #6b6057;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-links a:hover { color: #131314; }
.nav-cta {
  background: #161B16 !important;
  color: #f5f0e8 !important;
  padding: 0.45rem 1.1rem;
  border-radius: 6px;
  font-weight: 600;
  transition: background 0.2s !important;
}
.nav-cta:hover { background: #0e130e !important; }

.lang-toggle {
  background: transparent;
  border: 1px solid #d5ccc0;
  color: #6b6057;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.lang-toggle:hover {
  border-color: #d97757;
  color: #d97757;
  background: rgba(217, 119, 87, 0.06);
}

/* ── Hero ── */
.hero {
  max-width: 900px;
  margin: 0 auto;
  padding: 7rem 2rem 5rem;
  text-align: center;
}
.hero-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  background: rgba(217, 119, 87, 0.12);
  border: 1px solid rgba(217, 119, 87, 0.35);
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #c05e3a;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 1.75rem;
}
.hero-title {
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #131314;
  margin-bottom: 1.5rem;
}
.accent-text { color: #d97757; }
.hero-sub {
  font-size: 1.15rem;
  line-height: 1.75;
  color: #6b6057;
  max-width: 600px;
  margin: 0 auto 2.5rem;
}
.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.btn-primary {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: #161B16;
  color: #f5f0e8;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.btn-primary:hover { background: #0e130e; transform: translateY(-1px); }
.btn-primary:disabled { background: #c9bfb4; color: #8a8070; cursor: default; transform: none; }
.btn-ghost {
  display: inline-block;
  padding: 0.875rem 2rem;
  background: transparent;
  color: #6b6057;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid #d5ccc0;
  transition: border-color 0.2s, color 0.2s;
}
.btn-ghost:hover { border-color: #131314; color: #131314; }
.hero-meta {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: #9d9080;
  margin-bottom: 4rem;
}

/* ── Map Preview ── */
.map-preview {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e0d8cc;
  box-shadow: 0 24px 60px rgba(19, 19, 20, 0.12), 0 4px 16px rgba(19, 19, 20, 0.06);
  background: #fff;
  max-width: 800px;
  margin: 0 auto;
}
.map-chrome {
  background: #f0ebe2;
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-bottom: 1px solid #e0d8cc;
}
.dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
.dot.red    { background: #ff5f57; }
.dot.yellow { background: #ffbd2e; }
.dot.green  { background: #28c840; }
.map-url {
  margin-left: 0.75rem;
  font-size: 0.78rem;
  color: #9d9080;
  background: rgba(19,19,20,0.06);
  padding: 0.2rem 0.75rem;
  border-radius: 4px;
}
.map-screen {
  position: relative;
  height: 340px;
  background: #e8e0d4;
  overflow: hidden;
}
.map-layer { position: absolute; inset: 0; }
.layer-grid {
  background-image:
    linear-gradient(rgba(19, 19, 20, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(19, 19, 20, 0.06) 1px, transparent 1px);
  background-size: 40px 40px;
}
.layer-dots { pointer-events: none; }
.map-dot {
  position: absolute;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(217, 119, 87, 0.25);
  border: 2px solid rgba(217, 119, 87, 0.7);
}
.map-overlay-pill {
  position: absolute;
  background: rgba(245, 240, 232, 0.92);
  border: 1px solid #e0d8cc;
  backdrop-filter: blur(6px);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #131314;
}
.top-left    { top: 12px; left: 12px; }
.top-right   { top: 12px; right: 12px; }
.bottom-left { bottom: 12px; left: 12px; }
.analysis { color: #161B16; border-color: rgba(22, 27, 22, 0.3); background: rgba(237, 248, 243, 0.92); }

/* ── Stats Bar ── */
.stats-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eee8de;
  border-top: 1px solid #e0d8cc;
  border-bottom: 1px solid #e0d8cc;
  padding: 2.5rem 2rem;
  flex-wrap: wrap;
  gap: 0;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 3rem;
}
.stat-num {
  font-size: 2rem;
  font-weight: 800;
  color: #d97757;
  letter-spacing: -0.03em;
}
.stat-label {
  font-size: 0.82rem;
  color: #8a8070;
  margin-top: 0.25rem;
}
.stat-divider {
  width: 1px;
  height: 40px;
  background: #d5ccc0;
}

/* ── Features ── */
.features {
  max-width: 1100px;
  margin: 0 auto;
  padding: 7rem 2rem;
  text-align: center;
}
.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #d97757;
  margin-bottom: 1rem;
}
.section-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #131314;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
  line-height: 1.2;
}
.section-sub {
  color: #6b6057;
  font-size: 1.05rem;
  max-width: 540px;
  margin: 0 auto 4rem;
  line-height: 1.75;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  text-align: left;
}
.feature-card {
  background: #fff;
  border: 1px solid #e5ddd0;
  border-radius: 14px;
  padding: 1.75rem;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}
.feature-card:hover {
  border-color: #d97757;
  box-shadow: 0 8px 24px rgba(217, 119, 87, 0.08);
  transform: translateY(-2px);
}
.feature-icon { font-size: 1.75rem; margin-bottom: 1rem; }
.feature-card h3 { font-size: 1rem; font-weight: 700; color: #131314; margin-bottom: 0.6rem; }
.feature-card p  { font-size: 0.9rem; color: #7a7060; line-height: 1.7; }

/* ── How it works ── */
.how {
  background: #eee8de;
  padding: 7rem 2rem;
  text-align: center;
  border-top: 1px solid #e0d8cc;
}
.steps {
  max-width: 960px;
  margin: 3rem auto 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.step { flex: 1; min-width: 220px; max-width: 280px; text-align: left; }
.step-num {
  font-size: 2.5rem;
  font-weight: 900;
  color: rgba(217, 119, 87, 0.3);
  letter-spacing: -0.04em;
  margin-bottom: 0.75rem;
}
.step h3 { font-size: 1rem; font-weight: 700; color: #131314; margin-bottom: 0.6rem; }
.step p  { font-size: 0.88rem; color: #7a7060; line-height: 1.7; }
.step-arrow { font-size: 1.5rem; color: #d5ccc0; padding-top: 2.5rem; flex-shrink: 0; }

/* ── Quote ── */
.quote-section {
  max-width: 720px;
  margin: 0 auto;
  padding: 6rem 2rem;
  text-align: center;
}
blockquote {
  font-size: 1.35rem;
  font-style: italic;
  color: #2e2a25;
  line-height: 1.7;
  margin: 0 0 1.25rem;
  quotes: "\201C" "\201D";
}
blockquote::before { content: open-quote; }
blockquote::after  { content: close-quote; }
cite { font-size: 0.85rem; color: #9d9080; }

/* ── Early Access ── */
.early-access {
  background: #161B16;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 7rem 2rem;
}
.ea-inner { max-width: 600px; margin: 0 auto; text-align: center; }
.early-access .section-label { color: #d97757; }
.ea-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #f5f0e8;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
}
.ea-sub { color: #8a8070; font-size: 1.05rem; line-height: 1.75; margin-bottom: 2.5rem; }
.ea-form { display: flex; flex-direction: column; gap: 1rem; }
.ea-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.ea-fields .ea-input:last-child { grid-column: 1 / -1; }
.ea-input {
  background: rgba(245, 240, 232, 0.06);
  border: 1px solid rgba(245, 240, 232, 0.12);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  color: #f5f0e8;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  appearance: none;
  -webkit-appearance: none;
}
.ea-input::placeholder { color: #5a5248; }
.ea-input:focus { border-color: #d97757; }
.ea-select { cursor: pointer; }
.ea-select option { background: #1e1e1f; color: #f5f0e8; }
.ea-btn { width: 100%; padding: 1rem; font-size: 1.05rem; }
.ea-fine { font-size: 0.78rem; color: #4a4540; margin-top: 1rem; }

/* ── Footer ── */
.footer {
  background: #161B16;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.footer-copy { font-size: 0.82rem; color: #3a3530; }
.footer-link { font-size: 0.85rem; color: #d97757; text-decoration: none; }
.footer-link:hover { color: #e88d6a; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .nav-links a:not(.nav-cta) { display: none; }
  .steps { flex-direction: column; align-items: center; }
  .step-arrow { display: none; }
  .stats-bar { gap: 2rem; }
  .stat-divider { display: none; }
  .ea-fields { grid-template-columns: 1fr; }
  .ea-fields .ea-input:last-child { grid-column: auto; }
}
</style>
