import { setupMicrofrontend } from '../shared/microfrontend-system'
import { setupHeightSync } from '../shared/height-sync-system'

// Инициализируем систему микрофронтенда
const mfSystem = setupMicrofrontend('firstapp')
// Инициализируем синхронизацию высоты
setupHeightSync({ microfrontendId: 'firstapp' })

// Экспортируем для использования в других частях приложения
export { mfSystem }
export { getMicrofrontendSystem } from '../shared/microfrontend-system'
