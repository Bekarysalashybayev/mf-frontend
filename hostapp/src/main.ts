import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import routerPromise from './router'

// Создаем приложение асинхронно после загрузки роутера
async function initApp() {
  const app = createApp(App)
  app.use(createPinia())

  // Ждем загрузки роутера с роутами из микрофронтендов
  const router = await routerPromise
  app.use(router)

  app.mount('#app')
}

initApp().catch(error => {
  console.error('Ошибка инициализации приложения:', error)
})
