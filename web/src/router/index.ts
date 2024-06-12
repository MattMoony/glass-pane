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
      component: () => import('../views/Person.vue'),
    },
    {
      path: '/o/:oid',
      name: 'organization',
      component: () => import('../views/Organization.vue'),
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
      children: [
        {
          path: '',
          name: 'dashboard home',
          component: () => import('../views/DashboardHome.vue'),
        },
        {
          path: 'new-person',
          name: 'new person',
          component: () => import('../views/CreatePerson.vue'),
        },
        {
          path: 'new-organization',
          name: 'new organization',
          component: () => import('../views/CreateOrganization.vue'),
        },
        {
          path: 'new-event',
          name: 'new event',
          component: () => import('../views/CreateEvent.vue'),
        },
      ],
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
