import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import AboutPage from '@/views/AboutPage.vue'
import ScrollSyncDemo from '@/views/ScrollSyncDemo.vue'

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
    {
      path: '/bank/dashboard/scroll-sync',
      name: 'scroll-sync-demo',
      component: ScrollSyncDemo,
    },
  ],
})

export default router
