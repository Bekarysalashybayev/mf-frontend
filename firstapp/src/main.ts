import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { mfSystem } from '../setup-mf'
import { initScrollSync } from '../../shared/scroll-sync'

const app = createApp(App)

app.use(createPinia())
app.use(router)

mfSystem.attachRouter(router)

// Инициализация scroll sync для микрофронтенда
initScrollSync({
  role: 'microfrontend',
  id: 'firstapp',
  throttleMs: 80,
  deltaThreshold: 4,
  debug: false
})

app.mount('#app')

// Система микрофронтенда уже инициализирована в setup-mf.ts
console.log('Firstapp mounted, MF system state:', mfSystem.getState())
