/* В декларациях допускаем расширенные any/unknown для внешних remote модулей */

declare module 'firstApp/router' {
  import type { Router } from 'vue-router'
  const router: Router
  export default router
}

declare module 'secondApp/router' {
  import type { Router } from 'vue-router'
  const router: Router
  export default router
}

declare module 'creditApp/router' {
  interface CreditRouterLike { options: { routes: Array<{ path: string; name?: string; meta?: Record<string, unknown>; component?: unknown }> } }
  const router: CreditRouterLike
  export default router
}

declare module 'creditApp/mount' {
  import type { ApplicationRef, Provider } from '@angular/core'
  export interface AngularMountHandle { destroy: () => void; appRef: ApplicationRef; rootElement: HTMLElement; key: string }
  export interface MountOptions { providers?: Provider[] }
  export function mountAngular(key: string, container: HTMLElement, opts?: MountOptions): Promise<AngularMountHandle>
  const _default: typeof mountAngular
  export default _default
}
