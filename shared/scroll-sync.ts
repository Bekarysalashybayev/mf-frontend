/**
 * Упрощённая версия: ТОЛЬКО для микрофронтендов.
 * Хост использует собственную реализацию (hostapp/src/services/host-scroll-sync.ts)
 *
 * Протокол сообщения (отправляется ТОЛЬКО вверх к хосту):
 * {
 *   __mfScrollSync: true,
 *   type: 'mf-scroll-sync',
 *   source: <microfrontendId>,
 *   scrollY, scrollX, at, height, viewport
 * }
 */

interface ScrollSyncMessage {
  __mfScrollSync: true
  type: 'mf-scroll-sync'
  source: string
  scrollY: number
  scrollX: number
  at: number
  height: number
  viewport: number
}

interface MicrofrontendScrollSyncOptions {
  id: string
  throttleMs?: number
  deltaThreshold?: number
  debug?: boolean
  hostOrigin?: string
}

const MESSAGE_TYPE = 'mf-scroll-sync'
const GLOBAL_FLAG = '__MF_SCROLL_SYNC_INITIALIZED__'

let isApplyingRemote = false
let lastSentScrollY = -1
let removeListeners: (() => void) | null = null

function log(debug: boolean | undefined, ...args: any[]) { if (debug) console.log('[MF ScrollSync]', ...args) }

function throttle(fn: () => void, ms: number) {
  let pending = false
  return () => { if (pending) return; pending = true; setTimeout(() => { pending = false; fn() }, ms) }
}

function buildMessage(source: string): ScrollSyncMessage {
  return {
    __mfScrollSync: true,
    type: MESSAGE_TYPE,
    source,
    scrollY: window.scrollY || window.pageYOffset || 0,
    scrollX: window.scrollX || window.pageXOffset || 0,
    at: Date.now(),
    height: document.documentElement.scrollHeight || document.body.scrollHeight || 0,
    viewport: window.innerHeight
  }
}

export function initScrollSync(options: MicrofrontendScrollSyncOptions) {
  if ((window as any)[GLOBAL_FLAG]) return
  ;(window as any)[GLOBAL_FLAG] = true

  const throttleMs = options.throttleMs ?? 80
  const deltaThreshold = options.deltaThreshold ?? 4
  const debug = options.debug ?? false

  log(debug, 'Инициализация (microfrontend only)', options.id)

  const send = (force = false) => {
    const msg = buildMessage(options.id)
    if (!force && Math.abs(msg.scrollY - lastSentScrollY) < deltaThreshold) return
    lastSentScrollY = msg.scrollY
    try {
      if (window.parent && window.parent !== window) {
        const targetOrigin = options.hostOrigin || detectHostOrigin() || '*'
        window.parent.postMessage(msg, targetOrigin)
        log(debug, `${options.id} -> HOST`, msg)
      }
    } catch (err) { log(debug, 'postMessage error', err) }
  }

  const onScroll = throttle(() => { if (!isApplyingRemote) send(false) }, throttleMs)
  window.addEventListener('scroll', onScroll, { passive: true })

  function onMessage(ev: MessageEvent) {
    const data = ev.data as Partial<ScrollSyncMessage>
    if (!data || !data.__mfScrollSync || data.type !== MESSAGE_TYPE) return
    if (data.source !== 'host') return // принимаем только от хоста

    const targetY = Math.max(0, Math.min(data.scrollY || 0, (document.documentElement.scrollHeight - window.innerHeight)))
    const currentY = window.scrollY || window.pageYOffset || 0
    if (Math.abs(targetY - currentY) < 2) return

    isApplyingRemote = true
    log(debug, 'APPLY host scrollY =', targetY)
    try { window.scrollTo({ top: targetY, behavior: 'auto' }) } finally { setTimeout(() => { isApplyingRemote = false }, 30) }
  }

  window.addEventListener('message', onMessage)

  removeListeners = () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('message', onMessage)
    ;(window as any)[GLOBAL_FLAG] = false
  }

  // Отправим стартовые метрики через небольшой таймаут
  setTimeout(() => send(true), 30)

  ;(window as any).__mfScrollSyncDispose = () => removeListeners && removeListeners()

  return { dispose: () => removeListeners && removeListeners() }
}

function detectHostOrigin(): string | null {
  try { if (document.referrer) return new URL(document.referrer).origin } catch {}
  return null
}
