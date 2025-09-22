<template>
  <div ref="angularContainer" class="angular-wrapper">
    <div v-if="loading" class="loading">Загрузка Angular компонента...</div>
    <div v-if="error" class="error">
      <h3>Ошибка загрузки Angular компонента</h3>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const angularContainer = ref<HTMLElement>()
const loading = ref(true)
const error = ref('')
let angularAppHandle: { destroy: () => void } | null = null

onMounted(async () => {
  try {
    console.log('Загружаем Angular mount функцию (CreditMount)...')
    // @ts-ignore
    const mod = await import('angularApp/CreditMount')
    const mount = mod.default || mod.mountCredit
    if (!mount) throw new Error('mountCredit не найден в angularApp/CreditMount')
    if (angularContainer.value) {
      angularAppHandle = await mount(angularContainer.value)
      loading.value = false
    } else {
      throw new Error('Контейнер не найден')
    }
  } catch (err: any) {
    console.error('Ошибка загрузки Angular микрофронта:', err)
    error.value = `Module Federation ошибка: ${err.message}`
    loading.value = false
  }
})

onUnmounted(() => {
  try { angularAppHandle?.destroy() } catch (e) { console.warn('Destroy error', e) }
  if (angularContainer.value) angularContainer.value.innerHTML = ''
})
</script>

<style scoped>
.angular-wrapper {
  width: 100%;
  min-height: 400px;
}

.loading, .error {
  padding: 2rem;
  text-align: center;
}

.loading {
  color: #3498db;
  font-size: 1.1rem;
}

.error {
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  background: #fdf2f2;

  h3 {
    margin-top: 0;
  }
}

:deep(.credit-page) {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
