import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { microfrontendManager } from './services/microfrontend-manager'
import { initHostScrollSync } from './services/host-scroll-sync'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Прикрепляем роутер к менеджеру микрофронтендов
microfrontendManager.attachRouter(router)

// Инициализация scroll sync (host локальная реализация)
initHostScrollSync({
  throttleMs: 80,
  deltaThreshold: 4,
  debug: false,
  applyRemoteDocumentHeight: true
})

app.mount('#app')
