import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { clerkPlugin } from '@clerk/vue'
import i18n from './i18n'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) throw new Error('Add VITE_CLERK_PUBLISHABLE_KEY to .env')

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY, signInUrl: '/sign-in' })

app.mount('#app')
