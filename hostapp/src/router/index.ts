import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import MainLayout from '@/components/MainLayout.vue'
import { collectAndAdaptRoutes, getAllMicrofrontendRoutes } from '@/utils/routeCollector'

// Создаем функцию для создания роутера с загруженными роутами
async function createAppRouter() {
  let routes: RouteRecordRaw[] = [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', name: 'Home', component: HomePage }
      ]
    }
  ]

  try {
    // Загружаем роуты из микрофронтендов синхронно при создании роутера
    const allMicrofrontendRoutes = await getAllMicrofrontendRoutes()
    console.log('Найдены роуты из микрофронтендов:', allMicrofrontendRoutes)

    const adaptedRoutes = await collectAndAdaptRoutes()
    console.log('Адаптированные роуты для хост-приложения:', adaptedRoutes)

    // Добавляем роуты из микрофронтендов как дочерние к MainLayout
    if (adaptedRoutes.length > 0) {
      routes[0].children = [
        ...routes[0].children!,
        ...adaptedRoutes
      ]
    }

    console.log(`Успешно загружено ${adaptedRoutes.length} роутов из микрофронтендов`)
  } catch (error) {
    console.error('Ошибка при загрузке роутов из микрофронтендов:', error)
    console.log('Роутер создан с базовыми роутами')
  }

  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  console.log('Все роуты в приложении:', router.getRoutes().map(r => ({ path: r.path, name: r.name })))

  return router
}

// Экспортируем промис с роутером
export default createAppRouter()
