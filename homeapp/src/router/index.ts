import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import AboutPage from '@/views/AboutPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'about',
      component: AboutPage,
    },
    {
      path: '/bank/dashboard',
      name: 'bank',
      component: HomePage,
    },
  ],
})

export default router
