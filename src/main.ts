import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { primevueConfig } from './shared/config/primevue.config'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useTheme } from './design-system/utilities/useTheme'
import { queryClient } from './shared/query/queryClient'
import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)


const pinia = createPinia()
app.use(pinia)

// Initialize auth store (restores token and user from sessionStorage)
const authStore = useAuthStore()
authStore.initialize()

const { initTheme } = useTheme()
initTheme()


app.use(router)

// Setup Vue Query
app.use(VueQueryPlugin, { queryClient })

// Setup PrimeVue
app.use(PrimeVue, primevueConfig)

app.mount('#app')
