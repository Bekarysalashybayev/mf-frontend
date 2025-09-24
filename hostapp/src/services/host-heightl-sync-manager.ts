// Менеджер синхронизации высоты (заглушка)
// Исторически планировалось вынести авто-высоту iframe в отдельный модуль.
// В текущей реализации логика получения сообщений 'mf-height' и применения высоты
// встроена прямо в `microfrontend-manager.ts` (метод handleHeightMessage).
// Этот файл оставлен как точка расширения. При необходимости можно вынести
// функциональность сюда и импортировать её из microfrontend-manager.

export interface HostHeightSyncConfig {
  // зарезервировано для будущих опций
}

export class HostHeightSyncManager {
  // Простая заглушка — ничего не делает
  init() {
    if (import.meta?.env?.DEV) {
      console.log('[HostHeightSyncManager] Stub active (logic lives in microfrontend-manager).')
    }
  }
}

export const hostHeightSyncManager = new HostHeightSyncManager()
