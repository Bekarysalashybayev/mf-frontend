import { setupMicrofrontend } from '../../shared/microfrontend-system'

// Инициализируем систему микрофронтенда
const mfSystem = setupMicrofrontend('homeapp')

// Экспортируем для использования в других частях приложения
export { mfSystem }
export { getMicrofrontendSystem } from '../../shared/microfrontend-system'
