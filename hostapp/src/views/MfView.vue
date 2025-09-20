<template>
  <MainLayout>
    <div>
      <h2>Host shell — Microfrontend container</h2>
      <div style="height: 60vh; border: 1px solid #ccc; position: relative">
        <!-- iframe будет смонтирован только для одного активного микрофронтенда -->
        <iframe
          v-if="iframeSrc"
          ref="iframeRef"
          :src="iframeSrc"
          class="micro-iframe"
          @load="onLoad"
          style="width: 100%; height: 100%; border: 0"
        ></iframe>
      </div>
    </div>
  </MainLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/MainLayout.vue'

type Msg = {
  type: string
  path?: string
  from: 'mf' | 'host'
  nonce?: string
  navType?: 'push' | 'pop' | 'replace' | 'NAVIGATE_BACK'
}
const route = useRoute()
const router = useRouter()
const iframeRef = ref<HTMLIFrameElement | null>(null)
const iframeOrigin = ref<string | null>(null)
const lastHandledNonce = ref<string | null>(null)
const routeChangeFromMf = ref(false)
const lastHistoryPath = ref<string>(router.currentRoute.value.fullPath.replace(/\/+$/, ''))

// ВАЖНО: объявляем ДО использования внутри onMessage/watch
const lastNavigateFromHost = ref<{ path: string; ts: number }>({ path: '', ts: 0 })
const SUPPRESS_WINDOW = 1200 // окно (мс) для подавления эхо дубликата
// Добавляем флаг для подавления первого route-change после popstate
const justPopped = ref<{ path: string; ts: number }>({ path: '', ts: 0 })
const POP_SUPPRESS_WINDOW = 800 // мс

function buildIframeSrc(mfParam: string) {


  if (Array.isArray(mfParam)) {
    mfParam = mfParam.join('/')
  }

  // decode base path passed in param — adapt to your MF URL
  const base = decodeURIComponent(mfParam || '/gold/')

  // Например, mf располагается на другом домене или порту
  // в dev может быть http://localhost:5173/
  return base.startsWith('http') ? base : `http://localhost:5173/bank/${base}`
}

// set src initially
const iframeSrc = ref<string | null>(buildIframeSrc((route.params.mfId as string) || '/gold/'))

function sendToMf(msg: Msg) {
  const win = iframeRef.value?.contentWindow
  if (!win) return
  win.postMessage(msg, '*')
}

function onLoad() {
  // handshake: tell MF what is current host path
  const nonce = String(Date.now()) + Math.random()
  lastHandledNonce.value = nonce
  sendToMf({ type: 'sync-to-mf', path: router.currentRoute.value.fullPath, from: 'host', nonce })
  // (mf должен ответить mf-ready)
}

function normalizePath(p: string) {
  return p.replace(/\/+$/, '')
}

function onMessage(ev: MessageEvent) {
  const msg: Msg = ev.data
  if (!msg || typeof msg.type !== 'string') return
  if (msg.nonce && msg.nonce === lastHandledNonce.value) return
  console.log('host got msg', msg)
  const now = Date.now()
  if (msg.type === 'mf-ready') {
    if (msg.path) {
      const incoming = normalizePath(msg.path)
      const current = normalizePath(router.currentRoute.value.fullPath)
      if (incoming !== current) {
        routeChangeFromMf.value = true
        console.log(`Host: mf-ready from MF, navigating to ${incoming}`)
        router.replace(incoming).catch(() => {})
      }
      lastHistoryPath.value = incoming
    }
    iframeOrigin.value = ev.origin
  } else if (msg.type === 'route-change' && msg.path) {
    const incoming = normalizePath(msg.path)
    const current = normalizePath(router.currentRoute.value.fullPath)
    // Подавляем эхо после navigate
    if (
      incoming === lastNavigateFromHost.value.path &&
      now - lastNavigateFromHost.value.ts < SUPPRESS_WINDOW
    )
      return
    // Подавляем дубликат сразу после popstate (Back/Forward) — узел уже на нужном пути
    if (incoming === justPopped.value.path && now - justPopped.value.ts < POP_SUPPRESS_WINDOW)
      return
    if (incoming === lastHistoryPath.value && incoming === current) return

    // Если это pop из MF (напр. пользователь нажал Back внутри iframe) — используем replace
    if (msg.navType === 'pop') {
      if (incoming !== current) {
        routeChangeFromMf.value = true
        console.log(`Host: popstate from MF, navigating to ${incoming}`)
        router
          .replace(incoming)
          .then(() => {
            lastHistoryPath.value = incoming
          })
          .catch(() => {})
      } else {
        lastHistoryPath.value = incoming
      }
      return
    } else if (msg.type === 'NAVIGATE_BACK') {
      history.back()
    }

    // Поведение по умолчанию (push)
    if (incoming !== current) {
      routeChangeFromMf.value = true
      console.log(`Host: route-change from MF, navigating to ${incoming}`)
      router
        .push(incoming)
        .then(() => {
          lastHistoryPath.value = incoming
        })
        .catch(() => {})
    } else {
      lastHistoryPath.value = incoming
    }
  }
}

onMounted(() => {
  window.addEventListener('message', onMessage)
  watch(
    () => router.currentRoute.value.fullPath,
    (newVal) => {
      const normalized = normalizePath(newVal)
      if (routeChangeFromMf.value) {
        routeChangeFromMf.value = false
        lastHistoryPath.value = normalized
        return
      }
      if (normalized !== lastHistoryPath.value) lastHistoryPath.value = normalized
      if (!iframeRef.value) return
      const nonce = String(Date.now()) + Math.random()
      lastHandledNonce.value = nonce
      lastNavigateFromHost.value = { path: normalized, ts: Date.now() }
      sendToMf({ type: 'navigate', path: normalized, from: 'host', nonce })
    },
    { immediate: false },
  )

  window.addEventListener('popstate', (ev: PopStateEvent) => {
    console.log('host popstate', ev)
    const newPath = normalizePath(router.currentRoute.value.fullPath)
    lastHistoryPath.value = newPath // ОБНОВЛЯЕМ немедленно до прихода возможного route-change
    justPopped.value = { path: newPath, ts: Date.now() }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
})
</script>
