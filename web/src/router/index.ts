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
      path: '/p',
      name: 'create person',
      component: () => import('../views/CreatePerson.vue'),
    },
    {
      path: '/p/:pid',
      name: 'person',
      component: () => import('../views/Person.vue'),
    },
    {
      path: '/o',
      name: 'create organization',
      component: () => import('../views/CreateOrganization.vue'),
    },
    {
      path: '/o/:oid',
      name: 'organization',
      component: () => import('../views/Organization.vue'),
    },
    {
      path: '/e',
      name: 'create event',
      component: () => import('../views/CreateEvent.vue'),
    },
    {
      path: '/playground',
      name: 'playground',
      component: () => import('../views/Playground.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/Map.vue'),
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/Events.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not found',
      component: () => import('../views/NotFound.vue'),
    },
  ]
})

export default router
