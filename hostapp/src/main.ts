import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { microfrontendManager } from './services/microfrontend-manager'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Прикрепляем роутер к менеджеру микрофронтендов
microfrontendManager.attachRouter(router)

app.mount('#app')
