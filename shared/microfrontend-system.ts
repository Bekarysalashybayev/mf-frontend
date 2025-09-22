/**
 * Универсальная система для микрофронтендов
 * Объединяет всю логику коммуникации с хостом и управления историей
 */

export interface MicrofrontendMessage {
  type: 'navigate' | 'back' | 'forward' | 'replace'
  source: string
  path: string
  timestamp?: number
}

export interface HostMessage {
  type: 'navigate'
  path: string
  source: 'host'
}

export class MicrofrontendSystem {
  private microfrontendId: string
  private isInitialized = false
  private isInIframe = false
  private lastPath = ''
  private navigationInProgress = false
  private hostOrigin = ''
  private handshakeDone = false
  private pendingBeforeHandshake: MicrofrontendMessage[] = []
  private dynamicBasePaths: string[] | null = null
  private routerRef: any = null
  private lastRouterSyncedPath: string | null = null

  // Очередь сообщений для отправки хосту
  private messageQueue: MicrofrontendMessage[] = []
  private isProcessingQueue = false

  constructor(microfrontendId: string) {
    this.microfrontendId = microfrontendId
    this.isInIframe = window !== window.parent
    this.hostOrigin = this.isInIframe ? document.referrer.split('/').slice(0, 3).join('/') : window.location.origin
    this.lastPath = window.location.pathname + window.location.search + window.location.hash
  }

  /**
   * Инициализация системы микрофронтенда
   */
  public initialize(): void {
    if (this.isInitialized) {
      console.warn(`[${this.microfrontendId}] Already initialized`)
      return
    }

    console.log(`[${this.microfrontendId}] Initializing microfrontend system`, {
      isInIframe: this.isInIframe,
      hostOrigin: this.hostOrigin,
      currentPath: this.lastPath
    })

    this.setupHistoryInterception()
    this.setupMessageListener()
    // Убираем периодический опрос чтобы исключить лишние навигации
    // this.setupNavigationSync()
    this.isInitialized = true

    // Не отправляем navigate пока не получили host-init (handshake)
  }

  /**
   * Настройка перехвата методов истории браузера
   */
  private setupHistoryInterception(): void {
    // Сохраняем оригинальные методы
    const originalPushState = window.history.pushState.bind(window.history)
    const originalReplaceState = window.history.replaceState.bind(window.history)

    // Перехватываем pushState
    window.history.pushState = (data: any, unused: string, url?: string | URL | null) => {
      const result = originalPushState(data, unused, url)
      this.handleHistoryChange('navigate')
      return result
    }

    // Перехватываем replaceState
    window.history.replaceState = (data: any, unused: string, url?: string | URL | null) => {
      const result = originalReplaceState(data, unused, url)
      this.handleHistoryChange('replace')
      return result
    }

    // Слушаем popstate для кнопок назад/вперед
    window.addEventListener('popstate', () => {
      this.handleHistoryChange('back')
    })
  }

  /**
   * Настройка слушателя сообщений от хоста
   */
  private setupMessageListener(): void {
    if (!this.isInIframe) return

    window.addEventListener('message', (event: MessageEvent) => {
      if (!event.data) return
      const anyMsg: any = event.data
      if (anyMsg.type === 'host-init') {
        // Рукопожатие
        this.hostOrigin = event.origin
        if (anyMsg.basePath) {
          this.dynamicBasePaths = [anyMsg.basePath]
        }
        this.handshakeDone = true
        console.log(`[${this.microfrontendId}] Handshake received from host`, anyMsg)
        // Отправляем отложенные сообщения + первое navigate о текущем состоянии
        const currentPath = window.location.pathname + window.location.search + window.location.hash
        this.lastPath = currentPath
        this.pendingBeforeHandshake.unshift({ type: 'navigate', source: this.microfrontendId, path: currentPath })
        while (this.pendingBeforeHandshake.length) {
          const m = this.pendingBeforeHandshake.shift()!
          this.queueMessage(m)
        }
        return
      }

      if (event.origin !== this.hostOrigin) {
        return
      }

      const message = event.data as HostMessage
      if (message.source === 'host' && message.type === 'navigate') {
        this.handleHostNavigation(message.path)
      }
    })
  }

  /**
   * Настройка синхронизации навигации
   */
  private setupNavigationSync(): void {
    // Периодически проверяем изменения пути (fallback для случаев когда события не сработали)
    setInterval(() => {
      const currentPath = window.location.pathname + window.location.search + window.location.hash
      if (currentPath !== this.lastPath && !this.navigationInProgress) {
        console.log(`[${this.microfrontendId}] Path changed detected:`, this.lastPath, '->', currentPath)
        this.lastPath = currentPath
        this.notifyHost('navigate', currentPath)
      }
    }, 500)
  }

  /**
   * Обработка изменений истории браузера
   */
  private handleHistoryChange(type: 'navigate' | 'replace' | 'back'): void {
    if (this.navigationInProgress) {
      return // Избегаем циклических вызовов
    }

    const currentPath = window.location.pathname + window.location.search + window.location.hash

    // Проверяем что путь действительно изменился
    if (currentPath === this.lastPath) {
      return
    }

    // back интерпретируем как replace (не хотим добавлять запись истории в хосте)
    const effective: MicrofrontendMessage['type'] = (type === 'back') ? 'replace' : (type === 'replace' ? 'replace' : 'navigate')
    console.log(`[${this.microfrontendId}] History change (${type}=>${effective}):`, this.lastPath, '->', currentPath)

    this.lastPath = currentPath
    this.notifyHost(effective, currentPath)
  }

  /**
   * Обработка навигации от хоста
   */
  private handleHostNavigation(hostPath: string): void {
    const currentPath = window.location.pathname + window.location.search + window.location.hash

    if (hostPath === currentPath) {
      return // Путь уже соответствует
    }

    console.log(`[${this.microfrontendId}] Host navigation:`, currentPath, '->', hostPath)

    this.navigationInProgress = true

    try {
      // Определяем какую часть пути нужно использовать для локальной навигации
      const localPath = this.extractLocalPath(hostPath)

      if (localPath !== currentPath) {
        // Используем replace чтобы не создавать дублирующие записи в истории
        window.history.replaceState(null, '', localPath)
        this.lastPath = localPath

        // Если используется Vue Router или другой роутер, уведомляем его
        this.triggerRouterUpdate()
      }
    } finally {
      // Сбрасываем флаг через небольшую задержку
      setTimeout(() => {
        this.navigationInProgress = false
      }, 100)
    }
  }

  /**
   * Извлечение локального пути из глобального пути хоста
   */
  private extractLocalPath(hostPath: string): string {
    const staticMap: Record<string, string[]> = {
      'homeapp': ['/bank/dashboard', '/bank'],
      'firstapp': ['/bank/gold'],
      'secondapp': ['/bank/deposit']
    }
    const bases = this.dynamicBasePaths || staticMap[this.microfrontendId]
    if (!bases) {
      return hostPath
    }
    let matched: string | null = null
    for (let i = 0; i < bases.length; i++) {
      const b = bases[i]
      if (hostPath.indexOf(b) === 0) {
        matched = b
        break
      }
    }
    if (!matched) {
      return this.lastPath || hostPath
    }
    if (hostPath !== this.lastPath) {
      console.log(`[${this.microfrontendId}] Extracted local path (full): matched base ${matched} => ${hostPath}`)
    }
    return hostPath
  }

  /**
   * Уведомление роутера об изменении пути
   */
  private triggerRouterUpdate(): void {
    const targetPath = window.location.pathname
    if (this.routerRef) {
      try {
        const current = this.routerRef.currentRoute ? this.routerRef.currentRoute.value.fullPath : undefined
        if (current !== targetPath && this.lastRouterSyncedPath !== targetPath) {
          ;(window as any).__MF_SUPPRESS_ROUTER_LOG = true
          this.routerRef.replace(targetPath)
          this.lastRouterSyncedPath = targetPath
          // Сбрасываем флаг после микротаска, чтобы пользовательские переходы дальше логировались
          setTimeout(() => {
            if ((window as any).__MF_SUPPRESS_ROUTER_LOG) {
              (window as any).__MF_SUPPRESS_ROUTER_LOG = false
            }
          }, 0)
        }
      } catch (error) {
        console.warn(`[${this.microfrontendId}] Failed to update attached router:`, error)
      }
      return
    }
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }))
  }

  /**
   * Отправка уведомления хосту
   */
  private notifyHost(type: MicrofrontendMessage['type'], path: string): void {
    if (!this.isInIframe) {
      return // Не в iframe, уведомления не нужны
    }

    const message: MicrofrontendMessage = { type, source: this.microfrontendId, path, timestamp: Date.now() }
    if (!this.handshakeDone) {
      this.pendingBeforeHandshake.push(message)
      return
    }
    this.queueMessage(message)
  }

  /**
   * Добавление сообщения в очередь
   */
  private queueMessage(message: MicrofrontendMessage): void {
    this.messageQueue.push(message)
    this.processMessageQueue()
  }

  /**
   * Обработка очереди сообщений (ES5 совместимо, без Promise/async)
   */
  private processMessageQueue(): void {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return
    }
    this.isProcessingQueue = true

    const sendNext = () => {
      if (this.messageQueue.length === 0) {
        this.isProcessingQueue = false
        return
      }
      const msg = this.messageQueue.shift()!
      this.sendMessageToHost(msg)
      // Небольшая задержка
      setTimeout(sendNext, 50)
    }

    sendNext()
  }

  /**
   * Отправка сообщения хосту (синхронно)
   */
  private sendMessageToHost(message: MicrofrontendMessage): void {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, this.hostOrigin || '*')
        console.log(`[${this.microfrontendId}] Sent to host:`, message)
      }
    } catch (error) {
      console.error(`[${this.microfrontendId}] Failed to send message to host:`, error)
    }
  }

  /**
   * Программная навигация
   */
  public navigate(path: string, replace = false): void {
    console.log(`[${this.microfrontendId}] Programmatic navigation to:`, path)

    if (replace) {
      window.history.replaceState(null, '', path)
    } else {
      window.history.pushState(null, '', path)
    }
  }

  /**
   * Возврат назад
   */
  public goBack(): void {
    console.log(`[${this.microfrontendId}] Going back`)
    window.history.back()
  }

  /**
   * Переход вперед
   */
  public goForward(): void {
    console.log(`[${this.microfrontendId}] Going forward`)
    window.history.forward()
  }

  /**
   * Привязка роутера (например, Vue Router)
   */
  public attachRouter(router: any) {
    this.routerRef = router
    if (this.handshakeDone) {
      try {
        const path = window.location.pathname
        if (!router.currentRoute || router.currentRoute.value.fullPath !== path) {
          router.replace(path)
        }
        this.lastRouterSyncedPath = path
      } catch (_) {}
    }
  }

  /**
   * Получение текущего состояния
   */
  public getState() {
    return {
      microfrontendId: this.microfrontendId,
      isInitialized: this.isInitialized,
      isInIframe: this.isInIframe,
      currentPath: window.location.pathname + window.location.search + window.location.hash,
      lastPath: this.lastPath,
      navigationInProgress: this.navigationInProgress
    }
  }

  /**
   * Очистка ресурсов
   */
  public dispose(): void {
    console.log(`[${this.microfrontendId}] Disposing microfrontend system`)
    // Здесь можно добавить очистку слушателей и таймеров при необходимости
    this.isInitialized = false
  }
}

// Глобальная переменная для доступа к системе
declare global {
  interface Window {
    __MF_SYSTEM__?: MicrofrontendSystem
  }
}

/**
 * Фабричная функция для создания и инициализации системы микрофронтенда
 */
export function setupMicrofrontend(microfrontendId: string): MicrofrontendSystem {
  // Проверяем что система еще не инициализирована
  if (window.__MF_SYSTEM__) {
    console.warn(`Microfrontend system already initialized for: ${window.__MF_SYSTEM__.getState().microfrontendId}`)
    return window.__MF_SYSTEM__
  }

  // Создаем новую систему
  const system = new MicrofrontendSystem(microfrontendId)
  window.__MF_SYSTEM__ = system

  // Инициализируем
  system.initialize()

  console.log(`[${microfrontendId}] Microfrontend system setup completed`)

  return system
}

/**
 * Получение текущей системы микрофронтенда
 */
export function getMicrofrontendSystem(): MicrofrontendSystem | null {
  return window.__MF_SYSTEM__ || null
}
