import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'
import { primevueConfig } from './shared/config/primevue.config'

import App from './App.vue'
import router from './router'
import { queryClient } from './shared/query/setup'
import { useAuthStore } from './stores/auth'
// import { initSentry } from './shared/monitoring/sentry.config'

const app = createApp(App)

// initSentry(app, router)

const pinia = createPinia()
app.use(pinia)

// Initialize auth store (restores token and user from sessionStorage)
const authStore = useAuthStore()
authStore.initialize()

app.use(router)

app.use(VueQueryPlugin, { queryClient })

// Setup PrimeVue
app.use(PrimeVue, primevueConfig)

app.mount('#app')
