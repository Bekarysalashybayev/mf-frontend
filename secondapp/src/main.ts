import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { mfSystem } from '../setup-mf'

const app = createApp(App)

app.use(createPinia())
app.use(router)

mfSystem.attachRouter(router)

app.mount('#app')

// Система микрофронтенда уже инициализирована в setup-mf.ts
console.log('Secondapp mounted, MF system state:', mfSystem.getState())
