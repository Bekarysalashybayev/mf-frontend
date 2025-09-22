<template>
  <div ref="angularContainer" class="angular-wrapper">
    <div class="status-layer">
      <div v-if="loading" class="loading">Загрузка Angular компонента...</div>
      <div v-if="error" class="error">
        <h3>Ошибка загрузки Angular компонента</h3>
        <p>{{ error }}</p>
      </div>
    </div>
    <div ref="mountTarget" class="ng-mount-target"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface AngularMountHandle { destroy: () => void }

const route = useRoute()
const router = useRouter()
const angularContainer = ref<HTMLElement>()
const mountTarget = ref<HTMLElement>()
const loading = ref(true)
const error = ref('')
let angularAppHandle: AngularMountHandle | null = null
let currentKey = ''
let tryingFallback = false
let isMounting = false
let pendingKey: string | null = null

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

async function loadUniversalMount(): Promise<(key: string, el: HTMLElement) => Promise<AngularMountHandle>> {
  const mod = await import('creditApp/mount')
  const rec = mod as Record<string, unknown>
  const candidate = (rec.default ?? rec.mountAngular)
  if (typeof candidate !== 'function') throw new Error('Не найден универсальный mountAngular')
  return candidate as (key: string, el: HTMLElement) => Promise<AngularMountHandle>
}

async function performAngularMount(key: string) {
  if (!mountTarget.value) {
    error.value = 'Точка монтирования отсутствует'
    loading.value = false
    return
  }
  const mountFn = await loadUniversalMount()
  angularAppHandle = await mountFn(key, mountTarget.value)
}

async function mountByKey(key: string) {
  if (currentKey === key && angularAppHandle && !error.value) return
  if (isMounting) { pendingKey = key; return }
  isMounting = true
  pendingKey = null
  currentKey = key
  loading.value = true
  error.value = ''

  // Уничтожаем предыдущий Angular инстанс, но не трогаем структуру Vue
  try { angularAppHandle?.destroy() } catch { /* ignore */ }
  angularAppHandle = null
  if (mountTarget.value) mountTarget.value.innerHTML = ''

  try {
    await performAngularMount(key)
    loading.value = false
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (!tryingFallback && /Failed to resolve module specifier|does not provide an export/i.test(message)) {
      tryingFallback = true
      try {
        await injectRemoteEntry('http://localhost:3004/remoteEntry.js')
        await performAngularMount(key)
        loading.value = false
        tryingFallback = false
      } catch (inner) {
        const innerMsg = inner instanceof Error ? inner.message : String(inner)
        console.error('Fallback загрузка не удалась', innerMsg)
        error.value = `Angular fallback ошибка: ${innerMsg}`
        loading.value = false
        tryingFallback = false
      }
    } else {
      console.error('Ошибка загрузки Angular микрофронта:', message)
      error.value = `Module Federation ошибка: ${message}`
      loading.value = false
    }
  } finally {
    isMounting = false
    if (pendingKey && pendingKey !== currentKey) {
      const next = pendingKey
      pendingKey = null
      mountByKey(next)
    }
  }
}

function handleNavigate(e: Event) {
  const ce = e as CustomEvent
  const path = (ce.detail && (ce.detail as Record<string, unknown>).path) as string | undefined
  if (typeof path === 'string' && router.currentRoute.value.fullPath !== path) {
    router.push(path).catch(()=>{})
  }
}

onMounted(() => {
  window.addEventListener('mf:navigate', handleNavigate as EventListener)
  const key = (route.meta.angularMount as string) || 'credit'
  mountByKey(key)
})

watch(() => route.fullPath, () => {
  const key = (route.meta.angularMount as string) || 'credit'
  mountByKey(key)
})

onUnmounted(() => {
  window.removeEventListener('mf:navigate', handleNavigate as EventListener)
  try { angularAppHandle?.destroy() } catch { /* ignore */ }
  if (mountTarget.value) mountTarget.value.innerHTML = ''
})
</script>

<style scoped>
.angular-wrapper { width: 100%; min-height: 400px; position: relative; }
.status-layer { position: relative; z-index: 2; }
.ng-mount-target { position: relative; z-index: 1; }
.loading, .error { padding: 1.25rem 1rem; text-align: center; }
.loading { color: #3498db; font-size: 0.95rem; }
.error { color: #e74c3c; border: 1px solid #e74c3c; border-radius: 4px; background: #fdf2f2; }
.error h3 { margin: 0 0 0.5rem; font-size: 1rem; }
:deep(.credit-page), :deep(.credit-transfer-page) { padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
</style>
