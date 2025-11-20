import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

import auth from './services/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize Keycloak before mounting
auth.initKeycloak().then(() => {
    app.mount('#app')
})
