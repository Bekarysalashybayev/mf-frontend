<template>
  <MainLayout>
    <div>
      <h2>Host shell — Microfrontend container</h2>
      <div style="height: 60vh; border: 1px solid #ccc; position: relative">
        <iframe
          v-if="iframeSrc"
          ref="iframeRef"
          :src="iframeSrc"
          class="micro-iframe"
          style="width: 100%; height: 100%; border: 0"
          @load="onIframeLoad"
        ></iframe>
      </div>
    </div>
  </MainLayout>
</template>

<script lang="ts" setup>
import { computed, ref, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/components/MainLayout.vue'

// Минимальная логика выбора src по первому сегменту mfId (gold|deposit)
const route = useRoute()
const iframeRef = ref<HTMLIFrameElement | null>(null)

const iframeSrc = computed(() => {
  let raw = route.params.mfId as string | string[] | undefined
  if (Array.isArray(raw)) raw = raw.filter(Boolean).join('/')
  const cleaned = (raw || '').replace(/^\/+|\/+$/g, '')
  if (!cleaned) return 'http://localhost:5173/bank/gold'
  const [mf, ...rest] = cleaned.split('/')
  const restPath = rest.join('/')
  const port = mf === 'deposit' ? 5174 : 5173
  return `http://localhost:${port}/bank/${mf}${restPath ? '/' + restPath : ''}`
})

// ====== Отслеживание смен маршрута iframe (вариант 1: patch history) ======
// Контракт: при каждой смене пути внутри iframe вызываем handleIframeRoute(newPath)
// Ограничение: работает только при same-origin. При cross-origin будет тихий отказ.

let detachFns: Array<() => void> = []

function handleIframeRoute(path: string) {
  // Можно интегрировать с router хоста или шиной событий. Пока просто консоль + CustomEvent
  console.log('[iframe-route]', path)
  window.dispatchEvent(new CustomEvent('iframe-route-change', { detail: { path } }))
}

function safeGetPath(win: Window) {

  try { return win.location.pathname + win.location.search + win.location.hash } catch { return undefined }
}

function patchHistory(win: Window) {
  // Проверим same-origin доступ
  const test = safeGetPath(win)

  if (test === undefined) return // cross-origin — выходим

  const fire = () => {
    const p = safeGetPath(win)
    if (p) handleIframeRoute(p)
  }

  const origPush = win.history.pushState
  const origReplace = win.history.replaceState

  const wrappedPush: typeof win.history.pushState = function (...args) {
    const r = origPush.apply(this, args)
    fire()
    return r
  }
  const wrappedReplace: typeof win.history.replaceState = function (...args) {
    const r = origReplace.apply(this, args)
    fire()
    return r
  }

  win.history.pushState = wrappedPush
  win.history.replaceState = wrappedReplace

  const popHandler = () => fire()
  win.addEventListener('popstate', popHandler)

  // Сохраняем функции отката
  detachFns.push(() => {
    win.history.pushState = origPush
    win.history.replaceState = origReplace
    win.removeEventListener('popstate', popHandler)
  })

  // Начальное уведомление
  fire()
}

function onIframeLoad() {
  // При каждой загрузке очищаем старые хуки и ставим заново

  console.log('[iframe] load event')

  cleanupPatches()
  const win = iframeRef.value?.contentWindow
  if (!win) return
  try { patchHistory(win) } catch {/* ignore */}
}

function cleanupPatches() {
  detachFns.forEach(fn => { try { fn() } catch {} })
  detachFns = []
}

onBeforeUnmount(() => cleanupPatches())

// Если меняется iframeSrc (переключение между gold/deposit) — ждём следующего load
watch(iframeSrc, () => {
  // Очистим текущие хуки (iframe перезагрузится)
  cleanupPatches()
})
</script>

<style scoped>
.micro-iframe { display: block; }
</style>
