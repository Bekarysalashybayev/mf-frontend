import type { RouteRecordRaw } from 'vue-router'
import type { Component } from 'vue'
import AngularWrapper from '@/components/AngularWrapper.vue'

interface RemoteRoute {
  path: string
  name?: string
  component?: unknown
  meta?: { angularMount?: string } & Record<string, unknown>
}
interface RouterLike { options?: { routes?: RemoteRoute[] } }

interface MicrofrontendConfig {
  name: string
  routerImport: () => Promise<{ default: unknown }>
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
  },
  {
    name: 'creditApp',
    routerImport: () => import('creditApp/router')
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
      const routerLike = routerModule.default as RouterLike

      const routes = routerLike.options?.routes ?? []
      for (const route of routes) {
        if (route.component) {
          adaptedRoutes.push({
            path: route.path,
            name: route.name,
            component: route.component as Component
          })
          continue
        }
        if (!route.component && route.meta?.angularMount) {
          adaptedRoutes.push({
            path: route.path,
            name: route.name,
            component: AngularWrapper,
            meta: { angularMount: route.meta.angularMount }
          })
        }
      }
    } catch (error) {
      console.warn(`Не удалось загрузить роуты из ${mf.name}:`, error)
    }
  }

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
      const routerLike = routerModule.default as RouterLike
      const routes = routerLike.options?.routes ?? []
      const mapped = routes.map(r => ({
        path: r.path,
        name: r.name,
        meta: r.meta
      })) as RouteRecordRaw[]
      allRoutes.push(...mapped)
    } catch (error) {
      console.warn(`Не удалось загрузить роуты из ${mf.name}:`, error)
    }
  }

  return allRoutes
}
