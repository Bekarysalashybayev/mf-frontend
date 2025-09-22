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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const angularContainer = ref<HTMLElement>()
const loading = ref(true)
const error = ref('')
let angularAppHandle: { destroy: () => void } | null = null
let currentKey = ''
let tryingFallback = false

function injectRemoteEntry(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-remote-entry="${url}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script')
    s.src = url
    s.dataset.remoteEntry = url
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Не удалось загрузить remoteEntry: ' + url))
    document.head.appendChild(s)
  })
}

async function loadModule(key: string) {
  if (key === 'credit-transfer') {
    // @ts-ignore
    return await import('angularApp/CreditTransferMount')
  }
  // @ts-ignore
  return await import('angularApp/CreditMount')
}

async function mountByKey(key: string) {
  if (currentKey === key && angularAppHandle) return
  currentKey = key
  loading.value = true
  error.value = ''

  try { angularAppHandle?.destroy() } catch (e) { console.warn('Destroy previous Angular app error', e) }
  angularAppHandle = null
  if (angularContainer.value) angularContainer.value.innerHTML = ''

  try {
    const mod = await loadModule(key)
    const mount = mod.default || mod.mountCredit || mod.mountCreditTransfer
    if (!mount) throw new Error('mount функция не найдена для ключа ' + key)
    if (!angularContainer.value) throw new Error('Контейнер отсутствует')
    angularAppHandle = await mount(angularContainer.value)
    loading.value = false
  } catch (err: any) {
    // Fallback: если модуль не резолвится, пробуем явно подгрузить remoteEntry и повторить
    if (!tryingFallback && /Failed to resolve module specifier/.test(err?.message || '')) {
      tryingFallback = true
      try {
        await injectRemoteEntry('http://localhost:3004/remoteEntry.js')
        const mod2 = await loadModule(key)
        const mount2 = mod2.default || mod2.mountCredit || mod2.mountCreditTransfer
        if (!mount2) throw new Error('mount функция не найдена после fallback для ключа ' + key)
        if (!angularContainer.value) throw new Error('Контейнер отсутствует')
        angularAppHandle = await mount2(angularContainer.value)
        loading.value = false
        tryingFallback = false
        return
      } catch (inner) {
        console.error('Fallback загрузка не удалась', inner)
        tryingFallback = false
      }
    }
    console.error('Ошибка загрузки Angular микрофронта:', err)
    error.value = `Module Federation ошибка: ${err.message}`
    loading.value = false
  }
}

function handleNavigate(e: Event) {
  const ce = e as CustomEvent
  const path = ce.detail?.path
  if (typeof path === 'string') {
    if (router.currentRoute.value.fullPath !== path) {
      router.push(path).catch(()=>{})
    }
  }
}

onMounted(() => {
  window.addEventListener('mf:navigate', handleNavigate as EventListener)
  const key = (route.meta.angularMount as string) || 'credit'
  mountByKey(key)
})

// Перемонтируем при смене meta.angularMount или пути
watch(() => route.fullPath, () => {
  const key = (route.meta.angularMount as string) || 'credit'
  mountByKey(key)
})

onUnmounted(() => {
  window.removeEventListener('mf:navigate', handleNavigate as EventListener)
  try { angularAppHandle?.destroy() } catch (e) { console.warn('Destroy error', e) }
  if (angularContainer.value) angularContainer.value.innerHTML = ''
})
</script>

<style scoped>
.angular-wrapper { width: 100%; min-height: 400px; }
.loading, .error { padding: 2rem; text-align: center; }
.loading { color: #3498db; font-size: 1.1rem; }
.error { color: #e74c3c; border: 1px solid #e74c3c; border-radius: 4px; background: #fdf2f2; }
.error h3 { margin-top: 0; }
:deep(.credit-page), :deep(.credit-transfer-page) { padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
</style>
