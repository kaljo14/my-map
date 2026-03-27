<template>
  <div class="landing" :class="{ ready: isReady }">

    <!-- ── Particle Canvas Background ── -->
    <canvas ref="particleCanvas" class="particle-canvas" aria-hidden="true"></canvas>

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
    <section class="hero">
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
        <div class="hero-visual" :class="{ visible: showcaseVisible }" @mousemove="onMouseMove" @mouseleave="onMouseLeave" ref="heroVisual">
          <div class="screenshot-3d" :style="screenshotStyle">

            <div class="float-badge badge-tl">
              <div class="fb-icon"><span class="material-symbols-outlined">content_cut</span></div>
              <div class="fb-content">
                <div class="fb-value">366</div>
                <div class="fb-label">{{ t.map.barbershops }}</div>
              </div>
            </div>

            <div class="float-badge badge-tr">
              <div class="fb-icon score-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#E27B35" stroke-width="1.5"/><path d="M4.5 7l2 2 3-3" stroke="#E27B35" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="fb-content">
                <div class="fb-value amber">87<span class="fb-unit">/100</span></div>
                <div class="fb-label">{{ t.map.locationScore }}</div>
              </div>
            </div>

            <div class="float-badge badge-br">
              <div class="fb-mini-chart">
                <div v-for="(h, i) in radarBars" :key="i" class="radar-bar" :style="{ width: h + '%', background: i % 2 === 0 ? '#E27B35' : '#4a7fa8' }"></div>
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
            :ref="el => { if (el) featureCardRefs[i] = el as HTMLElement }"
          >
            <div class="fc-glow" :style="cardGlowStyles[i]"></div>
            <div class="feature-icon-wrap">
              <span class="material-symbols-outlined feature-icon">{{ f.icon }}</span>
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
          <div class="step" v-for="(step, i) in t.how.steps" :key="i" :style="`--step-i:${i}`">
            <div class="step-num-col">
              <div class="step-num-ring">
                <span class="step-num">0{{ i + 1 }}</span>
              </div>
              <div class="step-connector" v-if="i < t.how.steps.length - 1"></div>
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
          <div class="submitted-icon"><span class="material-symbols-outlined">check_circle</span></div>
          <p>{{ t.earlyAccess.submitted }}</p>
        </div>

        <p class="ea-fine">{{ t.earlyAccess.fine }}</p>
      </div>
    </section>

    <!-- ── Footer ── -->
    <footer class="footer">
      <span class="logo footer-logo">
        <img src="/logo_svg.svg" alt="Lonctus" class="logo-img footer-logo-img" />
        <span class="logo-name">Lonctus</span>
      </span>
      <span class="footer-copy">{{ t.footer.copy }}</span>
      <RouterLink to="/map" class="footer-link">{{ t.footer.openMap }}</RouterLink>
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
const particleCanvas = ref<HTMLCanvasElement | null>(null)
const heroVisual = ref<HTMLElement | null>(null)
const statsRef = ref<HTMLElement | null>(null)
const showcaseRef = ref<HTMLElement | null>(null)
const featureCardRefs = ref<HTMLElement[]>([])
const cardGlowStyles = ref<Record<number, string>>({})

const tiltX = ref(0)
const tiltY = ref(0)

const screenshotStyle = computed(() => ({
  transform: `perspective(1200px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg) scale3d(1,1,1)`,
  transition: tiltX.value === 0 && tiltY.value === 0 ? 'transform 0.8s ease' : 'transform 0.15s ease',
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
  cardGlowStyles.value[i] = `background: radial-gradient(300px circle at ${x}px ${y}px, rgba(226,123,53,0.08) 0%, transparent 70%); opacity: 1;`
}

function onCardLeave(i: number) {
  cardGlowStyles.value[i] = 'opacity: 0;'
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

function initParticles() {
  const canvas = particleCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let animId: number

  function resize() {
    canvas!.width = window.innerWidth
    canvas!.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  function rotX(v: number[], a: number): number[] {
    return [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)]
  }
  function rotY(v: number[], a: number): number[] {
    return [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)]
  }
  function rotZ(v: number[], a: number): number[] {
    return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]]
  }
  function project(v: number[], fov: number, cx: number, cy: number): [number, number, number] {
    const z = v[2] + fov
    if (z <= 0) return [-9999, -9999, -1]
    const s = fov / z
    return [cx + v[0] * s, cy + v[1] * s, z]
  }

  const CUBE_V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]
  const CUBE_E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
  const OCT_V = [[1,0,0],[-1,0,0],[0,1.4,0],[0,-1.4,0],[0,0,1],[0,0,-1]]
  const OCT_E = [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[4,3],[3,5],[5,2]]
  const DIA_V = [[0,-1.8,0],[0.8,0,0.8],[0.8,0,-0.8],[-0.8,0,-0.8],[-0.8,0,0.8],[0,1.8,0]]
  const DIA_E = [[0,1],[0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,1],[5,1],[5,2],[5,3],[5,4]]

  const RING_V: number[][] = []
  const RING_E: number[][] = []
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    RING_V.push([Math.cos(a), Math.sin(a), 0])
    RING_E.push([i, (i + 1) % 12])
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    RING_V.push([Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0])
    RING_E.push([12 + i, 12 + (i + 1) % 12])
  }
  for (let i = 0; i < 12; i += 3) RING_E.push([i, 12 + i])

  type ShapeDef = { v: number[][], e: number[][] }
  const SHAPES: ShapeDef[] = [
    { v: CUBE_V, e: CUBE_E },
    { v: OCT_V, e: OCT_E },
    { v: DIA_V, e: DIA_E },
    { v: RING_V, e: RING_E },
  ]

  interface Shape3D {
    def: ShapeDef
    x: number; y: number; depth: number
    size: number
    rx: number; ry: number; rz: number
    vrx: number; vry: number; vrz: number
    vx: number; vy: number
    baseOpacity: number
    colorIdx: number
  }

  const COLORS = ['226,123,53', '180,100,45', '74,127,168', '100,140,90', '200,140,80']

  function makeShape(): Shape3D {
    const depth = Math.random() * 700 + 150
    return {
      def: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      depth,
      size: (Math.random() * 35 + 18) * (depth / 350),
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      vrx: (Math.random() - 0.5) * 0.007,
      vry: (Math.random() - 0.5) * 0.010,
      vrz: (Math.random() - 0.5) * 0.005,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.12,
      baseOpacity: Math.random() * 0.09 + 0.03,
      colorIdx: Math.floor(Math.random() * COLORS.length),
    }
  }

  const objects: Shape3D[] = Array.from({ length: 22 }, makeShape)

  function drawShape(s: Shape3D) {
    const { v, e } = s.def
    const projected = v.map(vert => {
      let p = [vert[0] * s.size, vert[1] * s.size, vert[2] * s.size]
      p = rotX(p, s.rx)
      p = rotY(p, s.ry)
      p = rotZ(p, s.rz)
      return project([p[0], p[1], p[2] + s.depth], 700, s.x, s.y)
    })
    const depthFade = Math.min(1, 500 / s.depth)
    ctx!.strokeStyle = `rgba(${COLORS[s.colorIdx]}, ${s.baseOpacity * depthFade})`
    ctx!.lineWidth = 0.7
    for (const [a, b] of e) {
      if (projected[a][2] <= 0 || projected[b][2] <= 0) continue
      ctx!.beginPath()
      ctx!.moveTo(projected[a][0], projected[a][1])
      ctx!.lineTo(projected[b][0], projected[b][1])
      ctx!.stroke()
    }
  }

  function draw() {
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    objects.sort((a, b) => b.depth - a.depth)
    for (const s of objects) {
      drawShape(s)
      s.rx += s.vrx
      s.ry += s.vry
      s.rz += s.vrz
      s.x += s.vx
      s.y += s.vy
      if (s.x < -150) s.x = canvas.width + 150
      if (s.x > canvas.width + 150) s.x = -150
      if (s.y < -150) s.y = canvas.height + 150
      if (s.y > canvas.height + 150) s.y = -150
    }
    animId = requestAnimationFrame(draw)
  }

  draw()
  return () => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  }
}

function setupObservers() {
  document.querySelectorAll('.reveal-section').forEach(el =>
    new IntersectionObserver(entries => { if (entries[0].isIntersecting) entries[0].target.classList.add('revealed') }, { threshold: 0.1 }).observe(el)
  )
  if (statsRef.value)
    new IntersectionObserver(e => { if (e[0].isIntersecting) animateCounters() }, { threshold: 0.5 }).observe(statsRef.value)
  if (showcaseRef.value)
    new IntersectionObserver(e => { if (e[0].isIntersecting) showcaseVisible.value = true }, { threshold: 0.2 }).observe(showcaseRef.value)
}

function onScroll() {
  scrolled.value = window.scrollY > 60
}

let cleanupParticles: (() => void) | undefined

onMounted(() => {
  requestAnimationFrame(() => { isReady.value = true })
  cleanupParticles = initParticles()
  setTimeout(setupObservers, 100)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  cleanupParticles?.()
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
        { icon: 'map', title: 'Competitor Mapping', body: 'See every business in your category plotted on a live map. Instantly spot saturated areas and underserved neighbourhoods.' },
        { icon: 'group', title: 'Population Density', body: 'Overlay census-derived population grids to understand where your potential customers actually live — not just where real estate is cheap.' },
        { icon: 'train', title: 'Transit Accessibility', body: 'Visualise metro lines and stops to gauge foot traffic potential. High-transit corridors mean more walk-ins, not just residents.' },
        { icon: 'eco', title: 'Opportunity Zones', body: 'The analysis grid cross-references competitor density against population to surface zones where demand outstrips supply.' },
        { icon: 'search', title: 'Smart Filtering', body: 'Filter competitors by services, ratings, and more. Narrow down to exactly who you\'re competing against — or who you\'re not.' },
        { icon: 'location_on', title: 'Pin & Compare', body: 'Drop candidate locations on the map and compare their data profiles side-by-side before committing to a lease or investment.' },
      ],
    },
    how: {
      label: 'Process',
      title: 'From blank map to confident decision in minutes',
      steps: [
        { title: 'Choose your category', body: 'Tell Lonctus what kind of business you\'re opening. We load the relevant competitor dataset automatically.' },
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
      sub: 'Lonctus is in private beta. Join the waitlist and get free access at launch — plus a direct line to shape the product.',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'Work email',
      categoryPlaceholder: 'Business type',
      submit: 'Request Early Access',
      submitted: '🎉 You\'re on the list! We\'ll be in touch.',
      fine: 'No spam. Unsubscribe any time. We\'ll only reach out about Lonctus.',
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
        { icon: 'map', title: 'Картографиране на конкуренти', body: 'Вижте всеки бизнес от вашата категория нанесен на жива карта. Открийте незабавно наситени райони и необслужени квартали.' },
        { icon: 'group', title: 'Демографска плътност', body: 'Наложете демографска мрежа, за да разберете къде живеят потенциалните ви клиенти — не само където недвижимите имоти са евтини.' },
        { icon: 'train', title: 'Достъпност до транспорт', body: 'Визуализирайте метро линии и спирки, за да прецените пешеходния трафик. Транспортните коридори носят повече посетители.' },
        { icon: 'eco', title: 'Зони с възможности', body: 'Аналитичната мрежа кръстосва гъстотата на конкурентите с населеността и открива зоните, където търсенето надвишава предлагането.' },
        { icon: 'search', title: 'Интелигентно филтриране', body: 'Филтрирайте конкурентите по предлагани услуги, оценки и още. Стеснете точно до тези, с които се конкурирате — или не.' },
        { icon: 'location_on', title: 'Маркирай и сравни', body: 'Поставете кандидат-локации директно върху картата и сравнете профилите им един до друг, преди да поемете ангажимент за наем.' },
      ],
    },
    how: {
      label: 'Процес',
      title: 'От празна карта до уверено решение за минути',
      steps: [
        { title: 'Изберете категория', body: 'Кажете на Lonctus какъв вид бизнес откривате. Ние зареждаме съответния набор от данни за конкурентите автоматично.' },
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
    { display: counters.value[1] + '',  label: s.metroLines },
    { display: counters.value[2] + '+', label: s.gridCells },
    { display: s.cityName,              label: s.cityLabel },
  ]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

/* ── Design tokens ── */
.landing {
  --bg:          #08090C;
  --bg2:         #0E1014;
  --surface:     #13151A;
  --surface2:    #1A1D24;
  --border:      rgba(255,255,255,0.06);
  --border2:     rgba(255,255,255,0.10);
  --orange:      #E27B35;
  --orange-dim:  rgba(226,123,53,0.12);
  --orange-glow: rgba(226,123,53,0.20);
  --charcoal:    #3D4048;
  --text:        #F0EDE8;
  --text-2:      #A8A49E;
  --text-3:      #5C5955;
  --green:       #3E8A5A;
  --blue:        #3A7EC8;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; }

.landing {
  min-height: 100vh;
  background: #08090C;
  color: #F0EDE8;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

/* ── Canvas ── */
.particle-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

/* ── Grid overlay ── */
.grid-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(rgba(226,123,53,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(226,123,53,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%);
}

/* ── Nav ── */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 0 32px;
  height: 80px;
  display: flex;
  align-items: center;
  transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
}
.nav.scrolled {
  background: rgba(8,9,12,0.85);
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
  filter: drop-shadow(0 0 6px rgba(226,123,53,0.3));
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
.nav-links a:hover { color: var(--text); }
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
  color: #08090C !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  letter-spacing: 0.04em;
  padding: 8px 18px;
  border-radius: 4px;
  transition: opacity 0.2s, transform 0.15s !important;
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
  background-image: url('/Gemini_Generated_Image_ilploqilploqilpl.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(8,9,12,0.72) 0%, rgba(8,9,12,0.55) 50%, rgba(8,9,12,0.80) 100%),
    radial-gradient(ellipse at 30% 40%, rgba(226,123,53,0.08) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}
.hero > * { position: relative; z-index: 1; }
.hero-inner {
  max-width: 760px;
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
  transition: opacity 0.8s ease, transform 0.8s ease;
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
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--orange);
  box-shadow: 0 0 0 0 rgba(226,123,53,0.4);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(226,123,53,0.5); }
  70%  { box-shadow: 0 0 0 8px rgba(226,123,53,0); }
  100% { box-shadow: 0 0 0 0 rgba(226,123,53,0); }
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
.title-line-2 { display: block; }
.title-em {
  font-style: normal;
  background: linear-gradient(135deg, #E27B35 0%, #F0A060 60%, #D46020 100%);
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
  filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.4)) drop-shadow(0 12px 24px rgba(226,123,53,0.35));
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
  color: #08090C;
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
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(226,123,53,0.35);
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
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 4px;
  background: rgba(255,255,255,0.06);
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.btn-ghost:hover { color: var(--text); border-color: var(--orange); background: rgba(226,123,53,0.08); }
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
  transition: opacity 1s ease 0.3s, transform 1s ease 0.3s;
  position: relative;
  width: 100%;
  max-width: 900px;
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
  box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
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
.chrome-dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red    { background: #FF5F57; }
.dot.yellow { background: #FEBC2E; }
.dot.green  { background: #28C840; }
.map-url, .showcase-url {
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
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%);
  pointer-events: none;
  border-radius: 10px;
}
.visual-glow {
  position: absolute;
  bottom: -60px; left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 100px;
  background: radial-gradient(ellipse, rgba(226,123,53,0.18) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(20px);
}

/* ── Float badges ── */
.float-badge {
  position: absolute;
  background: rgba(13,15,20,0.92);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(12px);
  z-index: 10;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  animation: floatBadge 4s ease-in-out infinite;
}
.badge-tl { top: -14px; left: -20px; animation-delay: 0s; }
.badge-tr { top: -14px; right: -20px; animation-delay: 0.8s; }
.badge-br { bottom: 30px; right: -20px; animation-delay: 1.6s; }
.badge-bl { bottom: 30px; left: -20px; animation-delay: 2.4s; }
@keyframes floatBadge {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
.fb-icon {
  width: 28px; height: 28px;
  background: var(--surface2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--orange);
}
.fb-icon .material-symbols-outlined { font-size: 16px; }
.score-icon { background: rgba(226,123,53,0.1); }
.fb-value {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
  line-height: 1;
}
.fb-value.amber { color: var(--orange); }
.fb-unit { font-size: 0.65rem; font-weight: 400; color: var(--text-3); }
.fb-label { font-size: 0.7rem; color: var(--text-3); margin-top: 2px; white-space: nowrap; }
.fb-dot-amber {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--orange);
  flex-shrink: 0;
  box-shadow: 0 0 6px var(--orange);
}
.fb-mini-chart { display: flex; flex-direction: column; gap: 3px; width: 60px; }
.radar-bar { height: 4px; border-radius: 2px; transition: width 0.3s; }

/* ── Scroll indicator ── */
.scroll-indicator {
  position: absolute;
  bottom: 32px; left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
  opacity: 1;
  transition: opacity 0.4s;
}
.scroll-indicator.hidden { opacity: 0; pointer-events: none; }
.scroll-line {
  width: 1px; height: 40px;
  background: linear-gradient(to bottom, var(--orange), transparent);
  animation: scrollDown 1.8s ease-in-out infinite;
}
@keyframes scrollDown {
  0%   { transform: scaleY(0); transform-origin: top; }
  50%  { transform: scaleY(1); transform-origin: top; }
  51%  { transform: scaleY(1); transform-origin: bottom; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}
.scroll-indicator span { font-size: 0.65rem; letter-spacing: 0.12em; color: var(--text-3); text-transform: uppercase; }

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
.stat-item { text-align: center; }
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
  transition: opacity 0.8s ease, transform 0.8s ease;
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
  background: var(--bg2);
}
.showcase-inner {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}
.showcase-inner .section-sub { margin-left: auto; margin-right: auto; }
.showcase-screen {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border2);
  box-shadow: 0 60px 120px rgba(0,0,0,0.6);
  position: relative;
  opacity: 0;
  transform: translateY(40px) scale(0.97);
  transition: opacity 0.8s ease, transform 0.8s ease;
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
.showcase-img { display: block; width: 100%; height: auto; }
.showcase-annotations { position: absolute; inset: 0; pointer-events: none; }
.annotation {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ann-1 { top: 20%; left: 12%; }
.ann-2 { top: 50%; left: 38%; }
.ann-3 { top: 70%; right: 14%; }
.ann-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--blue);
  border: 2px solid rgba(255,255,255,0.6);
  flex-shrink: 0;
}
.ann-dot.orange { background: var(--orange); }
.ann-dot.green  { background: var(--green); }
.ann-label {
  background: rgba(8,9,12,0.85);
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
.features-inner { max-width: 1200px; margin: 0 auto; }
.section-head {
  text-align: center;
  margin-bottom: 60px;
}
.section-head .section-sub { margin: 0 auto; }
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
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}
.feature-card:hover { background: var(--surface2); }
.fc-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  opacity: 0;
}
.feature-icon-wrap {
  width: 44px; height: 44px;
  background: var(--orange-dim);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px solid rgba(226,123,53,0.15);
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
  background: var(--bg2);
}
.how-inner {
  max-width: 680px;
  margin: 0 auto;
}
.how-header { margin-bottom: 56px; }
.how-title { max-width: 500px; }
.steps { display: flex; flex-direction: column; gap: 0; }
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
  width: 44px; height: 44px;
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
  border: 1px solid rgba(226,123,53,0.08);
  border-radius: 50%;
  width: 80px; height: 80px;
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
  background: var(--surface);
  overflow: hidden;
}
.early-access::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(226,123,53,0.05) 0%, transparent 70%);
  pointer-events: none;
}
.ea-glow {
  position: absolute;
  top: -200px; left: 50%;
  transform: translateX(-50%);
  width: 600px; height: 400px;
  background: radial-gradient(ellipse, rgba(226,123,53,0.08) 0%, transparent 70%);
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
.ea-form { display: flex; flex-direction: column; gap: 16px; }
.ea-fields { display: flex; flex-direction: column; gap: 12px; }
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
.ea-input::placeholder { color: var(--text-3); }
.ea-input:focus { border-color: var(--orange); }
.ea-select { cursor: pointer; color: var(--text-2); }
.ea-select option { background: #1A1D24; color: var(--text); }
.ea-btn {
  width: 100%;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  padding: 16px 24px;
  letter-spacing: 0.02em;
  box-shadow: 0 0 0 1px rgba(226,123,53,0.4), 0 4px 24px rgba(226,123,53,0.35);
  border-radius: 6px;
}
.ea-btn:hover {
  box-shadow: 0 0 0 1px rgba(226,123,53,0.6), 0 8px 32px rgba(226,123,53,0.5);
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
.footer-logo { cursor: default; }
.footer-logo-img { height: 48px; }
.footer-copy { font-size: 0.8rem; color: var(--text-3); }
.footer-link {
  font-size: 0.85rem;
  color: var(--text-2);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover { color: var(--orange); }

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

/* ── Responsive ── */
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .hero-visual { display: none; }
  .feature-grid { grid-template-columns: 1fr 1fr; }
  .stats-inner { grid-template-columns: repeat(2, 1fr); }
  .badge-tl, .badge-bl { left: -8px; }
  .badge-tr, .badge-br { right: -8px; }
}
@media (max-width: 600px) {
  .nav { padding: 0 16px; }
  .nav-links a { display: none; }
  .hero { padding: 100px 16px 60px; }
  .feature-grid { grid-template-columns: 1fr; }
  .stats-inner { grid-template-columns: repeat(2, 1fr); }
  .footer { flex-direction: column; text-align: center; }
}
</style>
