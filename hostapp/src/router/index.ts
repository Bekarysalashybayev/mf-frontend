import { createRouter, createWebHistory } from 'vue-router'
import MicrofrontendView from '@/views/MicrofrontendView.vue'

const routes = [
  { path: '/', redirect: '/bank/dashboard' },
  { path: '/bank', redirect: '/bank/dashboard' },
  { path: '/bank/:rest(.*)*', name: 'MF', component: MicrofrontendView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
