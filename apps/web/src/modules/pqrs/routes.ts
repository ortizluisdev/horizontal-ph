import type { RouteRecordRaw } from 'vue-router'

const pqrsRoutes: RouteRecordRaw[] = [
  {
    path: 'pqrs',
    name: 'pqrs',
    component: () => import('./views/PqrsListView.vue'),
    meta: { title: 'PQRS', requiresAuth: true },
  },
  {
    path: 'pqrs/nuevo',
    name: 'pqrs-nuevo',
    component: () => import('./views/PqrsFormView.vue'),
    meta: { title: 'Nueva PQRS', requiresAuth: true },
  },
  {
    path: 'pqrs/:id',
    name: 'pqrs-detalle',
    component: () => import('./views/PqrsDetailView.vue'),
    meta: { title: 'Detalle PQRS', requiresAuth: true },
  },
]

export default pqrsRoutes