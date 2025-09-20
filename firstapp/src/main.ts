import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Setup postMessage handshake after router is ready
router.isReady().then(() => {
  // notify parent about current route
  const msg = { type: 'mf-ready', path: router.currentRoute.value.fullPath, from: 'mf', nonce: String(Date.now()) };
  window.parent.postMessage(msg, '*'); // укажи origin в проде
});
