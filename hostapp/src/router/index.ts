import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import MfView from '@/views/MfView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  // маршруты, которые будут отражать состояния микрофронтенда
  { path: '/bank/gold:mfId(.*)*', name: 'MF', component: MfView },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
