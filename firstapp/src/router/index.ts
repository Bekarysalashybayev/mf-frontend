import { createRouter, createWebHistory } from 'vue-router'
import GoldPage from '@/views/GoldPage.vue'
import GoldTransferPage from '@/views/GoldTransferPage.vue'

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

router.afterEach((to, from) => {
  console.log(`Navigated from ${from.fullPath} to ${to.fullPath}`)
})

export default router
