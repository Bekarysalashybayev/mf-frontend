import type { RouteRecordRaw, Router } from 'vue-router'
import AngularWrapper from '@/components/AngularWrapper.vue'

interface MicrofrontendConfig {
  name: string
  routerImport: () => Promise<{ default: Router }>
}

// Конфигурация микрофронтендов
const microfrontends: MicrofrontendConfig[] = [
  {
    name: 'firstApp',
    routerImport: () => import('firstApp/router')
  },
  {
    name: 'secondApp',
    routerImport: () => import('secondApp/router')
  }
]

/**
 * Собирает все роуты из микрофронтендов и адаптирует их для хост-приложения
 */
export async function collectAndAdaptRoutes(): Promise<RouteRecordRaw[]> {
  const adaptedRoutes: RouteRecordRaw[] = []

  for (const mf of microfrontends) {
    try {
      const routerModule = await mf.routerImport()
      const router = routerModule.default

      if (router && router.options && router.options.routes) {
        // Обрабатываем роуты из микрофронтенда
        for (const route of router.options.routes) {
          if (route.component) {
            adaptedRoutes.push({
              path: route.path, // Оставляем оригинальный путь без изменений
              name: route.name,
              component: route.component
            } as RouteRecordRaw)
          }
        }
      }
    } catch (error) {
      console.warn(`Не удалось загрузить роуты из ${mf.name}:`, error)
    }
  }

  // Добавляем Angular роут с Vue-оберткой
  adaptedRoutes.push({
    path: '/bank/credit',
    name: 'credit',
    component: AngularWrapper
  })

  return adaptedRoutes
}

/**
 * Получает все роуты из микрофронтендов (без компонентов, только структура)
 */
export async function getAllMicrofrontendRoutes(): Promise<RouteRecordRaw[]> {
  const allRoutes: RouteRecordRaw[] = []

  for (const mf of microfrontends) {
    try {
      const routerModule = await mf.routerImport()
      const router = routerModule.default

      if (router && router.options && router.options.routes) {
        allRoutes.push(...router.options.routes)
      }
    } catch (error) {
      console.warn(`Не удалось загрузить роуты из ${mf.name}:`, error)
    }
  }

  return allRoutes
}
