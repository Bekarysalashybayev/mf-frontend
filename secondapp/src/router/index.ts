import { createRouter, createWebHistory } from 'vue-router'
import DepositPage from "@/views/DepositPage.vue";
import DepositTransferPage from "@/views/DepositTransferPage.vue";
import DepositScrollDemo from "@/views/DepositScrollDemo.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
    {
      path: '/bank/deposit/demo',
      name: 'deposit-transfer-demo',
      component: DepositScrollDemo
    },
  ]
})

export default router
