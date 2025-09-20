import { createRouter, createWebHistory } from 'vue-router'
import GoldPage from '@/views/GoldPage.vue'
import GoldTransferPage from '@/views/GoldTransferPage.vue'

// Глобальный маркер типа навигации (push|pop|replace)

;(window as any).__LAST_NAV_TYPE__ = 'push'
window.addEventListener('popstate', () => {
  ;(window as any).__LAST_NAV_TYPE__ = 'pop'
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/bank/gold',
      name: 'gold',
      component: GoldPage,
    },
    {
      path: '/bank/gold/transfer',
      name: 'gold-transfer',
      component: GoldTransferPage,
    },
  ],
})

// On any router change, postMessage to parent (кроме случаев, когда навигация пришла с хоста)
router.afterEach((to, from) => {
  console.log('ROUTER AFTER EACH', to.fullPath, from.fullPath)

  const toPath = to.fullPath.includes(from.fullPath) && from.fullPath.length + 1 === to.fullPath.length;
  const fromPath = from.fullPath.includes(from.fullPath) && to.fullPath.length + 1 === from.fullPath.length;

  if (toPath || fromPath || to.fullPath === from.fullPath) {
    history.back()
  }

  if ((window as any).__NAVIGATED_FROM_HOST__) {
    ;(window as any).__NAVIGATED_FROM_HOST__ = false
    // Навигация инициирована хостом — считаем replace чтобы не плодить историю у хоста
    return
  }
  const navType = (window as any).__LAST_NAV_TYPE__ || 'push'
  // сбрасываем на push по умолчанию после обработки
  ;(window as any).__LAST_NAV_TYPE__ = 'push'
  const msg = {
    type: 'route-change',
    path: to.fullPath,
    from: 'mf',
    navType,
    nonce: String(Date.now()),
  }
  window.parent.postMessage(msg, '*')
})

export default router
