<template>
  <MainLayout>
    <div class="microfrontend-container">
      <!-- Контейнеры для каждого микрофронтенда -->
      <div
        v-for="mfId in microfrontendIds"
        :key="mfId"
        :id="`mf-container-${mfId}`"
        class="mf-container"
        :class="{ active: currentMfId === mfId }"
      >
        <!-- Iframe будет создан программно через MicrofrontendManager -->
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Загрузка микрофронтенда...</p>
      </div>

      <!-- Сообщение об ошибке -->
      <div v-if="error" class="error-message">
        <h3>Ошибка загрузки</h3>
        <p>{{ error }}</p>
        <button @click="retry" class="retry-button">Повторить</button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/components/MainLayout.vue'
import { microfrontendManager } from '@/services/microfrontend-manager'

const route = useRoute()
const isLoading = ref(false)
const error = ref<string | null>(null)

// Получаем список всех микрофронтендов
const microfrontendIds = ['homeapp', 'firstapp', 'secondapp', 'angularapp']

// Текущий активный микрофронтенд
const currentMfId = ref<string | null>(null)

// Вычисляем какой микрофронтенд должен быть активен на основе маршрута
const targetMfId = computed(() => {
  const resolved = microfrontendManager.resolveMicrofrontendId(route.fullPath)
  console.log('[MicrofrontendView] Route changed:', route.fullPath, '-> resolved MF:', resolved)
  return resolved
})

// Функция для обработки смены микрофронтенда
async function switchToMicrofrontend(mfId: string | null) {
  if (!mfId) {
    error.value = 'Не удалось определить микрофронтенд для текущего маршрута'
    return
  }

  if (currentMfId.value === mfId) {
    // Был ранний return, из-за этого подмаршруты (например scroll-sync) не доходили до iframe
    try {
      await microfrontendManager.switchMicrofrontend(mfId, route.fullPath)
    } catch (err) {
      console.error('Failed to resync path for same MF:', err)
    }
    return
  }

  try {
    isLoading.value = true
    error.value = null

    await microfrontendManager.switchMicrofrontend(mfId, route.fullPath)
    currentMfId.value = mfId

  } catch (err) {
    console.error('Failed to switch microfrontend:', err)
    error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
  } finally {
    isLoading.value = false
  }
}

// Повторная попытка загрузки
async function retry() {
  await switchToMicrofrontend(targetMfId.value)
}

// Отслеживаем изменения маршрута
watch(targetMfId, (newMfId) => {
  switchToMicrofrontend(newMfId)
}, { immediate: false })

watch(() => route.fullPath, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    const resolvedId = microfrontendManager.resolveMicrofrontendId(newPath)
    if (resolvedId && resolvedId === currentMfId.value) {
      console.log('[MicrofrontendView] fullPath changed within same MF, resync:', newPath)
      switchToMicrofrontend(resolvedId)
    }
  }
})

onMounted(async () => {
  try {
    // Настраиваем контейнеры для каждого микрофронтенда
    microfrontendIds.forEach(mfId => {
      microfrontendManager.setupContainer(`mf-container-${mfId}`, mfId)
    })

    // Активируем начальный микрофронтенд
    await switchToMicrofrontend(targetMfId.value)

  } catch (err) {
    console.error('Failed to initialize microfrontends:', err)
    error.value = 'Ошибка инициализации микрофронтендов'
  }
})

onBeforeUnmount(() => {
  // Менеджер сам очистит ресурсы при необходимости
})
</script>

<style scoped>
.microfrontend-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.mf-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: none;
}

.mf-container.active {
  display: block;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;
  color: #e74c3c;
  text-align: center;
}

.retry-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background-color: #2980b9;
}
</style>
