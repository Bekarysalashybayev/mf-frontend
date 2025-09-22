 // Имитация Vue Router объекта для хоста.
// Хост ожидает объект с options.routes.
// Здесь только метаданные маршрутов для Angular микрофронта.

interface AngularRouteMeta {
  angularMount: 'credit' | 'credit-transfer'
}

interface AngularRouteDescriptor {
  path: string
  name: string
  meta: AngularRouteMeta
}

const routes: AngularRouteDescriptor[] = [
  {
    path: '/bank/credit',
    name: 'credit',
    meta: { angularMount: 'credit' }
  },
  {
    path: '/bank/credit/transfer',
    name: 'credit-transfer',
    meta: { angularMount: 'credit-transfer' }
  }
]

const routerLike = {
  options: { routes }
}

export default routerLike
export type { AngularRouteDescriptor }

