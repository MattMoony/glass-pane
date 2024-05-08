import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing
    },
    {
      path: '/p/:pid',
      name: 'person',
      component: () => import('../views/NewPerson.vue'),
    },
    {
      path: '/lp/:uid',
      name: 'legacy-person',
      component: () => import('../views/Person.vue'),
    },
    {
      path: '/playground',
      name: 'playground',
      component: () => import('../views/Playground.vue'),
    },
  ]
})

export default router
