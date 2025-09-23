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
  /** Отслеживать изменения высоты документа (по умолчанию true) */
  observeHeight?: boolean
  /** Интервал fallback (мс) если ResizeObserver недоступен */
  heightPollIntervalMs?: number
}

const MESSAGE_TYPE = 'mf-scroll-sync'
const GLOBAL_FLAG = '__MF_SCROLL_SYNC_INITIALIZED__'

let isApplyingRemote = false
let lastSentScrollY = -1
let lastSentHeight = -1
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
  const observeHeight = options.observeHeight !== false
  const pollMs = options.heightPollIntervalMs ?? 1000

  log(debug, 'Инициализация (microfrontend only)', options.id)

  const send = (force = false) => {
    const msg = buildMessage(options.id)
    const scrollDeltaOk = Math.abs(msg.scrollY - lastSentScrollY) >= deltaThreshold
    const heightChanged = msg.height !== lastSentHeight
    if (!force && !scrollDeltaOk && !heightChanged) return
    lastSentScrollY = msg.scrollY
    lastSentHeight = msg.height
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

  // Отслеживание высоты документа
  let resizeObserver: ResizeObserver | null = null
  let intervalId: any = null

  if (observeHeight) {
    const scheduleHeightCheck = () => {
      send(true) // force для фикса высоты
    }
    if ('ResizeObserver' in window) {
      try {
        resizeObserver = new ResizeObserver(() => scheduleHeightCheck())
        resizeObserver.observe(document.documentElement)
        if (document.body) resizeObserver.observe(document.body)
        log(debug, 'ResizeObserver active for height tracking')
      } catch (e) { log(debug, 'ResizeObserver error', e) }
    } else {
      intervalId = setInterval(() => {
        const current = document.documentElement.scrollHeight || document.body.scrollHeight || 0
        if (current !== lastSentHeight) scheduleHeightCheck()
      }, pollMs)
      log(debug, 'Polling height fallback every', pollMs, 'ms')
    }
  }

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

    if (resizeObserver) { try { resizeObserver.disconnect() } catch {} }
    if (intervalId) clearInterval(intervalId)
    ;(window as any)[GLOBAL_FLAG] = false
  }

  // Стартовая отправка (force: чтобы зафиксировать начальную высоту даже без скролла)
  setTimeout(() => send(true), 30)

  ;(window as any).__mfScrollSyncDispose = () => removeListeners && removeListeners()

  return { dispose: () => removeListeners && removeListeners() }
}

function detectHostOrigin(): string | null {
  try { if (document.referrer) return new URL(document.referrer).origin } catch {}
  return null
}
