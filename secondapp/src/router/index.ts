import { createRouter, createWebHistory } from 'vue-router'
import DepositPage from "@/views/DepositPage.vue";
import DepositTransferPage from "@/views/DepositTransferPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/bank/deposit',
    },
    {
      path: '/bank/deposit',
      name: 'deposit',
      component: DepositPage
    },
    {
      path: '/bank/deposit/transfer',
      name: 'deposit-transfer',
      component: DepositTransferPage
    },
  ]
})

export default router
