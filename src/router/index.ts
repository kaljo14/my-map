import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import MapView from '../views/MapView.vue'
import auth from '../services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingView
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    auth.login()
    return false
  }
})

export default router
