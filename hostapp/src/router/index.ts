import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import MainLayout from '@/components/MainLayout.vue'

// Динамическая загрузка удаленных компонентов
const GoldPage = () => import('firstApp/GoldPage')
const GoldTransferPage = () => import('firstApp/GoldTransferPage')
const DepositPage = () => import('secondApp/DepositPage')
const DepositTransferPage = () => import('secondApp/DepositTransferPage')

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: '', name: 'Home', component: HomePage },
      // Роуты для первого микрофронтенда (Gold)
      { path: '/gold', name: 'Gold', component: GoldPage },
      { path: '/gold/transfer', name: 'GoldTransfer', component: GoldTransferPage },
      // Роуты для второго микрофронтенда (Deposit)
      { path: '/deposit', name: 'Deposit', component: DepositPage },
      { path: '/deposit/transfer', name: 'DepositTransfer', component: DepositTransferPage },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
