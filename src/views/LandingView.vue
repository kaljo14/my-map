<template>
  <div class="landing" :class="{ ready: isReady }">
    <!-- ── Grid overlay ── -->
    <div class="grid-overlay" aria-hidden="true"></div>

    <!-- ── Nav ── -->
    <nav class="nav" :class="{ scrolled: scrolled }">
      <div class="nav-inner">
        <span class="logo">
          <img src="/log.png" alt="Lonctus logo" class="logo-img" />
          <span class="logo-name">Lonctus</span>
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
    <section
      class="hero"
      @mousemove="onHeroMouseMove"
      @mouseleave="onHeroMouseLeave"
    >
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
            <img
              src="/log.png"
              alt="Lonctus Graphic"
              class="hero-center-logo"
            />
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
              <span class="meta-check" aria-hidden="true">✓</span>
              {{ m }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Scroll indicator ── -->
    <div class="scroll-indicator" :class="{ hidden: scrolled }">
      <div class="scroll-line"></div>
      <span>Scroll</span>
    </div>

    <!-- ── Stats bar ── -->
    <section class="stats-bar" ref="statsRef">
      <div class="stats-inner">
        <div class="stat-item" v-for="s in statsDisplay" :key="s.label">
          <div class="stat-value">{{ s.display }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- ── App Showcase ── -->
    <section class="showcase reveal-section" ref="showcaseRef">
      <div class="showcase-inner">
        <div class="section-label">{{ t.showcase.label }}</div>
        <h2 class="section-title">{{ t.showcase.title }}</h2>
        <p class="section-sub">{{ t.showcase.sub }}</p>

        <!-- ── 3D Interactive Preview ── -->
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
                <span class="map-url">lonctus.app/map · Sofia Analysis</span>
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

    <!-- ── Features ── -->
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

    <!-- ── How it works ── -->
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

    <!-- ── Quote ── -->
    <section class="quote-section reveal-section">
      <div class="quote-inner">
        <div class="quote-mark" aria-hidden="true">"</div>
        <blockquote>{{ t.quote.text }}</blockquote>
        <cite>{{ t.quote.author }}</cite>
      </div>
    </section>

    <!-- ── Early Access ── -->
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

    <!-- ── Footer ── -->
    <footer class="footer">
      <span class="logo footer-logo">
        <img src="/log.png" alt="Lonctus" class="logo-img footer-logo-img" />
        <span class="logo-name">Lonctus</span>
      </span>
      <span class="footer-copy">{{ t.footer.copy }}</span>
      <RouterLink to="/map" class="footer-link">{{
        t.footer.openMap
      }}</RouterLink>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const lang = ref<'en' | 'bg'>('en')
const submitted = ref(false)
const isReady = ref(false)
const scrolled = ref(false)
const showcaseVisible = ref(false)

const form = reactive({ name: '', email: '', category: '' })
const heroVisual = ref<HTMLElement | null>(null)
const statsRef = ref<HTMLElement | null>(null)
const showcaseRef = ref<HTMLElement | null>(null)
const featureCardRefs = ref<HTMLElement[]>([])
const cardGlowStyles = ref<Record<number, string>>({})

const tiltX = ref(0)
const tiltY = ref(0)

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

function toggleLang() {
  lang.value = lang.value === 'en' ? 'bg' : 'en'
}

function handleSubmit() {
  submitted.value = true
}

const radarBars = [65, 87, 72, 54, 91]

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

function setupObservers() {
  document.querySelectorAll('.reveal-section').forEach((el) =>
    new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting)
          entries[0].target.classList.add('revealed')
      },
      { threshold: 0.1 },
    ).observe(el),
  )
  if (statsRef.value)
    new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) animateCounters()
      },
      { threshold: 0.5 },
    ).observe(statsRef.value)
  if (showcaseRef.value)
    new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) showcaseVisible.value = true
      },
      { threshold: 0.2 },
    ).observe(showcaseRef.value)
}

function onScroll() {
  scrolled.value = window.scrollY > 60
}

onMounted(() => {
  requestAnimationFrame(() => {
    isReady.value = true
  })
  setTimeout(setupObservers, 100)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const translations = {
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How it works',
      cta: 'Get Early Access',
    },
    hero: {
      badge: 'Business Location Intelligence · Sofia, Bulgaria',
      titleLine1: 'Stop guessing.',
      titleLine2: 'Find where your business wins.',
      sub: 'Lonctus overlays competitor density, population data, and transit accessibility on one interactive map — so you can pick locations backed by data, not instinct.',
      ctaPrimary: 'Register for Early Access',
      ctaSecondary: 'See Live Demo →',
      meta1: 'No credit card required',
      meta2: 'Free during beta',
      meta3: 'Built for Sofia — expanding everywhere',
    },
    map: {
      barbershops: 'barbershops mapped',
      gyms: 'gyms',
      opportunityZones: 'Opportunity Zones',
      locationScore: 'Location Score',
    },
    showcase: {
      label: 'The Platform',
      title: 'Every insight on one map',
      sub: 'Competitor clusters, metro accessibility, population density, and AI-scored locations — all live, all interactive.',
      ann1: 'Competitor density heatmap',
      ann2: 'Location comparison panel',
      ann3: 'Opportunity zone scoring',
    },
    stats: {
      businesses: 'Businesses mapped',
      metroLines: 'Metro lines',
      gridCells: 'Population grid cells',
      cityName: 'Sofia',
      cityLabel: 'City covered',
    },
    features: {
      label: 'What you get',
      title: 'Everything you need to pick the right spot',
      sub: 'Most entrepreneurs rely on gut feel and walking around. Lonctus gives you the data layer that was always missing.',
      items: [
        {
          icon: 'map',
          title: 'Competitor Mapping',
          body: 'See every business in your category plotted on a live map. Instantly spot saturated areas and underserved neighbourhoods.',
        },
        {
          icon: 'group',
          title: 'Population Density',
          body: 'Overlay census-derived population grids to understand where your potential customers actually live — not just where real estate is cheap.',
        },
        {
          icon: 'train',
          title: 'Transit Accessibility',
          body: 'Visualise metro lines and stops to gauge foot traffic potential. High-transit corridors mean more walk-ins, not just residents.',
        },
        {
          icon: 'eco',
          title: 'Opportunity Zones',
          body: 'The analysis grid cross-references competitor density against population to surface zones where demand outstrips supply.',
        },
        {
          icon: 'search',
          title: 'Smart Filtering',
          body: "Filter competitors by services, ratings, and more. Narrow down to exactly who you're competing against — or who you're not.",
        },
        {
          icon: 'location_on',
          title: 'Pin & Compare',
          body: 'Drop candidate locations on the map and compare their data profiles side-by-side before committing to a lease or investment.',
        },
      ],
    },
    how: {
      label: 'Process',
      title: 'From blank map to confident decision in minutes',
      steps: [
        {
          title: 'Choose your category',
          body: "Tell Lonctus what kind of business you're opening. We load the relevant competitor dataset automatically.",
        },
        {
          title: 'Explore the layers',
          body: "Toggle population density, metro proximity, and competitor clusters. See patterns emerge that you'd never spot on foot.",
        },
        {
          title: 'Lock in your location',
          body: 'Identify your opportunity zone, pin your candidate address, and walk into lease negotiations with data behind you.',
        },
      ],
    },
    quote: {
      text: "We spent three months searching for a gym location. With a tool like this, we'd have found the right spot in a week.",
      author: '— Beta tester, Sofia fitness entrepreneur',
    },
    earlyAccess: {
      label: 'Early Access',
      title: 'Be first when we launch',
      sub: 'Lonctus is in private beta. Join the waitlist and get free access at launch — plus a direct line to shape the product.',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'Work email',
      categoryPlaceholder: 'Business type',
      submit: 'Request Early Access',
      submitted: "🎉 You're on the list! We'll be in touch.",
      fine: "No spam. Unsubscribe any time. We'll only reach out about Lonctus.",
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
      badge: 'Интелигентен избор на бизнес локация · София',
      titleLine1: 'Спрете да гадаете.',
      titleLine2: 'Намерете мястото, където бизнесът ви печели.',
      sub: 'Lonctus нанася гъстотата на конкурентите, демографски данни и достъпност до транспорт върху една интерактивна карта — за да избирате локации с данни, не с интуиция.',
      ctaPrimary: 'Регистрирайте се за ранен достъп',
      ctaSecondary: 'Вижте демото →',
      meta1: 'Без кредитна карта',
      meta2: 'Безплатно по време на бета',
      meta3: 'Изградено за София — разширяваме се навсякъде',
    },
    map: {
      barbershops: 'нанесени бръснарници',
      gyms: 'фитнеса',
      opportunityZones: 'Зони с възможности',
      locationScore: 'Оценка на локация',
    },
    showcase: {
      label: 'Платформата',
      title: 'Всяка информация на една карта',
      sub: 'Клъстери на конкуренти, достъпност до метро, демографска плътност и AI-оценени локации — всичко в реално време, всичко интерактивно.',
      ann1: 'Топлинна карта на конкурентите',
      ann2: 'Панел за сравнение на локации',
      ann3: 'Оценяване на зони с възможности',
    },
    stats: {
      businesses: 'Нанесени бизнеса',
      metroLines: 'Метро линии',
      gridCells: 'Клетки демографска мрежа',
      cityName: 'София',
      cityLabel: 'Покрит град',
    },
    features: {
      label: 'Какво получавате',
      title: 'Всичко нужно за избора на правилното място',
      sub: 'Повечето предприемачи разчитат на усещане и обходи. Lonctus ви дава слоя с данни, който винаги е липсвал.',
      items: [
        {
          icon: 'map',
          title: 'Картографиране на конкуренти',
          body: 'Вижте всеки бизнес от вашата категория нанесен на жива карта. Открийте незабавно наситени райони и необслужени квартали.',
        },
        {
          icon: 'group',
          title: 'Демографска плътност',
          body: 'Наложете демографска мрежа, за да разберете къде живеят потенциалните ви клиенти — не само където недвижимите имоти са евтини.',
        },
        {
          icon: 'train',
          title: 'Достъпност до транспорт',
          body: 'Визуализирайте метро линии и спирки, за да прецените пешеходния трафик. Транспортните коридори носят повече посетители.',
        },
        {
          icon: 'eco',
          title: 'Зони с възможности',
          body: 'Аналитичната мрежа кръстосва гъстотата на конкурентите с населеността и открива зоните, където търсенето надвишава предлагането.',
        },
        {
          icon: 'search',
          title: 'Интелигентно филтриране',
          body: 'Филтрирайте конкурентите по предлагани услуги, оценки и още. Стеснете точно до тези, с които се конкурирате — или не.',
        },
        {
          icon: 'location_on',
          title: 'Маркирай и сравни',
          body: 'Поставете кандидат-локации директно върху картата и сравнете профилите им един до друг, преди да поемете ангажимент за наем.',
        },
      ],
    },
    how: {
      label: 'Процес',
      title: 'От празна карта до уверено решение за минути',
      steps: [
        {
          title: 'Изберете категория',
          body: 'Кажете на Lonctus какъв вид бизнес откривате. Ние зареждаме съответния набор от данни за конкурентите автоматично.',
        },
        {
          title: 'Разгледайте слоевете',
          body: 'Включвайте демографска плътност, близост до метро и клъстери конкуренти. Наблюдавайте модели, които никога не бихте открили с обход.',
        },
        {
          title: 'Заключете локацията',
          body: 'Открийте зоната с възможности, маркирайте адреса-кандидат и влезте в преговорите за наем с данни зад гърба си.',
        },
      ],
    },
    quote: {
      text: 'Прекарахме три месеца в търсене на локация за фитнес. С такъв инструмент щяхме да намерим правилното място за една седмица.',
      author: '— Бета тестер, Sofia фитнес предприемач',
    },
    earlyAccess: {
      label: 'Ранен достъп',
      title: 'Бъдете първи при стартирането',
      sub: 'Lonctus е в затворена бета. Присъединете се към списъка и получете безплатен достъп при стартиране — плюс пряка линия за оформяне на продукта.',
      namePlaceholder: 'Вашето име',
      emailPlaceholder: 'Служебен имейл',
      categoryPlaceholder: 'Вид бизнес',
      submit: 'Заявете ранен достъп',
      submitted: '🎉 Вие сте в списъка! Ще се свържем с вас.',
      fine: 'Без спам. Отписване по всяко време. Ще се свързваме само за Lonctus.',
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
    { display: counters.value[1] + '', label: s.metroLines },
    { display: counters.value[2] + '+', label: s.gridCells },
    { display: s.cityName, label: s.cityLabel },
  ]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

/* ── Design tokens ── */
.landing {
  --bg: #08090c;
  --bg2: #0e1014;
  --surface: #13151a;
  --surface2: #1a1d24;
  --border: rgba(255, 255, 255, 0.06);
  --border2: rgba(255, 255, 255, 0.1);
  --orange: #e27b35;
  --orange-dim: rgba(226, 123, 53, 0.12);
  --orange-glow: rgba(226, 123, 53, 0.2);
  --charcoal: #3d4048;
  --text: #f0ede8;
  --text-2: #a8a49e;
  --text-3: #5c5955;
  --green: #3e8a5a;
  --blue: #3a7ec8;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.landing {
  min-height: 100vh;
  background: #08090c;
  color: #f0ede8;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

/* ── Grid overlay ── */
.grid-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(circle, rgba(226, 123, 53, 0.35) 1.5px, transparent 1.5px),
    linear-gradient(rgba(226, 123, 53, 0.1) 2px, transparent 2px),
    linear-gradient(90deg, rgba(226, 123, 53, 0.1) 2px, transparent 2px);
  background-size:
    88px 88px,
    88px 88px,
    88px 88px;
  mask-image: radial-gradient(
    ellipse 110% 90% at 50% 50%,
    black 20%,
    transparent 80%
  );
}

/* ── Nav ── */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 32px;
  height: 80px;
  display: flex;
  align-items: center;
  transition:
    background 0.3s,
    border-color 0.3s,
    backdrop-filter 0.3s;
}
.nav.scrolled {
  background: rgba(8, 9, 12, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: default;
}
.logo-img {
  height: 64px;
  width: auto;
  filter: drop-shadow(0 0 6px rgba(226, 123, 53, 0.3));
}
.logo-name {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: -0.01em;
  color: var(--text);
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}
.nav-links a {
  text-decoration: none;
  color: var(--text-2);
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  transition: color 0.2s;
}
.nav-links a:hover {
  color: var(--text);
}
.lang-toggle {
  background: none;
  border: 1px solid var(--border2);
  color: var(--text-2);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-toggle:hover {
  border-color: var(--orange);
  color: var(--orange);
}
.nav-cta {
  background: var(--orange) !important;
  color: #08090c !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  letter-spacing: 0.04em;
  padding: 8px 18px;
  border-radius: 4px;
  transition:
    opacity 0.2s,
    transform 0.15s !important;
}
.nav-cta:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ── Hero ── */
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

/* ── 3D Interactive Visual (inside showcase) ── */
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
.map-url,
.showcase-url {
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

/* ── Float badges ── */
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

/* ── Scroll indicator ── */
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

/* ── Stats bar ── */
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

/* ── Reveal sections ── */
.reveal-section {
  opacity: 0;
  transform: translateY(32px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}
.reveal-section.revealed {
  opacity: 1;
  transform: none;
}

/* ── Section labels / titles ── */
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

/* ── Showcase ── */
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
.showcase-screen {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border2);
  box-shadow: 0 60px 120px rgba(0, 0, 0, 0.6);
  position: relative;
  opacity: 0;
  transform: translateY(40px) scale(0.97);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}
.showcase-screen.visible {
  opacity: 1;
  transform: none;
}
.showcase-chrome {
  background: var(--surface2);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border);
}
.showcase-img {
  display: block;
  width: 100%;
  height: auto;
}
.showcase-annotations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.annotation {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ann-1 {
  top: 20%;
  left: 12%;
}
.ann-2 {
  top: 50%;
  left: 38%;
}
.ann-3 {
  top: 70%;
  right: 14%;
}
.ann-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--blue);
  border: 2px solid rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}
.ann-dot.orange {
  background: var(--orange);
}
.ann-dot.green {
  background: var(--green);
}
.ann-label {
  background: rgba(8, 9, 12, 0.85);
  border: 1px solid var(--border2);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.72rem;
  color: var(--text-2);
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

/* ── Features ── */
.features {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
}
.features-inner {
  max-width: 1200px;
  margin: 0 auto;
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

/* ── How it works ── */
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

/* ── Quote ── */
.quote-section {
  position: relative;
  z-index: 1;
  padding: 100px 32px;
  text-align: center;
}
.quote-inner {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
}
.quote-mark {
  font-family: 'Syne', sans-serif;
  font-size: 8rem;
  line-height: 0.5;
  color: var(--orange-dim);
  margin-bottom: 24px;
  display: block;
  border: 1px solid rgba(226, 123, 53, 0.08);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 32px;
  background: var(--surface);
  color: var(--orange);
}
blockquote {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  font-style: italic;
  line-height: 1.6;
  color: var(--text);
  font-weight: 300;
  margin-bottom: 24px;
}
cite {
  font-size: 0.85rem;
  color: var(--text-3);
  font-style: normal;
  letter-spacing: 0.02em;
}

/* ── Early Access ── */
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

/* ── Footer ── */
.footer {
  position: relative;
  z-index: 1;
  padding: 32px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.footer-logo {
  cursor: default;
}
.footer-logo-img {
  height: 48px;
}
.footer-copy {
  font-size: 0.8rem;
  color: var(--text-3);
}
.footer-link {
  font-size: 0.85rem;
  color: var(--text-2);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover {
  color: var(--orange);
}

/* ── Material Symbols ── */
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

/* ── Responsive: Tablet ── */
@media (max-width: 900px) {
  .hero-visual {
    display: none;
  }
  .feature-grid {
    grid-template-columns: 1fr 1fr;
  }
  .stats-inner {
    grid-template-columns: repeat(2, 1fr);
  }
  .badge-tl,
  .badge-bl {
    left: -8px;
  }
  .badge-tr,
  .badge-br {
    right: -8px;
  }

  /* Background sections: stop oversized background, use cover */
  .how {
    background-size: cover;
    background-position: center center;
    animation: none;
  }
  .early-access {
    background-size: cover;
    background-position: center 40%;
    animation: none;
  }
}

/* ── Responsive: Mobile ── */
@media (max-width: 600px) {
  /* — Nav — */
  .nav {
    padding: 0 16px;
  }
  .nav-links a {
    display: none;
  }

  /* — Hero: kill 3D, use a clean subtle zoom-pan — */
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

  /* — Hero text — */
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

  /* — Stats — */
  .stats-inner {
    grid-template-columns: repeat(2, 1fr);
    padding: 28px 20px;
    gap: 20px 16px;
  }

  /* — Showcase — */
  .showcase {
    padding: 60px 20px;
  }
  .showcase-inner .section-sub {
    font-size: 0.875rem;
  }
  .annotation {
    display: none;
  }

  /* — Features — */
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

  /* — How it works — */
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

  /* — Quote — */
  .quote-section {
    padding: 60px 20px;
  }
  blockquote {
    font-size: 1.05rem;
  }

  /* — Early access — */
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

  /* — Footer — */
  .footer {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
    gap: 12px;
  }
}
</style>
