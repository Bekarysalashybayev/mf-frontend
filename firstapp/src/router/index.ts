import { createRouter, createWebHistory } from 'vue-router'
import GoldPage from '@/views/GoldPage.vue'
import GoldTransferPage from '@/views/GoldTransferPage.vue'

// Базовая конфигурация роутера
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/bank/gold', name: 'gold', component: GoldPage },
    { path: '/bank/gold/transfer', name: 'gold-transfer', component: GoldTransferPage },
  ],
})

export default router
