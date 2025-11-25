import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.vectorgrid';

import auth from './services/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize Keycloak before mounting
auth.initKeycloak().then(() => {
    app.mount('#app')
})
