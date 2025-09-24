/**
 * Система синхронизации высоты контента микрофронтенда с хостом.
 * Микрофронтенд измеряет свою полную высоту (scrollHeight) и отправляет её хосту.
 * Хост динамически устанавливает высоту iframe, чтобы скролл был только на хост-странице.
 */

export interface HeightSyncMessage {
  type: 'mf-height'
  source: string
  height: number
  scrollHeight: number
  timestamp: number
}

export interface HeightSyncController {
  stop: () => void
  forceMeasure: () => void
  getLastHeight: () => number | null
}

interface HeightSyncOptions {
  microfrontendId: string
  minHeight?: number
  debounceMs?: number
  log?: boolean
}

function logEnabled(opts: HeightSyncOptions) {
  return !!opts.log
}

function measureDocumentHeight(): number {
  const body = document.body
  const html = document.documentElement
  if (!body || !html) return 0
  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  )
}

/**
 * Инициализация HeightSync внутри микрофронтенда
 */
export function setupHeightSync(options: HeightSyncOptions): HeightSyncController | null {
  if (window === window.parent) {
    // Не в iframe — синхронизация не нужна
    return null
  }

  const opts: HeightSyncOptions = {
    minHeight: 200,
    debounceMs: 80,
    log: false,
    ...options
  }

  let lastHeight: number | null = null
  let frame = 0
  let disposed = false

  const hostOrigin = document.referrer.split('/').slice(0, 3).join('/') || '*'

  const send = (h: number) => {
    if (disposed) return
    if (!h) return
    if (opts.minHeight && h < opts.minHeight) h = opts.minHeight
    if (lastHeight !== null && Math.abs(h - lastHeight) < 2) {
      return // изменилось менее чем на 2px — игнорируем микроколебания
    }
    lastHeight = h
    const msg: HeightSyncMessage = {
      type: 'mf-height',
      source: opts.microfrontendId,
      height: h,
      scrollHeight: h,
      timestamp: Date.now()
    }
    try {
      window.parent.postMessage(msg, hostOrigin)
      if (logEnabled(opts)) console.log(`[${opts.microfrontendId}] Sent height`, msg)
    } catch (e) {
      if (logEnabled(opts)) console.warn(`[${opts.microfrontendId}] Failed postMessage height`, e)
    }
  }

  const scheduleMeasure = () => {
    if (disposed) return
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const h = measureDocumentHeight()
      send(h)
    })
  }

  // ResizeObserver для отслеживания изменений размеров
  let resizeObserver: ResizeObserver | null = null
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => scheduleMeasure())
    try {
      resizeObserver.observe(document.documentElement)
      resizeObserver.observe(document.body)
    } catch {}
  }

  // MutationObserver — на случай когда контент меняется без ResizeObserver (например canvas, абсолютное позиционирование)
  const mutationObserver = new MutationObserver(() => scheduleMeasure())
  mutationObserver.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: false })

  // Fallback: периодический опрос первые ~3 секунды (для поздних стилей/шрифтов)
  const startTime = Date.now()
  const interval = setInterval(() => {
    if (disposed) return
    scheduleMeasure()
    if (Date.now() - startTime > 3000) {
      clearInterval(interval)
    }
  }, 250)

  // Отправляем несколько первоначальных замеров
  setTimeout(scheduleMeasure, 0)
  setTimeout(scheduleMeasure, 100)
  setTimeout(scheduleMeasure, 500)

  // Дополнительные первичные замеры (агрессивная серия)
  ;[50,120,250,400,700,1100,1600].forEach(ms => setTimeout(scheduleMeasure, ms))

  const onLoad = () => { scheduleMeasure(); setTimeout(scheduleMeasure, 60); setTimeout(scheduleMeasure, 300) }
  const onDomReady = () => { scheduleMeasure(); setTimeout(scheduleMeasure, 120) }

  if (document.readyState === 'complete') {
    onLoad()
  } else {
    window.addEventListener('load', onLoad, { once: true })
  }
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    onDomReady()
  } else {
    document.addEventListener('DOMContentLoaded', onDomReady, { once: true })
  }
  window.addEventListener('resize', () => scheduleMeasure())
  window.addEventListener('orientationchange', () => scheduleMeasure())

  const controller: HeightSyncController = {
    stop() {
      disposed = true
      cancelAnimationFrame(frame)
      if (resizeObserver) try { resizeObserver.disconnect() } catch {}
      try { mutationObserver.disconnect() } catch {}
      clearInterval(interval)
    },
    forceMeasure() { scheduleMeasure() },
    getLastHeight() { return lastHeight }
  }

  // Экспорт для отладки
  ;(window as any).__MF_HEIGHT_SYNC__ = controller

  window.addEventListener('message', (e: MessageEvent) => {
    if (!e.data) return
    if (e.data.type === 'mf-height-ping' || e.data.type === 'mf-height-force') {
      const aggressive = e.data.type === 'mf-height-force'
      scheduleMeasure()
      setTimeout(scheduleMeasure, 40)
      setTimeout(scheduleMeasure, 120)
      setTimeout(scheduleMeasure, 250)
      if (aggressive) {
        setTimeout(scheduleMeasure, 500)
        setTimeout(scheduleMeasure, 900)
      }
    }
  })

  return controller
}

export function isHeightSyncMessage(data: any): data is HeightSyncMessage {
  return data && data.type === 'mf-height' && typeof data.height === 'number' && typeof data.source === 'string'
}
