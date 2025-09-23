/**
 * Централизованный менеджер микрофронтендов
 * Управляет загрузкой, синхронизацией истории и коммуникацией с MF
 */
export interface MicrofrontendConfig {
  id: string
  port: number
  basePath: string
  routes: string[]
  container?: HTMLElement
  iframe?: HTMLIFrameElement
  isLoaded?: boolean
  autoHeight?: boolean // новый флаг для режима авто-высоты
}

export interface NavigationMessage {
  type: 'navigate' | 'back' | 'forward' | 'replace'
  source: string
  path: string
  timestamp?: number
}

export class MicrofrontendManager {
  private configs: Map<string, MicrofrontendConfig> = new Map()
  private activeId: string | null = null
  private messageQueue: NavigationMessage[] = []
  private isProcessingNavigation = false
  private allowedOrigins: Set<string> = new Set()
  private lastHistoryPath: string | null = null
  private prevPopStatePath: string | null = null
  // Новый: ссылка на Vue Router
  private router: any | null = null

  constructor() {
    this.initializeConfigs()
    this.setupEventListeners()
    this.setupAllowedOrigins()
  }

  // Позволяет прикрепить экземпляр роутера
  public attachRouter(router: any) {
    this.router = router
  }

  private initializeConfigs() {
    const configs: MicrofrontendConfig[] = [
      {
        id: 'firstapp',
        port: 5173,
        basePath: '/bank/gold',
        routes: ['/bank/gold']
      },
      {
        id: 'secondapp',
        port: 5174,
        basePath: '/bank/deposit',
        routes: ['/bank/deposit']
      },
      {
        id: 'homeapp',
        port: 5172,
        basePath: '/bank/dashboard',
        routes: ['/bank/dashboard', '/bank'],
        autoHeight: true // включаем авто-высоту для домашнего MF
      },
      {
        id: 'angularapp',
        port: 5175,
        basePath: '/bank/credit',
        routes: ['/bank/credit']
      }
    ]

    configs.forEach(config => {
      this.configs.set(config.id, config)
    })
  }

  private setupAllowedOrigins() {
    this.allowedOrigins.add(window.location.origin)
    this.configs.forEach(config => {
      this.allowedOrigins.add(`http://localhost:${config.port}`)
    })
  }

  private setupEventListeners() {
    // Слушаем сообщения от микрофронтендов
    window.addEventListener('message', this.handleMessage.bind(this))

    // Слушаем изменения истории браузера
    window.addEventListener('popstate', this.handlePopState.bind(this))
  }

  private isNavigationMessage(payload: any): payload is NavigationMessage {
    if (!payload || typeof payload !== 'object') return false
    if ((payload as any).__mfScrollSync && payload.type === 'mf-scroll-sync') return false // игнорируем scroll-sync
    const t = (payload as any).type
    return t === 'navigate' || t === 'back' || t === 'forward' || t === 'replace'
  }

  private handleMessage(event: MessageEvent) {
    if (!this.allowedOrigins.has(event.origin)) {
      return
    }

    const payload = event.data
    if (!this.isNavigationMessage(payload)) {
      return // не наше сообщение (например scroll-sync или другое служебное)
    }

    const message = payload as NavigationMessage
    if (!message.source || !this.configs.has(message.source)) {
      return
    }

    // Доп. защита: если тип требует path, но path не передан
    if ((message.type === 'navigate' || message.type === 'replace') && !message.path) {
      console.warn('[MF Manager] Skip navigation message without path:', message)
      return
    }

    this.queueNavigation(message)
  }

  private queueNavigation(message: NavigationMessage) {
    message.timestamp = Date.now()
    this.messageQueue.push(message)
    this.processNavigationQueue()
  }

  private async processNavigationQueue() {
    if (this.isProcessingNavigation || this.messageQueue.length === 0) {
      return
    }

    this.isProcessingNavigation = true

    try {
      const message = this.messageQueue.shift()!
      await this.processNavigation(message)
    } finally {
      this.isProcessingNavigation = false

      // Обрабатываем следующее сообщение если есть
      if (this.messageQueue.length > 0) {
        setTimeout(() => this.processNavigationQueue(), 0)
      }
    }
  }

  private async processNavigation(message: NavigationMessage) {
    const { type, path, source } = message

    console.log(`[MF Manager] Processing navigation from ${source}: ${type} to ${path}`)

    if (!path && (type === 'navigate' || type === 'replace')) {
      console.warn('[MF Manager] Navigation message without path ignored')
      return
    }

    if (type === 'back' || type === 'forward') {
      console.log('[MF Manager] Ignoring back/forward message from MF (handled by browser)')
      return
    }

    // Валидация пути
    const normalizedPath = this.normalizePath(path)
    if (!normalizedPath) {
      console.warn('[MF Manager] Invalid path:', path)
      return
    }

    // Проверяем что путь соответствует микрофронтенду
    const config = this.configs.get(source)
    if (!config || !this.isPathAllowedForMF(normalizedPath, config)) {
      console.warn('[MF Manager] Path not allowed for MF:', normalizedPath, source)
      return
    }

    // Избегаем дублирования только если путь уже активен в адресной строке
    const currentHostPath = window.location.pathname + window.location.search + window.location.hash
    if (normalizedPath === currentHostPath) {
      console.log(`[MF Manager] Path already active: ${normalizedPath}`)
      return
    }

    // Убеждаемся что правильный микрофронтенд активен
    const expectedMfId = this.resolveMicrofrontendId(normalizedPath)
    if (expectedMfId !== source) {
      console.warn(`[MF Manager] Path ${normalizedPath} should belong to ${expectedMfId}, but received from ${source}`)
      return
    }

    if (expectedMfId !== this.activeId) {
      console.log(`[MF Manager] Switching to correct MF: ${expectedMfId} for path: ${normalizedPath}`)
      await this.switchMicrofrontend(expectedMfId, normalizedPath)
    } else if (type === 'navigate') {
      const activeConfig = this.configs.get(this.activeId!)
      if (activeConfig) {
        const base = activeConfig.basePath
        if (currentHostPath.startsWith(base) && normalizedPath.startsWith(base)) {
          console.log(`[MF Manager] Internal in-MF navigation (replace instead of push): ${currentHostPath} -> ${normalizedPath}`)
          try {
            if (this.router) {
              await this.router.replace(normalizedPath)
            } else {
              window.history.replaceState({ mfSource: source }, '', normalizedPath)
            }
            this.lastHistoryPath = normalizedPath
            this.syncPathToMicrofrontend(source, normalizedPath)
          } catch (e) {
            console.error('[MF Manager] Failed internal replace navigation', e)
          }
          return
        }
      }
    }

    try {
      console.log(`[MF Manager] Updating browser history: ${type} to ${normalizedPath}`)

      switch (type as any) {
        case 'navigate':
          if (this.router) {
            await this.router.push(normalizedPath)
          } else {
            window.history.pushState({ mfSource: source }, '', normalizedPath)
          }
          this.lastHistoryPath = normalizedPath
          break
        case 'replace':
          if (this.router) {
            await this.router.replace(normalizedPath)
          } else {
            window.history.replaceState({ mfSource: source }, '', normalizedPath)
          }
          this.lastHistoryPath = normalizedPath
          break
        case 'back':
          window.history.back()
          break
        case 'forward':
          window.history.forward()
          break
      }
    } catch (error) {
      console.error('[MF Manager] Navigation error:', error)
    }
  }

  private handlePopState() {
    const path = window.location.pathname + window.location.search + window.location.hash
    if (this.prevPopStatePath === path) {
      console.log('[MF Manager] Skip duplicate popstate for same path:', path)
      return
    }
    this.prevPopStatePath = path
    this.lastHistoryPath = path
    const mfId = this.resolveMicrofrontendId(path)

    console.log(`[MF Manager] PopState event for path: ${path}, resolved MF: ${mfId}, current active: ${this.activeId}`)

    if (mfId && mfId === this.activeId) {
      console.log(`[MF Manager] Same MF, syncing path: ${path} to ${mfId}`)
      this.syncPathToMicrofrontend(mfId, path)
    }
    // Если MF другой – ничего не делаем: пусть Vue router и MicrofrontendView решат переключение
  }

  public resolveMicrofrontendId(path: string): string | null {
    console.log('[MF Manager] Resolving microfrontend for path:', path)

    let bestMatch: { id: string; route: string } | null = null

    for (const [id, config] of this.configs) {
      for (const route of config.routes) {
        // Точное совпадение
        if (path === route) {
          if (!bestMatch || route.length > bestMatch.route.length) {
            bestMatch = { id, route }
          }
          continue
        }
        // Префиксное совпадение (раздел границы) — предотвращаем что /bank/credit будет матчиться /bank, если есть более длинный маршрут
        if (path.startsWith(route.endsWith('/') ? route : route + '/')) {
          if (!bestMatch || route.length > bestMatch.route.length) {
            bestMatch = { id, route }
          }
        }
      }
    }

    if (bestMatch) {
      console.log(`[MF Manager] Longest route match: ${bestMatch.route} -> ${bestMatch.id}`)
      return bestMatch.id
    }

    if (path === '/' || path === '/bank') {
      console.log('[MF Manager] Using default homeapp for root path:', path)
      return 'homeapp'
    }

    console.log('[MF Manager] No match found for path:', path)
    return null
  }

  public async switchMicrofrontend(mfId: string, path?: string): Promise<void> {
    console.log(`[MF Manager] Switching to microfrontend: ${mfId}, path: ${path}, current active: ${this.activeId}`)

    const config = this.configs.get(mfId)
    if (!config) {
      console.error('[MF Manager] Unknown microfrontend:', mfId)
      return
    }

    // Скрываем текущий активный микрофронтенд
    if (this.activeId && this.activeId !== mfId) {
      const currentConfig = this.configs.get(this.activeId)
      if (currentConfig?.container) {
        console.log(`[MF Manager] Hiding current MF: ${this.activeId}`)
        currentConfig.container.style.display = 'none'
      }
    }

    this.activeId = mfId
    console.log(`[MF Manager] Active MF set to: ${mfId}`)

    // Показываем и загружаем новый микрофронтенд
    await this.loadMicrofrontend(config, path)
  }

  private async loadMicrofrontend(config: MicrofrontendConfig, path?: string): Promise<void> {
    console.log(`[MF Manager] Loading microfrontend: ${config.id}, path: ${path}`)

    if (!config.container) {
      console.error('[MF Manager] Container not found for:', config.id)
      return
    }

    // Показываем контейнер
    config.container.style.display = 'block'
    console.log(`[MF Manager] Container shown for: ${config.id}`)

    // Создаем или переиспользуем iframe
    if (!config.iframe) {
      console.log(`[MF Manager] Creating new iframe for: ${config.id}`)
      config.iframe = this.createIframe(config)
      config.container.appendChild(config.iframe)
    } else {
      console.log(`[MF Manager] Reusing existing iframe for: ${config.id}`)
    }

    // Загружаем микрофронтенд если еще не загружен
    if (!config.isLoaded) {
      const targetPath = path || config.basePath
      const url = `http://localhost:${config.port}${targetPath}`
      console.log(`[MF Manager] Loading URL: ${url} for ${config.id}`)

      await this.loadIframe(config.iframe, url)
      config.isLoaded = true
      this.sendHostInit(config)
    } else if (path) {
      // Синхронизируем путь с уже загруженным микрофронтендом
      console.log(`[MF Manager] Syncing path ${path} to уже загруженный ${config.id}`)
      this.syncPathToMicrofrontend(config.id, path)
    }
  }

  private createIframe(config: MicrofrontendConfig): HTMLIFrameElement {
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.title = config.id
    return iframe
  }

  private loadIframe(iframe: HTMLIFrameElement, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Iframe load timeout'))
      }, 10000)

      iframe.onload = () => {
        clearTimeout(timeout)
        resolve()
      }

      iframe.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('Iframe load error'))
      }

      iframe.src = url
    })
  }

  private syncPathToMicrofrontend(mfId: string, path: string) {
    const config = this.configs.get(mfId)
    if (!config?.iframe) return

    try {
      config.iframe.contentWindow?.postMessage({
        type: 'navigate',
        path: path,
        source: 'host'
      }, `http://localhost:${config.port}`)
    } catch (error) {
      console.error('[MF Manager] Failed to sync path:', error)
    }
  }

  private sendHostInit(config: MicrofrontendConfig) {
    try {
      if (config.iframe?.contentWindow) {
        const msg = { type: 'host-init', hostOrigin: window.location.origin, basePath: config.basePath }
        config.iframe.contentWindow.postMessage(msg, `http://localhost:${config.port}`)
        console.log('[MF Manager] Sent host-init to', config.id, msg)
      }
    } catch (e) {
      console.warn('[MF Manager] Failed to send host-init', e)
    }
  }

  private normalizePath(path: string): string | null {
    const trimmed = path.trim()
    if (!trimmed) return null
    if (/undefined|null/i.test(trimmed)) return null
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const url = new URL(trimmed)
        if (url.origin !== window.location.origin) return null
        return url.pathname + url.search + url.hash
      } catch {
        return null
      }
    }
    return trimmed.startsWith('/') ? trimmed : '/' + trimmed
  }

  private isPathAllowedForMF(path: string, config: MicrofrontendConfig): boolean {
    return config.routes.some(route => path.startsWith(route))
  }

  public setupContainer(containerId: string, mfId: string) {
    const container = document.getElementById(containerId)
    if (!container) {
      console.error('[MF Manager] Container not found:', containerId)
      return
    }

    const config = this.configs.get(mfId)
    if (!config) {
      console.error('[MF Manager] Microfrontend config not found:', mfId)
      return
    }

    config.container = container
  }

  public getCurrentMicrofrontendId(): string | null {
    return this.activeId
  }

  public getMicrofrontendConfig(id: string): MicrofrontendConfig | undefined {
    return this.configs.get(id)
  }

  public getActiveIframe(): HTMLIFrameElement | null {
    if (!this.activeId) return null
    const cfg = this.configs.get(this.activeId)
    return cfg?.iframe || null
  }

  public dispose() {
    window.removeEventListener('message', this.handleMessage.bind(this))
    window.removeEventListener('popstate', this.handlePopState.bind(this))

    // Очищаем все iframe
    this.configs.forEach(config => {
      if (config.iframe) {
        config.iframe.remove()
      }
    })
  }
}

// Экспортируем глобальный экземпляр
export const microfrontendManager = new MicrofrontendManager()
