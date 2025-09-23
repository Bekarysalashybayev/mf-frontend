/**
 * Host-only scroll sync logic (moved from shared).
 * Синхронизация скролла между окном хоста и активным iframe микрофронтенда.
 * Протокол сообщения неизменен: { __mfScrollSync:true, type:'mf-scroll-sync', source:'host'|<mfId>, scrollY, scrollX, at, height, viewport }
 */
import { microfrontendManager } from './microfrontend-manager'

export interface HostScrollSyncOptions {
  throttleMs?: number
  deltaThreshold?: number
  debug?: boolean
  /** Применять min-height: remoteHeight к body (по умолчанию true) */
  applyRemoteDocumentHeight?: boolean
  /** Автоматически задавать высоту активному iframe по высоте документа microfrontend (по умолчанию true) */
  applyIframeHeight?: boolean
}

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

const GLOBAL_FLAG = '__HOST_SCROLL_SYNC__'
const MESSAGE_TYPE = 'mf-scroll-sync'

let isApplyingRemote = false
let lastSentScrollY = -1
let removeListeners: (() => void) | null = null

function log(enabled: boolean | undefined, ...args: any[]) { if (enabled) console.log('[HostScrollSync]', ...args) }

function throttle<T extends (...a:any[])=>void>(fn:T, ms:number):T {
  let pending = false
  return function(this:any, ...args:any[]) {
    if (pending) return
    pending = true
    setTimeout(() => { pending = false; fn.apply(this,args) }, ms)
  } as T
}

function buildMessage(): ScrollSyncMessage {
  return {
    __mfScrollSync: true,
    type: MESSAGE_TYPE,
    source: 'host',
    scrollY: window.scrollY || window.pageYOffset || 0,
    scrollX: window.scrollX || window.pageXOffset || 0,
    at: Date.now(),
    height: document.documentElement.scrollHeight || document.body.scrollHeight || 0,
    viewport: window.innerHeight
  }
}

export function initHostScrollSync(opts: HostScrollSyncOptions = {}) {
  if ((window as any)[GLOBAL_FLAG]) return
  ;(window as any)[GLOBAL_FLAG] = true

  const throttleMs = opts.throttleMs ?? 80
  const deltaThreshold = opts.deltaThreshold ?? 4
  const debug = opts.debug ?? false
  const applyRemoteDocHeight = opts.applyRemoteDocumentHeight !== false
  const applyIframeHeight = opts.applyIframeHeight !== false

  log(debug, 'init')

  const send = (force=false) => {
    const msg = buildMessage()
    if (!force && Math.abs(msg.scrollY - lastSentScrollY) < deltaThreshold) return
    lastSentScrollY = msg.scrollY
    const iframe = microfrontendManager.getActiveIframe()
    if (iframe?.contentWindow) {
      try { iframe.contentWindow.postMessage(msg, '*'); log(debug,'HOST -> MF', msg) } catch(e) { log(debug,'postMessage error', e) }
    }
  }

  const onScroll = throttle(() => { if (!isApplyingRemote) send(false) }, throttleMs)
  window.addEventListener('scroll', onScroll, { passive: true })

  function onMessage(ev: MessageEvent) {
    const data = ev.data as Partial<ScrollSyncMessage>
    if (!data || data.type !== MESSAGE_TYPE || !data.__mfScrollSync) return
    // Принимаем только от активного iframe
    const activeId = microfrontendManager.getCurrentMicrofrontendId()
    if (activeId && data.source !== activeId) return

    // Применяем высоту
    if (applyRemoteDocHeight && typeof data.height === 'number') {
      document.body.style.minHeight = data.height + 'px'
    }

    if (applyIframeHeight && typeof data.height === 'number') {
      const iframe = microfrontendManager.getActiveIframe()
      if (iframe) {
        iframe.style.height = data.height + 'px'
        iframe.style.minHeight = data.height + 'px'
        iframe.style.display = 'block'
        // Контейнеру присвоим ту же высоту, если он не в полноэкранном режиме
        const parent = iframe.parentElement
        if (parent && !parent.classList.contains('mf-fullscreen')) {
          parent.style.height = data.height + 'px'
        }
      }
    }

    const targetY = Math.max(0, Math.min(data.scrollY || 0, (document.documentElement.scrollHeight - window.innerHeight)))
    const currentY = window.scrollY || window.pageYOffset || 0
    if (Math.abs(targetY - currentY) < 2) return

    isApplyingRemote = true
    log(debug,'APPLY remote scrollY=', targetY, 'from', data.source)
    try { window.scrollTo({ top: targetY, behavior: 'auto' }) } finally { setTimeout(()=>{ isApplyingRemote=false },30) }
  }

  window.addEventListener('message', onMessage)

  removeListeners = () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('message', onMessage)
    ;(window as any)[GLOBAL_FLAG] = false
  }

  // Экспорт хелпера для форс‑отправки
  ;(window as any).__mfScrollSyncHostPush = () => send(true)

  // Начальная отправка
  setTimeout(() => send(true), 0)

  return { dispose: () => removeListeners && removeListeners() }
}
