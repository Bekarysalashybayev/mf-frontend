import { setupMicrofrontend } from '../shared/microfrontend-system'
import { setupHeightSync } from '../shared/height-sync-system'

// Инициализация системы микрофронтенда для Angular приложения
export const mfSystem = setupMicrofrontend('angularapp')
setupHeightSync({ microfrontendId: 'angularapp' })
export { getMicrofrontendSystem } from '../shared/microfrontend-system'
