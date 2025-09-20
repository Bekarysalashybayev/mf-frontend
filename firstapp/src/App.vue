<template>
  <router-view />
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'
import { onBeforeUnmount, onMounted } from 'vue'

const router = useRouter()

function onMessage(ev: MessageEvent) {
  // SECURITY: check ev.origin in production
  const msg = ev.data;
  if (!msg || typeof msg.type !== 'string') return;

  console.log('mf got msg', msg);

  if (msg.type === 'navigate' && msg.path) {
    if (router.currentRoute.value.fullPath !== msg.path) {
      // помечаем что следующая смена маршрута инициирована хостом
      ;(window as any).__NAVIGATED_FROM_HOST__ = true;
      router.replace(msg.path).catch(()=>{});
    }
  } else if (msg.type === 'sync-to-mf' && typeof msg.path === 'string') {
    if (router.currentRoute.value.fullPath !== msg.path) {
      ;(window as any).__NAVIGATED_FROM_HOST__ = true;
      router.replace(msg.path).catch(()=>{});
    }
  }
}

onMounted(() => window.addEventListener('message', onMessage));
onBeforeUnmount(() => window.removeEventListener('message', onMessage));

</script>
<style scoped></style>
