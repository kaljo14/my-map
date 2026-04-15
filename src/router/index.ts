import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import LandingView from '../views/LandingView.vue'
import auth from '../services/auth'

const MapView = () => import('../views/MapView.vue')
const SignInView = () => import('../views/SignInView.vue')
const FeaturesView = () => import('../views/FeaturesView.vue')

function waitForClerk(): Promise<void> {
  if (auth.isLoaded.value) return Promise.resolve()
  return new Promise(resolve => {
    const stop = watch(auth.isLoaded, loaded => {
      if (loaded) { stop(); resolve() }
    })
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingView
    },
    {
      path: '/features',
      name: 'features',
      component: FeaturesView
    },
    {
      path: '/sign-in/:pathMatch(.*)*',
      name: 'sign-in',
      component: SignInView
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return

  await waitForClerk()

  if (!auth.isAuthenticated.value) {
    return { name: 'sign-in' }
  }
})

export default router
