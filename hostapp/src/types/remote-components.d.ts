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
  import type { Router } from 'vue-router'
  const router: Router
  export default router
}

declare module 'angularApp/CreditMount' {
  export interface AngularMountHandle { destroy: () => void; appRef: any; rootElement: HTMLElement }
  export function mountCredit(container: HTMLElement): Promise<AngularMountHandle>
  const _default: typeof mountCredit
  export default _default
}

declare module 'angularApp/CreditTransferMount' {
  export interface AngularMountHandle { destroy: () => void; appRef: any; rootElement: HTMLElement }
  export function mountCreditTransfer(container: HTMLElement): Promise<AngularMountHandle>
  const _default: typeof mountCreditTransfer
  export default _default
}

declare module 'angularApp/CreditPage' {
  const CreditComponent: any
  export default CreditComponent
}

// Angular remote modules (без импорта пакетов Angular, чтобы не тащить зависимость)
