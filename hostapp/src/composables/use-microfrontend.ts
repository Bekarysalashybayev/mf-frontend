/**
 * Композабл для работы с микрофронтендами
 */
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { microfrontendManager } from '@/services/microfrontend-manager'

export function useMicrofrontend() {
  const route = useRoute()
  const router = useRouter()

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Текущий активный микрофронтенд
  const currentMicrofrontend = computed(() => {
    return microfrontendManager.getCurrentMicrofrontendId()
  })

  // Определяем какой микрофронтенд нужен для текущего маршрута
  const requiredMicrofrontend = computed(() => {
    return microfrontendManager.resolveMicrofrontendId(route.fullPath)
  })

  // Проверяем доступность микрофронтенда
  const isMicrofrontendAvailable = computed(() => {
    const mfId = requiredMicrofrontend.value
    return mfId ? !!microfrontendManager.getMicrofrontendConfig(mfId) : false
  })

  // Навигация к определенному пути в микрофронтенде
  async function navigateToMicrofrontend(path: string) {
    try {
      isLoading.value = true
      error.value = null

      await router.push(path)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка навигации'
      console.error('Navigation error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Получение конфигурации микрофронтенда
  function getMicrofrontendConfig(id: string) {
    return microfrontendManager.getMicrofrontendConfig(id)
  }

  // Проверка что путь принадлежит определенному микрофронтенду
  function isPathForMicrofrontend(path: string, mfId: string): boolean {
    const resolvedMfId = microfrontendManager.resolveMicrofrontendId(path)
    return resolvedMfId === mfId
  }

  return {
    // State
    isLoading,
    error,
    currentMicrofrontend,
    requiredMicrofrontend,
    isMicrofrontendAvailable,

    // Methods
    navigateToMicrofrontend,
    getMicrofrontendConfig,
    isPathForMicrofrontend,

    // Direct access to manager for advanced usage
    manager: microfrontendManager
  }
}
