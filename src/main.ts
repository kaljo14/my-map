import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css'

import auth from './services/auth'
import i18n from './i18n'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// Initialize Keycloak before mounting
auth.initKeycloak().then(() => {
    app.mount('#app')
})
